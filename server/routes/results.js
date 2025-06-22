const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { userId, questionId, selected, isCorrect } = req.body;
  console.log("📥 Raw req.body:", req.body);

  try {
    const result = await prisma.result.create({
      data: {
        questionId: questionId.toString(),
        selected: selected.toString(),
        correct: isCorrect,
        userId: userId  // ✅ เปลี่ยนตรงนี้
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
