const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { mode, questions, answers } = req.body;

  try {
    if (!Array.isArray(answers) || answers.length !== questions.length) {
      return res.status(400).json({ error: 'ข้อมูลคำตอบไม่ถูกต้อง' });
    }

    const fetched = await prisma.question.findMany({
      where: { id: { in: questions } }
    });

    // เรียงลำดับให้ตรงกับ questions array ที่ client ส่งมา
    const recordMap = new Map(fetched.map(q => [q.id, q]));
    const records = questions.map(id => recordMap.get(id)).filter(Boolean);

    let correctCount = 0;
    let score = 0;
    let fullScore = 0;
    const wrongAttributes = { topic: {}, skill: {}, trap: {} };

    records.forEach((q, i) => {
      const userAns = answers[i];
      const correct = isCorrectAnswer(userAns, q);
      const thisScore = q.score || 1;
      fullScore += thisScore;

      if (correct) {
        correctCount++;
        score += thisScore;
      } else {
        ['topic', 'skill', 'trap'].forEach(type => {
          const attrs = q.attributes?.[type] || [];
          attrs.forEach(attr => {
            wrongAttributes[type][attr] = (wrongAttributes[type][attr] || 0) + 1;
          });
        });
      }
    });

    // ดึง studentProfileId จาก session userId
    const userId = req.session?.userId;
    let studentProfileId = 1;
    if (userId) {
      const profile = await prisma.studentProfile.findFirst({ where: { userId } });
      if (profile) studentProfileId = profile.id;
    }

    // ⏺️ บันทึกผลสอบ
    await prisma.examResult.create({
      data: {
        studentProfileId,
        mode,
        topicTagsJson: [],
        score,
        total: questions.length,
        durationSec: 0,
        weakAttributes: wrongAttributes,
        questionIds: questions,
        userAnswers: answers
      }
    });

    res.json({
      correctCount,
      total: questions.length,
      score,
      fullScore,
      questions: records,
      userAnswers: answers
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ตรวจคำตอบล้มเหลว' });
  }
});

function normalizeAnswer(ans) {
  const str = (typeof ans === 'string') ? ans.trim().replace(/\s+/g, '') : String(ans);
  const num = parseFloat(str);
  if (!isNaN(num)) return num.toFixed(6);
  return str.toLowerCase();
}

function isCorrectAnswer(userAns, q) {
  const a = normalizeAnswer(userAns);
  if (q.answer != null) return parseInt(userAns) === q.answer;
  if (Array.isArray(q.shortAnswer)) {
    return q.shortAnswer.some(sa => normalizeAnswer(sa) === a);
  }
  return false;
}

module.exports = router;
