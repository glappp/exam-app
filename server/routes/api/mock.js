const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function requireLogin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  if (!['admin', 'teacher'].includes(req.session.role)) return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
  next();
}

// GET /api/mock/blueprints
router.get('/blueprints', requireLogin, async (req, res) => {
  try {
    const blueprints = await prisma.mockBlueprint.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ blueprints: blueprints.map(b => ({
      ...b,
      topics: JSON.parse(b.topics),
      difficulty: JSON.parse(b.difficulty)
    })) });
  } catch (err) {
    res.status(500).json({ error: 'โหลด blueprints ล้มเหลว' });
  }
});

// GET /api/mock/exam?blueprintId=1
router.get('/exam', requireLogin, async (req, res) => {
  try {
    const id = parseInt(req.query.blueprintId);
    if (!id) return res.status(400).json({ error: 'ต้องระบุ blueprintId' });

    const bp = await prisma.mockBlueprint.findUnique({ where: { id } });
    if (!bp) return res.status(404).json({ error: 'ไม่พบ blueprint' });

    const topics = JSON.parse(bp.topics);
    const diff = JSON.parse(bp.difficulty);
    const allQ = await prisma.question.findMany();

    const selected = [];

    for (const { tag, count } of topics) {
      const pool = allQ.filter(q =>
        ['topic','skill','trap'].some(type =>
          Array.isArray(q.attributes?.[type]) && q.attributes[type].includes(tag)
        )
      );
      if (!pool.length) continue;

      const easy   = pool.filter(q => q.attributes?.difficulty === 1);
      const medium  = pool.filter(q => q.attributes?.difficulty === 2);
      const hard    = pool.filter(q => q.attributes?.difficulty === 3);
      const anyDiff = pool;

      const nEasy   = Math.round(count * diff.easy   / 100);
      const nMedium = Math.round(count * diff.medium  / 100);
      const nHard   = Math.max(0, count - nEasy - nMedium);

      const pick = (arr, n) => arr.slice().sort(() => Math.random() - 0.5).slice(0, n);

      const batch = [
        ...pick(easy.length   ? easy   : anyDiff, nEasy),
        ...pick(medium.length ? medium : anyDiff, nMedium),
        ...pick(hard.length   ? hard   : anyDiff, nHard),
      ];

      if (batch.length < count) {
        const usedIds = new Set(batch.map(q => q.id));
        const extra = pool.filter(q => !usedIds.has(q.id)).sort(() => Math.random() - 0.5);
        batch.push(...extra.slice(0, count - batch.length));
      }
      selected.push(...batch.slice(0, count));
    }

    if (selected.length < bp.totalQuestions) {
      const usedIds = new Set(selected.map(q => q.id));
      const extra = allQ.filter(q => !usedIds.has(q.id)).sort(() => Math.random() - 0.5);
      selected.push(...extra.slice(0, bp.totalQuestions - selected.length));
    }

    const questions = selected.slice(0, bp.totalQuestions).sort(() => Math.random() - 0.5);

    res.json({
      blueprint: { ...bp, topics: JSON.parse(bp.topics), difficulty: JSON.parse(bp.difficulty) },
      questions
    });
  } catch (err) {
    console.error('❌ mock/exam:', err);
    res.status(500).json({ error: 'สร้างชุดข้อสอบล้มเหลว' });
  }
});

// GET /api/mock/history
router.get('/history', requireLogin, async (req, res) => {
  try {
    const profiles = await prisma.studentProfile.findMany({
      where: { userId: req.session.userId },
      select: { id: true }
    });
    if (!profiles.length) return res.json({ history: [] });

    const results = await prisma.examResult.findMany({
      where: {
        studentProfileId: { in: profiles.map(p => p.id) },
        mode: 'mock'
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const history = await Promise.all(results.map(async r => {
      const bpId = r.examSetCode ? parseInt(r.examSetCode.replace('mock-', '')) : null;
      let bpName = 'Mock';
      let avgPassScore = null;
      if (bpId) {
        const bp = await prisma.mockBlueprint.findUnique({ where: { id: bpId } });
        if (bp) { bpName = bp.name; avgPassScore = bp.avgPassScore; }
      }
      const stars = avgPassScore !== null ? calcStars(r.score, avgPassScore) : null;
      return { ...r, bpName, avgPassScore, stars };
    }));

    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: 'โหลดประวัติล้มเหลว' });
  }
});

// POST /api/mock/blueprints
router.post('/blueprints', requireAdmin, async (req, res) => {
  try {
    const { name, grade, timeLimitSec, totalQuestions, avgPassScore, topics, difficulty } = req.body;
    if (!name || !grade || !avgPassScore || !topics?.length) {
      return res.status(400).json({ error: 'กรอกข้อมูลไม่ครบ' });
    }
    const bp = await prisma.mockBlueprint.create({
      data: {
        name, grade,
        timeLimitSec: timeLimitSec || 3600,
        totalQuestions: totalQuestions || topics.reduce((s, t) => s + t.count, 0),
        avgPassScore: parseFloat(avgPassScore),
        topics: JSON.stringify(topics),
        difficulty: JSON.stringify(difficulty || { easy: 30, medium: 50, hard: 20 })
      }
    });
    res.json({ success: true, blueprint: bp });
  } catch (err) {
    console.error('❌ mock/blueprints POST:', err);
    res.status(500).json({ error: 'สร้าง blueprint ล้มเหลว' });
  }
});

// DELETE /api/mock/blueprints/:id
router.delete('/blueprints/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.mockBlueprint.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false }
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'ลบล้มเหลว' });
  }
});

function calcStars(score, avgPass) {
  const diff = score - avgPass;
  if (diff >= 15) return 5;
  if (diff >= 8)  return 4;
  if (diff >= 1)  return 3;
  if (diff >= -7) return 2;
  return 1;
}

module.exports = router;
