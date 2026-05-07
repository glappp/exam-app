require('dotenv').config(); // โหลด .env สำหรับ local dev
// ── Catch startup crashes ──────────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('💥 uncaughtException:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('💥 unhandledRejection:', reason);
  process.exit(1);
});

const cors = require('cors');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs');
console.log('🚀 Starting server...');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   PORT:', process.env.PORT);
console.log('   DATABASE_URL set:', !!process.env.DATABASE_URL);
console.log('   R2 set:', !!process.env.R2_ACCOUNT_ID);

const { upload, getFilename, useR2 } = require('./storage');

const prisma = new PrismaClient();
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: true, credentials: true } });
require('./grand-prix-socket')(io);

// ✅ Trust Render/proxy reverse proxy (ต้องมีก่อน session)
app.set('trust proxy', 1);

// ✅ Maintenance window: 04:00–05:00 ICT (= 21:00–22:00 UTC)
app.use((req, res, next) => {
  const utcHour = new Date().getUTCHours();
  if (utcHour === 21) { // 04:00–05:00 ICT
    if (req.path.startsWith('/api/') || req.method !== 'GET') {
      return res.status(503).json({
        error: 'ระบบปิดปรับปรุงชั่วคราว (04:00–05:00 น.) กรุณากลับมาใหม่ภายหลัง'
      });
    }
  }
  next();
});

// ✅ Middleware (ต้องอยู่ก่อน routes ทั้งหมด)
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(session({
  store: process.env.DATABASE_URL
    ? new pgSession({ conString: process.env.DATABASE_URL, createTableIfMissing: true })
    : undefined,
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.get('/', (req, res) => res.redirect('/index.html'));
app.use(express.static(path.join(__dirname, '..', 'client'))); // สำหรับไฟล์ static

// ── mustChangePassword guard ───────────────────────────────────────────────
// ถ้า user ต้องเปลี่ยน password → block ทุก API ยกเว้น auth และ /api/me
const CHANGE_PWD_EXEMPT = ['/me', '/login', '/logout', '/register'];
app.use('/api', async (req, res, next) => {
  if (!req.session?.userId) return next();
  const exempted = CHANGE_PWD_EXEMPT.includes(req.path) || req.path.startsWith('/auth');
  if (exempted) return next();
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { mustChangePassword: true, role: true },
    });
    if (user?.mustChangePassword && user.role === 'student') {
      return res.status(403).json({ error: 'กรุณาเปลี่ยนรหัสผ่านก่อนใช้งาน', code: 'MUST_CHANGE_PASSWORD' });
    }
  } catch { /* ถ้า query fail ให้ผ่านไปก่อน */ }
  next();
});

const attributeDictRoute = require('./routes/api/attributeDictRoute');
app.use('/api', attributeDictRoute);

const studentRoute = require('./routes/api/student');
app.use('/api/student', studentRoute);

const adminRoute = require('./routes/api/admin');
app.use('/api/admin', adminRoute);




// ✅ Static files
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
if (useR2) {
  // ถ้าไฟล์มีอยู่ใน local (committed ใน git เช่น chulabhorn images) → serve ตรง
  // ถ้าไม่มี → redirect ไป R2 (user-uploaded files)
  app.use('/uploads', (req, res) => {
    const relPath   = req.path.replace(/^\//, '');
    const localPath = path.join(__dirname, 'uploads', relPath);
    if (fs.existsSync(localPath)) {
      return res.sendFile(localPath);
    }
    const base = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
    if (!base) return res.status(503).send('R2_PUBLIC_URL ยังไม่ได้ตั้งค่า');
    res.redirect(`${base}/uploads/${relPath}`);
  });
} else {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}


// ✅ Import route
const registerRoute = require('./routes/register');
app.use('/api/register', registerRoute);

const authRoute = require('./routes/api/auth');
app.use('/api/auth', authRoute);

// ✅ Edit question with optional image upload (must come before questionsRoute)
// Pre-middleware: ดึง R2 key เดิมเพื่อ overwrite แทนการสร้าง key ใหม่
async function attachOverwriteKey(req, res, next) {
  if (useR2) {
    try {
      const q = await prisma.question.findUnique({
        where: { id: req.params.id },
        select: { image: true, content: true }
      });
      if (q?.image) {
        req.overwriteImageKey = `uploads/${q.image}`;
      } else if (Array.isArray(q?.content)) {
        const imgBlock = q.content.find(b => b.type === 'image');
        if (imgBlock?.url) {
          const base = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
          req.overwriteImageKey = imgBlock.url.replace(base + '/', '');
        }
      }
    } catch (_) {}
  }
  next();
}

app.put('/questions/:id', attachOverwriteKey, upload.fields([
  { name: 'questionImage', maxCount: 1 },
  { name: 'choiceImage0', maxCount: 1 },
  { name: 'choiceImage1', maxCount: 1 },
  { name: 'choiceImage2', maxCount: 1 },
  { name: 'choiceImage3', maxCount: 1 }
]), async (req, res) => {
  try {
    const { questionText, answer, attributesJson, code, source, shortAnswerJson } = req.body;
    const files = req.files || {};
    const attributes = attributesJson ? JSON.parse(attributesJson) : undefined;

    const data = {};
    if (questionText !== undefined) { data.textTh = questionText; data.textEn = questionText; }
    if (answer !== undefined) data.answer = answer || null;
    if (shortAnswerJson !== undefined) data.shortAnswer = JSON.parse(shortAnswerJson);
    if (attributes !== undefined) data.attributes = attributes;
    if (code !== undefined) data.code = code || null;
    if (source !== undefined) data.source = source || null;
    // ถ้า overwrite key เดิม → URL ไม่เปลี่ยน ไม่ต้องอัปเดต DB
    // ถ้าเป็น key ใหม่ (ไม่มีรูปเดิม) → บันทึก filename ใหม่
    if (files.questionImage?.[0] && !req.overwriteImageKey) {
      data.image = getFilename(files.questionImage[0]);
    }

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
    res.status(500).json({ error: `แก้ไขโจทย์ไม่สำเร็จ: ${err.message}` });
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
app.use('/api/mock', require('./routes/api/mock'));
app.use('/api/ai', require('./routes/api/ai-gen'));
app.use('/api/announcements', require('./routes/api/announcements'));
app.use('/api/classroom', require('./routes/api/csv-upload'));
app.use('/api/teacher', require('./routes/api/teacher'));
app.use('/api/school-admin', require('./routes/api/school-admin'));
app.use('/api/time-trial', require('./routes/api/time-trial'));
app.use('/api/tickets', require('./routes/api/tickets'));
app.use('/api/questions', require('./routes/api/question-report'));
app.use('/api/feedback',  require('./routes/api/feedback'));
app.use('/api/academic-records', require('./routes/api/academic-records'));
app.use('/api/mission',      require('./routes/api/mission'));
app.use('/api/leaderboard',  require('./routes/api/leaderboard'));
app.use('/api/saturday-quiz', require('./routes/api/saturday-quiz').router);
app.use('/api/box',          require('./routes/api/box'));
app.use('/api/parent',       require('./routes/api/parent'));
app.use('/api/adaptive',    require('./routes/api/adaptive'));

// GET /api/schools?province=X&district=Y — public, no auth
app.get('/api/schools', async (req, res) => {
  try {
    const { province, district } = req.query;
    const where = { isActive: true };
    if (province) where.province = province;
    if (district) where.district = district;
    const schools = await prisma.school.findMany({ where, orderBy: { name: 'asc' }, select: { id: true, name: true, district: true, province: true } });
    res.json({ schools });
  } catch (err) {
    res.status(500).json({ error: 'โหลดโรงเรียนล้มเหลว' });
  }
});



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
  req.session.schoolId = user.schoolId || null;

  if (!user.firstLoginAt) {
    await prisma.user.update({ where: { id: user.id }, data: { firstLoginAt: new Date() } });
  }

  // บันทึก login event
  await prisma.loginLog.create({
    data: { userId: user.id, schoolId: user.schoolId || null }
  }).catch(() => {}); // ไม่ให้ error ขัด login

  res.json({
    user: { id: user.id, username: user.username, role: user.role, firstName: user.firstName },
    mustChangePassword: user.mustChangePassword,
  });
});


app.get('/api/me', (req, res) => {
  if (req.session.userId) {
    res.json({
      loggedIn: true,
      userId: req.session.userId,
      role: req.session.role,
      firstName: req.session.firstName,
      username: req.session.username,
      impersonating: req.session.adminBackup?.username || null
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

// ✅ Seed subject/grade entries ถ้ายังไม่มี
async function seedSubjectGradeIfNeeded() {
  const count = await prisma.attributeDictionary.count({ where: { type: { in: ['subject', 'grade'] } } });
  if (count > 0) return;
  const entries = [
    { key: 'math',    type: 'subject', th: 'คณิตศาสตร์', en: 'Mathematics' },
    { key: 'science', type: 'subject', th: 'วิทยาศาสตร์', en: 'Science' },
    { key: 'thai',    type: 'subject', th: 'ภาษาไทย',     en: 'Thai Language' },
    { key: 'english', type: 'subject', th: 'ภาษาอังกฤษ',  en: 'English' },
    { key: 'social',  type: 'subject', th: 'สังคมศึกษา',  en: 'Social Studies' },
    { key: 'p1', type: 'grade', th: 'ป.1', en: 'Grade 1', grade: 1 },
    { key: 'p2', type: 'grade', th: 'ป.2', en: 'Grade 2', grade: 2 },
    { key: 'p3', type: 'grade', th: 'ป.3', en: 'Grade 3', grade: 3 },
    { key: 'p4', type: 'grade', th: 'ป.4', en: 'Grade 4', grade: 4 },
    { key: 'p5', type: 'grade', th: 'ป.5', en: 'Grade 5', grade: 5 },
    { key: 'p6', type: 'grade', th: 'ป.6', en: 'Grade 6', grade: 6 },
    { key: 'm1', type: 'grade', th: 'ม.1', en: 'Grade 7',  grade: 7 },
    { key: 'm2', type: 'grade', th: 'ม.2', en: 'Grade 8',  grade: 8 },
    { key: 'm3', type: 'grade', th: 'ม.3', en: 'Grade 9',  grade: 9 },
  ];
  for (const e of entries) {
    await prisma.attributeDictionary.upsert({ where: { key: e.key }, update: {}, create: e });
  }
  console.log('✅ seeded subject/grade entries');
}

// ✅ Start server
const { ensureActiveSeason } = require('./utils/season-check');
const { scheduleMaintenance } = require('./utils/maintenance');
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, async () => {
  console.log(`✅ Backend is running on http://localhost:${PORT}`);
  await seedSubjectGradeIfNeeded().catch(e => console.error('seed error:', e));
  await ensureActiveSeason().catch(e => console.error('season-check error:', e));
  scheduleMaintenance();
});
