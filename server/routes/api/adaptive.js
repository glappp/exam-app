const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function requireLogin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  next();
}

// GET /api/adaptive/next?exclude=id1,id2
// ดึงโจทย์ 1 ข้อแบบ weighted จาก subtopic ที่นักเรียนผ่านแล้ว
router.get('/next', requireLogin, async (req, res) => {
  try {
    const profile = await prisma.studentProfile.findFirst({
      where: { userId: req.session.userId },
      orderBy: { createdAt: 'desc' }
    });
    if (!profile) return res.status(404).json({ error: 'ไม่พบข้อมูลนักเรียน' });

    const MIN_PASSES = 5;

    // ดึง subtopic ที่ผ่านแล้ว
    const passes = await prisma.subtopicPass.findMany({
      where: { studentProfileId: profile.id }
    });

    if (passes.length < MIN_PASSES) {
      return res.status(403).json({
        error: `ต้องผ่านอย่างน้อย ${MIN_PASSES} subtopic ก่อนใช้โหมดนี้`,
        code: 'INSUFFICIENT_PASSES',
        passCount: passes.length,
        required: MIN_PASSES
      });
    }

    const passedSubtopics = new Set(passes.map(p => p.subtopicKey));

    // ตรวจว่าผ่านครบทุก subtopic ในหลักสูตรหรือยัง
    const sections = await prisma.curriculumSection.findMany({ select: { topicTags: true } });
    const allCurriculumSubtopics = new Set();
    for (const sec of sections) {
      const tags = Array.isArray(sec.topicTags) ? sec.topicTags : [];
      tags.filter(t => t.startsWith('subtopic:')).forEach(t => allCurriculumSubtopics.add(t));
    }
    const allSubtopicsPassed = passedSubtopics.size >= allCurriculumSubtopics.size;

    // ถ้ายังไม่ผ่านครบ ดึง source ของข้อสอบแข่งขัน (isOfficial=true) เพื่อ exclude
    let officialSources = new Set();
    if (!allSubtopicsPassed) {
      const officialSets = await prisma.examSetMetadata.findMany({
        where: { isOfficial: true },
        select: { questionSource: true }
      });
      officialSets.forEach(s => { if (s.questionSource) officialSources.add(s.questionSource); });
    }

    // ดึง AdaptiveWeakness ของนักเรียนนี้
    const weaknesses = await prisma.adaptiveWeakness.findMany({
      where: { studentProfileId: profile.id }
    });
    const weakMap = Object.fromEntries(weaknesses.map(w => [w.tagKey, w.failCount]));

    // ดึงคำถาม (exclude ที่เพิ่งทำ)
    const excludeIds = (req.query.exclude || '').split(',').filter(Boolean);

    const questions = await prisma.question.findMany({
      select: { id: true, attributes: true, source: true },
      where: excludeIds.length > 0 ? { id: { notIn: excludeIds } } : undefined
    });

    // กรอง:
    // 1. ต้องมีอย่างน้อย 1 subtopic ที่ผ่านแล้ว
    // 2. ถ้ายังไม่ผ่านครบหลักสูตร → ข้ามข้อสอบแข่งขัน (official)
    const candidates = questions.filter(q => {
      if (q.attributes?.parentQuestionId) return false;
      const subs = q.attributes?.subtopic || [];
      if (!subs.some(s => passedSubtopics.has(s))) return false;
      if (!allSubtopicsPassed && q.source) {
        for (const src of officialSources) {
          if (q.source.startsWith(src)) return false;
        }
      }
      return true;
    });

    if (candidates.length === 0) {
      return res.status(404).json({ error: 'ไม่พบโจทย์ที่เหมาะสม', code: 'NO_QUESTIONS' });
    }

    // คำนวณ weight = 1 + sum(failCount × 3) ของ tag ที่ตรงกับ weakness
    const weighted = candidates.map(q => {
      const allTags = [
        ...(q.attributes?.topic || []),
        ...(q.attributes?.subtopic || []),
        ...(q.attributes?.skill || []),
        ...(q.attributes?.trap || [])
      ];
      const bonus = allTags.reduce((sum, tag) => sum + (weakMap[tag] || 0) * 3, 0);
      return { id: q.id, weight: 1 + bonus };
    });

    // Weighted random
    const totalWeight = weighted.reduce((s, q) => s + q.weight, 0);
    let r = Math.random() * totalWeight;
    let picked = weighted[weighted.length - 1];
    for (const q of weighted) {
      r -= q.weight;
      if (r <= 0) { picked = q; break; }
    }

    // ดึงข้อมูลครบของโจทย์ที่เลือก
    const fullQuestion = await prisma.question.findUnique({ where: { id: picked.id } });

    // ส่ง top weakness กลับไปด้วยเพื่อแสดง banner
    const topWeaknesses = weaknesses
      .sort((a, b) => b.failCount - a.failCount)
      .slice(0, 5);

    res.json({ question: fullQuestion, weaknesses: topWeaknesses });
  } catch (err) {
    console.error('❌ adaptive/next:', err);
    res.status(500).json({ error: 'โหลดโจทย์ล้มเหลว' });
  }
});

// POST /api/adaptive/submit
// Body: { questionId, isCorrect, tags: { topic:[], subtopic:[], skill:[], trap:[] } }
router.post('/submit', requireLogin, async (req, res) => {
  try {
    const { questionId, isCorrect, tags = {} } = req.body;
    if (!questionId) return res.status(400).json({ error: 'ต้องระบุ questionId' });

    const profile = await prisma.studentProfile.findFirst({
      where: { userId: req.session.userId },
      orderBy: { createdAt: 'desc' }
    });
    if (!profile) return res.status(404).json({ error: 'ไม่พบข้อมูลนักเรียน' });

    const allTagEntries = [
      ...(tags.topic    || []).map(k => ({ tagType: 'topic',    tagKey: k })),
      ...(tags.subtopic || []).map(k => ({ tagType: 'subtopic', tagKey: k })),
      ...(tags.skill    || []).map(k => ({ tagType: 'skill',    tagKey: k })),
      ...(tags.trap     || []).map(k => ({ tagType: 'trap',     tagKey: k })),
    ];

    if (isCorrect) {
      // ตอบถูก: correctStreak++ ต่อทุก tag ที่มีใน weakness
      const keys = allTagEntries.map(t => t.tagKey);
      const existing = await prisma.adaptiveWeakness.findMany({
        where: { studentProfileId: profile.id, tagKey: { in: keys } }
      });

      for (const rec of existing) {
        const newStreak = rec.correctStreak + 1;
        if (newStreak >= 3 && rec.failCount <= 1) {
          // ลบ weakness ออก
          await prisma.adaptiveWeakness.delete({ where: { id: rec.id } });
        } else if (newStreak >= 3) {
          await prisma.adaptiveWeakness.update({
            where: { id: rec.id },
            data: { failCount: rec.failCount - 1, correctStreak: 0 }
          });
        } else {
          await prisma.adaptiveWeakness.update({
            where: { id: rec.id },
            data: { correctStreak: newStreak }
          });
        }
      }
    } else {
      // ตอบผิด: upsert ทุก tag — failCount++, correctStreak=0
      const now = new Date();
      for (const { tagType, tagKey } of allTagEntries) {
        await prisma.adaptiveWeakness.upsert({
          where: { studentProfileId_tagKey: { studentProfileId: profile.id, tagKey } },
          create: { studentProfileId: profile.id, tagType, tagKey, failCount: 1, correctStreak: 0, lastFailedAt: now },
          update: { failCount: { increment: 1 }, correctStreak: 0, lastFailedAt: now }
        });
      }
    }

    // บันทึก ExamAnswer
    const q = await prisma.question.findUnique({ where: { id: questionId } });
    if (q) {
      await prisma.examAnswer.create({
        data: {
          studentProfileId: profile.id,
          questionId,
          selectedAnswer: req.body.selectedAnswer || '',
          isCorrect: !!isCorrect
        }
      });
    }

    // ดึง weakness ล่าสุดส่งกลับ
    const weaknesses = await prisma.adaptiveWeakness.findMany({
      where: { studentProfileId: profile.id },
      orderBy: { failCount: 'desc' },
      take: 5
    });

    res.json({ ok: true, weaknesses });
  } catch (err) {
    console.error('❌ adaptive/submit:', err);
    res.status(500).json({ error: 'บันทึกคำตอบล้มเหลว' });
  }
});

// GET /api/adaptive/weaknesses — ดูรายการจุดอ่อนของนักเรียน
router.get('/weaknesses', requireLogin, async (req, res) => {
  try {
    const profile = await prisma.studentProfile.findFirst({
      where: { userId: req.session.userId },
      orderBy: { createdAt: 'desc' }
    });
    if (!profile) return res.json({ weaknesses: [] });

    const weaknesses = await prisma.adaptiveWeakness.findMany({
      where: { studentProfileId: profile.id },
      orderBy: { failCount: 'desc' }
    });
    res.json({ weaknesses });
  } catch (err) {
    console.error('❌ adaptive/weaknesses:', err);
    res.status(500).json({ error: 'โหลดข้อมูลล้มเหลว' });
  }
});

module.exports = router;
