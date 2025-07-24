const cors = require('cors');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const session = require('express-session');
const bcrypt = require('bcryptjs');



// Log ขั้นตอนเริ่มต้น
console.log('🚀 Server is starting...');

const prisma = new PrismaClient();
const app = express();
const upload = multer({ dest: 'uploads/' });

// Static client folder
app.use(express.static(path.join(__dirname, '..', 'client')));

// Routes
app.use('/api', require('./routes/api/attributeDictRoute'));
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/register', require('./routes/register'));
app.use('/questions', require('./routes/questions'));
app.use('/results', require('./routes/results'));
app.use('/api', require('./routes/exam-options'));
app.use('/api/exam-set', require('./routes/api/exam-set-random'));
app.use('/api/exam-sets', require('./routes/api/exam-sets'));
app.use('/api/exam-set-official', require('./routes/api/exam-set-official'));
app.use('/api/submit-exam', require('./routes/api/submit-exam'));

// Auth
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ message: 'ไม่พบผู้ใช้' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });

  req.session.userId = user.id;
  req.session.role = user.role;
  req.session.firstName = user.firstName || null;
  res.json({ user: { id: user.id, username: user.username, role: user.role, firstName: user.firstName } });
});

app.get('/api/me', (req, res) => {
  if (req.session.userId) {
    return res.json({
      loggedIn: true,
      userId: req.session.userId,
      role: req.session.role,
      firstName: req.session.firstName
    });
  }
  res.status(401).json({ loggedIn: false });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'ออกจากระบบล้มเหลว' });
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// Upload question
import { uploadToR2 } from "./services/r2Client";

app.post('/add-question', upload.fields([
  { name: 'questionImage', maxCount: 1 },
  { name: 'choiceImage0', maxCount: 1 },
  { name: 'choiceImage1', maxCount: 1 },
  { name: 'choiceImage2', maxCount: 1 },
  { name: 'choiceImage3', maxCount: 1 }
]), async (req, res) => {
  try {
    const { questionText, choice0, choice1, choice2, choice3, correct, difficulty } = req.body;
    const files = /** @type {{ [field: string]: Express.Multer.File[] }} */ (req.files);
    const now = new Date().toISOString();

    const choiceTexts = [choice0, choice1, choice2, choice3];

    const choices = await Promise.all(choiceTexts.map(async (text, i) => {
      const file = files[`choiceImage${i}`]?.[0];
      const imageUrl = file
        ? await uploadToR2(file.path, `choice-${i}-${Date.now()}-${file.originalname}`)
        : null;
      return {
        textTh: text,
        textEn: text,
        image: imageUrl
      };
    }));

    const questionImageFile = files.questionImage?.[0];
    const questionImageUrl = questionImageFile
      ? await uploadToR2(questionImageFile.path, `question-${Date.now()}-${questionImageFile.originalname}`)
      : null;

    const result = await prisma.question.create({
      data: {
        textTh: questionText,
        textEn: questionText,
        image: questionImageUrl,
        answer: parseInt(correct),
        attributes: {
          topic: [],
          skill: [],
          trap: [],
          difficulty: difficulty ? parseInt(difficulty) : 1
        },
        difficulty: difficulty ? parseInt(difficulty) : 1,
        choices,
        source: 'me',
        estimatedTimeSec: 30,
        derivedFrom: null,
        ownerOrg: 'me',
        createdBy: 'admin',
        updatedBy: 'admin',
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

// Bind to all interfaces and dynamic PORT
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend is running on http://0.0.0.0:${PORT}`);
});
