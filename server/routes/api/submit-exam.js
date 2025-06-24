const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


router.post('/', async (req, res) => {
  const { mode, questions, answers } = req.body;

  try {
    const records = await prisma.question.findMany({
      where: { id: { in: questions } }
    });

    let correctCount = 0;
    let score = 0;
    let fullScore = 0;
    let wrongAttributes = [];

    records.forEach((q, i) => {
      const ans = answers[i];
      const correct = q.answer != null
        ? q.answer === ans
        : q.shortAnswer?.includes(ans.trim());
      const thisScore = q.score || 1;
      fullScore += thisScore;
      if (correct) {
        correctCount++;
        score += thisScore;
      } else {
        wrongAttributes.push(...(q.attributes.topic || []));
      }
    });

    const countMap = {};
    wrongAttributes.forEach(attr => countMap[attr] = (countMap[attr] || 0) + 1);
    const sorted = Object.entries(countMap).sort((a, b) => b[1] - a[1]);
    const recommendations = sorted.slice(0, 3).map(([k]) => k);

    res.json({ correctCount, total: questions.length, score, fullScore, recommendations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ตรวจคำตอบล้มเหลว' });
  }
});

module.exports = router;
