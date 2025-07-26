import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const sets = await prisma.examSetMetadata.findMany({
      orderBy: { year: 'desc' }
    });
    res.json(sets);
  } catch (e) {
    console.error('🔥 Error loading exam sets:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
