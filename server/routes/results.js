const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { userId, questionId, selected, isCorrect } = req.body;
  console.log("📥 Raw req.body:", req.body);

  // แปลง userId เป็น Int — ถ้าเป็น "unknown" หรือไม่มีค่า ให้ใช้ null
  const parsedUserId = userId && !isNaN(parseInt(userId)) ? parseInt(userId) : null;

  try {
    const result = await prisma.result.create({
      data: {
        questionId: questionId.toString(),
        selected: selected.toString(),
        correct: isCorrect,
        userId: parsedUserId
      }
    });

    console.log("✅ Prisma บันทึกผลสำเร็จ:", result.id);
    res.json({ success: true, result });
  } catch (err) {
    console.error('❌ Prisma Error:', err);
    res.status(500).json({ success: false });
  }
});




module.exports = router;
