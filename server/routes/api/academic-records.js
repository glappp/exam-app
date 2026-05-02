// GET /api/academic-records/mine
// ดึง AcademicRecord ของนักเรียนที่ login อยู่
// match ด้วย firstName + lastName + school (จาก StudentProfile)

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/mine', async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { firstName: true, lastName: true }
    });
    if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });

    const profile = await prisma.studentProfile.findFirst({
      where: { userId: req.session.userId, status: 'active' },
      orderBy: { academicYear: 'desc' }
    });

    // ค้นหาโดยชื่อ+นามสกุล ก่อน — ถ้ามีโรงเรียนใน profile ให้กรองด้วย
    // ถ้าไม่เจอ (เช่น ชื่อโรงเรียนใน profile ต่างจากที่ import) ให้ลองใหม่โดยไม่กรองโรงเรียน
    const baseWhere = { firstName: user.firstName, lastName: user.lastName };

    let records = [];
    if (profile?.school) {
      records = await prisma.academicRecord.findMany({
        where: { ...baseWhere, school: { contains: profile.school.replace(/^โรงเรียน/, '') } },
        orderBy: [{ academicYear: 'asc' }, { term: 'asc' }, { subjectName: 'asc' }]
      });
    }
    // fallback: ค้นด้วยชื่ออย่างเดียว (ถ้ายังไม่เจอ)
    if (!records.length) {
      records = await prisma.academicRecord.findMany({
        where: baseWhere,
        orderBy: [{ academicYear: 'asc' }, { term: 'asc' }, { subjectName: 'asc' }]
      });
    }

    // จัดกลุ่มเป็น { year: { term: [records] } }
    const grouped = {};
    for (const r of records) {
      if (!grouped[r.academicYear]) grouped[r.academicYear] = {};
      if (!grouped[r.academicYear][r.term]) grouped[r.academicYear][r.term] = [];
      grouped[r.academicYear][r.term].push({
        subjectCode: r.subjectCode,
        subjectName: r.subjectName,
        midScore:    r.midScore,
        finalScore:  r.finalScore,
        totalScore:  r.totalScore,
        gradeValue:  r.gradeValue,
      });
    }

    // summary ต่อปี (GPA เฉลี่ย)
    const years = Object.keys(grouped).sort();
    const summary = years.map(y => {
      const allSubjects = Object.values(grouped[y]).flat();
      const grades = allSubjects.map(s => parseFloat(s.gradeValue)).filter(n => !isNaN(n));
      const gpa = grades.length ? Math.round(grades.reduce((a,b)=>a+b,0)/grades.length*100)/100 : null;
      const grade = records.find(r=>r.academicYear===y)?.grade || '';
      return { year: y, grade, gpa };
    });

    res.json({ records: grouped, years, summary, total: records.length });
  } catch (err) {
    console.error('❌ academic-records/mine:', err);
    res.status(500).json({ error: 'โหลดข้อมูลล้มเหลว' });
  }
});

module.exports = router;
