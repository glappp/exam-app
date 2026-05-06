const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function requireLogin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  next();
}

// หลัง maintenance = อาทิตย์ 05:00+ ICT (review + settle เปิดพร้อมกัน)
function isAfterMaintenance() {
  const ict = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const day  = ict.getUTCDay();
  const hour = ict.getUTCHours();
  return (day === 0 && hour >= 5) || (day >= 1 && day <= 5);
}

// weekKey = วันอาทิตย์ต้นสัปดาห์ (YYYY-MM-DD)
function getWeekKey(date = new Date()) {
  const d = new Date(date);
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

function getSaturdayDate(weekKey) {
  const sun = new Date(weekKey + 'T00:00:00Z');
  sun.setUTCDate(sun.getUTCDate() + 6);
  return sun;
}

function isSaturday() {
  const ict = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return ict.getUTCDay() === 6;
}

// ── สร้าง template (คืนวันศุกร์ = maintenance วันเสาร์ 04:00 ICT) ──────────
// เลือก family ที่จะออกสัปดาห์นี้ — ทำครั้งเดียว ใช้ร่วมกันทุกคน
async function generateWeekTemplate(weekKey) {
  const existing = await prisma.saturdayQuizTemplate.count({ where: { weekKey } });
  if (existing > 0) {
    console.log(`ℹ️  SaturdayQuiz template มีแล้ว: ${weekKey}`);
    return;
  }

  // ดึง official sources
  const officialSets = await prisma.examSetMetadata.findMany({
    where: { isOfficial: true },
    select: { questionSource: true },
  });
  const officialSources = officialSets.map(s => s.questionSource).filter(Boolean);

  // ── 8 ข้อฝึกหัด: เลือก family (parentGroup) ──────────────────────────────
  // ดึงทุกข้อที่ไม่ใช่ official + ไม่มี parentQuestionId (= root ของแต่ละ family)
  const practiceRoots = await prisma.question.findMany({
    where: { parentQuestionId: null },
    select: { id: true, attributes: true, source: true },
  });

  const practiceFiltered = practiceRoots.filter(q => {
    if (!q.source) return true;
    return !officialSources.some(src => q.source.startsWith(src));
  });

  // dedupe ตาม parentGroup — เก็บ root แต่ละ family ไว้หนึ่งตัว
  const seenFamilies = new Set();
  const familyCandidates = [];
  for (const q of practiceFiltered) {
    const fk = q.attributes?.parentGroup || q.id;
    if (!seenFamilies.has(fk)) {
      seenFamilies.add(fk);
      familyCandidates.push({ familyKey: fk, isCompetitive: false });
    }
  }

  const shuffledPractice = familyCandidates.sort(() => Math.random() - 0.5).slice(0, 8);

  // ── 2 ข้อแข่งขัน: ใช้ questionId โดยตรง (ไม่มี family) ───────────────────
  const allQ = await prisma.question.findMany({ select: { id: true, source: true } });
  const competitive = allQ.filter(q => q.source && officialSources.some(src => q.source.startsWith(src)));
  const shuffledComp = competitive.sort(() => Math.random() - 0.5).slice(0, 2);

  const templateData = [
    ...shuffledPractice.map((f, i) => ({ weekKey, slot: i + 1, ...f })),
    ...shuffledComp.map((q, i) => ({ weekKey, slot: 9 + i, familyKey: q.id, isCompetitive: true })),
  ];

  // ล้าง template เก่า (เก็บไว้แค่สัปดาห์นี้)
  await prisma.saturdayQuizTemplate.deleteMany({ where: { weekKey: { not: weekKey } } });
  await prisma.saturdayQuizTemplate.createMany({ data: templateData, skipDuplicates: true });

  console.log(`✅ SaturdayQuiz template สร้างใหม่: ${weekKey} (practice=${shuffledPractice.length}, comp=${shuffledComp.length})`);
}

// ── สร้าง pool สำหรับนักเรียนคนนี้ (ตอนเริ่มสอบ) ──────────────────────────
// สุ่มข้อจาก family ที่ template กำหนด — แต่ละคนได้ variant ต่างกัน
async function generateStudentPool(weekKey, userId) {
  const template = await prisma.saturdayQuizTemplate.findMany({
    where: { weekKey },
    orderBy: { slot: 'asc' },
  });

  if (template.length === 0) {
    // fallback: สร้าง template ถ้าไม่มี (ไม่ควรเกิดในระบบปกติ)
    await generateWeekTemplate(weekKey);
    return generateStudentPool(weekKey, userId);
  }

  const poolData = [];
  for (const t of template) {
    let questionId;
    if (t.isCompetitive) {
      // ข้อแข่งขัน: ใช้ questionId โดยตรง — ทุกคนได้ข้อเดียวกัน
      questionId = t.familyKey;
    } else {
      // ข้อฝึกหัด: สุ่มหนึ่งข้อจาก family เดียวกัน (root + variants)
      const rootQ = await prisma.question.findFirst({
        where: {
          OR: [
            { id: t.familyKey },
            { attributes: { path: ['parentGroup'], equals: t.familyKey } },
          ],
        },
        select: { id: true },
      });

      // ดึง variants ของ root ด้วย
      const variantQ = rootQ
        ? await prisma.question.findMany({
            where: { parentQuestionId: rootQ.id },
            select: { id: true },
          })
        : [];

      const family = [
        ...(rootQ ? [rootQ] : []),
        ...variantQ,
      ];

      if (family.length === 0) {
        // fallback: ใช้ familyKey โดยตรง
        questionId = t.familyKey;
      } else {
        questionId = family[Math.floor(Math.random() * family.length)].id;
      }
    }
    poolData.push({ weekKey, userId, slot: t.slot, questionId });
  }

  await prisma.saturdayQuizPool.createMany({ data: poolData, skipDuplicates: true });
  console.log(`✅ SaturdayQuiz pool สร้างให้ userId=${userId}: ${weekKey}`);
  return poolData;
}

// GET /api/saturday-quiz/questions
router.get('/questions', requireLogin, async (req, res) => {
  try {
    const weekKey = getWeekKey();
    const userId  = req.session.userId;

    if (!isSaturday()) {
      const saturday = getSaturdayDate(weekKey);
      return res.status(403).json({
        error: 'สอบได้เฉพาะวันเสาร์เท่านั้น',
        code: 'NOT_SATURDAY',
        opensAt: saturday.toISOString(),
      });
    }

    // ตรวจว่าสอบแล้วหรือยัง
    const existing = await prisma.saturdayQuizAttempt.findUnique({
      where: { userId_weekKey: { userId, weekKey } },
    });
    if (existing) {
      return res.status(409).json({
        error: 'สอบสัปดาห์นี้แล้ว',
        code: 'ALREADY_ATTEMPTED',
        attempt: existing,
      });
    }

    // ดึง pool ของนักเรียนคนนี้ (สร้างถ้ายังไม่มี)
    let pool = await prisma.saturdayQuizPool.findMany({
      where: { weekKey, userId },
      include: { question: true },
      orderBy: { slot: 'asc' },
    });

    if (pool.length === 0) {
      await generateStudentPool(weekKey, userId);
      pool = await prisma.saturdayQuizPool.findMany({
        where: { weekKey, userId },
        include: { question: true },
        orderBy: { slot: 'asc' },
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

// GET /api/saturday-quiz/review — ดูเฉลย (เปิดวันอาทิตย์ 05:00+ ICT)
router.get('/review', requireLogin, async (req, res) => {
  try {
    if (!isAfterMaintenance()) {
      return res.status(403).json({
        error: 'ดูเฉลยได้หลัง 05:00 น. วันอาทิตย์',
        code: 'REVIEW_NOT_OPEN',
      });
    }

    const currentWeekKey = getWeekKey();
    const prevSun = new Date(currentWeekKey + 'T00:00:00Z');
    prevSun.setUTCDate(prevSun.getUTCDate() - 7);
    const reviewWeekKey = req.query.weekKey || prevSun.toISOString().slice(0, 10);
    const userId = req.session.userId;

    const attempt = await prisma.saturdayQuizAttempt.findUnique({
      where: { userId_weekKey: { userId, weekKey: reviewWeekKey } },
    });
    if (!attempt) {
      return res.status(403).json({
        error: 'ไม่พบผลการสอบ — ดูเฉลยได้เฉพาะคนที่เข้าสอบเท่านั้น',
        code: 'NO_ATTEMPT',
      });
    }

    // ดึง pool ของนักเรียนคนนี้ พร้อม answer
    const pool = await prisma.saturdayQuizPool.findMany({
      where: { weekKey: reviewWeekKey, userId },
      include: { question: true },
      orderBy: { slot: 'asc' },
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
      return { ...q, userAnswer: userAns ?? null, isCorrect: correct };
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
router.post('/submit', requireLogin, async (req, res) => {
  try {
    const { weekKey, answers = {}, timeUsed } = req.body;
    const userId = req.session.userId;
    if (!weekKey || timeUsed == null) {
      return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
    }

    const existing = await prisma.saturdayQuizAttempt.findUnique({
      where: { userId_weekKey: { userId, weekKey } },
    });
    if (existing) return res.status(409).json({ error: 'ส่งคำตอบแล้ว', attempt: existing });

    // ดึง pool ของนักเรียนคนนี้ พร้อม answer
    const pool = await prisma.saturdayQuizPool.findMany({
      where: { weekKey, userId },
      include: { question: { select: { id: true, answer: true, shortAnswer: true, type: true } } },
      orderBy: { slot: 'asc' },
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
      data: { userId, weekKey, score, timeUsed: Math.round(timeUsed), answers },
    });

    res.json({ ok: true, score, total: pool.length, timeUsed, result, attempt });
  } catch (err) {
    console.error('❌ saturday-quiz/submit:', err);
    res.status(500).json({ error: 'บันทึกคำตอบล้มเหลว' });
  }
});

module.exports = { router, generateWeekTemplate };
