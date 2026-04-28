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

// สร้าง label สวยจาก venue key เช่น "ipst" → "IPST"
function venueLabel(venueKey, sets) {
  const sample = sets.find(s => parseVenue(s.questionSource) === venueKey);
  if (!sample?.label) return venueKey.toUpperCase();
  // ตัด " ป.X ปี YYYY" ออกจาก label
  return sample.label.replace(/\s*(ป\.\d+|ม\.\d+)?\s*ปี\s*\d+$/i, '').trim();
}

router.get('/exam-options', async (req, res) => {
  const mode = req.query.mode;
  try {
    const sets = await prisma.examSetMetadata.findMany({
      where: mode === 'official' ? { isOfficial: true, isActive: true } : { isActive: true },
      orderBy: { year: 'desc' }
    });

    // grades
    const grades = [...new Set(sets.map(e => e.grade))].sort();

    // จัดกลุ่ม venue → { grade → [years] }
    const venueMap = {};
    sets.forEach(s => {
      const venue = parseVenue(s.questionSource);
      if (!venue) return;
      if (!venueMap[venue]) venueMap[venue] = { label: '', grades: {}, sources: [] };
      venueMap[venue].label = venueLabel(venue, sets);
      venueMap[venue].sources.push(s.questionSource);
      if (!venueMap[venue].grades[s.grade]) venueMap[venue].grades[s.grade] = [];
      if (s.year) venueMap[venue].grades[s.grade].push(s.year);
    });

    const venues = Object.entries(venueMap).map(([key, v]) => ({
      key,
      label: v.label,
      grades: Object.entries(v.grades).map(([grade, years]) => ({
        grade,
        years: [...new Set(years)].sort((a, b) => b.localeCompare(a)) // ใหม่ก่อน
      })),
      sources: [...new Set(v.sources)]
    }));

    // compat: examSets เดิม (ไม่ใช้แล้วแต่เผื่อมีอะไร depend)
    const examSets = sets.map(e => ({ source: e.questionSource, label: e.label || e.questionSource, year: e.year }));

    res.json({ grades, venues, examSets });
  } catch (err) {
    console.error('Fetch exam options error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
