const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/random', async (req, res) => {
  try {
    const all = await prisma.question.findMany({ select: { id: true } });

    // สุ่มลำดับ แล้วเลือก 20 ข้อแรก
    const shuffled = all.sort(() => Math.random() - 0.5).slice(0, 20);
    const ids = shuffled.map(q => q.id);

    const questions = await prisma.question.findMany({
      where: { id: { in: ids } }
    });

    // เรียงตามลำดับที่สุ่มได้
    const map = new Map(questions.map(q => [q.id, q]));
    const ordered = ids.map(id => map.get(id)).filter(Boolean);

    res.json(ordered);
  } catch (error) {
    console.error("❌ ERROR ใน /api/exam-set/random:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
