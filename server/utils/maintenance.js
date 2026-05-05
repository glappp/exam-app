/**
 * maintenance.js — งาน 22:00 ICT ทุกคืน
 *
 * 1. Aggregate LoginLog → DailyUsageStat (school-level + classroom-level)
 * 2. Aggregate ExamAnswer → questionsAnswered ใน DailyUsageStat
 * 3. ลบ LoginLog ที่ process แล้ว
 * 4. ลบ ExamAnswer ที่ process แล้ว
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

async function runMaintenance() {
  const date = yesterdayICT();
  const { start, end } = ictDateToUTCRange(date);
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
