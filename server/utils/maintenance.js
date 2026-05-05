/**
 * maintenance.js — งาน 04:00 ICT ทุกคืน (21:00 UTC)
 *
 * 1. [วันอาทิตย์เท่านั้น] Settle weekly leaderboard → HallOfFame
 * 2. Aggregate LoginLog → DailyUsageStat (school-level + classroom-level)
 * 3. Aggregate ExamAnswer → questionsAnswered ใน DailyUsageStat
 * 4. ลบ LoginLog ที่ process แล้ว
 * 5. ลบ ExamAnswer ที่ process แล้ว
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// แปลง Date → "YYYY-MM-DD" (ICT = UTC+7)
function toICTDateStr(d) {
  const ict = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return ict.toISOString().slice(0, 10);
}

// วันก่อนหน้า (ICT)
function yesterdayICT() {
  const now = new Date();
  const ictNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  ictNow.setUTCDate(ictNow.getUTCDate() - 1);
  return ictNow.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// แปลง "YYYY-MM-DD" (ICT) → UTC range สำหรับ query
function ictDateToUTCRange(dateStr) {
  // dateStr = "2026-05-04" → ช่วงนั้นใน ICT = UTC 17:00 วันก่อน ถึง UTC 17:00 วันนั้น
  const [y, m, d] = dateStr.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, d - 1, 17, 0, 0)); // 00:00 ICT
  const end   = new Date(Date.UTC(y, m - 1, d, 17, 0, 0));     // 24:00 ICT
  return { start, end };
}

// ── Settle Weekly (เฉพาะวันอาทิตย์ 04:00 ICT) ──────────────────────────────
// weekKey ของสัปดาห์ที่เพิ่งจบ = อาทิตย์ก่อน 7 วัน
function prevWeekKey() {
  const now = new Date();
  const ict = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  // ต้นสัปดาห์ปัจจุบัน (อาทิตย์นี้)
  const day = ict.getUTCDay();
  ict.setUTCDate(ict.getUTCDate() - day);       // อาทิตย์นี้
  ict.setUTCDate(ict.getUTCDate() - 7);          // ถอยไป 7 วัน = อาทิตย์ที่แล้ว
  return ict.toISOString().slice(0, 10);
}

async function settleWeekly() {
  const weekKey = prevWeekKey();
  console.log(`📊 Settling weekly leaderboard: ${weekKey}`);

  // หา LeaderboardPeriod ที่ตรงกับ weekKey นี้
  const period = await prisma.leaderboardPeriod.findFirst({
    where: { type: 'weekly', weekKey },
  });

  if (!period) {
    console.log(`   ⚠️ ไม่พบ LeaderboardPeriod สำหรับ ${weekKey} — ข้าม`);
    return;
  }

  if (period.settled) {
    console.log(`   ℹ️ ${weekKey} settled แล้ว — ข้าม`);
    return;
  }

  // ── Time Trial ──────────────────────────────────────────────────────────
  const ttScores = await prisma.timeTrialScore.findMany({
    where: { weekKey },
    orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
  });
  // best score per user
  const ttSeen = new Set();
  const ttRanked = [];
  for (const s of ttScores) {
    if (!ttSeen.has(s.userId)) { ttSeen.add(s.userId); ttRanked.push(s); }
  }

  // ── Saturday Quiz ────────────────────────────────────────────────────────
  const sqAttempts = await prisma.saturdayQuizAttempt.findMany({
    where: { weekKey },
    orderBy: [{ score: 'desc' }, { timeUsed: 'asc' }],
  });

  // เขียน HallOfFame (upsert เผื่อ run ซ้ำ)
  let hofCount = 0;
  for (const [idx, s] of ttRanked.entries()) {
    await prisma.hallOfFame.upsert({
      where: { userId_periodId_activity: { userId: s.userId, periodId: period.id, activity: 'time_trial' } },
      create: { userId: s.userId, periodId: period.id, activity: 'time_trial', totalScore: s.score, totalTime: s.createdAt?.getTime?.() ?? 0, rank: idx + 1 },
      update: { totalScore: s.score, rank: idx + 1 },
    });
    hofCount++;
  }
  for (const [idx, a] of sqAttempts.entries()) {
    await prisma.hallOfFame.upsert({
      where: { userId_periodId_activity: { userId: a.userId, periodId: period.id, activity: 'saturday_quiz' } },
      create: { userId: a.userId, periodId: period.id, activity: 'saturday_quiz', totalScore: a.score, totalTime: a.timeUsed, rank: idx + 1 },
      update: { totalScore: a.score, totalTime: a.timeUsed, rank: idx + 1 },
    });
    hofCount++;
  }

  // mark settled
  await prisma.leaderboardPeriod.update({ where: { id: period.id }, data: { settled: true } });

  console.log(`✅ Settled ${weekKey}: TT=${ttRanked.length}, SQ=${sqAttempts.length}, HoF=${hofCount} records`);
}

// ── Settle Monthly (ถ้า monthly period เพิ่งจบเมื่อวาน = เสาร์สุดท้ายของรอบ) ──
async function settleMonthlyIfDue() {
  const yesterday = yesterdayICT(); // เสาร์ที่เพิ่งผ่านไป

  // หา monthly period ที่ endDate ตรงกับเมื่อวาน และยังไม่ settled
  const period = await prisma.leaderboardPeriod.findFirst({
    where: {
      type: 'monthly',
      settled: false,
      endDate: {
        gte: new Date(yesterday + 'T00:00:00Z'),
        lt:  new Date(yesterday + 'T23:59:59Z'),
      },
    },
  });

  if (!period) return; // ไม่มี monthly period จบวันนี้

  console.log(`📊 Settling monthly period: ${period.label} (id=${period.id})`);

  // ดึง weekly periods ใน range
  const weeklyPeriods = await prisma.leaderboardPeriod.findMany({
    where: {
      type: 'weekly',
      seasonId: period.seasonId,
      startDate: { gte: period.startDate },
      endDate:   { lte: period.endDate },
    },
    select: { weekKey: true },
  });
  const weekKeys = weeklyPeriods.map(p => p.weekKey).filter(Boolean);
  if (!weekKeys.length) { console.log('   ⚠️ ไม่มี weekKey — ข้าม'); return; }

  // รวมคะแนน Time Trial
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

  // รวมคะแนน Saturday Quiz (จาก HallOfFame weekly ที่ settle แล้ว)
  const weeklyHoF = await prisma.hallOfFame.findMany({
    where: { periodId: { in: (await prisma.leaderboardPeriod.findMany({ where: { type: 'weekly', weekKey: { in: weekKeys } }, select: { id: true } })).map(p => p.id) }, activity: 'saturday_quiz' },
  });
  const sqTotals = new Map();
  const sqTimeTotals = new Map();
  for (const h of weeklyHoF) {
    sqTotals.set(h.userId, (sqTotals.get(h.userId) || 0) + h.totalScore);
    sqTimeTotals.set(h.userId, (sqTimeTotals.get(h.userId) || 0) + (h.totalTime || 0));
  }

  const hofEntries = [];

  // Time Trial
  const ttSorted = [...ttTotals.entries()].sort((a, b) => b[1] - a[1]);
  for (let i = 0; i < ttSorted.length; i++) {
    const [userId, totalScore] = ttSorted[i];
    hofEntries.push({ userId, periodId: period.id, activity: 'time_trial', totalScore, rank: i + 1 });
  }

  // Saturday Quiz (tiebreak: totalTime น้อยกว่า)
  const sqSorted = [...sqTotals.entries()].sort((a, b) => b[1] !== a[1] ? b[1] - a[1] : (sqTimeTotals.get(a[0]) || 0) - (sqTimeTotals.get(b[0]) || 0));
  for (let i = 0; i < sqSorted.length; i++) {
    const [userId, totalScore] = sqSorted[i];
    hofEntries.push({ userId, periodId: period.id, activity: 'saturday_quiz', totalScore, totalTime: sqTimeTotals.get(userId) || null, rank: i + 1 });
  }

  for (const entry of hofEntries) {
    await prisma.hallOfFame.upsert({
      where: { userId_periodId_activity: { userId: entry.userId, periodId: entry.periodId, activity: entry.activity } },
      create: entry,
      update: { totalScore: entry.totalScore, totalTime: entry.totalTime ?? null, rank: entry.rank },
    });
  }

  await prisma.leaderboardPeriod.update({ where: { id: period.id }, data: { settled: true } });
  console.log(`✅ Monthly settled: ${period.label} — TT=${ttSorted.length}, SQ=${sqSorted.length}`);
}

// ── Close Season + Reset Boxes (ถ้า active season สิ้นสุดเมื่อวาน) ───────────
async function closeSeasonIfDue() {
  const yesterday = yesterdayICT();

  const season = await prisma.leaderboardSeason.findFirst({
    where: {
      status: 'active',
      endDate: {
        gte: new Date(yesterday + 'T00:00:00Z'),
        lt:  new Date(yesterday + 'T23:59:59Z'),
      },
    },
  });

  if (!season) return;

  console.log(`🗓️  Season หมดอายุ: ${season.name} — ปิด season และ reset กล่องรางวัล`);

  // Reset BoxInventory ของทุก user
  const resetResult = await prisma.boxInventory.updateMany({
    data: { silverCount: 0, goldCount: 0 },
  });

  // Mark season as closed
  await prisma.leaderboardSeason.update({
    where: { id: season.id },
    data:  { status: 'closed' },
  });

  console.log(`✅ Season "${season.name}" ปิดแล้ว — reset BoxInventory ${resetResult.count} users`);
}

async function runMaintenance() {
  const date = yesterdayICT();
  const { start, end } = ictDateToUTCRange(date);

  // ── Settle weekly + monthly (เฉพาะวันอาทิตย์ ICT) ──────────────────────
  const ict = new Date(Date.now() + 7 * 60 * 60 * 1000);
  if (ict.getUTCDay() === 0) {   // 0 = อาทิตย์
    await settleWeekly().catch(e => console.error('❌ settleWeekly error:', e));
    await settleMonthlyIfDue().catch(e => console.error('❌ settleMonthly error:', e));
    await closeSeasonIfDue().catch(e => console.error('❌ closeSeasonIfDue error:', e));
  }
  console.log(`🔧 Maintenance: aggregating ${date} (UTC ${start.toISOString()} – ${end.toISOString()})`);

  try {
    // ── 1. Aggregate LoginLog ─────────────────────────────────────────────────
    const loginLogs = await prisma.loginLog.findMany({
      where: { loginAt: { gte: start, lt: end } },
      select: { userId: true, schoolId: true }
    });

    if (loginLogs.length > 0) {
      // ดึง StudentProfile เพื่อรู้ grade + classroom ของแต่ละ userId
      const userIds = [...new Set(loginLogs.map(l => l.userId))];
      const profiles = await prisma.studentProfile.findMany({
        where: { userId: { in: userIds }, status: 'active' },
        select: { userId: true, grade: true, classroom: true, school: true }
      });
      // ดึง schoolId จาก User ด้วย (ถ้า loginLog.schoolId null)
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, schoolId: true }
      });
      const userSchoolMap = Object.fromEntries(users.map(u => [u.id, u.schoolId]));
      const profileMap = Object.fromEntries(profiles.map(p => [p.userId, p]));

      // group: { schoolId, grade, classroom } → Set<userId>
      const groups = {};
      for (const log of loginLogs) {
        const profile = profileMap[log.userId];
        const schoolId = log.schoolId ?? userSchoolMap[log.userId] ?? null;
        const grade = profile?.grade ?? null;
        const classroom = profile?.classroom ?? null;

        // school-level key
        const schoolKey = `${schoolId}||`;
        if (!groups[schoolKey]) groups[schoolKey] = { schoolId, grade: null, classroom: null, users: new Set() };
        groups[schoolKey].users.add(log.userId);

        // classroom-level key (ถ้ามี grade + classroom)
        if (grade && classroom) {
          const classKey = `${schoolId}|${grade}|${classroom}`;
          if (!groups[classKey]) groups[classKey] = { schoolId, grade, classroom, users: new Set() };
          groups[classKey].users.add(log.userId);
        }
      }

      // upsert DailyUsageStat (login part)
      for (const { schoolId, grade, classroom, users } of Object.values(groups)) {
        await prisma.dailyUsageStat.upsert({
          where: {
            date_schoolId_grade_classroom: {
              date,
              schoolId: schoolId ?? null,
              grade: grade ?? null,
              classroom: classroom ?? null,
            }
          },
          create: { date, schoolId: schoolId ?? null, grade: grade ?? null, classroom: classroom ?? null, activeUsers: users.size },
          update: { activeUsers: users.size }
        });
      }
    }

    // ── 2. Aggregate ExamAnswer ───────────────────────────────────────────────
    const examAnswers = await prisma.examAnswer.findMany({
      where: { createdAt: { gte: start, lt: end } },
      select: {
        studentProfileId: true,
        studentProfile: { select: { grade: true, classroom: true, school: true, userId: true } }
      }
    });

    if (examAnswers.length > 0) {
      // group โดยใช้ studentProfile info
      const qGroups = {};
      for (const ea of examAnswers) {
        const sp = ea.studentProfile;
        if (!sp) continue;
        // หา schoolId จาก user
        const user = await prisma.user.findFirst({
          where: { id: sp.userId },
          select: { schoolId: true }
        });
        const schoolId = user?.schoolId ?? null;
        const grade = sp.grade ?? null;
        const classroom = sp.classroom ?? null;

        const schoolKey = `${schoolId}||`;
        if (!qGroups[schoolKey]) qGroups[schoolKey] = { schoolId, grade: null, classroom: null, count: 0 };
        qGroups[schoolKey].count++;

        if (grade && classroom) {
          const classKey = `${schoolId}|${grade}|${classroom}`;
          if (!qGroups[classKey]) qGroups[classKey] = { schoolId, grade, classroom, count: 0 };
          qGroups[classKey].count++;
        }
      }

      for (const { schoolId, grade, classroom, count } of Object.values(qGroups)) {
        await prisma.dailyUsageStat.upsert({
          where: {
            date_schoolId_grade_classroom: {
              date,
              schoolId: schoolId ?? null,
              grade: grade ?? null,
              classroom: classroom ?? null,
            }
          },
          create: { date, schoolId: schoolId ?? null, grade: grade ?? null, classroom: classroom ?? null, questionsAnswered: count },
          update: { questionsAnswered: { increment: count } }
        });
      }
    }

    // ── 3. ลบ LoginLog ที่ process แล้ว ──────────────────────────────────────
    const deletedLogin = await prisma.loginLog.deleteMany({
      where: { loginAt: { gte: start, lt: end } }
    });

    // ── 4. ลบ ExamAnswer ที่ process แล้ว ────────────────────────────────────
    const deletedExam = await prisma.examAnswer.deleteMany({
      where: { createdAt: { gte: start, lt: end } }
    });

    console.log(`✅ Maintenance done: ${date}`);
    console.log(`   LoginLog ลบ ${deletedLogin.count} rows`);
    console.log(`   ExamAnswer ลบ ${deletedExam.count} rows`);
  } catch (err) {
    console.error('❌ Maintenance error:', err);
  }
}

// ── Scheduler: รัน runMaintenance ทุกคืน 04:00 ICT ─────────────────────────
// ICT = UTC+7 → 04:00 ICT = 21:00 UTC (วันก่อนหน้า)
function scheduleMaintenance() {
  function msUntilNext21UTC() {
    const now = new Date();
    const next = new Date();
    next.setUTCHours(21, 0, 0, 0);
    if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
    return next - now;
  }

  function loop() {
    const delay = msUntilNext21UTC();
    const nextRun = new Date(Date.now() + delay);
    console.log(`⏰ Maintenance scheduled: ${nextRun.toISOString()} (${Math.round(delay/60000)} นาที) [04:00 ICT]`);
    setTimeout(async () => {
      await runMaintenance();
      loop(); // schedule ครั้งต่อไป
    }, delay);
  }

  loop();
}

module.exports = { scheduleMaintenance, runMaintenance };
