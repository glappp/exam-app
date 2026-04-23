const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const { source, grade } = req.query;

  try {
    const raw = await prisma.question.findMany({
      where: { source: source || undefined },
      take: 100
    });

    // กรอง grade ใน JS — ถ้ามี source อยู่แล้วไม่ต้อง filter grade ซ้ำ
    // (source เช่น ipst-p6-2558 บ่งบอก grade ชัดเจนอยู่แล้ว)
    const filtered = (grade && !source)
      ? raw.filter(q => {
          const g = q.attributes?.examGrade || '';
          const normalized = /^\d/.test(g) ? 'p' + g : g;
          return normalized === grade || g === grade;
        })
      : raw;

    // เรียงตาม questionNo เช่น "001", "002"
    const questions = filtered.sort((a, b) => {
      const aNo = a.attributes?.questionNo || '000';
      const bNo = b.attributes?.questionNo || '000';
      return aNo.localeCompare(bNo);
    });

    res.json(questions);
  } catch (e) {
    console.error('🔥 Prisma error:', e);
    res.status(500).json({ error: 'Internal Server Error', details: e.message });
  }
});

module.exports = router;
