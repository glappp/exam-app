import cors from 'cors';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// Log ขั้นตอนเริ่มต้น
console.log('🚀 Server is starting...');

const prisma = new PrismaClient();
const app = express();
const upload = multer({ dest: 'uploads/' });

// Static client folder
app.use(express.static(path.join(__dirname, '..', 'client')));

// Routes

const attributeDictRoute = require('./routes/api/attributeDictRoute.js');
app.use('/api', attributeDictRoute);


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

const registerRoute = require('./routes/register.js');
const questionsRoute = require('./routes/questions.js');
const resultsRoute = require('./routes/results.js');
const examOptionsRoute = require('./routes/exam-options.js');
const examSetRandomRoute = require('./routes/api/exam-set-random.js');
const examSetsRoute = require('./routes/api/exam-sets.js');
const examSetOfficialRoute = require('./routes/api/exam-set-official.js');
const submitExamRoute = require('./routes/api/submit-exam.js');

app.use('/api/register', registerRoute);
app.use('/questions', questionsRoute);
app.use('/results', resultsRoute);
app.use('/api', examOptionsRoute);
app.use('/api/exam-set', examSetRandomRoute);
app.use('/api/exam-sets', examSetsRoute);
app.use('/api/exam-set-official', examSetOfficialRoute);
app.use('/api/submit-exam', submitExamRoute);


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
import { uploadToR2 } from "./services/r2Client.js";
;

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
        ? await uploadToR2(file.path, `images/choices/choice-${i}-${Date.now()}-${file.originalname}`)

        : null;
      return {
        textTh: text,
        textEn: text,
        image: imageUrl
      };
    }));

    const questionImageFile = files.questionImage?.[0];
    const questionImageUrl = questionImageFile
      ? await uploadToR2(questionImageFile.path, `images/questions/question-${Date.now()}-${questionImageFile.originalname}`)

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
