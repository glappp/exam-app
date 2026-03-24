const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
