const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/random', async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      take: 20
    });

    res.json(questions);
  } catch (error) {
    console.error("❌ ERROR ใน /api/exam-set/random:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/exam-set/adaptive
// ดึงโจทย์จากจุดอ่อนของนักเรียน (อิงจาก weakAttributes ในประวัติสอบ)
router.get('/adaptive', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });

    // รวม weakAttributes จากผลสอบ 10 ครั้งล่าสุด
    const profiles = await prisma.studentProfile.findMany({
      where: { userId },
      select: { id: true }
    });

    const weakTally = {};
    if (profiles.length > 0) {
      const results = await prisma.examResult.findMany({
        where: { studentProfileId: { in: profiles.map(p => p.id) } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { weakAttributes: true }
      });
      results.forEach(r => {
        const w = r.weakAttributes;
        if (!w || typeof w !== 'object') return;
        Object.entries(w).forEach(([k, v]) => {
          if (typeof v === 'number') weakTally[k] = (weakTally[k] || 0) + v;
        });
      });
    }

    // หา topic tags ที่อ่อนสุด 3 อันดับ (score ติดลบมากที่สุด)
    const weakTopicTags = Object.entries(weakTally)
      .filter(([k]) => k.startsWith('topic:'))
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([k]) => k);

    const allQ = await prisma.question.findMany();

    let questions;
    if (weakTopicTags.length > 0) {
      const weakQ = allQ.filter(q =>
        Array.isArray(q.attributes?.topic) &&
        q.attributes.topic.some(t => weakTopicTags.includes(t))
      );
      const restQ = allQ.filter(q => !weakQ.includes(q));
      // จัด weak ก่อน ตามด้วย random เติมให้ครบ 20
      const shuffledWeak = weakQ.sort(() => Math.random() - 0.5);
      const shuffledRest = restQ.sort(() => Math.random() - 0.5);
      questions = [...shuffledWeak, ...shuffledRest].slice(0, 20);
    } else {
      // ยังไม่มีประวัติ → สุ่มธรรมดา
      questions = allQ.sort(() => Math.random() - 0.5).slice(0, 20);
    }

    res.json({ questions, weakTopicTags });
  } catch (error) {
    console.error("❌ ERROR ใน /api/exam-set/adaptive:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
