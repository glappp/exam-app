const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function requireAdmin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  if (req.session.role !== 'admin') return res.status(403).json({ error: 'สิทธิ์ไม่เพียงพอ' });
  next();
}

// GET /api/admin/users — all users + profile summary
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, username: true, firstName: true, lastName: true,
        email: true, role: true, createdAt: true,
        studentProfiles: {
          select: {
            grade: true, school: true, academicYear: true,
            _count: { select: { examResults: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'โหลด users ล้มเหลว' });
  }
});

// GET /api/admin/results — recent exam results with user info
router.get('/results', requireAdmin, async (req, res) => {
  try {
    const results = await prisma.examResult.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        studentProfile: {
          select: {
            grade: true, school: true, academicYear: true,
            user: { select: { firstName: true, lastName: true, username: true } }
          }
        }
      }
    });
    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'โหลดผลสอบล้มเหลว' });
  }
});

// GET /api/admin/stats — summary numbers
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [userCount, questionCount, resultCount] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.examResult.count()
    ]);
    res.json({ userCount, questionCount, resultCount });
  } catch (err) {
    res.status(500).json({ error: 'โหลด stats ล้มเหลว' });
  }
});

// PATCH /api/admin/users/:id/role — change user role (+schoolId optional)
router.patch('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { role, schoolId } = req.body;
    if (!['admin', 'school_admin', 'teacher', 'student'].includes(role)) {
      return res.status(400).json({ error: 'role ไม่ถูกต้อง' });
    }
    const data = { role };
    if (schoolId !== undefined) data.schoolId = schoolId ? parseInt(schoolId) : null;
    const user = await prisma.user.update({ where: { id: parseInt(req.params.id) }, data });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'เปลี่ยน role ล้มเหลว' });
  }
});

// ── Schools ──────────────────────────────────────────────

// GET /api/admin/schools
router.get('/schools', requireAdmin, async (req, res) => {
  try {
    const schools = await prisma.school.findMany({ orderBy: { province: 'asc' } });
    res.json({ schools });
  } catch (err) {
    res.status(500).json({ error: 'โหลดโรงเรียนล้มเหลว' });
  }
});

// POST /api/admin/schools
router.post('/schools', requireAdmin, async (req, res) => {
  try {
    const { name, district, province } = req.body;
    if (!name || !district || !province) return res.status(400).json({ error: 'กรอกข้อมูลไม่ครบ' });
    const school = await prisma.school.create({ data: { name, district, province } });
    res.json({ success: true, school });
  } catch (err) {
    res.status(500).json({ error: 'สร้างโรงเรียนล้มเหลว' });
  }
});

// PATCH /api/admin/schools/:id
router.patch('/schools/:id', requireAdmin, async (req, res) => {
  try {
    const { name, district, province, isActive } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (district !== undefined) data.district = district;
    if (province !== undefined) data.province = province;
    if (isActive !== undefined) data.isActive = isActive;
    const school = await prisma.school.update({ where: { id: parseInt(req.params.id) }, data });
    res.json({ success: true, school });
  } catch (err) {
    res.status(500).json({ error: 'แก้ไขโรงเรียนล้มเหลว' });
  }
});

// DELETE /api/admin/schools/:id
router.delete('/schools/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.school.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ลบโรงเรียนล้มเหลว' });
  }
});

module.exports = router;
