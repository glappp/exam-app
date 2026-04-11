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

// GET /api/student/point-log — ประวัติ transaction + ยอดรวม
router.get('/point-log', requireLogin, async (req, res) => {
  try {
    const academicYear = String(new Date().getFullYear() + 543);
    const [transactions, agg] = await Promise.all([
      prisma.pointTransaction.findMany({
        where: { userId: req.session.userId, academicYear },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.pointTransaction.aggregate({
        where: { userId: req.session.userId, academicYear },
        _sum: { amount: true }
      })
    ]);
    res.json({ transactions, totalPoints: agg._sum.amount || 0 });
  } catch (err) {
    res.status(500).json({ error: 'โหลด point log ล้มเหลว' });
  }
});

// POST /api/student/parent-deduct — ผู้ปกครองหักคะแนน
router.post('/parent-deduct', requireLogin, async (req, res) => {
  try {
    const { amount, note } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'จำนวนไม่ถูกต้อง' });
    const academicYear = String(new Date().getFullYear() + 543);

    const agg = await prisma.pointTransaction.aggregate({
      where: { userId: req.session.userId, academicYear },
      _sum: { amount: true }
    });
    const balance = agg._sum.amount || 0;
    if (balance < amount) return res.status(400).json({ error: `คะแนนไม่พอ (มี ${balance} ⭐)` });

    const tx = await prisma.pointTransaction.create({
      data: {
        userId: req.session.userId,
        academicYear,
        type: 'parent_deduct',
        amount: -amount,
        note: note || 'แลกรางวัล'
      }
    });
    res.json({ success: true, transaction: tx, newBalance: balance - amount });
  } catch (err) {
    console.error('❌ parent-deduct:', err);
    res.status(500).json({ error: 'หักคะแนนล้มเหลว' });
  }
});

// GET /api/student/character — LV + XP + class name
router.get('/character', requireLogin, async (req, res) => {
  try {
    const char = await prisma.characterState.findUnique({ where: { userId: req.session.userId } });
    const xp = char?.totalXp || 0;
    const level = char?.level || 1;
    const XP_TABLE = [0,50,120,220,360,550,800,1120,1520,2020,2620,3320,4120,5020,6120,7420,8920,10620,12620,15020,18020];
    const CLASS_NAME = ['','นักเรียนใหม่','นักเรียนใหม่','นักเรียนใหม่','นักเรียนใหม่','นักเรียนใหม่','นักสู้','นักสู้','นักสู้','นักสู้','นักสู้','จอมเวทย์','จอมเวทย์','จอมเวทย์','จอมเวทย์','จอมเวทย์','อัศวิน','อัศวิน','อัศวิน','อัศวิน','อัศวิน'];
    const CLASS_ICON = ['','🌱','🌱','🌱','🌱','🌱','⚔️','⚔️','⚔️','⚔️','⚔️','🧙','🧙','🧙','🧙','🧙','🦅','🦅','🦅','🦅','🦅'];
    const xpThisLevel = XP_TABLE[Math.min(level - 1, XP_TABLE.length - 1)] || 0;
    const xpNextLevel = XP_TABLE[Math.min(level, XP_TABLE.length - 1)] || xpThisLevel + 500;
    res.json({
      level, totalXp: xp,
      className: CLASS_NAME[Math.min(level, CLASS_NAME.length - 1)] || 'ราชันย์',
      classIcon: CLASS_ICON[Math.min(level, CLASS_ICON.length - 1)] || '👑',
      xpThisLevel, xpNextLevel,
      xpProgress: xp - xpThisLevel,
      xpNeeded: xpNextLevel - xpThisLevel
    });
  } catch (err) {
    res.status(500).json({ error: 'โหลดตัวละครล้มเหลว' });
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

// GET /api/student/topic-stats — accuracy ต่อ topic สำหรับ practice overview
const PASS_ACCURACY     = 0.70;
const PASS_MIN_ATTEMPTS = 10;

router.get('/topic-stats', requireLogin, async (req, res) => {
  try {
    const profile = await prisma.studentProfile.findFirst({
      where: { userId: req.session.userId },
      orderBy: { createdAt: 'desc' }
    });
    if (!profile) return res.json({ stats: {} });

    // ดึง ExamAnswer พร้อม Question attributes
    const answers = await prisma.examAnswer.findMany({
      where: { studentProfileId: profile.id },
      select: {
        isCorrect: true,
        question: { select: { attributes: true } }
      }
    });
    if (answers.length === 0) return res.json({ stats: {} });

    // สะสม attempted/correct ต่อ grade → topic → subtopic
    const stats = {};
    for (const a of answers) {
      const g = a.question?.attributes?.examGrade || '';
      const grade   = /^\d/.test(g) ? 'p' + g : g;
      const topic   = (a.question?.attributes?.topic    || [])[0];
      const subtopic = (a.question?.attributes?.subtopic || [])[0];
      if (!grade || !topic) continue;
      if (!stats[grade]) stats[grade] = {};
      if (!stats[grade][topic]) stats[grade][topic] = {};
      if (subtopic) {
        if (!stats[grade][topic][subtopic]) stats[grade][topic][subtopic] = { attempted: 0, correct: 0 };
        stats[grade][topic][subtopic].attempted++;
        if (a.isCorrect) stats[grade][topic][subtopic].correct++;
      }
    }

    // คำนวณ accuracy + passed ต่อ subtopic
    for (const grade of Object.keys(stats)) {
      for (const topic of Object.keys(stats[grade])) {
        for (const sub of Object.keys(stats[grade][topic])) {
          const s = stats[grade][topic][sub];
          s.accuracy = s.attempted > 0 ? s.correct / s.attempted : 0;
          s.passed   = s.attempted >= PASS_MIN_ATTEMPTS && s.accuracy >= PASS_ACCURACY;
        }
      }
    }

    res.json({ stats });
  } catch (err) {
    console.error('❌ topic-stats:', err);
    res.status(500).json({ error: 'โหลด topic stats ล้มเหลว' });
  }
});

module.exports = router;
