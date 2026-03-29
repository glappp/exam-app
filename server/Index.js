const cors = require('cors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { upload, getFilename, useR2 } = require('./storage');

const prisma = new PrismaClient();
const app = express();

app.use(express.static(path.join(__dirname, '..', 'client'))); // สำหรับไฟล์ static

const attributeDictRoute = require('./routes/api/attributeDictRoute');
app.use('/api', attributeDictRoute); // ✅ เส้นทางจะเป็น /api/attributeDict.json

const studentRoute = require('./routes/api/student');
app.use('/api/student', studentRoute);

const adminRoute = require('./routes/api/admin');
app.use('/api/admin', adminRoute);


// ✅ Middleware
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));




// ✅ Static files
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
if (useR2) {
  // Redirect /uploads/:filename → R2 public URL
  app.get('/uploads/:filename', (req, res) => {
    const base = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
    if (!base) return res.status(503).send('R2_PUBLIC_URL ยังไม่ได้ตั้งค่า');
    res.redirect(`${base}/uploads/${req.params.filename}`);
  });
} else {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}


// ✅ Import route
const registerRoute = require('./routes/register');
app.use('/api/register', registerRoute);

// ✅ Edit question with optional image upload (must come before questionsRoute)
app.put('/questions/:id', upload.fields([
  { name: 'questionImage', maxCount: 1 },
  { name: 'choiceImage0', maxCount: 1 },
  { name: 'choiceImage1', maxCount: 1 },
  { name: 'choiceImage2', maxCount: 1 },
  { name: 'choiceImage3', maxCount: 1 }
]), async (req, res) => {
  try {
    const { questionText, answer, attributesJson, code } = req.body;
    const files = req.files || {};
    const attributes = attributesJson ? JSON.parse(attributesJson) : undefined;

    const data = {};
    if (questionText !== undefined) { data.textTh = questionText; data.textEn = questionText; }
    if (answer !== undefined) data.answer = parseInt(answer);
    if (attributes !== undefined) {
      data.attributes = attributes;
      data.difficulty = String(attributes.difficulty ?? 1);
    }
    if (code !== undefined) data.code = code || null;
    if (files.questionImage?.[0]) data.image = getFilename(files.questionImage[0]);

    // Build choices if any choice text or image provided
    const choiceTexts = [0, 1, 2, 3].map(i => req.body[`choice${i}`]);
    if (choiceTexts.some(t => t !== undefined)) {
      // Load existing question to merge
      const existing = await prisma.question.findUnique({ where: { id: req.params.id } });
      const existingChoices = Array.isArray(existing?.choices) ? existing.choices : [{},{},{},{}];
      data.choices = [0, 1, 2, 3].map(i => ({
        textTh: choiceTexts[i] ?? existingChoices[i]?.textTh ?? '',
        textEn: choiceTexts[i] ?? existingChoices[i]?.textEn ?? '',
        image: getFilename(files[`choiceImage${i}`]?.[0]) ?? existingChoices[i]?.image ?? null
      }));
    }

    const question = await prisma.question.update({ where: { id: req.params.id }, data });
    res.json({ success: true, question });
  } catch (err) {
    console.error('❌ แก้ไขโจทย์ล้มเหลว:', err);
    res.status(500).json({ error: 'แก้ไขโจทย์ไม่สำเร็จ' });
  }
});

const questionsRoute = require('./routes/questions');
app.use('/questions', questionsRoute);

const resultsRoute = require('./routes/results');
app.use('/results', resultsRoute);

app.use('/api', require('./routes/exam-options'));

app.use('/api/exam-set', require('./routes/api/exam-set-random'));
app.use('/api/exam-sets', require('./routes/api/exam-sets'));
app.use('/api/exam-set-official', require('./routes/api/exam-set-official'));
app.use('/api/submit-exam', require('./routes/api/submit-exam'));
app.use('/api/announcements', require('./routes/api/announcements'));
app.use('/api/classroom', require('./routes/api/csv-upload'));



// ✅ Simple in-memory rate limiter: 5 attempts per IP per 15 min
const loginAttempts = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const max = 5;
  let entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
  }
  entry.count++;
  loginAttempts.set(ip, entry);
  return entry.count > max;
}

// ✅ Auth APIs
app.post('/api/login', async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ message: 'พยายามเข้าสู่ระบบมากเกินไป กรุณารอ 15 นาทีแล้วลองใหม่' });
  }

  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    return res.status(401).json({ message: 'ไม่พบผู้ใช้' });
  }

  const isMatch = await bcrypt.compare(password, user.password); // ✅ เปรียบเทียบ hash

  if (!isMatch) {
    return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
  }

  req.session.userId = user.id;
  req.session.role = user.role;
  req.session.firstName = user.firstName || null;

  res.json({ user: { id: user.id, username: user.username, role: user.role, firstName: user.firstName } });
});


app.get('/api/me', (req, res) => {
  if (req.session.userId) {
    res.json({
      loggedIn: true,
      userId: req.session.userId,
      role: req.session.role,
      firstName: req.session.firstName
    });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'ออกจากระบบล้มเหลว' });
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});



// ✅ Upload question
app.post('/add-question', upload.fields([
  { name: 'questionImage', maxCount: 1 },
  { name: 'choiceImage0', maxCount: 1 },
  { name: 'choiceImage1', maxCount: 1 },
  { name: 'choiceImage2', maxCount: 1 },
  { name: 'choiceImage3', maxCount: 1 }
]), async (req, res) => {
  try {
    const { questionText, answer, attributesJson, code } = req.body;
    const files = req.files;

    const attributes = attributesJson ? JSON.parse(attributesJson) : {
      topic: [], skill: [], trap: [], difficulty: 1
    };

    const choices = [0, 1, 2, 3].map(i => ({
      textTh: req.body[`choice${i}`] || '',
      textEn: req.body[`choice${i}`] || '',
      image: getFilename(files[`choiceImage${i}`]?.[0]) || null
    }));

    const data = {
      textTh: questionText,
      textEn: questionText,
      image: getFilename(files.questionImage?.[0]) || null,
      answer: parseInt(answer),
      attributes,
      difficulty: String(attributes.difficulty ?? 1),
      choices,
      ownerOrg: 'me',
      createdBy: req.session?.username || 'teacher',
      updatedBy: req.session?.username || 'teacher',
    };
    if (code) data.code = code;

    const result = await prisma.question.create({ data });

    console.log('✅ เพิ่มโจทย์:', result.id);
    res.json({ success: true, id: result.id });
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
    res.status(500).json({ success: false, error: 'เพิ่มโจทย์ไม่สำเร็จ' });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend is running on http://localhost:${PORT}`);
});
