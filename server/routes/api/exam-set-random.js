import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/random', async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      take: 20
    });

    res.json(questions);
  } catch (error) {
    console.error("❌ ERROR ใน /api/exam-set/random:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
