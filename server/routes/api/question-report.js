const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/questions/:id/report
router.post('/:id/report', async (req, res) => {
  try {
    const { id } = req.params;
    const { reportType, note } = req.body;

    if (!reportType) return res.status(400).json({ error: 'reportType required' });

    const question = await prisma.question.findUnique({ where: { id }, select: { id: true } });
    if (!question) return res.status(404).json({ error: 'ไม่พบโจทย์' });

    // หา studentProfileId ถ้า login อยู่
    let studentProfileId = null;
    if (req.session?.userId) {
      const profile = await prisma.studentProfile.findFirst({
        where: { userId: req.session.userId },
        select: { id: true },
        orderBy: { id: 'desc' },
      });
      studentProfileId = profile?.id ?? null;
    }

    await prisma.questionReport.create({
      data: { questionId: id, reportType, note: note || null, studentProfileId },
    });

    res.json({ ok: true });
  } catch (e) {
    console.error('report error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
