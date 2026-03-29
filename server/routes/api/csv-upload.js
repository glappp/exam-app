const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function requireTeacher(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  if (!['admin', 'teacher'].includes(req.session.role)) return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
  next();
}

// GET /api/classroom/template — download CSV template
router.get('/template', requireTeacher, (req, res) => {
  const header = 'รหัสนักเรียน,ชื่อ-นามสกุล,คะแนนที่ได้,คะแนนเต็ม\n';
  const example = 'STU001,สมชาย ใจดี,85,100\nSTU002,มานี มีใจ,72,100\n';
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="score_template.csv"');
  res.send('\uFEFF' + header + example); // BOM for Excel Thai
});

// POST /api/classroom/upload — upload CSV คะแนน
router.post('/upload', requireTeacher, express.text({ type: 'text/csv', limit: '1mb' }), async (req, res) => {
  try {
    const { subject, academicYear } = req.query;
    if (!subject || !academicYear) return res.status(400).json({ error: 'ต้องระบุ subject และ academicYear' });

    const lines = req.body.replace(/\r/g, '').split('\n').filter(l => l.trim());
    if (lines.length < 2) return res.status(400).json({ error: 'ไฟล์ไม่มีข้อมูล' });

    // skip header row
    const rows = lines.slice(1).map(line => {
      const [studentCode, name, scoreStr, fullScoreStr] = line.split(',').map(s => s.trim());
      return { studentCode, name, score: parseFloat(scoreStr), fullScore: parseFloat(fullScoreStr) };
    }).filter(r => r.studentCode && !isNaN(r.score) && !isNaN(r.fullScore));

    if (!rows.length) return res.status(400).json({ error: 'ไม่พบข้อมูลที่ถูกต้องในไฟล์' });

    // เช็ค studentCode ที่ไม่พบในระบบ
    const codes = rows.map(r => r.studentCode);
    const profiles = await prisma.studentProfile.findMany({
      where: { studentCode: { in: codes } },
      select: { studentCode: true, userId: true }
    });
    const codeToUserId = Object.fromEntries(profiles.map(p => [p.studentCode, p.userId]));
    const notFound = codes.filter(c => !codeToUserId[c]);

    // คำนวณ stats
    const scores = rows.map(r => r.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const sd = Math.sqrt(scores.map(s => (s - mean) ** 2).reduce((a, b) => a + b, 0) / scores.length);
    const passCount = rows.filter(r => r.score / r.fullScore >= 0.5).length;

    // คำนวณ percentile แต่ละคน
    const withPercentile = rows.map(r => ({
      ...r,
      userId: codeToUserId[r.studentCode] || null,
      percentile: Math.round(scores.filter(s => s < r.score).length / scores.length * 100)
    }));

    // บันทึกลง DB
    const upload = await prisma.classroomScoreUpload.create({
      data: {
        uploadedById: req.session.userId,
        academicYear,
        subject,
        scores: JSON.stringify(withPercentile),
        stats: JSON.stringify({ mean: Math.round(mean * 10) / 10, sd: Math.round(sd * 10) / 10, count: rows.length, passCount })
      }
    });

    res.json({
      success: true,
      uploadId: upload.id,
      stats: { mean: Math.round(mean * 10) / 10, sd: Math.round(sd * 10) / 10, count: rows.length, passCount },
      notFound,
      preview: withPercentile.slice(0, 5)
    });
  } catch (err) {
    console.error('❌ csv-upload:', err);
    res.status(500).json({ error: 'upload ล้มเหลว: ' + err.message });
  }
});

// GET /api/classroom/my-scores — เด็กดูคะแนนของตัวเอง
router.get('/my-scores', async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  try {
    const uploads = await prisma.classroomScoreUpload.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const myScores = [];
    for (const u of uploads) {
      const scores = JSON.parse(u.scores);
      const mine = scores.find(s => s.userId === req.session.userId);
      if (mine) {
        const stats = u.stats ? JSON.parse(u.stats) : null;
        myScores.push({
          subject: u.subject,
          academicYear: u.academicYear,
          score: mine.score,
          fullScore: mine.fullScore,
          percentile: mine.percentile,
          mean: stats?.mean,
          uploadedAt: u.createdAt
        });
      }
    }

    res.json({ scores: myScores });
  } catch (err) {
    res.status(500).json({ error: 'โหลดคะแนนล้มเหลว' });
  }
});

module.exports = router;
