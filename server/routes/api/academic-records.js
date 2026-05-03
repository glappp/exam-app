// GET /api/academic-records/mine
// ดึง AcademicRecord ของนักเรียนที่ login อยู่
// match ด้วย firstName + lastName
// response รวม classStats (ห้อง) และ gradeStats (ทั้งชั้น) ต่อวิชา

const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();

// ─── helpers ─────────────────────────────────────────────────────────────────

function calcStats(scores) {
  const n = scores.length;
  if (!n) return null;
  const mean = scores.reduce((a, b) => a + b, 0) / n;
  const sd   = Math.sqrt(scores.map(v => (v - mean) ** 2).reduce((a, b) => a + b, 0) / n);
  return {
    mean:  Math.round(mean * 10) / 10,
    sd:    Math.round(sd   * 10) / 10,
    min:   Math.min(...scores),
    max:   Math.max(...scores),
    count: n,
  };
}

function calcPercentile(myScore, allScores) {
  if (!allScores.length || myScore == null) return null;
  return Math.round(allScores.filter(s => s < myScore).length / allScores.length * 100);
}

// ─── route ───────────────────────────────────────────────────────────────────

router.get('/mine', async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.session.userId },
      select: { firstName: true, lastName: true }
    });
    if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });

    // ── 1. ดึง records ของนักเรียนคนนี้ ─────────────────────────────────────
    const records = await prisma.academicRecord.findMany({
      where:   { firstName: user.firstName, lastName: user.lastName },
      orderBy: [{ academicYear: 'asc' }, { term: 'asc' }, { subjectName: 'asc' }]
    });

    if (!records.length) {
      return res.json({ records: {}, years: [], summary: [], total: 0 });
    }

    // ── 2. รวบ context ที่ unique เพื่อ query peer scores ────────────────────
    // classContext: (school, grade, classroom, year, term)
    // gradeContext: (school, grade, year, term)
    const classCtxMap = new Map(); // key → {school,grade,classroom,academicYear,term}
    const gradeCtxMap = new Map(); // key → {school,grade,academicYear,term}

    for (const r of records) {
      const ck = `${r.school}|${r.grade}|${r.classroom}|${r.academicYear}|${r.term}`;
      const gk = `${r.school}|${r.grade}|${r.academicYear}|${r.term}`;
      if (!classCtxMap.has(ck)) classCtxMap.set(ck, {
        school: r.school, grade: r.grade, classroom: r.classroom,
        academicYear: r.academicYear, term: r.term
      });
      if (!gradeCtxMap.has(gk)) gradeCtxMap.set(gk, {
        school: r.school, grade: r.grade,
        academicYear: r.academicYear, term: r.term
      });
    }

    // ── 3. ดึง peer scores แล้วสร้าง map: key → [totalScore, ...] ───────────
    // classScores: "school|grade|classroom|year|term|subject" → number[]
    // gradeScores: "school|grade|year|term|subject"           → number[]
    const classScores = new Map();
    const gradeScores = new Map();

    await Promise.all([
      ...Array.from(classCtxMap.values()).map(async ctx => {
        const peers = await prisma.academicRecord.findMany({
          where:  { school: ctx.school, grade: ctx.grade, classroom: ctx.classroom,
                    academicYear: ctx.academicYear, term: ctx.term },
          select: { subjectName: true, totalScore: true }
        });
        const prefix = `${ctx.school}|${ctx.grade}|${ctx.classroom}|${ctx.academicYear}|${ctx.term}`;
        for (const p of peers) {
          if (p.totalScore == null) continue;
          const k = `${prefix}|${p.subjectName}`;
          if (!classScores.has(k)) classScores.set(k, []);
          classScores.get(k).push(p.totalScore);
        }
      }),
      ...Array.from(gradeCtxMap.values()).map(async ctx => {
        const peers = await prisma.academicRecord.findMany({
          where:  { school: ctx.school, grade: ctx.grade,
                    academicYear: ctx.academicYear, term: ctx.term },
          select: { subjectName: true, totalScore: true }
        });
        const prefix = `${ctx.school}|${ctx.grade}|${ctx.academicYear}|${ctx.term}`;
        for (const p of peers) {
          if (p.totalScore == null) continue;
          const k = `${prefix}|${p.subjectName}`;
          if (!gradeScores.has(k)) gradeScores.set(k, []);
          gradeScores.get(k).push(p.totalScore);
        }
      })
    ]);

    // ── 4. จัดกลุ่ม records พร้อม stats ─────────────────────────────────────
    const grouped = {};
    for (const r of records) {
      if (!grouped[r.academicYear])       grouped[r.academicYear] = {};
      if (!grouped[r.academicYear][r.term]) grouped[r.academicYear][r.term] = [];

      const ck = `${r.school}|${r.grade}|${r.classroom}|${r.academicYear}|${r.term}|${r.subjectName}`;
      const gk = `${r.school}|${r.grade}|${r.academicYear}|${r.term}|${r.subjectName}`;
      const cScores = classScores.get(ck) || [];
      const gScores = gradeScores.get(gk) || [];

      const cStat = calcStats(cScores);
      const gStat = calcStats(gScores);

      grouped[r.academicYear][r.term].push({
        subjectCode: r.subjectCode,
        subjectName: r.subjectName,
        midScore:    r.midScore,
        finalScore:  r.finalScore,
        totalScore:  r.totalScore,
        gradeValue:  r.gradeValue,
        classStats:  cStat ? { ...cStat, percentile: calcPercentile(r.totalScore, cScores) } : null,
        gradeStats:  gStat ? { ...gStat, percentile: calcPercentile(r.totalScore, gScores) } : null,
      });
    }

    // ── 5. summary ต่อปี (GPA) ───────────────────────────────────────────────
    const years = Object.keys(grouped).sort();
    const summary = years.map(y => {
      const allSubjects = Object.values(grouped[y]).flat();
      const grades = allSubjects.map(s => parseFloat(s.gradeValue)).filter(n => !isNaN(n));
      const gpa    = grades.length
        ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length * 100) / 100
        : null;
      const grade  = records.find(r => r.academicYear === y)?.grade || '';
      return { year: y, grade, gpa };
    });

    res.json({ records: grouped, years, summary, total: records.length });
  } catch (err) {
    console.error('❌ academic-records/mine:', err);
    res.status(500).json({ error: 'โหลดข้อมูลล้มเหลว' });
  }
});

module.exports = router;
