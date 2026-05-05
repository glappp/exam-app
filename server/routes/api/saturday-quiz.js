const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function requireLogin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  next();
}

// weekKey = วันอาทิตย์ต้นสัปดาห์ (YYYY-MM-DD)
function getWeekKey(date = new Date()) {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=อาทิตย์
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

// วันเสาร์ของสัปดาห์นี้ (UTC+7)
function getSaturdayDate(weekKey) {
  const sun = new Date(weekKey + 'T00:00:00Z');
  sun.setUTCDate(sun.getUTCDate() + 6);
  return sun;
}

function isSaturday() {
  // ตรวจตาม ICT (UTC+7)
  const now = new Date();
  const ict = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return ict.getUTCDay() === 6;
}

// สุ่ม 8 ข้อฝึกหัด + 2 ข้อแข่งขัน สำหรับสัปดาห์นี้ (เหมือนกันทุกคน)
async function generateWeekPool(weekKey) {
  // 8 ข้อฝึกหัด — ข้อหลัก (ไม่มี parentQuestionId), isOfficial=false
  const practiceQuestions = await prisma.question.findMany({
    where: {
      attributes: { path: ['parentQuestionId'], equals: null },
    },
    select: { id: true, attributes: true, source: true },
  });

  // ดึง source ของ official sets
  const officialSets = await prisma.examSetMetadata.findMany({
    where: { isOfficial: true },
    select: { questionSource: true },
  });
  const officialSources = officialSets.map(s => s.questionSource).filter(Boolean);

  const practice = practiceQuestions.filter(q => {
    if (!q.source) return true;
    return !officialSources.some(src => q.source.startsWith(src));
  });

  // กรอง parent duplicates — ใช้ตัวแรกของแต่ละ parentGroup
  const seenParents = new Set();
  const uniquePractice = [];
  for (const q of practice) {
    const parent = q.attributes?.parentGroup || q.id;
    if (!seenParents.has(parent)) {
      seenParents.add(parent);
      uniquePractice.push(q);
    }
  }

  // สุ่ม 8 จาก uniquePractice
  const shuffledPractice = uniquePractice.sort(() => Math.random() - 0.5).slice(0, 8);

  // 2 ข้อแข่งขัน
  const competitiveQuestions = await prisma.question.findMany({
    where: {},
    select: { id: true, source: true },
  });
  const competitive = competitiveQuestions.filter(q => {
    if (!q.source) return false;
    return officialSources.some(src => q.source.startsWith(src));
  });
  const shuffledCompetitive = competitive.sort(() => Math.random() - 0.5).slice(0, 2);

  const pool = [...shuffledPractice, ...shuffledCompetitive];

  // ล้างข้อมูลสัปดาห์เก่าก่อนสร้างใหม่
  await prisma.saturdayQuizAttempt.deleteMany({ where: { weekKey: { not: weekKey } } });
  await prisma.saturdayQuizPool.deleteMany({ where: { weekKey: { not: weekKey } } });

  // บันทึก pool ลง DB
  await prisma.saturdayQuizPool.createMany({
    data: pool.map((q, i) => ({
      weekKey,
      questionId: q.id,
      sortOrder: i + 1,
    })),
    skipDuplicates: true,
  });

  console.log(`✅ SaturdayQuiz pool สร้างใหม่: ${weekKey} (ล้างข้อมูลเก่าแล้ว)`);
  return weekKey;
}

// GET /api/saturday-quiz/questions — ดึงโจทย์สัปดาห์นี้
router.get('/questions', requireLogin, async (req, res) => {
  try {
    const weekKey = getWeekKey();

    if (!isSaturday()) {
      // นอกวันเสาร์ — บอกวันที่จะเปิด
      const saturday = getSaturdayDate(weekKey);
      return res.status(403).json({
        error: 'สอบได้เฉพาะวันเสาร์เท่านั้น',
        code: 'NOT_SATURDAY',
        opensAt: saturday.toISOString(),
      });
    }

    // ตรวจว่าสอบแล้วหรือยัง
    const existing = await prisma.saturdayQuizAttempt.findUnique({
      where: { userId_weekKey: { userId: req.session.userId, weekKey } },
    });
    if (existing) {
      return res.status(409).json({
        error: 'สอบสัปดาห์นี้แล้ว',
        code: 'ALREADY_ATTEMPTED',
        attempt: existing,
      });
    }

    // ดึง pool (สร้างถ้ายังไม่มี)
    let pool = await prisma.saturdayQuizPool.findMany({
      where: { weekKey },
      include: { question: true },
      orderBy: { sortOrder: 'asc' },
    });

    if (pool.length === 0) {
      await generateWeekPool(weekKey);
      pool = await prisma.saturdayQuizPool.findMany({
        where: { weekKey },
        include: { question: true },
        orderBy: { sortOrder: 'asc' },
      });
    }

    // ไม่ส่ง answer ไปให้ client
    const questions = pool.map(p => {
      const { answer, shortAnswer, ...safe } = p.question;
      return safe;
    });

    res.json({ weekKey, questions });
  } catch (err) {
    console.error('❌ saturday-quiz/questions:', err);
    res.status(500).json({ error: 'โหลดโจทย์ล้มเหลว' });
  }
});

// GET /api/saturday-quiz/review — ดูเฉลย (เปิดวันอาทิตย์ 05:00+ ICT หลัง maintenance)
// เฉพาะคนที่สอบแล้วเท่านั้น
router.get('/review', requireLogin, async (req, res) => {
  try {
    // ตรวจเวลา ICT
    const now = new Date();
    const ict = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const ictDay  = ict.getUTCDay();  // 0=อาทิตย์
    const ictHour = ict.getUTCHours();
    const reviewOpen = (ictDay === 0 && ictHour >= 5) || (ictDay >= 1 && ictDay <= 5);

    if (!reviewOpen) {
      return res.status(403).json({
        error: 'ดูเฉลยได้หลัง 05:00 น. วันอาทิตย์',
        code: 'REVIEW_NOT_OPEN',
      });
    }

    // weekKey ของสัปดาห์ที่สอบ (= weekKey ก่อนหน้า 7 วัน จากต้นสัปดาห์ปัจจุบัน)
    const currentWeekKey = getWeekKey(); // อาทิตย์นี้
    const prevSun = new Date(currentWeekKey + 'T00:00:00Z');
    prevSun.setUTCDate(prevSun.getUTCDate() - 7);
    const reviewWeekKey = req.query.weekKey || prevSun.toISOString().slice(0, 10);

    // ตรวจว่าผู้ใช้สอบแล้วหรือยัง
    const attempt = await prisma.saturdayQuizAttempt.findUnique({
      where: { userId_weekKey: { userId: req.session.userId, weekKey: reviewWeekKey } },
    });
    if (!attempt) {
      return res.status(403).json({
        error: 'ไม่พบผลการสอบ — ดูเฉลยได้เฉพาะคนที่เข้าสอบเท่านั้น',
        code: 'NO_ATTEMPT',
      });
    }

    // ดึงข้อสอบพร้อมเฉลย
    const pool = await prisma.saturdayQuizPool.findMany({
      where: { weekKey: reviewWeekKey },
      include: { question: true }, // รวม answer + shortAnswer ด้วย
      orderBy: { sortOrder: 'asc' },
    });

    const userAnswers = attempt.answers || {};
    const questions = pool.map(p => {
      const q = p.question;
      const userAns = userAnswers[q.id];
      let correct = false;
      if (q.type === 'mc') {
        correct = userAns === q.answer;
      } else if (q.type === 'numeric' && q.shortAnswer) {
        const accepted = Array.isArray(q.shortAnswer) ? q.shortAnswer : [q.shortAnswer];
        correct = accepted.includes(String(userAns));
      }
      return {
        ...q,                         // รวม answer + shortAnswer (unhide แล้ว)
        userAnswer: userAns ?? null,
        isCorrect: correct,
      };
    });

    res.json({
      weekKey: reviewWeekKey,
      score: attempt.score,
      timeUsed: attempt.timeUsed,
      questions,
    });
  } catch (err) {
    console.error('❌ saturday-quiz/review:', err);
    res.status(500).json({ error: 'โหลดเฉลยล้มเหลว' });
  }
});

// POST /api/saturday-quiz/submit
// Body: { weekKey, answers: { questionId: selectedAnswer }, timeUsed }
router.post('/submit', requireLogin, async (req, res) => {
  try {
    const { weekKey, answers = {}, timeUsed } = req.body;
    if (!weekKey || timeUsed == null) {
      return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
    }

    // ตรวจซ้ำ
    const existing = await prisma.saturdayQuizAttempt.findUnique({
      where: { userId_weekKey: { userId: req.session.userId, weekKey } },
    });
    if (existing) return res.status(409).json({ error: 'ส่งคำตอบแล้ว', attempt: existing });

    // ดึง pool + คำเฉลย
    const pool = await prisma.saturdayQuizPool.findMany({
      where: { weekKey },
      include: { question: { select: { id: true, answer: true, shortAnswer: true, type: true } } },
    });

    let score = 0;
    const result = {};
    for (const p of pool) {
      const q = p.question;
      const selected = answers[q.id];
      let correct = false;
      if (q.type === 'mc') {
        correct = selected === q.answer;
      } else if (q.type === 'numeric' && q.shortAnswer) {
        const accepted = Array.isArray(q.shortAnswer) ? q.shortAnswer : [q.shortAnswer];
        correct = accepted.includes(String(selected));
      }
      if (correct) score++;
      result[q.id] = { correct, correctAnswer: q.answer || q.shortAnswer };
    }

    const attempt = await prisma.saturdayQuizAttempt.create({
      data: {
        userId: req.session.userId,
        weekKey,
        score,
        timeUsed: Math.round(timeUsed),
        answers,
      },
    });

    res.json({ ok: true, score, total: pool.length, timeUsed, result, attempt });
  } catch (err) {
    console.error('❌ saturday-quiz/submit:', err);
    res.status(500).json({ error: 'บันทึกคำตอบล้มเหลว' });
  }
});

module.exports = router;
