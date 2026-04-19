// server/routes/exam-options.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/exam-options', async (req, res) => {
  const mode = req.query.mode;
  try {
  const sets = await prisma.examSetMetadata.findMany({
    where: mode === 'official'
    ? { isOfficial: true }
    : {} // ฝึกฝน: เอาทั้ง true และ false
  });


    const unique = {
      grades: [...new Set(sets.map(e => e.grade))],
      examSets: sets.map(e => ({ source: e.questionSource, label: e.label || e.questionSource, year: e.year })),
      years: [...new Set(sets.map(e => e.year).filter(Boolean))]
    };

    res.json(unique);
  } catch (err) {
    console.error('Fetch exam options error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
