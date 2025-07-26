import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
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
              path: ['year'], // ต้องใช้ array สำหรับ JSON path
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
    res.status(500).json({
      error: 'Internal Server Error',
      details: err.message
    });
  }
});

export default router;
