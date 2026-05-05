const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function requireTeacher(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  if (!['admin', 'school_admin', 'teacher'].includes(req.session.role)) return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
  next();
}

// สคูลที่ต้องใช้กรอง — admin ดูทุกโรงเรียน, teacher/school_admin ดูแค่โรงเรียนตัวเอง
async function resolveSchoolFilter(req, schoolParam) {
  if (req.session.role === 'admin') return schoolParam || undefined;
  if (!req.session.schoolId) return null; // ไม่ผูก school → ไม่ได้ข้อมูล
  const school = await prisma.school.findUnique({ where: { id: req.session.schoolId } });
  return school?.name || null;
}

// GET /api/teacher/filters
router.get('/filters', requireTeacher, async (req, res) => {
  try {
    const yearFilter = req.query.academicYear || String(new Date().getFullYear() + 543);
    const schoolName = await resolveSchoolFilter(req);

    const where = { academicYear: yearFilter, status: 'active' };
    if (schoolName) where.school = schoolName;

    const profiles = await prisma.studentProfile.findMany({
      where, select: { grade: true, classroom: true, school: true }, distinct: ['grade', 'classroom']
    });

    const grades = [...new Set(profiles.map(p => p.grade))].sort();
    const classrooms = [...new Set(profiles.map(p => p.classroom).filter(Boolean))].sort();
    const schools = req.session.role === 'admin'
      ? [...new Set(profiles.map(p => p.school).filter(Boolean))].sort()
      : [];

    res.json({ grades, classrooms, schools, schoolName: schoolName || null });
  } catch (err) {
    res.status(500).json({ error: 'โหลด filters ล้มเหลว' });
  }
});

// GET /api/teacher/class-overview?grade=ป.5&classroom=1&academicYear=2568
router.get('/class-overview', requireTeacher, async (req, res) => {
  try {
    const { grade, classroom, academicYear } = req.query;
    const yearFilter = academicYear || String(new Date().getFullYear() + 543);
    const schoolName = await resolveSchoolFilter(req, req.query.school);
    if (schoolName === null) return res.json({ students: [], classWeakTopics: [], needAttention: [], total: 0 });

    const where = { academicYear: yearFilter, status: 'active' };
    if (schoolName) where.school = schoolName;
    if (grade) where.grade = grade;
    if (classroom) where.classroom = classroom;

    const profiles = await prisma.studentProfile.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, username: true } },
        examResults: {
          orderBy: { createdAt: 'desc' }, take: 20,
          select: { mode: true, score: true, total: true, weakAttributes: true, createdAt: true }
        }
      }
    });

    const students = profiles.map(p => {
      const timedResults = p.examResults.filter(r => ['competitive', 'official', 'mock'].includes(r.mode));
      const pcts = timedResults.map(r => r.total ? Math.round(r.score / r.total * 100) : 0);
      const avgPct = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;
      const weakTags = {};
      timedResults.forEach(r => {
        const wa = r.weakAttributes;
        if (wa && typeof wa === 'object') {
          Object.entries(wa).forEach(([k, v]) => { if (v < 0) weakTags[k] = (weakTags[k] || 0) + 1; });
        }
      });
      return {
        userId: p.userId,
        name: `${p.user.firstName} ${p.user.lastName}`,
        username: p.user.username,
        grade: p.grade,
        classroom: p.classroom,
        examCount: timedResults.length,
        avgPct,
        weakTags: Object.entries(weakTags).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k)
      };
    });

    const allWeak = {};
    students.forEach(s => s.weakTags.forEach(t => { allWeak[t] = (allWeak[t] || 0) + 1; }));
    const classWeakTopics = Object.entries(allWeak).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([tag, count]) => ({ tag, count, label: tag.replace(/^[^:]+:/, '') }));

    const needAttention = students.filter(s => s.examCount < 3 || (s.avgPct !== null && s.avgPct < 50));

    res.json({ students, classWeakTopics, needAttention, total: students.length });
  } catch (err) {
    console.error('class-overview:', err);
    res.status(500).json({ error: 'โหลดข้อมูลล้มเหลว' });
  }
});

// GET /api/teacher/classroom-scores — ClassroomScoreUpload ของโรงเรียน (ทั้งหมด ไม่ filter ปี/ภาค)
router.get('/classroom-scores', requireTeacher, async (req, res) => {
  try {
    const schoolName = await resolveSchoolFilter(req);
    if (schoolName === null) return res.json({ uploads: [] });

    const where = {};
    if (schoolName) where.school = schoolName;

    const uploads = await prisma.classroomScoreUpload.findMany({
      where, orderBy: { createdAt: 'desc' },
      select: { id: true, academicYear: true, term: true, examPeriod: true, school: true, grade: true, subject: true, stats: true, createdAt: true }
    });

    res.json({ uploads });
  } catch (err) {
    res.status(500).json({ error: 'โหลดคะแนนล้มเหลว' });
  }
});

// GET /api/teacher/school-stats?days=7 — สถิติรวมโรงเรียน (จาก DailyUsageStat)
router.get('/school-stats', requireTeacher, async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 7, 30);
    const schoolId = req.session.schoolId || null;

    // ช่วงวันที่ days วันล่าสุด
    const dateList = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dateList.push(d.toISOString().slice(0, 10));
    }

    // ดึง school-level stats (grade=null, classroom=null)
    const stats = await prisma.dailyUsageStat.findMany({
      where: {
        date: { in: dateList },
        schoolId: schoolId,
        grade: null,
        classroom: null,
      },
      orderBy: { date: 'asc' },
    });

    // นักเรียนทั้งหมดในโรงเรียน
    const yearFilter = String(new Date().getFullYear() + 543);
    const schoolName = req.session.role === 'admin' ? undefined : (await prisma.school.findUnique({ where: { id: schoolId }, select: { name: true } }))?.name;
    const where = { status: 'active', academicYear: yearFilter };
    if (schoolName) where.school = schoolName;
    const totalStudents = await prisma.studentProfile.count({ where });

    // summary 7 วัน
    const summary = {
      totalStudents,
      totalActiveUsers: stats.reduce((s, r) => s + r.activeUsers, 0),
      totalQuestionsAnswered: stats.reduce((s, r) => s + r.questionsAnswered, 0),
      daily: dateList.map(date => {
        const row = stats.find(r => r.date === date);
        return { date, activeUsers: row?.activeUsers || 0, questionsAnswered: row?.questionsAnswered || 0 };
      }),
    };

    res.json(summary);
  } catch (err) {
    console.error('school-stats:', err);
    res.status(500).json({ error: 'โหลดสถิติล้มเหลว' });
  }
});

// GET /api/teacher/students-detail?grade=&classroom=&academicYear=
// ตารางรายคน พร้อม XP, daily mission, saturday quiz, tickets
router.get('/students-detail', requireTeacher, async (req, res) => {
  try {
    const { grade, classroom, academicYear } = req.query;
    const yearFilter = academicYear || String(new Date().getFullYear() + 543);
    const schoolName = await resolveSchoolFilter(req, req.query.school);
    if (schoolName === null) return res.json({ students: [] });

    const where = { academicYear: yearFilter, status: 'active' };
    if (schoolName) where.school = schoolName;
    if (grade) where.grade = grade;
    if (classroom) where.classroom = classroom;

    const profiles = await prisma.studentProfile.findMany({
      where,
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: [{ grade: 'asc' }, { classroom: 'asc' }, { studentCode: 'asc' }],
    });

    if (profiles.length === 0) return res.json({ students: [] });

    const userIds = profiles.map(p => p.userId);
    const today = new Date().toISOString().slice(0, 10);

    // ดึงข้อมูลหลายตารางพร้อมกัน
    const weekKey = (() => {
      const d = new Date();
      d.setHours(0,0,0,0);
      const day = d.getDay(); // 0=อาทิตย์
      d.setDate(d.getDate() - day);
      return d.toISOString().slice(0, 10);
    })();

    const [charStates, dailyMissions, satQuizAttempts, ticketWallets] = await Promise.all([
      prisma.characterState.findMany({ where: { userId: { in: userIds } } }),
      prisma.missionDailyLog.findMany({ where: { userId: { in: userIds }, date: today } }),
      prisma.saturdayQuizAttempt.findMany({ where: { userId: { in: userIds }, weekKey } }),
      prisma.ticketWallet.findMany({ where: { userId: { in: userIds } } }),
    ]);

    // สร้าง map
    const charMap   = Object.fromEntries(charStates.map(c => [c.userId, c]));
    const dailyMap  = Object.fromEntries(dailyMissions.map(m => [m.userId, m]));
    const sqMap     = Object.fromEntries(satQuizAttempts.map(a => [a.userId, a]));
    const ticketMap = Object.fromEntries(ticketWallets.map(t => [t.userId, t]));

    const students = profiles.map(p => {
      const uid = p.userId;
      const cs = charMap[uid];
      const dm = dailyMap[uid];
      const sq = sqMap[uid];
      const tw = ticketMap[uid];
      return {
        userId: uid,
        studentCode: p.studentCode || '',
        name: `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim(),
        grade: p.grade,
        classroom: p.classroom || '',
        level: cs?.level || 1,
        totalXp: cs?.totalXp || 0,
        dailyDone: dm?.completedAt ? true : false,
        dailyCorrect: dm?.correctCount || 0,
        satQuizScore: sq?.score ?? null,
        satQuizTime: sq?.timeUsed ?? null,
        tickets: tw?.balance || 0,
      };
    });

    res.json({ students });
  } catch (err) {
    console.error('students-detail:', err);
    res.status(500).json({ error: 'โหลดข้อมูลนักเรียนล้มเหลว' });
  }
});

module.exports = router;
