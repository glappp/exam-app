const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GRADE_ORDER = ['ป.4','ป.5','ป.6','ม.1','ม.2','ม.3'];
const DEFAULT_PASSWORD = '1111';
const SALT_ROUNDS = 10;

function requireSchoolAdmin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  if (req.session.role !== 'school_admin') return res.status(403).json({ error: 'สิทธิ์ไม่เพียงพอ' });
  if (!req.session.schoolId) return res.status(403).json({ error: 'ไม่ได้ผูกกับโรงเรียน' });
  next();
}

// GET /api/school-admin/school — ข้อมูลโรงเรียนของตัวเอง
router.get('/school', requireSchoolAdmin, async (req, res) => {
  try {
    const school = await prisma.school.findUnique({ where: { id: req.session.schoolId } });
    res.json({ school });
  } catch (err) {
    res.status(500).json({ error: 'โหลดข้อมูลโรงเรียนล้มเหลว' });
  }
});

// GET /api/school-admin/students?academicYear=2568 — รายชื่อนักเรียนในโรงเรียน
router.get('/students', requireSchoolAdmin, async (req, res) => {
  try {
    const { academicYear } = req.query;
    const school = await prisma.school.findUnique({ where: { id: req.session.schoolId } });
    const where = { school: school.name };
    if (academicYear) where.academicYear = academicYear;

    const profiles = await prisma.studentProfile.findMany({
      where,
      include: { user: { select: { id: true, username: true, firstName: true, lastName: true } } },
      orderBy: [{ grade: 'asc' }, { classroom: 'asc' }, { studentCode: 'asc' }]
    });
    res.json({ students: profiles });
  } catch (err) {
    res.status(500).json({ error: 'โหลดรายชื่อนักเรียนล้มเหลว' });
  }
});

// POST /api/school-admin/upload-roster — อัปโหลด CSV สร้าง accounts
// CSV format: studentCode,firstName,lastName,grade,classroom
router.post('/upload-roster', requireSchoolAdmin, async (req, res) => {
  try {
    const { academicYear, rows } = req.body;
    // rows = [{ studentCode, firstName, lastName, grade, classroom }]
    if (!academicYear || !rows?.length) return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });

    const school = await prisma.school.findUnique({ where: { id: req.session.schoolId } });
    const hashedPw = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

    const results = { created: 0, skipped: 0, errors: [] };

    for (const row of rows) {
      const { studentCode, firstName, lastName, grade, classroom } = row;
      if (!studentCode || !firstName || !lastName || !grade) {
        results.errors.push(`ข้อมูลไม่ครบ: ${JSON.stringify(row)}`);
        continue;
      }
      const username = studentCode.toString().trim();
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) { results.skipped++; continue; }

      await prisma.user.create({
        data: {
          username,
          password: hashedPw,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: '',
          role: 'student',
          schoolId: req.session.schoolId,
          studentProfiles: {
            create: {
              academicYear: academicYear.toString(),
              school: school.name,
              district: school.district,
              province: school.province,
              grade: grade.trim(),
              classroom: (classroom || '').toString().trim(),
              studentCode: username
            }
          }
        }
      });
      results.created++;
    }

    res.json({ success: true, ...results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'อัปโหลด roster ล้มเหลว' });
  }
});

// POST /api/school-admin/promote — ขยับชั้นนักเรียน
// body: { fromAcademicYear, toAcademicYear, selections: [{ userId, newGrade, newClassroom }] }
router.post('/promote', requireSchoolAdmin, async (req, res) => {
  try {
    const { fromAcademicYear, toAcademicYear, selections } = req.body;
    if (!fromAcademicYear || !toAcademicYear || !selections?.length) {
      return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
    }

    const school = await prisma.school.findUnique({ where: { id: req.session.schoolId } });
    let promoted = 0;

    for (const sel of selections) {
      const { userId, newGrade, newClassroom } = sel;
      // ตรวจสอบว่านักเรียนอยู่ในโรงเรียนนี้
      const profile = await prisma.studentProfile.findFirst({
        where: { userId, school: school.name, academicYear: fromAcademicYear }
      });
      if (!profile) continue;

      // สร้าง profile ปีใหม่ (ถ้ายังไม่มี)
      const exists = await prisma.studentProfile.findFirst({
        where: { userId, academicYear: toAcademicYear }
      });
      if (exists) continue;

      await prisma.studentProfile.create({
        data: {
          userId,
          academicYear: toAcademicYear,
          school: school.name,
          district: school.district,
          province: school.province,
          grade: newGrade || profile.grade,
          classroom: newClassroom || profile.classroom || '',
          studentCode: profile.studentCode || ''
        }
      });
      promoted++;
    }

    res.json({ success: true, promoted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ขยับชั้นล้มเหลว' });
  }
});

// POST /api/school-admin/reset-password/:userId — reset password เป็น 1111
router.post('/reset-password/:userId', requireSchoolAdmin, async (req, res) => {
  try {
    const school = await prisma.school.findUnique({ where: { id: req.session.schoolId } });
    // ตรวจสอบว่า user นี้อยู่ในโรงเรียนเดียวกัน
    const profile = await prisma.studentProfile.findFirst({
      where: { userId: parseInt(req.params.userId), school: school.name }
    });
    if (!profile) return res.status(403).json({ error: 'ไม่มีสิทธิ์' });

    const hashedPw = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: parseInt(req.params.userId) },
      data: { password: hashedPw }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Reset password ล้มเหลว' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// Score Upload System — routes ใหม่ (school_admin + admin)
// ══════════════════════════════════════════════════════════════════════════════

function requireScoreAdmin(req, res, next) {
  const role = req.session?.role;
  if (!role || !['admin', 'school_admin'].includes(role)) {
    return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
  }
  next();
}

function getSchoolId(req) {
  if (req.session?.role === 'admin') {
    const sid = parseInt(req.query.schoolId || req.body?.schoolId);
    return isNaN(sid) ? null : sid;
  }
  return req.session?.schoolId || null;
}

// GET /api/school-admin/meta
router.get('/meta', requireScoreAdmin, async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) return res.status(400).json({ error: 'ไม่พบโรงเรียน' });
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) return res.status(404).json({ error: 'ไม่พบโรงเรียน' });
    const yearRows = await prisma.schoolSubject.findMany({
      where: { schoolId }, select: { academicYear: true },
      distinct: ['academicYear'], orderBy: { academicYear: 'desc' },
    });
    res.json({ school, academicYears: yearRows.map(y => y.academicYear) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/school-admin/classrooms?academicYear=
router.get('/classrooms', requireScoreAdmin, async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) return res.status(400).json({ error: 'ไม่พบโรงเรียน' });
    const { academicYear } = req.query;
    const rows = await prisma.schoolSubject.findMany({
      where: { schoolId, ...(academicYear ? { academicYear } : {}) },
      select: { grade: true, classroom: true },
      distinct: ['grade', 'classroom'],
      orderBy: [{ grade: 'asc' }, { classroom: 'asc' }],
    });
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Subjects CRUD ─────────────────────────────────────────────────────────────

// GET /api/school-admin/subjects?academicYear=&grade=&classroom=
router.get('/subjects', requireScoreAdmin, async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) return res.status(400).json({ error: 'ไม่พบโรงเรียน' });
    const { academicYear, grade, classroom } = req.query;
    const where = { schoolId };
    if (academicYear) where.academicYear = academicYear;
    if (grade)        where.grade        = grade;
    if (classroom)    where.classroom    = classroom;
    const subjects = await prisma.schoolSubject.findMany({
      where, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    res.json({ subjects });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/school-admin/subjects
router.post('/subjects', requireScoreAdmin, async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) return res.status(400).json({ error: 'ไม่พบโรงเรียน' });
    const { academicYear, grade, classroom, subjectCode, subjectName, sortOrder } = req.body;
    if (!academicYear || !grade || !classroom || !subjectCode || !subjectName)
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });
    const subject = await prisma.schoolSubject.create({
      data: { schoolId, academicYear, grade, classroom, subjectCode, subjectName,
              sortOrder: sortOrder ?? 0 },
    });
    res.json({ success: true, subject });
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'รหัสวิชานี้มีอยู่แล้ว' });
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/school-admin/subjects/:id
router.put('/subjects/:id', requireScoreAdmin, async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const id = parseInt(req.params.id);
    const existing = await prisma.schoolSubject.findUnique({ where: { id } });
    if (!existing || existing.schoolId !== schoolId)
      return res.status(404).json({ error: 'ไม่พบวิชา' });
    const { subjectCode, subjectName, sortOrder } = req.body;
    const subject = await prisma.schoolSubject.update({
      where: { id },
      data: { ...(subjectCode !== undefined && { subjectCode }),
               ...(subjectName !== undefined && { subjectName }),
               ...(sortOrder  !== undefined && { sortOrder: parseInt(sortOrder) }) },
    });
    res.json({ success: true, subject });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/school-admin/subjects/:id
router.delete('/subjects/:id', requireScoreAdmin, async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const id = parseInt(req.params.id);
    const existing = await prisma.schoolSubject.findUnique({ where: { id } });
    if (!existing || existing.schoolId !== schoolId)
      return res.status(404).json({ error: 'ไม่พบวิชา' });
    const count = await prisma.academicScore.count({ where: { schoolSubjectId: id } });
    if (count > 0)
      return res.status(409).json({ error: `ลบไม่ได้ — มีคะแนน ${count} รายการ` });
    await prisma.schoolSubject.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/school-admin/subjects/clone — copy รายวิชาจากห้องอื่น
router.post('/subjects/clone', requireScoreAdmin, async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) return res.status(400).json({ error: 'ไม่พบโรงเรียน' });
    const { fromAcademicYear, fromGrade, fromClassroom,
            toAcademicYear,   toGrade,   toClassroom } = req.body;
    const source = await prisma.schoolSubject.findMany({
      where: { schoolId, academicYear: fromAcademicYear,
               grade: fromGrade, classroom: fromClassroom },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    if (!source.length) return res.status(404).json({ error: 'ไม่พบรายวิชาต้นทาง' });
    let created = 0;
    for (const s of source) {
      try {
        await prisma.schoolSubject.create({
          data: { schoolId, academicYear: toAcademicYear, grade: toGrade,
                  classroom: toClassroom, subjectCode: s.subjectCode,
                  subjectName: s.subjectName, sortOrder: s.sortOrder },
        });
        created++;
      } catch (e) { if (e.code !== 'P2002') throw e; }
    }
    res.json({ success: true, created, total: source.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Score Grid ────────────────────────────────────────────────────────────────

// GET /api/school-admin/scores?academicYear=&grade=&classroom=&term=
router.get('/scores', requireScoreAdmin, async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) return res.status(400).json({ error: 'ไม่พบโรงเรียน' });
    const { academicYear, grade, classroom, term } = req.query;
    if (!academicYear || !grade || !classroom || !term)
      return res.status(400).json({ error: 'ระบุ academicYear, grade, classroom, term' });
    const termInt = parseInt(term);

    // วิชา
    const subjects = await prisma.schoolSubject.findMany({
      where: { schoolId, academicYear, grade, classroom },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    // นักเรียน — ดึงจาก userId ในโรงเรียนนี้ + grade+classroom
    const schoolUsers = await prisma.user.findMany({
      where: { schoolId, role: 'student' }, select: { id: true },
    });
    const userIds = schoolUsers.map(u => u.id);
    const students = await prisma.studentProfile.findMany({
      where: { userId: { in: userIds }, grade, classroom, status: 'active' },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: [{ user: { lastName: 'asc' } }, { user: { firstName: 'asc' } }],
    });

    // คะแนนที่มีอยู่
    const subjectIds = subjects.map(s => s.id);
    const profileIds = students.map(p => p.id);
    const existing = (subjectIds.length && profileIds.length)
      ? await prisma.academicScore.findMany({
          where: { schoolSubjectId: { in: subjectIds },
                   studentProfileId: { in: profileIds }, term: termInt },
        })
      : [];

    const records = {};
    existing.forEach(s => {
      records[`${s.studentProfileId}_${s.schoolSubjectId}`] = {
        id: s.id, midterm: s.midterm, final: s.final, total: s.total,
      };
    });

    res.json({ subjects, students, records });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/school-admin/scores/batch — upsert คะแนน
router.post('/scores/batch', requireScoreAdmin, async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) return res.status(400).json({ error: 'ไม่พบโรงเรียน' });
    const { rows, term } = req.body;
    if (!Array.isArray(rows) || !term)
      return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
    const termInt = parseInt(term);

    // ตรวจสอบ schoolSubjectId เป็นของโรงเรียนนี้จริง
    const subjectIds = [...new Set(rows.map(r => r.schoolSubjectId).filter(Boolean))];
    const validSubs = await prisma.schoolSubject.findMany({
      where: { id: { in: subjectIds }, schoolId }, select: { id: true },
    });
    const validSet = new Set(validSubs.map(s => s.id));
    const validRows = rows.filter(r =>
      r.studentProfileId && r.schoolSubjectId && validSet.has(r.schoolSubjectId)
    );
    if (!validRows.length) return res.json({ success: true, upserted: 0 });

    let upserted = 0;
    const BATCH = 100;
    for (let i = 0; i < validRows.length; i += BATCH) {
      const batch = validRows.slice(i, i + BATCH);
      await prisma.$transaction(
        batch.map(r => prisma.academicScore.upsert({
          where: {
            studentProfileId_schoolSubjectId_term: {
              studentProfileId: r.studentProfileId,
              schoolSubjectId:  r.schoolSubjectId,
              term:             termInt,
            },
          },
          create: { studentProfileId: r.studentProfileId, schoolSubjectId: r.schoolSubjectId,
                    term: termInt, midterm: r.midterm ?? null,
                    final: r.final ?? null, total: r.total ?? null },
          update: { midterm: r.midterm ?? null, final: r.final ?? null, total: r.total ?? null },
        }))
      );
      upserted += batch.length;
    }
    res.json({ success: true, upserted });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/school-admin/promote-auto — เลื่อนชั้นอัตโนมัติ (grade+1, classroom เดิม)
router.post('/promote-auto', requireScoreAdmin, async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) return res.status(400).json({ error: 'ไม่พบโรงเรียน' });
    const GRADES = ['ป.1','ป.2','ป.3','ป.4','ป.5','ป.6'];
    const schoolUsers = await prisma.user.findMany({
      where: { schoolId, role: 'student' }, select: { id: true },
    });
    const userIds = schoolUsers.map(u => u.id);
    const profiles = await prisma.studentProfile.findMany({
      where: { userId: { in: userIds }, status: 'active' },
      select: { id: true, grade: true },
    });
    let promoted = 0;
    const updates = profiles
      .map(p => {
        const idx = GRADES.indexOf(p.grade);
        if (idx < 0 || idx >= GRADES.length - 1) return null;
        promoted++;
        return prisma.studentProfile.update({
          where: { id: p.id }, data: { grade: GRADES[idx + 1] },
        });
      })
      .filter(Boolean);
    if (updates.length) await prisma.$transaction(updates);
    res.json({ success: true, promoted, total: profiles.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
