import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { userId, questionId, selected, isCorrect } = req.body;
  console.log('📥 Raw req.body:', req.body);

  try {
    const result = await prisma.result.create({
      data: {
        questionId: questionId.toString(),
        selected: selected.toString(),
        correct: isCorrect,
        userId: userId
      }
    });

    console.log('✅ Prisma บันทึกผลสำเร็จ:', result.id);
    res.json({ success: true, result });
  } catch (err) {
    console.error('❌ Prisma Error:', err);
    res.status(500).json({ success: false });
  }
});

export default router;
