const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function requireTeacher(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  if (!['admin', 'teacher'].includes(req.session.role)) return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
  next();
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function calcStats(scores) {
  const n = scores.length;
  if (n === 0) return { mean: 0, sd: 0, min: 0, max: 0 };
  const mean = scores.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(scores.map(s => (s - mean) ** 2).reduce((a, b) => a + b, 0) / n);
  return {
    mean: Math.round(mean * 10) / 10,
    sd: Math.round(sd * 10) / 10,
    min: Math.min(...scores),
    max: Math.max(...scores),
    count: n,
    passCount: scores.filter(s => s / scores._fullScore >= 0.5).length // ไม่ใช้ตรงนี้
  };
}

function attachPercentile(rows) {
  const scores = rows.map(r => r.score);
  return rows.map(r => ({
    ...r,
    percentile: Math.round(scores.filter(s => s < r.score).length / scores.length * 100)
  }));
}

function buildStats(rows) {
  const scores = rows.map(r => r.score);
  const n = scores.length;
  const mean = scores.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(scores.map(s => (s - mean) ** 2).reduce((a, b) => a + b, 0) / n);
  const fullScore = rows[0]?.fullScore || 100;
  return {
    mean: Math.round(mean * 10) / 10,
    sd: Math.round(sd * 10) / 10,
    min: Math.min(...scores),
    max: Math.max(...scores),
    count: n,
    passCount: rows.filter(r => r.score / fullScore >= 0.5).length
  };
}

// GET /api/classroom/students?school=&grade=&year= — รายชื่อนักเรียนตาม school+grade
router.get('/students', requireTeacher, async (req, res) => {
  try {
    const { school, grade, year } = req.query;
    const yearFilter = year || String(new Date().getFullYear() + 543);
    const where = { academicYear: yearFilter, status: 'active' };
    if (school) where.school = school;
    if (grade) where.grade = grade;

    const profiles = await prisma.studentProfile.findMany({
      where,
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: [{ grade: 'asc' }, { classroom: 'asc' }, { studentCode: 'asc' }]
    });

    const students = profiles.map(p => ({
      userId: p.userId,
      studentCode: p.studentCode || '',
      name: `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim(),
      grade: p.grade,
      classroom: p.classroom || '',
      school: p.school
    }));

    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/classroom/score-entry — กรอกคะแนน manual + คำนวณสถิติ + บันทึก
router.post('/score-entry', requireTeacher, async (req, res) => {
  try {
    const { subject, academicYear, fullScore, rows } = req.body;
    // rows: [{userId, studentCode, name, score}]
    if (!Array.isArray(rows) || rows.length === 0)
      return res.status(400).json({ error: 'ไม่มีข้อมูลคะแนน' });

    const fs = parseFloat(fullScore) || 100;
    const valid = rows
      .map(r => ({ ...r, score: parseFloat(r.score), fullScore: fs }))
      .filter(r => !isNaN(r.score));

    if (valid.length === 0) return res.status(400).json({ error: 'กรุณากรอกคะแนนอย่างน้อย 1 คน' });

    const withPct = attachPercentile(valid);
    const stats = buildStats(valid);

    const upload = await prisma.classroomScoreUpload.create({
      data: {
        uploadedById: req.session.userId,
        subject: subject || 'ไม่ระบุวิชา',
        scores: JSON.stringify(withPct),
        stats: JSON.stringify(stats)
      }
    });

    res.json({ success: true, uploadId: upload.id, stats, rows: withPct });
  } catch (err) {
    console.error('❌ score-entry:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/classroom/matrix-entry — บันทึกคะแนนหลายวิชาพร้อมกัน (matrix)
// body: { academicYear, school, grade, subjects:[{name,fullScore}], rows:[{userId,studentCode,name,classroom,subjectScores:{วิชา:คะแนน}}] }
router.post('/matrix-entry', requireTeacher, async (req, res) => {
  try {
    const { academicYear, school, grade, subjects, rows } = req.body;
    if (!Array.isArray(subjects) || subjects.length === 0)
      return res.status(400).json({ error: 'กรุณาเพิ่มวิชาอย่างน้อย 1 วิชา' });
    if (!Array.isArray(rows) || rows.length === 0)
      return res.status(400).json({ error: 'ไม่มีข้อมูลนักเรียน' });

    // ตรวจสิทธิ์โรงเรียน
    const isAdmin = req.session.role === 'admin';
    const teacherSchool = req.session.school || '';
    if (!isAdmin && teacherSchool && school && school !== teacherSchool)
      return res.status(403).json({ error: 'ไม่มีสิทธิ์บันทึกคะแนนของโรงเรียนอื่น' });

    // คำนวณ stats ต่อวิชา
    const statsPerSubject = subjects.map(subj => {
      const scores = rows
        .map(r => parseFloat(r.subjectScores?.[subj.name]))
        .filter(s => !isNaN(s));
      if (scores.length === 0) return { subject: subj.name, fullScore: subj.fullScore, count: 0 };
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const sd = Math.sqrt(scores.map(s => (s - mean) ** 2).reduce((a, b) => a + b, 0) / scores.length);
      return {
        subject: subj.name,
        fullScore: subj.fullScore,
        mean: Math.round(mean * 10) / 10,
        sd: Math.round(sd * 10) / 10,
        min: Math.min(...scores),
        max: Math.max(...scores),
        count: scores.length,
        passCount: scores.filter(s => s / subj.fullScore >= 0.5).length
      };
    });

    // คำนวณ percentile ต่อวิชาต่อนักเรียน
    const rowsWithPct = rows.map(r => {
      const pct = {};
      subjects.forEach(subj => {
        const s = parseFloat(r.subjectScores?.[subj.name]);
        if (!isNaN(s)) {
          const allScores = rows.map(rr => parseFloat(rr.subjectScores?.[subj.name])).filter(x => !isNaN(x));
          pct[subj.name] = Math.round(allScores.filter(x => x < s).length / allScores.length * 100);
        }
      });
      return { ...r, percentiles: pct };
    });

    const upload = await prisma.classroomScoreUpload.create({
      data: {
        uploadedById: req.session.userId,
        school: school || teacherSchool,
        subject: 'multi',
        scores: JSON.stringify(rowsWithPct),
        stats: JSON.stringify(statsPerSubject)
      }
    });

    res.json({ success: true, uploadId: upload.id, stats: statsPerSubject, rows: rowsWithPct });
  } catch (err) {
    console.error('❌ matrix-entry:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/classroom/history — ประวัติ (ครูเห็นของตัวเอง, admin เห็นทั้งหมดของโรงเรียนเดียวกัน)
router.get('/history', requireTeacher, async (req, res) => {
  try {
    const isAdmin = req.session.role === 'admin';
    const where = isAdmin ? {} : { uploadedById: req.session.userId };
    const uploads = await prisma.classroomScoreUpload.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 30
    });
    res.json(uploads.map(u => ({
      id: u.id,
      subject: u.subject,
      school: u.school,
      grade: u.grade,
      academicYear: u.academicYear,
      stats: u.stats ? JSON.parse(u.stats) : null,
      createdAt: u.createdAt
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/classroom/export/:id — download ผลเป็น CSV
router.get('/export/:id', requireTeacher, async (req, res) => {
  try {
    const upload = await prisma.classroomScoreUpload.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!upload) return res.status(404).json({ error: 'ไม่พบข้อมูล' });

    // ตรวจสิทธิ์: ครูเห็นเฉพาะของตัวเอง
    const isAdmin = req.session.role === 'admin';
    if (!isAdmin && upload.uploadedById !== req.session.userId)
      return res.status(403).json({ error: 'ไม่มีสิทธิ์ดาวน์โหลด' });

    const rows = JSON.parse(upload.scores);
    const statsRaw = upload.stats ? JSON.parse(upload.stats) : {};
    const isMulti = upload.subject === 'multi';

    let csv = '\uFEFF'; // BOM
    if (isMulti) {
      // หลายวิชา — header เป็น subjects
      const subjectNames = Array.isArray(statsRaw) ? statsRaw.map(s => s.subject) : [];
      csv += `โรงเรียน: ${upload.school || '-'},ชั้น: ${upload.grade || '-'},ปี: ${upload.academicYear}\n`;
      // stats per subject
      if (Array.isArray(statsRaw)) {
        csv += statsRaw.map(s => `${s.subject}: เฉลี่ย=${s.mean} SD=${s.sd} (${s.count}คน ผ่าน${s.passCount})`).join(' | ') + '\n\n';
      }
      csv += `ลำดับ,รหัสนักเรียน,ชื่อ-นามสกุล,ห้อง,${subjectNames.join(',')},${subjectNames.map(s => 'Pct_'+s).join(',')}\n`;
      rows.forEach((r, i) => {
        const scores = subjectNames.map(s => r.subjectScores?.[s] ?? '');
        const pcts = subjectNames.map(s => r.percentiles?.[s] != null ? 'P'+r.percentiles[s] : '');
        csv += `${i+1},${r.studentCode||''},${r.name||''},${r.classroom||''},${scores.join(',')},${pcts.join(',')}\n`;
      });
    } else {
      // วิชาเดียว (format เดิม)
      const stats = Array.isArray(statsRaw) ? statsRaw[0] : statsRaw;
      csv += `วิชา: ${upload.subject},ปีการศึกษา: ${upload.academicYear}\n`;
      csv += `ค่าเฉลี่ย: ${stats?.mean},SD: ${stats?.sd},จำนวน: ${stats?.count},ผ่าน: ${stats?.passCount}\n\n`;
      csv += 'ลำดับ,รหัสนักเรียน,ชื่อ-นามสกุล,คะแนนที่ได้,คะแนนเต็ม,เปอร์เซ็นไทล์\n';
      rows.forEach((r, i) => {
        csv += `${i+1},${r.studentCode||''},${r.name||''},${r.score||''},${r.fullScore||''},${r.percentile??''}\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="scores_${upload.id}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/classroom/my-scores — นักเรียนดูผลคะแนนของตัวเอง
router.get('/my-scores', async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  const userId = req.session.userId;
  try {
    // ข้อมูลนักเรียน
    const profile = await prisma.studentProfile.findFirst({
      where: { userId, status: 'active' },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { academicYear: 'desc' }
    });

    // โหลด uploads ที่เกี่ยวข้องกับโรงเรียน+ชั้น (ถ้ามี) เพื่อกรอง
    const where = {};
    if (profile) {
      if (profile.school) where.school = profile.school;
      if (profile.grade)  where.grade  = profile.grade;
    }
    const uploads = await prisma.classroomScoreUpload.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // กรองเฉพาะ records ที่มี userId ของนักเรียนนี้
    const results = [];
    const yearRawData = {}; // { "2565": [{ rows, myScore }] } สำหรับคำนวณ aggregate

    for (const u of uploads) {
      let rows;
      try { rows = JSON.parse(u.scores || '[]'); } catch { continue; }
      const myRow = rows.find(r => r.userId === userId);
      if (!myRow) continue;
      const stats = u.stats ? JSON.parse(u.stats) : null;
      const isMulti = u.subject === 'multi';

      // คำนวณ rank ต่อวิชา (standard competition ranking: tied = same rank)
      const ranks = {};
      if (isMulti && Array.isArray(stats)) {
        stats.forEach(s => {
          const myScore = parseFloat(myRow.subjectScores?.[s.subject]);
          if (isNaN(myScore)) return;
          const allScores = rows
            .map(r => parseFloat(r.subjectScores?.[s.subject]))
            .filter(x => !isNaN(x));
          ranks[s.subject] = allScores.filter(x => x > myScore).length + 1;
        });
      } else if (!isMulti) {
        const myScore = parseFloat(myRow.score);
        if (!isNaN(myScore)) {
          const allScores = rows.map(r => parseFloat(r.score)).filter(x => !isNaN(x));
          ranks['_'] = allScores.filter(x => x > myScore).length + 1;
          ranks['_total'] = allScores.length;
        }
        // เก็บ raw rows สำหรับ aggregate (groupby year+term)
        const termKey = `${u.academicYear}|${u.term || '1'}`;
        if (!yearRawData[termKey]) yearRawData[termKey] = [];
        yearRawData[termKey].push({ rows, fullScore: parseFloat(myRow.fullScore) || 100 });
      }

      // เติม max/min ถ้า stats เก่าไม่มี — คำนวณจาก raw scores
      let enrichedStats = stats;
      if (!isMulti && stats && (stats.max == null || stats.min == null)) {
        const allScores = rows.map(r => parseFloat(r.score)).filter(x => !isNaN(x));
        enrichedStats = {
          ...stats,
          max: allScores.length ? Math.max(...allScores) : null,
          min: allScores.length ? Math.min(...allScores) : null,
        };
      }

      results.push({
        uploadId: u.id,
        subject: u.subject,
        isMulti,
        school: u.school,
        grade: u.grade,
        academicYear: u.academicYear,
        term: u.term || '1',
        createdAt: u.createdAt,
        myData: myRow,
        classStats: enrichedStats,
        ranks,
        total: rows.length
      });
    }

    // คำนวณ aggregate (คะแนนรวม + สถิติ + อันดับ) แต่ละปีการศึกษา
    const aggregates = {};
    for (const [termKey, subjectList] of Object.entries(yearRawData)) {
      const [year, term] = termKey.split('|');
      const studentTotals = {};
      for (const { rows } of subjectList) {
        for (const row of rows) {
          const key = row.userId ?? row.studentCode;
          if (key == null) continue;
          studentTotals[key] = (studentTotals[key] || 0) + (parseFloat(row.score) || 0);
        }
      }
      const allTotals = Object.values(studentTotals);
      const myTotal   = studentTotals[userId] || 0;
      const fullTotal = subjectList.reduce((s, d) => s + d.fullScore, 0);
      const n    = allTotals.length;
      const mean = allTotals.reduce((s, v) => s + v, 0) / n;
      const sd   = Math.sqrt(allTotals.reduce((s, v) => s + (v - mean) ** 2, 0) / n);
      const rank = allTotals.filter(t => t > myTotal).length + 1;

      aggregates[termKey] = {
        year,
        term,
        myTotal,
        fullTotal,
        classMeanTotal: Math.round(mean * 10) / 10,
        classSDTotal:   Math.round(sd   * 10) / 10,
        rank,
        total: n,
        subjectCount: subjectList.length
      };
    }

    const student = profile ? {
      name: `${profile.user.firstName || ''} ${profile.user.lastName || ''}`.trim(),
      grade: profile.grade,
      classroom: profile.classroom || '',
      school: profile.school,
      studentCode: profile.studentCode || '',
      academicYear: profile.academicYear
    } : null;

    res.json({ student, results, aggregates });
  } catch (err) {
    console.error('❌ my-scores:', err);
    res.status(500).json({ error: err.message });
  }
});

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
    const { subject } = req.query;
    if (!subject) return res.status(400).json({ error: 'ต้องระบุ subject' });

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

module.exports = router;
