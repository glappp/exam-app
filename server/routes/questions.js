const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ✅ ดึง source ทั้งหมด (distinct) — สำหรับ filter ชุดข้อสอบ
router.get('/sources', async (req, res) => {
  try {
    const rows = await prisma.question.findMany({
      select: { source: true },
      distinct: ['source'],
      orderBy: { source: 'asc' },
    });
    res.json(rows.map(r => r.source).filter(Boolean));
  } catch (err) {
    console.error('❌ ดึง sources ล้มเหลว:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ ดึงโจทย์แบบ paginated + filter (สำหรับ list-questions.html)
router.get('/', async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page) || 1);
    const limit    = 20;
    const keyword  = (req.query.keyword || '').trim();
    const difficulty = req.query.difficulty;
    const attrType   = req.query.attrType;   // ยังรองรับ legacy
    const attrValue  = req.query.attrValue;
    const needsReview = req.query.needsReview;
    const source     = req.query.source;     // filter ชุดข้อสอบ (exact match)
    const code       = (req.query.code || '').trim(); // filter รหัส/เลขข้อ

    const where = {};
    if (keyword) where.textTh = { contains: keyword };
    if (difficulty && difficulty !== 'all') {
      const diffMap = { easy: '1', medium: '2', hard: '3' };
      where.difficulty = diffMap[difficulty] || difficulty;
    }
    if (needsReview === 'true') where.needsReview = true;
    if (source && source !== 'all') where.source = source;
    if (code) where.code = { contains: code };

    // ดึงทั้งหมดที่ผ่าน where แล้วกรอง attrType/attrValue ใน JS
    let allMatching = await prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    if (attrType && attrValue && attrValue !== 'all') {
      allMatching = allMatching.filter(q => {
        const attrs = q.attributes?.[attrType];
        return Array.isArray(attrs) && attrs.some(a => a.includes(attrValue));
      });
    }

    const total      = allMatching.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage   = Math.min(page, totalPages);
    const questions  = allMatching.slice((safePage - 1) * limit, safePage * limit);

    res.json({ questions, currentPage: safePage, totalPages, total });
  } catch (err) {
    console.error('❌ ดึงโจทย์ล้มเหลว:', err);
    res.status(500).json({ error: 'ดึงโจทย์ไม่สำเร็จ' });
  }
});

// ✅ ดึงโจทย์ทั้งหมด (ใน practice mode ใช้)
// ?practiceOnly=true → ยกเว้นข้อสอบจริง/แข่งขัน (isOfficial=true)
router.get('/all', async (req, res) => {
  try {
    let where = {};

    if (req.query.practiceOnly === 'true') {
      const officialSets = await prisma.examSetMetadata.findMany({
        where: { isOfficial: true },
        select: { questionSource: true }
      });
      const officialSources = officialSets
        .map(s => s.questionSource)
        .filter(Boolean);
      if (officialSources.length > 0) {
        where.source = { notIn: officialSources };
      }
    }

    const questions = await prisma.question.findMany({ where });
    res.json({ questions });
  } catch (err) {
    console.error('❌ ดึงโจทย์ล้มเหลว:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงโจทย์ได้' });
  }
});

// ✅ ดึงโจทย์รายข้อ
router.get('/:id', async (req, res) => {
  try {
    const question = await prisma.question.findUnique({ where: { id: req.params.id } });
    if (!question) return res.status(404).json({ error: 'ไม่พบโจทย์' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: 'ดึงโจทย์ไม่สำเร็จ' });
  }
});

// ✅ แก้ไขโจทย์
router.put('/:id', async (req, res) => {
  try {
    const { questionText, answer, attributesJson, code, needsReview } = req.body;
    const attributes = attributesJson ? JSON.parse(attributesJson) : undefined;

    const data = {};
    if (questionText !== undefined) { data.textTh = questionText; data.textEn = questionText; }
    if (answer !== undefined) data.answer = answer || null;
    if (attributes !== undefined) {
      data.attributes = attributes;
      data.difficulty = String(attributes.difficulty ?? 1);
    }
    if (code !== undefined) data.code = code || null;
    if (needsReview !== undefined) data.needsReview = needsReview === 'true' || needsReview === true;

    const question = await prisma.question.update({ where: { id: req.params.id }, data });
    res.json({ success: true, question });
  } catch (err) {
    console.error('❌ แก้ไขโจทย์ล้มเหลว:', err);
    res.status(500).json({ error: 'แก้ไขโจทย์ไม่สำเร็จ' });
  }
});

module.exports = router;
