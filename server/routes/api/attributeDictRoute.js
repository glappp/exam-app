// server/routes/api/attributeDictRoute.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/attribute-dict — ดึงทั้งหมด (filter ด้วย ?type=topic&grade=6)
router.get('/attribute-dict', async (req, res) => {
  try {
    const { type, grade } = req.query;
    const where = {};
    if (type) where.type = type;
    if (grade) where.grade = parseInt(grade);
    const items = await prisma.attributeDictionary.findMany({
      where,
      orderBy: [{ type: 'asc' }, { grade: 'asc' }, { key: 'asc' }]
    });
    res.json(items);
  } catch (err) {
    console.error('❌ Error loading attribute dictionary:', err);
    res.status(500).json({ error: 'โหลด attribute dictionary ไม่สำเร็จ' });
  }
});

// POST /api/attribute-dict — สร้างใหม่
router.post('/attribute-dict', async (req, res) => {
  try {
    const { key, type, th, en, grade } = req.body;
    if (!key || !type || !th || !en) {
      return res.status(400).json({ error: 'กรุณากรอก key, type, th, en' });
    }
    const item = await prisma.attributeDictionary.create({
      data: { key, type, th, en, grade: grade ? parseInt(grade) : null }
    });
    res.json({ success: true, item });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'key นี้มีอยู่แล้ว' });
    }
    console.error('❌ Error creating attribute:', err);
    res.status(500).json({ error: 'สร้าง attribute ไม่สำเร็จ' });
  }
});

// PUT /api/attribute-dict/:key — แก้ไข
router.put('/attribute-dict/:key', async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);
    const { th, en, grade } = req.body;
    const item = await prisma.attributeDictionary.update({
      where: { key },
      data: { th, en, grade: grade ? parseInt(grade) : null }
    });
    res.json({ success: true, item });
  } catch (err) {
    console.error('❌ Error updating attribute:', err);
    res.status(500).json({ error: 'แก้ไข attribute ไม่สำเร็จ' });
  }
});

// DELETE /api/attribute-dict/:key — ลบ
router.delete('/attribute-dict/:key', async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);
    await prisma.attributeDictionary.delete({ where: { key } });
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error deleting attribute:', err);
    res.status(500).json({ error: 'ลบ attribute ไม่สำเร็จ' });
  }
});

// เก็บ route เดิมไว้ backward compat
router.get('/attributeDict.json', async (req, res) => {
  try {
    const items = await prisma.attributeDictionary.findMany();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'โหลด attribute dictionary ไม่สำเร็จ' });
  }
});

module.exports = router;
