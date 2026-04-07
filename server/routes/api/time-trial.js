// 📁 server/routes/api/time-trial.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { getTodayICT } = require('../../utils/dateICT');
const prisma = new PrismaClient();

const TICKET_DAILY_CAP = 5;

async function deductTicket(userId) {
  const today = getTodayICT();
  const [wallet, daily] = await Promise.all([
    prisma.ticketWallet.findUnique({ where: { userId } }),
    prisma.ticketDailyUsage.findUnique({ where: { userId_date: { userId, date: today } } })
  ]);
  const balance = wallet?.balance ?? 0;
  const usedToday = daily?.usedCount ?? 0;
  if (balance < 1) throw new Error('ตั๋วไม่พอ');
  if (usedToday >= TICKET_DAILY_CAP) throw new Error(`ใช้ตั๋วครบ ${TICKET_DAILY_CAP} ใบแล้วในวันนี้`);
  await Promise.all([
    prisma.ticketWallet.update({ where: { userId }, data: { balance: { decrement: 1 } } }),
    prisma.ticketDailyUsage.upsert({
      where: { userId_date: { userId, date: today } },
      update: { usedCount: { increment: 1 } },
      create: { userId, date: today, usedCount: 1 }
    }),
    prisma.ticketLog.create({
      data: { userId, type: 'use_competitive', amount: -1, note: `time-trial ${today}` }
    })
  ]);
}

// ─── Week helpers ─────────────────────────────────────────────────

function getWeekKey(date = new Date()) {
  // ISO week: Mon=start, Sun=end
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day); // nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getWeekRange(weekKey) {
  const [yearStr, wStr] = weekKey.split('-W');
  const year = parseInt(yearStr);
  const week = parseInt(wStr);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const mon = new Date(jan4);
  mon.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (week - 1) * 7);
  const sun = new Date(mon);
  sun.setUTCDate(mon.getUTCDate() + 6);
  return { start: mon, end: sun };
}

// ─── POST /api/time-trial/score ───────────────────────────────────
router.post('/score', async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });

  const { score, correctCount, wrongCount, maxCombo, useTicket } = req.body;
  if (typeof score !== 'number' || typeof correctCount !== 'number') {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
  }

  // ต้องใช้ตั๋วจึงจะบันทึกลง leaderboard
  if (!useTicket) {
    return res.json({ saved: false, rank: null });
  }

  try {
    await deductTicket(req.session.userId);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const weekKey = getWeekKey();

  await prisma.timeTrialScore.create({
    data: {
      userId: req.session.userId,
      weekKey,
      score,
      correctCount,
      wrongCount: wrongCount || 0,
      maxCombo: maxCombo || 0,
    },
  });

  // rank in current week
  const weekScores = await prisma.timeTrialScore.groupBy({
    by: ['userId'],
    where: { weekKey },
    _max: { score: true },
  });
  const betterCount = weekScores.filter(r => r._max.score > score).length;

  res.json({ saved: true, rank: betterCount + 1, weekKey });
});

// ─── GET /api/time-trial/leaderboard?week=current ─────────────────
router.get('/leaderboard', async (req, res) => {
  const currentWeek = getWeekKey();
  const week = (!req.query.week || req.query.week === 'current') ? currentWeek : req.query.week;
  const isCurrent = week === currentWeek;

  // best score per user for this week
  const allScores = await prisma.timeTrialScore.findMany({
    where: { weekKey: week },
    include: { user: { select: { username: true, firstName: true, lastName: true } } },
    orderBy: { score: 'desc' },
  });

  const seen = new Set();
  const top20 = [];
  for (const s of allScores) {
    if (!seen.has(s.userId)) {
      seen.add(s.userId);
      top20.push(s);
      if (top20.length >= 20) break;
    }
  }

  const ranked = top20.map((s, i) => ({
    rank: i + 1,
    userId: s.userId,
    displayName: s.user.firstName || s.user.username,
    score: s.score,
    correctCount: s.correctCount,
    wrongCount: s.wrongCount,
    maxCombo: s.maxCombo,
    createdAt: s.createdAt,
  }));

  // my best this week
  let myBest = null;
  if (req.session?.userId) {
    const me = await prisma.timeTrialScore.findFirst({
      where: { userId: req.session.userId, weekKey: week },
      orderBy: { score: 'desc' },
    });
    if (me) {
      const betterCount = top20.filter(p => p.score > me.score && p.userId !== me.userId).length;
      myBest = {
        userId: me.userId,
        score: me.score,
        correctCount: me.correctCount,
        wrongCount: me.wrongCount,
        maxCombo: me.maxCombo,
        rank: betterCount + 1,
      };
    }
  }

  const { start, end } = getWeekRange(week);
  res.json({ week, isCurrent, start, end, top20: ranked, myBest });
});

// ─── GET /api/time-trial/weeks ────────────────────────────────────
router.get('/weeks', async (req, res) => {
  const rows = await prisma.timeTrialScore.groupBy({
    by: ['weekKey'],
    orderBy: { weekKey: 'desc' },
  });

  const currentWeek = getWeekKey();
  const weeks = rows.map(r => {
    const { start, end } = getWeekRange(r.weekKey);
    return {
      weekKey: r.weekKey,
      isCurrent: r.weekKey === currentWeek,
      start,
      end,
    };
  });

  // Always include current week even if no scores yet
  if (!weeks.find(w => w.isCurrent)) {
    const { start, end } = getWeekRange(currentWeek);
    weeks.unshift({ weekKey: currentWeek, isCurrent: true, start, end });
  }

  res.json({ weeks });
});

module.exports = router;
