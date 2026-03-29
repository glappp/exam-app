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
  if (req.session.role !== 'admin' && req.session.role !== 'teacher') {
    return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
  }
  next();
}

// GET /api/announcements — ประกาศที่ยังไม่ได้อ่านของ user นี้
router.get('/', requireLogin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { role: true }
    });
    const now = new Date();
    const all = await prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        OR: [{ targetRole: null }, { targetRole: user?.role }]
      },
      orderBy: { createdAt: 'desc' }
    });

    const reads = await prisma.announcementRead.findMany({
      where: { userId: req.session.userId },
      select: { announcementId: true }
    });
    const readIds = new Set(reads.map(r => r.announcementId));
    const unread = all.filter(a => !readIds.has(a.id));

    res.json({ announcements: unread });
  } catch (err) {
    console.error('❌ announcements GET:', err);
    res.status(500).json({ error: 'โหลดประกาศล้มเหลว' });
  }
});

// POST /api/announcements/:id/read — mark as read
router.post('/:id/read', requireLogin, async (req, res) => {
  try {
    await prisma.announcementRead.upsert({
      where: { userId_announcementId: { userId: req.session.userId, announcementId: parseInt(req.params.id) } },
      update: {},
      create: { userId: req.session.userId, announcementId: parseInt(req.params.id) }
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'บันทึกการอ่านล้มเหลว' });
  }
});

// POST /api/announcements — admin/teacher สร้างประกาศ
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, body, targetRole, expiresAt } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'กรุณากรอกหัวข้อและเนื้อหา' });
    const ann = await prisma.announcement.create({
      data: {
        title,
        body,
        targetRole: targetRole || null,
        createdById: req.session.userId,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });
    res.json({ success: true, announcement: ann });
  } catch (err) {
    console.error('❌ announcements POST:', err);
    res.status(500).json({ error: 'สร้างประกาศล้มเหลว' });
  }
});

// DELETE /api/announcements/:id — admin ลบ/ปิดประกาศ
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.announcement.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false }
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'ลบประกาศล้มเหลว' });
  }
});

module.exports = router;
