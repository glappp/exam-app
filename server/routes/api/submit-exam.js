const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { mode, questions, answers, durationSec } = req.body;

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

    if (studentProfileId) {
      await prisma.examResult.create({
        data: {
          studentProfileId,
          mode: mode || 'practice',
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
      }
    }

    res.json({
      correctCount,
      total: questions.length,
      score,
      fullScore,
      questions: records,
      userAnswers: answers,
      weakAttributes
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ตรวจคำตอบล้มเหลว' });
  }
});

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
