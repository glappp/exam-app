const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function requireLogin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  next();
}

// GET /api/student/me — user info + latest profile + recent exam results
router.get('/me', requireLogin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true, username: true, firstName: true, lastName: true, email: true, role: true,
        studentProfiles: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            examResults: {
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        }
      }
    });
    if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });

    const profile = user.studentProfiles[0] || null;
    const examResults = profile?.examResults || [];

    res.json({ user, profile, examResults });
  } catch (err) {
    console.error('❌ student/me:', err);
    res.status(500).json({ error: 'โหลดข้อมูลล้มเหลว' });
  }
});

// PUT /api/student/profile — create or update StudentProfile for current year
router.put('/profile', requireLogin, async (req, res) => {
  try {
    const { academicYear, school, district, province, grade, classroom, studentCode } = req.body;
    if (!academicYear || !school || !grade) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ (ปีการศึกษา / โรงเรียน / ระดับชั้น)' });
    }

    const existing = await prisma.studentProfile.findFirst({
      where: { userId: req.session.userId, academicYear }
    });

    const data = { school, district: district || '', province: province || '', grade, classroom: classroom || null, studentCode: studentCode || null };

    let profile;
    if (existing) {
      profile = await prisma.studentProfile.update({ where: { id: existing.id }, data });
    } else {
      profile = await prisma.studentProfile.create({ data: { ...data, userId: req.session.userId, academicYear } });
    }

    res.json({ success: true, profile });
  } catch (err) {
    console.error('❌ student/profile PUT:', err);
    res.status(500).json({ error: 'บันทึกโปรไฟล์ล้มเหลว' });
  }
});

// GET /api/student/history — paginated exam history
router.get('/history', requireLogin, async (req, res) => {
  try {
    const profiles = await prisma.studentProfile.findMany({
      where: { userId: req.session.userId },
      select: { id: true }
    });
    if (!profiles.length) return res.json({ results: [] });

    const profileIds = profiles.map(p => p.id);
    const results = await prisma.examResult.findMany({
      where: { studentProfileId: { in: profileIds } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: 'โหลดประวัติล้มเหลว' });
  }
});

// GET /api/student/daily-mission — สถานะภารกิจวันนี้ + คะแนนสะสม
router.get('/daily-mission', requireLogin, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const academicYear = String(new Date().getFullYear() + 543);

    const [mission, pointsAgg] = await Promise.all([
      prisma.dailyMission.findUnique({
        where: { userId_date: { userId: req.session.userId, date: today } }
      }),
      prisma.pointTransaction.aggregate({
        where: { userId: req.session.userId, academicYear },
        _sum: { amount: true }
      })
    ]);

    res.json({
      today,
      questionsCount: mission?.questionsCount || 0,
      baseCompleted: mission?.baseCompleted || false,
      pointsEarnedToday: mission?.pointsEarned || 0,
      totalPoints: pointsAgg._sum.amount || 0,
      dailyGoal: 10
    });
  } catch (err) {
    console.error('❌ daily-mission:', err);
    res.status(500).json({ error: 'โหลดภารกิจล้มเหลว' });
  }
});

module.exports = router;
