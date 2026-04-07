const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
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

module.exports = router;
