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
// บันทึก candidates ทุกตัวของแต่ละ slot ไว้ล่วงหน้า
// practice slot: 1 root + ≤5 variants = สูงสุด 6 candidates
// competitive slot: 1 ข้อตรงๆ — ไม่มี family
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

  // ── 8 ข้อฝึกหัด: เลือก family root ──────────────────────────────────────
  const practiceRoots = await prisma.question.findMany({
    where: { parentQuestionId: null },
    select: { id: true, attributes: true, source: true },
    include: { variants: { select: { id: true } } },
  });

  const practiceFiltered = practiceRoots.filter(q => {
    if (!q.source) return true;
    return !officialSources.some(src => q.source.startsWith(src));
  });

  // dedupe ตาม parentGroup
  const seenFamilies = new Set();
  const familyPool = [];
  for (const q of practiceFiltered) {
    const fk = q.attributes?.parentGroup || q.id;
    if (!seenFamilies.has(fk)) {
      seenFamilies.add(fk);
      // candidates = root + variants (≤5 variants → สูงสุด 6)
      familyPool.push({
        candidates: [{ id: q.id }, ...q.variants].slice(0, 6),
      });
    }
  }

  const shuffledFamilies = familyPool.sort(() => Math.random() - 0.5).slice(0, 8);

  // ── 2 ข้อแข่งขัน ─────────────────────────────────────────────────────────
  const allQ = await prisma.question.findMany({ select: { id: true, source: true } });
  const competitive = allQ
    .filter(q => q.source && officialSources.some(src => q.source.startsWith(src)))
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  // ── บันทึก template ───────────────────────────────────────────────────────
  const rows = [];
  shuffledFamilies.forEach((f, i) => {
    f.candidates.forEach(c => {
      rows.push({ weekKey, slot: i + 1, questionId: c.id, isCompetitive: false });
    });
  });
  competitive.forEach((q, i) => {
    rows.push({ weekKey, slot: 9 + i, questionId: q.id, isCompetitive: true });
  });

  await prisma.saturdayQuizTemplate.deleteMany({ where: { weekKey: { not: weekKey } } });
  await prisma.saturdayQuizTemplate.createMany({ data: rows, skipDuplicates: true });

  const practiceCount = shuffledFamilies.length;
  const candidateCount = rows.filter(r => !r.isCompetitive).length;
  console.log(`✅ SaturdayQuiz template: ${weekKey} — ${practiceCount} slots, ${candidateCount} practice candidates, ${competitive.length} competitive`);
}

// ── สร้าง pool สำหรับนักเรียนคนนี้ (ตอนเริ่มสอบ) ──────────────────────────
// สุ่ม 1 candidate ต่อ slot จาก template ที่เตรียมไว้แล้ว
async function generateStudentPool(weekKey, userId) {
  const templateRows = await prisma.saturdayQuizTemplate.findMany({
    where: { weekKey },
    orderBy: { slot: 'asc' },
  });

  if (templateRows.length === 0) {
    // fallback: สร้าง template ถ้าไม่มี
    await generateWeekTemplate(weekKey);
    return generateStudentPool(weekKey, userId);
  }

  // group candidates ตาม slot
  const bySlot = new Map();
  for (const row of templateRows) {
    if (!bySlot.has(row.slot)) bySlot.set(row.slot, []);
    bySlot.get(row.slot).push(row);
  }

  const poolData = [];
  for (const [slot, candidates] of [...bySlot.entries()].sort((a, b) => a[0] - b[0])) {
    // สุ่ม 1 จาก candidates ของ slot นี้
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    poolData.push({ weekKey, userId, slot, questionId: picked.questionId });
  }

  await prisma.saturdayQuizPool.createMany({ data: poolData, skipDuplicates: true });
  console.log(`✅ SaturdayQuiz pool userId=${userId}: ${weekKey} (${poolData.length} questions)`);
  return poolData;
}

// GET /api/saturday-quiz/questions
router.get('/questions', requireLogin, async (req, res) => {
  try {
    const weekKey = getWeekKey();
    const userId  = req.session.userId;

    const isAdmin = ['admin', 'school_admin', 'teacher'].includes(req.session.role);
    const devBypass = process.env.NODE_ENV !== 'production' && req.query.dev === '1';
    const bypass = isAdmin || devBypass;

    if (!isSaturday() && !bypass) {
      const saturday = getSaturdayDate(weekKey);
      return res.status(403).json({
        error: 'สอบได้เฉพาะวันเสาร์เท่านั้น',
        code: 'NOT_SATURDAY',
        opensAt: saturday.toISOString(),
      });
    }

    // ตรวจ active season
    if (!bypass) {
      const activeSeason = await prisma.leaderboardSeason.findFirst({
        where: { status: 'active' },
      });
      if (!activeSeason) {
        return res.status(403).json({
          error: 'ขณะนี้ปิด Season แล้ว — สอบประจำสัปดาห์จะเปิดอีกครั้งเมื่อเริ่ม Season ใหม่',
          code: 'NO_ACTIVE_SEASON',
        });
      }
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
