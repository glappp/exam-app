const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function requireTeacher(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  if (!['admin', 'teacher'].includes(req.session.role)) return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
  next();
}

// GET /api/teacher/class-overview?grade=ป.5&school=xxx&academicYear=2568
router.get('/class-overview', requireTeacher, async (req, res) => {
  try {
    const { grade, school, academicYear } = req.query;
    const yearFilter = academicYear || String(new Date().getFullYear() + 543);

    const profiles = await prisma.studentProfile.findMany({
      where: {
        academicYear: yearFilter,
        status: 'active',
        ...(grade ? { grade } : {}),
        ...(school ? { school } : {})
      },
      include: {
        user: { select: { firstName: true, lastName: true, username: true } },
        examResults: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: { mode: true, score: true, total: true, weakAttributes: true, createdAt: true }
        }
      }
    });

    // สรุปแต่ละนักเรียน
    const students = profiles.map(p => {
      const results = p.examResults;
      const timedResults = results.filter(r => ['competitive', 'official'].includes(r.mode));
      const pcts = timedResults.map(r => r.total ? Math.round(r.score / r.total * 100) : 0);
      const avgPct = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;

      // รวม weak tags จาก timed exams
      const weakTags = {};
      timedResults.forEach(r => {
        const tags = Array.isArray(r.weakAttributes) ? r.weakAttributes : [];
        tags.forEach(t => { weakTags[t] = (weakTags[t] || 0) + 1; });
      });

      return {
        userId: p.userId,
        name: `${p.user.firstName} ${p.user.lastName}`,
        username: p.user.username,
        grade: p.grade,
        examCount: timedResults.length,
        avgPct,
        weakTags: Object.entries(weakTags).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k)
      };
    });

    // หัวข้อที่ทั้งห้องอ่อน (weak tags ที่ปรากฏบ่อยที่สุด)
    const allWeak = {};
    students.forEach(s => s.weakTags.forEach(t => { allWeak[t] = (allWeak[t] || 0) + 1; }));
    const classWeakTopics = Object.entries(allWeak)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([tag, count]) => ({ tag, count, label: tag.replace(/^[^:]+:/, '') }));

    // เด็กที่ต้องดูแลเป็นพิเศษ (สอบน้อยกว่า 3 ครั้ง หรือ avgPct < 50)
    const needAttention = students.filter(s => s.examCount < 3 || (s.avgPct !== null && s.avgPct < 50));

    res.json({ students, classWeakTopics, needAttention, total: students.length });
  } catch (err) {
    console.error('❌ class-overview:', err);
    res.status(500).json({ error: 'โหลดข้อมูลล้มเหลว' });
  }
});

// GET /api/teacher/filters — ดึง grade/school ที่มีอยู่
router.get('/filters', requireTeacher, async (req, res) => {
  try {
    const yearFilter = String(new Date().getFullYear() + 543);
    const profiles = await prisma.studentProfile.findMany({
      where: { academicYear: yearFilter, status: 'active' },
      select: { grade: true, school: true },
      distinct: ['grade', 'school']
    });
    const grades = [...new Set(profiles.map(p => p.grade))].sort();
    const schools = [...new Set(profiles.map(p => p.school))].filter(Boolean).sort();
    res.json({ grades, schools });
  } catch (err) {
    res.status(500).json({ error: 'โหลด filters ล้มเหลว' });
  }
});

module.exports = router;
