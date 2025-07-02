const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const { source, year, grade } = req.query;

  try {
    const raw = await prisma.question.findMany({
      where: {
        source: source,
        AND: [
          {
            attributes: {
              path: 'year',
              equals: year
            }
          },
          {
            attributes: {
              path: 'examGrade',
              equals: grade
            }
          }
        ]
      },
      take: 100
    });

    // ✅ เรียงตาม questionNo เช่น "001", "002"
    const questions = raw.sort((a, b) => {
      const aNo = a.attributes?.questionNo || '000';
      const bNo = b.attributes?.questionNo || '000';
      return aNo.localeCompare(bNo);
    });

    res.json(questions);
  } catch (e) {
    console.error('🔥 Prisma error:', e);
    res.status(500).json({ error: 'Internal Server Error', details: e.message });
  }
});

module.exports = router;
