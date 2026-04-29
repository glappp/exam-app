const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/feedback — รับ feedback จาก widget
router.post('/', async (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อน' });
  }
  const { name, message, page } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'กรุณาใส่ข้อความ' });
  }
  try {
    await prisma.feedback.create({
      data: {
        name:    name?.trim()    || null,
        message: message.trim(),
        page:    page?.trim()    || null,
        userId:  req.session?.userId || null,
      }
    });
    res.json({ success: true });
  } catch (err) {
    console.error('feedback error:', err);
    res.status(500).json({ error: 'บันทึกไม่สำเร็จ' });
  }
});

// GET /api/feedback — admin ดูรายการ (ต้อง login เป็น admin)
router.get('/', async (req, res) => {
  if (req.session?.role !== 'admin') {
    return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
  }
  try {
    const list = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'โหลดไม่สำเร็จ' });
  }
});

module.exports = router;
