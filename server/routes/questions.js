import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ✅ ดึงโจทย์ทั้งหมด (ใน practice mode ใช้)
router.get('/all', async (req, res) => {
  try {
    const questions = await prisma.question.findMany();
    res.json({ questions });
  } catch (err) {
    console.error('❌ ดึงโจทย์ล้มเหลว:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงโจทย์ได้' });
  }
});

export default router;
