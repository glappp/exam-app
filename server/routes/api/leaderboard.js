const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function requireLogin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  next();
}

// weekKey = วันอาทิตย์ต้นสัปดาห์ (YYYY-MM-DD) ตาม ICT
function getWeekKey(date = new Date()) {
  const ict = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const day = ict.getUTCDay(); // 0=อาทิตย์
  ict.setUTCDate(ict.getUTCDate() - day);
  return ict.toISOString().slice(0, 10);
}

// ── GET /api/leaderboard/overview ────────────────────────────────────────────
// ดึง ranking รายสัปดาห์และรายเดือนของทั้ง 2 กิจกรรม
router.get('/overview', requireLogin, async (req, res) => {
  try {
    const weekKey = req.query.week || getWeekKey();
    const userId = req.session.userId;

    const [ttWeekly, sqWeekly, myTT, mySQ] = await Promise.all([
      // Time Trial — best score per user this week
      prisma.timeTrialScore.findMany({
        where: { weekKey },
        include: { user: { select: { id: true, firstName: true, username: true } } },
        orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
      }),
      // Saturday Quiz — one attempt per user per week
      prisma.saturdayQuizAttempt.findMany({
        where: { weekKey },
        include: { user: { select: { id: true, firstName: true, username: true } } },
        orderBy: [{ score: 'desc' }, { timeUsed: 'asc' }],
      }),
      // My best Time Trial this week
      prisma.timeTrialScore.findFirst({
        where: { userId, weekKey },
        orderBy: { score: 'desc' },
      }),
      // My Saturday Quiz this week
      prisma.saturdayQuizAttempt.findUnique({
        where: { userId_weekKey: { userId, weekKey } },
      }),
    ]);

    // Time Trial: keep best score per user
    const ttSeen = new Set();
    const ttRanked = [];
    for (const s of ttWeekly) {
      if (!ttSeen.has(s.userId)) {
        ttSeen.add(s.userId);
        ttRanked.push(s);
      }
    }

    const formatTT = (list) => list.slice(0, 20).map((s, i) => ({
      rank: i + 1,
      userId: s.userId,
      name: s.user.firstName || s.user.username,
      score: s.score,
      correctCount: s.correctCount,
    }));

    const formatSQ = (list) => list.slice(0, 20).map((s, i) => ({
      rank: i + 1,
      userId: s.userId,
      name: s.user.firstName || s.user.username,
      score: s.score,
      timeUsed: s.timeUsed,
    }));

    // My rank in Time Trial
    let myTTRank = null;
    if (myTT) {
      myTTRank = ttRanked.findIndex(s => s.userId === userId) + 1 || null;
    }

    // My rank in Saturday Quiz
    let mySQRank = null;
    if (mySQ) {
      mySQRank = sqWeekly.findIndex(s => s.userId === userId) + 1 || null;
    }

    // Monthly hall of fame (top 10 per activity for current period)
    const hallOfFame = await prisma.hallOfFame.findMany({
      orderBy: [{ rank: 'asc' }],
      take: 40,
      include: { userId: false },
    });

    // ดึงชื่อสำหรับ HoF
    const hofUserIds = [...new Set(hallOfFame.map(h => h.userId))];
    const hofUsers = await prisma.user.findMany({
      where: { id: { in: hofUserIds } },
      select: { id: true, firstName: true, username: true },
    });
    const hofUserMap = Object.fromEntries(hofUsers.map(u => [u.id, u]));

    const hofFormatted = hallOfFame.map(h => ({
      rank: h.rank,
      userId: h.userId,
      name: hofUserMap[h.userId]?.firstName || hofUserMap[h.userId]?.username || `ผู้ใช้ ${h.userId}`,
      activity: h.activity,
      totalScore: h.totalScore,
      totalTime: h.totalTime,
      periodId: h.periodId,
    }));

    res.json({
      weekKey,
      weekly: {
        timeTrial: {
          rankings: formatTT(ttRanked),
          total: ttSeen.size,
          myBest: myTT ? { score: myTT.score, rank: myTTRank } : null,
        },
        saturdayQuiz: {
          rankings: formatSQ(sqWeekly),
          total: sqWeekly.length,
          myAttempt: mySQ ? { score: mySQ.score, timeUsed: mySQ.timeUsed, rank: mySQRank } : null,
        },
      },
      hallOfFame: {
        timeTrial: hofFormatted.filter(h => h.activity === 'time_trial').slice(0, 10),
        saturdayQuiz: hofFormatted.filter(h => h.activity === 'saturday_quiz').slice(0, 10),
      },
    });
  } catch (err) {
    console.error('❌ leaderboard/overview:', err);
    res.status(500).json({ error: 'โหลด leaderboard ล้มเหลว' });
  }
});

// ── GET /api/leaderboard/hall-of-fame ────────────────────────────────────────
router.get('/hall-of-fame', requireLogin, async (req, res) => {
  try {
    const { activity, periodId } = req.query;
    const where = {};
    if (activity) where.activity = activity;
    if (periodId) where.periodId = parseInt(periodId);

    const records = await prisma.hallOfFame.findMany({
      where,
      orderBy: [{ periodId: 'desc' }, { rank: 'asc' }],
      take: 50,
    });

    const userIds = [...new Set(records.map(r => r.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, username: true },
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    const periods = await prisma.leaderboardPeriod.findMany({
      where: { id: { in: [...new Set(records.map(r => r.periodId))] } },
      select: { id: true, label: true, startDate: true, endDate: true },
    });
    const periodMap = Object.fromEntries(periods.map(p => [p.id, p]));

    const formatted = records.map(r => ({
      ...r,
      name: userMap[r.userId]?.firstName || userMap[r.userId]?.username || `ผู้ใช้ ${r.userId}`,
      period: periodMap[r.periodId] || null,
    }));

    res.json({ records: formatted });
  } catch (err) {
    console.error('❌ leaderboard/hall-of-fame:', err);
    res.status(500).json({ error: 'โหลด Hall of Fame ล้มเหลว' });
  }
});

// ── POST /api/leaderboard/settle-weekly (admin) ───────────────────────────────
// Body: { weekKey } — settle weekly, ต้องมีผู้เล่น ≥10
router.post('/settle-weekly', requireLogin, async (req, res) => {
  try {
    if (!['admin', 'school_admin'].includes(req.session.role)) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
    }
    const weekKey = req.body.weekKey || getWeekKey(new Date(Date.now() - 7 * 86400000));
    const MIN_PLAYERS = 10;
    const result = {};

    // Time Trial
    const ttScores = await prisma.timeTrialScore.findMany({ where: { weekKey }, orderBy: [{ score: 'desc' }, { createdAt: 'asc' }] });
    const ttSeen = new Set();
    const ttRanked = [];
    for (const s of ttScores) {
      if (!ttSeen.has(s.userId)) { ttSeen.add(s.userId); ttRanked.push(s); }
    }
    result.timeTrial = ttRanked.length >= MIN_PLAYERS
      ? { settled: true, players: ttRanked.length, top3: ttRanked.slice(0, 3).map(s => ({ userId: s.userId, score: s.score })) }
      : { settled: false, players: ttRanked.length, reason: `ต้องการ ${MIN_PLAYERS} คน` };

    // Saturday Quiz
    const sqAttempts = await prisma.saturdayQuizAttempt.findMany({ where: { weekKey }, orderBy: [{ score: 'desc' }, { timeUsed: 'asc' }] });
    result.saturdayQuiz = sqAttempts.length >= MIN_PLAYERS
      ? { settled: true, players: sqAttempts.length, top3: sqAttempts.slice(0, 3).map(s => ({ userId: s.userId, score: s.score, timeUsed: s.timeUsed })) }
      : { settled: false, players: sqAttempts.length, reason: `ต้องการ ${MIN_PLAYERS} คน` };

    res.json({ ok: true, weekKey, result });
  } catch (err) {
    console.error('❌ leaderboard/settle-weekly:', err);
    res.status(500).json({ error: 'settle-weekly ล้มเหลว' });
  }
});

// ── POST /api/leaderboard/settle-monthly (admin) ─────────────────────────────
// Body: { periodId } — รวมคะแนนตาม period แล้วบันทึก HallOfFame
router.post('/settle-monthly', requireLogin, async (req, res) => {
  try {
    if (!['admin', 'school_admin'].includes(req.session.role)) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
    }
    const { periodId } = req.body;
    if (!periodId) return res.status(400).json({ error: 'ต้องระบุ periodId' });

    const period = await prisma.leaderboardPeriod.findUnique({ where: { id: periodId } });
    if (!period || period.type !== 'monthly') return res.status(404).json({ error: 'ไม่พบ period' });

    // ดึง weekly periods ที่อยู่ใน range ของ monthly period
    const weeklyPeriods = await prisma.leaderboardPeriod.findMany({
      where: {
        type: 'weekly',
        seasonId: period.seasonId,
        startDate: { gte: period.startDate },
        endDate: { lte: period.endDate },
      },
      select: { weekKey: true },
    });
    const weekKeys = weeklyPeriods.map(p => p.weekKey).filter(Boolean);

    if (weekKeys.length === 0) return res.status(400).json({ error: 'ไม่มี weekKey ใน period นี้' });

    // รวมคะแนน Time Trial (best per week per user)
    const ttScores = await prisma.timeTrialScore.findMany({ where: { weekKey: { in: weekKeys } }, orderBy: [{ score: 'desc' }] });
    const ttUserWeek = new Map();
    for (const s of ttScores) {
      const key = `${s.userId}:${s.weekKey}`;
      if (!ttUserWeek.has(key)) ttUserWeek.set(key, s.score);
    }
    const ttTotals = new Map();
    for (const [key, score] of ttUserWeek) {
      const userId = parseInt(key.split(':')[0]);
      ttTotals.set(userId, (ttTotals.get(userId) || 0) + score);
    }

    // รวมคะแนน Saturday Quiz
    const sqAttempts = await prisma.saturdayQuizAttempt.findMany({ where: { weekKey: { in: weekKeys } } });
    const sqTotals = new Map();
    const sqTimeTotals = new Map();
    for (const a of sqAttempts) {
      sqTotals.set(a.userId, (sqTotals.get(a.userId) || 0) + a.score);
      sqTimeTotals.set(a.userId, (sqTimeTotals.get(a.userId) || 0) + a.timeUsed);
    }

    const hofEntries = [];

    // Time Trial HoF
    const ttSorted = [...ttTotals.entries()].sort((a, b) => b[1] - a[1]);
    for (let i = 0; i < ttSorted.length; i++) {
      const [userId, totalScore] = ttSorted[i];
      hofEntries.push({ userId, periodId, activity: 'time_trial', totalScore, rank: i + 1 });
    }

    // Saturday Quiz HoF (tiebreak: totalTime น้อยกว่า)
    const sqSorted = [...sqTotals.entries()].sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return (sqTimeTotals.get(a[0]) || 0) - (sqTimeTotals.get(b[0]) || 0);
    });
    for (let i = 0; i < sqSorted.length; i++) {
      const [userId, totalScore] = sqSorted[i];
      hofEntries.push({ userId, periodId, activity: 'saturday_quiz', totalScore, totalTime: sqTimeTotals.get(userId) || null, rank: i + 1 });
    }

    // upsert ลง HallOfFame
    for (const entry of hofEntries) {
      await prisma.hallOfFame.upsert({
        where: { userId_periodId_activity: { userId: entry.userId, periodId: entry.periodId, activity: entry.activity } },
        create: entry,
        update: { totalScore: entry.totalScore, totalTime: entry.totalTime, rank: entry.rank },
      });
    }

    await prisma.leaderboardPeriod.update({ where: { id: periodId }, data: { settled: true } });

    res.json({ ok: true, periodId, ttSettled: ttSorted.length, sqSettled: sqSorted.length });
  } catch (err) {
    console.error('❌ leaderboard/settle-monthly:', err);
    res.status(500).json({ error: 'settle-monthly ล้มเหลว' });
  }
});

// ── POST /api/leaderboard/seed-season (admin) ────────────────────────────────
// Body: { name, startDate, endDate, monthlyPeriods: [{label, startDate, endDate}] }
router.post('/seed-season', requireLogin, async (req, res) => {
  try {
    if (!['admin', 'school_admin'].includes(req.session.role)) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
    }
    const { name, startDate, endDate, monthlyPeriods = [] } = req.body;

    const season = await prisma.leaderboardSeason.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'active',
      },
    });

    // สร้าง weekly periods อัตโนมัติ (อาทิตย์–เสาร์) ระหว่าง startDate–endDate
    const periods = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    let cur = new Date(start);
    let weekNum = 1;

    while (cur <= end) {
      const weekStart = new Date(cur);
      const weekEnd = new Date(cur);
      weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
      const wk = cur.toISOString().slice(0, 10);
      periods.push({
        seasonId: season.id,
        type: 'weekly',
        weekKey: wk,
        label: `สัปดาห์ที่ ${weekNum}`,
        startDate: weekStart,
        endDate: weekEnd,
      });
      cur.setUTCDate(cur.getUTCDate() + 7);
      weekNum++;
    }

    // สร้าง monthly periods จากที่ส่งมา
    for (let i = 0; i < monthlyPeriods.length; i++) {
      const mp = monthlyPeriods[i];
      periods.push({
        seasonId: season.id,
        type: 'monthly',
        monthKey: `${season.id}-M${i + 1}`,
        label: mp.label,
        startDate: new Date(mp.startDate),
        endDate: new Date(mp.endDate),
      });
    }

    await prisma.leaderboardPeriod.createMany({ data: periods });

    res.json({ ok: true, seasonId: season.id, periodsCreated: periods.length });
  } catch (err) {
    console.error('❌ leaderboard/seed-season:', err);
    res.status(500).json({ error: 'seed-season ล้มเหลว' });
  }
});

module.exports = router;
