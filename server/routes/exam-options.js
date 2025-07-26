import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/exam-options', async (req, res) => {
  try {
    const mode = req.query.mode || 'all';
    let whereClause = {};

    if (mode === 'official') {
      whereClause = { isOfficial: true };
    } else if (mode === 'practice') {
      whereClause = {};
    } else {
      console.warn('Unknown mode:', mode);
      // ถ้าอยาก strict:
      // return res.status(400).json({ error: 'Invalid mode' });
      whereClause = {};
    }

    const sets = await prisma.examSetMetadata.findMany({
      where: whereClause
    });

    const unique = {
      grades: [...new Set(sets.map(e => e.grade))],
      examTypes: [...new Set(sets.map(e => e.examType))],
      years: [...new Set(sets.map(e => e.year).filter(Boolean))]
    };

    res.json(unique);
  } catch (err) {
    console.error('Fetch exam options error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
