const cors = require('cors');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const session = require('express-session');

const prisma = new PrismaClient();
const app = express();
const upload = multer({ dest: 'uploads/' });
const bcrypt = require('bcrypt');

app.use(express.static(path.join(__dirname, '..', 'client'))); // สำหรับไฟล์ static



// ✅ Middleware
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // สำหรับ dev, ใช้ true พร้อม HTTPS
}));




// ✅ Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/client', express.static(path.join(__dirname, '../client')));

// ✅ Import route
const registerRoute = require('./routes/register');
app.use('/api/register', registerRoute);

const questionsRoute = require('./routes/questions');
app.use('/questions', questionsRoute);

const resultsRoute = require('./routes/results');
app.use('/results', resultsRoute);

app.use('/api', require('./routes/exam-options'));

// ✅ Auth APIs
app.post('/api/login', async (req, res) => {
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
    const { questionText, choice0, choice1, choice2, choice3, correct, difficulty } = req.body;
    const files = req.files;
    const now = new Date().toISOString();

    const choices = [choice0, choice1, choice2, choice3].map((text, i) => ({
      textTh: text,
      textEn: text, // ⛳ เปลี่ยนถ้ามีเวอร์ชันอังกฤษ
      image: files[`choiceImage${i}`]?.[0]?.filename || null
    }));

    const result = await prisma.question.create({
      data: {
        textTh: questionText,
        textEn: questionText,
        image: files.questionImage?.[0]?.filename || null,
        answer: parseInt(correct),
        attributes: {
          topic: [],
          skill: [],
          trap: [],
          difficulty: difficulty ? parseInt(difficulty) : 1
        },
        difficulty,
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

// ✅ Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend is running on http://localhost:${PORT}`);
});
