const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { mode, questions, answers } = req.body;

  try {
    // 🔐 ตรวจ input เบื้องต้น
    if (!Array.isArray(answers) || answers.length !== questions.length) {
      return res.status(400).json({ error: 'ข้อมูลคำตอบไม่ถูกต้อง' });
    }

    // 🔍 ดึงโจทย์จากฐานข้อมูล
    const records = await prisma.question.findMany({
      where: { id: { in: questions } }
    });

    let correctCount = 0;
    let score = 0;
    let fullScore = 0;
    let wrongAttributes = [];

    records.forEach((q, i) => {
      const userAns = answers[i];
      const correct = isCorrectAnswer(userAns, q);

      const thisScore = q.score || 1;
      fullScore += thisScore;

      if (correct) {
        correctCount++;
        score += thisScore;
      } else {
        wrongAttributes.push(...(q.attributes?.topic || []));
      }
    });

    // 📊 วิเคราะห์หัวข้อที่ผิดบ่อย
    const countMap = {};
    wrongAttributes.forEach(attr => {
      countMap[attr] = (countMap[attr] || 0) + 1;
    });
    const sorted = Object.entries(countMap).sort((a, b) => b[1] - a[1]);
    const recommendations = sorted.slice(0, 3).map(([k]) => k);

    // ✅ ส่งผลลัพธ์กลับ
    res.json({ correctCount, total: questions.length, score, fullScore, recommendations });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ตรวจคำตอบล้มเหลว' });
  }
});

// 🔧 ฟังก์ชัน normalize คำตอบ
function normalizeAnswer(ans) {
  const str = (typeof ans === 'string') ? ans.trim().replace(/\s+/g, '') : String(ans);

  const num = parseFloat(str);
  if (!isNaN(num)) return num.toFixed(6); // เช่น 0.25 เท่ากับ .25

  return str.toLowerCase();
}

// 🔍 ฟังก์ชันตรวจว่าคำตอบถูกหรือไม่
function isCorrectAnswer(userAns, q) {
  const a = normalizeAnswer(userAns);

  if (q.answer != null) {
    // แบบเลือกตอบ → ต้อง match index
    return parseInt(userAns) === q.answer;
  }

  if (Array.isArray(q.shortAnswer)) {
    return q.shortAnswer.some(sa => normalizeAnswer(sa) === a);
  }

  return false;
}

module.exports = router;
