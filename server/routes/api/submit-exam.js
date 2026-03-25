const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { mode, questions, answers, durationSec } = req.body;

  try {
    if (!Array.isArray(answers) || answers.length !== questions.length) {
      return res.status(400).json({ error: 'ข้อมูลคำตอบไม่ถูกต้อง' });
    }

    const records = await prisma.question.findMany({
      where: { id: { in: questions } }
    });

    let correctCount = 0;
    let score = 0;
    let fullScore = 0;
    const wrongAttributes = {};

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
            wrongAttributes[attr] = (wrongAttributes[attr] || 0) - 1;
          });
        });
      }
    });

    // หา StudentProfile ของ user ที่ login อยู่
    let studentProfileId = null;
    if (req.session?.userId) {
      const profile = await prisma.studentProfile.findFirst({
        where: { userId: req.session.userId },
        orderBy: { createdAt: 'desc' }
      });
      if (profile) {
        studentProfileId = profile.id;
      } else {
        // สร้าง profile ชั่วคราวถ้ายังไม่มี
        const newProfile = await prisma.studentProfile.create({
          data: {
            userId: req.session.userId,
            academicYear: String(new Date().getFullYear() + 543),
            school: 'ไม่ระบุ',
            district: '',
            province: '',
            grade: 'ไม่ระบุ'
          }
        });
        studentProfileId = newProfile.id;
      }
    }

    if (studentProfileId) {
      await prisma.examResult.create({
        data: {
          studentProfileId,
          mode: mode || 'practice',
          topicTagsJson: [],
          score,
          total: questions.length,
          durationSec: durationSec || 0,
          weakAttributes: wrongAttributes,
          questionIds: questions,
          userAnswers: answers
        }
      });
    }

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
