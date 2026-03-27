const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ✅ ดึงโจทย์แบบ paginated + filter (สำหรับ list-questions.html)
router.get('/', async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page) || 1);
    const limit    = 20;
    const keyword  = (req.query.keyword || '').trim();
    const difficulty = req.query.difficulty;
    const attrType   = req.query.attrType;
    const attrValue  = req.query.attrValue;

    const where = {};
    if (keyword) where.textTh = { contains: keyword };
    if (difficulty && difficulty !== 'all') {
      const diffMap = { easy: '1', medium: '2', hard: '3' };
      where.difficulty = diffMap[difficulty] || difficulty;
    }

    // ดึงทั้งหมดที่ผ่าน where แล้วกรอง attrType/attrValue ใน JS
    let allMatching = await prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    if (attrType && attrValue && attrValue !== 'all') {
      allMatching = allMatching.filter(q => {
        const attrs = q.attributes?.[attrType];
        return Array.isArray(attrs) && attrs.some(a => a.includes(attrValue));
      });
    }

    const total      = allMatching.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage   = Math.min(page, totalPages);
    const questions  = allMatching.slice((safePage - 1) * limit, safePage * limit);

    res.json({ questions, currentPage: safePage, totalPages, total });
  } catch (err) {
    console.error('❌ ดึงโจทย์ล้มเหลว:', err);
    res.status(500).json({ error: 'ดึงโจทย์ไม่สำเร็จ' });
  }
});

// ✅ ดึงโจทย์ทั้งหมด (ใน practice mode ใช้)
router.get('/all', async (req, res) => {
  try {
    const questions = await prisma.question.findMany();
    res.json({ questions });
  } catch (err) {
    console.error('❌ ดึงโจทย์ล้มเหลว:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงโจทย์ได้' });
  }
});

// ✅ ดึงโจทย์รายข้อ
router.get('/:id', async (req, res) => {
  try {
    const question = await prisma.question.findUnique({ where: { id: req.params.id } });
    if (!question) return res.status(404).json({ error: 'ไม่พบโจทย์' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: 'ดึงโจทย์ไม่สำเร็จ' });
  }
});

// ✅ แก้ไขโจทย์
router.put('/:id', async (req, res) => {
  try {
    const { questionText, answer, attributesJson, code } = req.body;
    const attributes = attributesJson ? JSON.parse(attributesJson) : undefined;

    const data = {};
    if (questionText !== undefined) { data.textTh = questionText; data.textEn = questionText; }
    if (answer !== undefined) data.answer = parseInt(answer);
    if (attributes !== undefined) {
      data.attributes = attributes;
      data.difficulty = String(attributes.difficulty ?? 1);
    }
    if (code !== undefined) data.code = code || null;

    const question = await prisma.question.update({ where: { id: req.params.id }, data });
    res.json({ success: true, question });
  } catch (err) {
    console.error('❌ แก้ไขโจทย์ล้มเหลว:', err);
    res.status(500).json({ error: 'แก้ไขโจทย์ไม่สำเร็จ' });
  }
});

module.exports = router;
