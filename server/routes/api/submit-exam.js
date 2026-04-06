const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { getTodayICT } = require('../../utils/dateICT');
const prisma = new PrismaClient();

const TICKET_DAILY_CAP = 5;

// หักตั๋ว 1 ใบสำหรับ competitive mode
// คืน { ok: true } หรือ throw error
async function deductTicket(userId) {
  const today = getTodayICT();
  const [wallet, daily] = await Promise.all([
    prisma.ticketWallet.findUnique({ where: { userId } }),
    prisma.ticketDailyUsage.findUnique({ where: { userId_date: { userId, date: today } } })
  ]);
  const balance = wallet?.balance ?? 0;
  const usedToday = daily?.usedCount ?? 0;

  if (balance < 1) throw new Error('ตั๋วไม่พอ');
  if (usedToday >= TICKET_DAILY_CAP) throw new Error(`ใช้ตั๋วครบ ${TICKET_DAILY_CAP} ใบแล้วในวันนี้`);

  await Promise.all([
    prisma.ticketWallet.update({ where: { userId }, data: { balance: { decrement: 1 } } }),
    prisma.ticketDailyUsage.upsert({
      where: { userId_date: { userId, date: today } },
      update: { usedCount: { increment: 1 } },
      create: { userId, date: today, usedCount: 1 }
    }),
    prisma.ticketLog.create({
      data: { userId, type: 'use_competitive', amount: -1, note: `แข่งขัน ${today}` }
    })
  ]);
  return { ok: true };
}

router.post('/', async (req, res) => {
  const { mode, questions, answers, durationSec, examSetCode, useTicket } = req.body;

  try {
    if (!Array.isArray(answers) || answers.length !== questions.length) {
      return res.status(400).json({ error: 'ข้อมูลคำตอบไม่ถูกต้อง' });
    }

    const records = await prisma.question.findMany({
      where: { id: { in: questions } }
    });

    const TIMED_MODES = ['competitive', 'official'];
    let correctCount = 0;
    let score = 0;
    let fullScore = 0;
    const weakTagSet = new Set();

    records.forEach((q, i) => {
      const userAns = answers[i];
      const correct = isCorrectAnswer(userAns, q);
      const thisScore = q.score || 1;
      fullScore += thisScore;

      if (correct) {
        correctCount++;
        score += thisScore;
      } else if (TIMED_MODES.includes(mode)) {
        ['topic', 'skill', 'trap'].forEach(type => {
          (q.attributes?.[type] || []).forEach(attr => weakTagSet.add(attr));
        });
      }
    });

    const weakAttributes = TIMED_MODES.includes(mode) ? [...weakTagSet] : null;

    // หา StudentProfile ของ user ที่ login อยู่
    let studentProfileId = null;
    if (req.session?.userId) {
      const profile = await prisma.studentProfile.findFirst({
        where: { userId: req.session.userId },
        orderBy: { createdAt: 'desc' }
      });
      if (profile) {
        studentProfileId = profile.id;
      } else {
        // สร้าง profile ชั่วคราวถ้ายังไม่มี
        const newProfile = await prisma.studentProfile.create({
          data: {
            userId: req.session.userId,
            academicYear: String(new Date().getFullYear() + 543),
            school: 'ไม่ระบุ',
            district: '',
            province: '',
            grade: 'ไม่ระบุ'
          }
        });
        studentProfileId = newProfile.id;
      }
    }

    // competitive mode: ต้องใช้ตั๋วจึงจะบันทึกผล
    const isCompetitive = mode === 'competitive';
    let ticketUsed = false;
    if (isCompetitive && useTicket && req.session?.userId) {
      try {
        await deductTicket(req.session.userId);
        ticketUsed = true;
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }

    const shouldSaveResult = !isCompetitive || ticketUsed;
    if (studentProfileId && shouldSaveResult) {
      await prisma.examResult.create({
        data: {
          studentProfileId,
          mode: mode || 'practice',
          examSetCode: examSetCode || null,
          topicTagsJson: [],
          score,
          total: questions.length,
          durationSec: durationSec || 0,
          weakAttributes,
          questionIds: questions,
          userAnswers: answers
        }
      });
    }

    // อัปเดต DailyMission (ทุก mode ยกเว้น targeted)
    if (req.session?.userId && mode !== 'targeted') {
      const today = new Date().toISOString().slice(0, 10);
      const academicYear = String(new Date().getFullYear() + 543);
      const DAILY_GOAL = 10;
      const DAILY_POINTS = 10;

      const existing = await prisma.dailyMission.findUnique({
        where: { userId_date: { userId: req.session.userId, date: today } }
      });
      const prevCount = existing?.questionsCount || 0;
      const newCount = prevCount + questions.length;
      const wasComplete = existing?.baseCompleted || false;
      const nowComplete = newCount >= DAILY_GOAL;

      await prisma.dailyMission.upsert({
        where: { userId_date: { userId: req.session.userId, date: today } },
        update: {
          questionsCount: newCount,
          ...((!wasComplete && nowComplete) ? { baseCompleted: true, pointsEarned: DAILY_POINTS } : {})
        },
        create: {
          userId: req.session.userId,
          date: today,
          questionsCount: newCount,
          baseCompleted: nowComplete,
          pointsEarned: nowComplete ? DAILY_POINTS : 0
        }
      });

      if (!wasComplete && nowComplete) {
        await prisma.pointTransaction.create({
          data: {
            userId: req.session.userId,
            academicYear,
            type: 'exam',
            amount: DAILY_POINTS,
            note: `ภารกิจรายวัน ${today}`
          }
        });

        // เช็คโบนัสสัปดาห์ (ทำครบ 5/7 วัน → +20)
        const weekId = getISOWeek(new Date());
        const { monday, sunday } = getWeekRange(new Date());
        const [completedDays, bonusExists] = await Promise.all([
          prisma.dailyMission.count({
            where: {
              userId: req.session.userId,
              date: { gte: monday, lte: sunday },
              baseCompleted: true
            }
          }),
          prisma.pointTransaction.findFirst({
            where: { userId: req.session.userId, type: 'weekly_bonus', note: { contains: weekId } }
          })
        ]);
        if (completedDays >= 5 && !bonusExists) {
          await prisma.pointTransaction.create({
            data: {
              userId: req.session.userId,
              academicYear,
              type: 'weekly_bonus',
              amount: 20,
              note: `โบนัสสัปดาห์ ${weekId}`
            }
          });
        }
      }
    }

    // อัปเดต XP (1 XP ต่อข้อที่ตอบถูก)
    let characterLevel = null;
    if (req.session?.userId && correctCount > 0) {
      const xpGain = correctCount;
      const char = await prisma.characterState.upsert({
        where: { userId: req.session.userId },
        update: { totalXp: { increment: xpGain } },
        create: { userId: req.session.userId, totalXp: xpGain, level: 1 }
      });
      const newLevel = calcLevel(char.totalXp + xpGain);
      if (newLevel !== char.level) {
        await prisma.characterState.update({
          where: { userId: req.session.userId },
          data: { level: newLevel }
        });
      }
      characterLevel = { level: newLevel, totalXp: char.totalXp + xpGain, xpGain };
    }

    res.json({
      correctCount,
      total: questions.length,
      score,
      fullScore,
      questions: records,
      userAnswers: answers,
      weakAttributes,
      characterLevel,
      ticketUsed,
      saved: shouldSaveResult
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ตรวจคำตอบล้มเหลว' });
  }
});

// XP thresholds ต่อ level (สะสม)
const XP_TABLE = [0,50,120,220,360,550,800,1120,1520,2020,2620,3320,4120,5020,6120,7420,8920,10620,12620,15020,18020];
function calcLevel(xp) {
  for (let i = XP_TABLE.length - 1; i >= 0; i--) {
    if (xp >= XP_TABLE[i]) return i + 1;
  }
  return 1;
}

const CLASS_NAME = ['', 'นักเรียนใหม่','นักเรียนใหม่','นักเรียนใหม่','นักเรียนใหม่','นักเรียนใหม่',
  'นักสู้','นักสู้','นักสู้','นักสู้','นักสู้',
  'จอมเวทย์','จอมเวทย์','จอมเวทย์','จอมเวทย์','จอมเวทย์',
  'อัศวิน','อัศวิน','อัศวิน','อัศวิน','อัศวิน'];
const CLASS_ICON = ['','🌱','🌱','🌱','🌱','🌱','⚔️','⚔️','⚔️','⚔️','⚔️','🧙','🧙','🧙','🧙','🧙','🦅','🦅','🦅','🦅','🦅'];

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function getWeekRange(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0=Mon
  const monday = new Date(d);
  monday.setDate(d.getDate() - day);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    monday: monday.toISOString().slice(0, 10),
    sunday: sunday.toISOString().slice(0, 10)
  };
}

function normalizeAnswer(ans) {
  const str = (typeof ans === 'string') ? ans.trim().replace(/\s+/g, '') : String(ans);
  const num = parseFloat(str);
  if (!isNaN(num)) return num.toFixed(6);
  return str.toLowerCase();
}

function isCorrectAnswer(userAns, q) {
  const a = normalizeAnswer(userAns);
  if (q.answer != null) return parseInt(userAns) === q.answer;
  if (Array.isArray(q.shortAnswer)) {
    return q.shortAnswer.some(sa => normalizeAnswer(sa) === a);
  }
  return false;
}

module.exports = router;
