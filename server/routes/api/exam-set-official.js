// server/routes/api/exam-set-official.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const { source, year, grade } = req.query;

  try {
    const questions = await prisma.question.findMany({
      where: {
        source,
        AND: [
          {
            attributes: {
              // Prisma JSON filter ต้องรับ path เป็น array
              path: ['year'],
              equals: year
            }
          },
          {
            attributes: {
              path: ['examGrade'],
              equals: grade
            }
          }
        ]
      },
      take: 100
    });

    res.json(questions);
  } catch (err) {
    console.error('❌ fetch official exam error:', err);
    res
      .status(500)
      .json({ error: 'Internal Server Error', details: err.message });
  }
});

module.exports = router;
