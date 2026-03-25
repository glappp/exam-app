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

// PATCH /api/admin/users/:id/role — change user role
router.patch('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'teacher', 'student'].includes(role)) {
      return res.status(400).json({ error: 'role ไม่ถูกต้อง' });
    }
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { role }
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'เปลี่ยน role ล้มเหลว' });
  }
});

module.exports = router;
