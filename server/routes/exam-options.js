// server/routes/exam-options.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// แยก venue จาก questionSource เช่น "ipst-p6-2558" → "ipst"
function parseVenue(source) {
  if (!source) return source;
  const parts = source.split('-');
  const gradeIdx = parts.findIndex(p => /^[pm]\d+$/.test(p));
  return gradeIdx > 0 ? parts.slice(0, gradeIdx).join('-') : source;
}

// ชื่อวิชาที่ต้องตัดออกจาก label
const SUBJECT_WORDS = /\s*(คณิตศาสตร์|วิทยาศาสตร์|ภาษาไทย|ภาษาอังกฤษ|สังคมศึกษา)/g;

// สร้าง label เฉพาะชื่อองค์กร: ใช้ venueName จาก DB ถ้ามี ไม่งั้นคำนวณจาก label
function venueLabel(venueKey, sets) {
  const sample = sets.find(s => parseVenue(s.questionSource) === venueKey);
  if (!sample) return venueKey.toUpperCase();
  if (sample.venueName) return sample.venueName;
  if (!sample.label) return venueKey.toUpperCase();
  return sample.label
    .replace(SUBJECT_WORDS, '')                       // ตัดชื่อวิชา เช่น คณิตศาสตร์
    .replace(/\s+(ป\.\d+|ม\.\d+)\b.*$/i, '')         // ตัดทุกอย่างตั้งแต่ ป.X เป็นต้นไป
    .trim();
}

const SUBJECT_LABELS = {
  math:    'คณิตศาสตร์',
  science: 'วิทยาศาสตร์',
  thai:    'ภาษาไทย',
  english: 'ภาษาอังกฤษ',
};

router.get('/exam-options', async (req, res) => {
  const { mode, subject } = req.query;
  try {
    const where = mode === 'official'
      ? { isOfficial: true, isActive: true }
      : { isActive: true };
    if (subject) where.subject = subject;

    const sets = await prisma.examSetMetadata.findMany({
      where,
      orderBy: { year: 'desc' }
    });

    // subjects ที่มีข้อมูล (ไม่กรองตาม mode เพื่อให้ selector แสดงครบ)
    const allSets = await prisma.examSetMetadata.findMany({
      where: { isActive: true },
      select: { subject: true }
    });
    const subjects = [...new Set(allSets.map(s => s.subject || 'math'))].sort().map(k => ({
      key: k,
      label: SUBJECT_LABELS[k] || k
    }));

    // grades
    const grades = [...new Set(sets.map(e => e.grade))].sort();

    // จัดกลุ่ม venue → { subject, grade → [years] }
    const venueMap = {};
    sets.forEach(s => {
      const venue = parseVenue(s.questionSource);
      if (!venue) return;
      if (!venueMap[venue]) venueMap[venue] = { label: '', subject: s.subject || 'math', grades: {}, sources: [] };
      venueMap[venue].label = venueLabel(venue, sets);
      venueMap[venue].sources.push(s.questionSource);
      if (!venueMap[venue].grades[s.grade]) venueMap[venue].grades[s.grade] = [];
      if (s.year) venueMap[venue].grades[s.grade].push(s.year);
    });

    const venues = Object.entries(venueMap).map(([key, v]) => ({
      key,
      label: v.label,
      subject: v.subject,
      grades: Object.entries(v.grades).map(([grade, years]) => ({
        grade,
        years: [...new Set(years)].sort((a, b) => b.localeCompare(a)) // ใหม่ก่อน
      })),
      sources: [...new Set(v.sources)]
    }));

    // compat: examSets เดิม
    const examSets = sets.map(e => ({ source: e.questionSource, label: e.label || e.questionSource, year: e.year }));

    res.json({ subjects, grades, venues, examSets });
  } catch (err) {
    console.error('Fetch exam options error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
