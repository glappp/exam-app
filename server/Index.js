const cors = require('cors');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const upload = multer({ dest: 'uploads/' });

const session = require('express-session');
const loginRoute = require('./routes/login');

// ✅ Middleware เรียงลำดับ
app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false
}));

// ✅ Routes
app.use('/api/login', loginRoute);

// ✅ Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/client', express.static(path.join(__dirname, '../client')));

// ✅ Route เพิ่มโจทย์แบบ multipart
app.post('/add-question', upload.fields([
  { name: 'questionImage', maxCount: 1 },
  { name: 'choiceImage0', maxCount: 1 },
  { name: 'choiceImage1', maxCount: 1 },
  { name: 'choiceImage2', maxCount: 1 },
  { name: 'choiceImage3', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      questionText,
      choice0, choice1, choice2, choice3,
      correct,
      difficulty
    } = req.body;

    const files = req.files;

    const now = new Date().toISOString();
const choices = [
  {
    textTh: choice0,
    textEn: choice0,  // ถ้าไม่มีภาษาอังกฤษแยก ใช้ซ้ำได้
    image: files.choiceImage0?.[0]?.filename || null
  },
  {
    textTh: choice1,
    textEn: choice1,
    image: files.choiceImage1?.[0]?.filename || null
  },
  {
    textTh: choice2,
    textEn: choice2,
    image: files.choiceImage2?.[0]?.filename || null
  },
  {
    textTh: choice3,
    textEn: choice3,
    image: files.choiceImage3?.[0]?.filename || null
  }
];



    const estimatedTimeSec = estimateTime({
      text: req.body.questionText,
      choices: choices,
      difficulty: req.body.difficulty
    });

    const result = await prisma.question.create({
      data: {
        text: questionText,
        image: files.questionImage?.[0]?.filename || null,
        answer: parseInt(correct),
        difficulty: difficulty || null,
        choices,
        tags: [],
        source: 'me',
        estimatedTimeSec,
        derivedFrom: null,
        createdBy: 'admin',
        updatedBy: 'admin',
        ownerOrg: 'me',
        createdAt: now
      }
    });

    console.log('✅ เพิ่มโจทย์:', result.id);
    res.json({ success: true, id: result.id });

  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
    res.status(500).json({ success: false, error: 'เพิ่มโจทย์ไม่สำเร็จ' });
  }
});

function estimateTime({ text, choices, difficulty }) {
  let baseTime = 20;
  baseTime += Math.floor(text.length / 100) * 10;
  if (choices.some(c => c.image)) baseTime += 10;
  if (difficulty === 'medium') baseTime *= 1.2;
  if (difficulty === 'hard') baseTime *= 1.5;
  return Math.round(baseTime);
}

// ✅ Route แสดงโจทย์แบบแบ่งหน้า
app.get('/questions', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const attrType = req.query.attrType;
  const attrValue = req.query.attrValue;
  const difficulty = req.query.difficulty;
  const keyword = req.query.keyword;

  const where = {};

  if (attrType && attrValue && attrType !== 'all' && attrValue !== 'all') {
    where.tags = { has: `${attrType}:${attrValue}` };
  }

  if (difficulty && difficulty !== 'all') {
    where.difficulty = difficulty;
  }

  if (keyword && keyword.trim() !== '') {
    where.text = { contains: keyword.trim() };
  }

  try {
    const total = await prisma.question.count({ where });
    const questions = await prisma.question.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      questions,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่ server' });
  }
});

// ✅ Route ใหม่: ดึงทุกข้อสอบ (ไม่แบ่งหน้า)
app.get('/questions/all', async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ questions });
  } catch (err) {
    console.error("❌ Failed to get all questions:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/results', async (req, res) => {
  const { questionId, selected, isCorrect } = req.body;

  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const result = await prisma.result.create({
      data: {
        questionId: question.id,
        selected: selected.toString(),
        correct: isCorrect,
      },
    });

    res.json({ success: true, result });
  } catch (err) {
    console.error("❌ Failed to save result:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/results', async (req, res) => {
  try {
    const results = await prisma.result.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { question: true }
    });
    res.json(results);
  } catch (err) {
    console.error("❌ Failed to get results:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/analysis', async (req, res) => {
  try {
    const results = await prisma.result.findMany({
      include: { question: true }
    });

    const statMap = {};

    for (const r of results) {
      const tags = r.question?.tags;
      if (!tags) continue;

      const topicTag = tags.find(t => t.startsWith('topic:'));
      if (!topicTag) continue;

      const topic = topicTag.split(':')[1];
      if (!statMap[topic]) {
        statMap[topic] = { total: 0, correct: 0 };
      }

      statMap[topic].total += 1;
      if (r.correct) statMap[topic].correct += 1;
    }

    const data = Object.entries(statMap).map(([topic, stat]) => ({
      chapter: topic,
      correct: stat.correct,
      total: stat.total,
      accuracy: Math.round((stat.correct / stat.total) * 100)
    }));

    res.json(data);

  } catch (err) {
    console.error("❌ วิเคราะห์จุดอ่อนผิดพลาด:", err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่ server' });
  }
});

const registerRoute = require('./routes/register');
app.use('/api/register', registerRoute);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend is running on http://localhost:${PORT}`);
});
