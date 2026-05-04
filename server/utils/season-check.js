/**
 * season-check.js — auto-create LeaderboardSeason ถ้ายังไม่มี
 *
 * Logic ปีการศึกษาไทย:
 *   - ปิดเทอม: 1 มี.ค – 15 พ.ค
 *   - เริ่ม season: อาทิตย์แรก ≥ 16 พ.ค
 *   - จบ season: เสาร์สุดท้ายก่อน 1 มี.ค ของปีถัดไป
 *   - Monthly periods: ทุก 4 สัปดาห์ (28 วัน)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// วันอาทิตย์แรกที่ >= targetDate
function firstSundayOnOrAfter(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0=อาทิตย์
  if (day !== 0) d.setUTCDate(d.getUTCDate() + (7 - day));
  return d;
}

// เสาร์สุดท้ายก่อน targetDate
function lastSaturdayBefore(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - 1); // วันก่อน targetDate
  const day = d.getUTCDay(); // 0=อาทิตย์
  const daysToSat = (day + 1) % 7; // ถอยกลับไปหาเสาร์
  d.setUTCDate(d.getUTCDate() - daysToSat);
  return d;
}

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

// สร้าง season ใหม่อัตโนมัติสำหรับปีการศึกษาที่กำหนด
async function createSeasonForYear(startYear) {
  // เริ่ม: อาทิตย์แรก >= 16 พ.ค ของ startYear (Gregorian)
  const mayStart = new Date(Date.UTC(startYear, 4, 16)); // พ.ค = เดือน 4 (0-indexed)
  const seasonStart = firstSundayOnOrAfter(mayStart);

  // จบ: เสาร์สุดท้ายก่อน 1 มี.ค ของปีถัดไป
  const marEnd = new Date(Date.UTC(startYear + 1, 2, 1)); // มี.ค = เดือน 2
  const seasonEnd = lastSaturdayBefore(marEnd);

  const thaiYear = startYear + 543;
  const season = await prisma.leaderboardSeason.create({
    data: {
      name: `Season ปีการศึกษา ${thaiYear}`,
      startDate: seasonStart,
      endDate: seasonEnd,
      status: 'active',
    },
  });

  // สร้าง weekly periods
  const periods = [];
  let cur = new Date(seasonStart);
  let weekNum = 1;

  while (cur <= seasonEnd) {
    const weekStart = new Date(cur);
    const weekEnd = new Date(cur);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
    periods.push({
      seasonId: season.id,
      type: 'weekly',
      weekKey: toDateStr(weekStart),
      label: `สัปดาห์ที่ ${weekNum}`,
      startDate: weekStart,
      endDate: weekEnd,
    });
    cur.setUTCDate(cur.getUTCDate() + 7);
    weekNum++;
  }

  // สร้าง monthly periods ทุก 4 สัปดาห์
  const weeklyPeriods = periods.filter(p => p.type === 'weekly');
  let monthNum = 1;
  for (let i = 0; i < weeklyPeriods.length; i += 4) {
    const chunk = weeklyPeriods.slice(i, i + 4);
    if (chunk.length === 0) break;
    const mStart = chunk[0].startDate;
    const mEnd = chunk[chunk.length - 1].endDate;
    const startLabel = mStart.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    const endLabel = mEnd.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    periods.push({
      seasonId: season.id,
      type: 'monthly',
      monthKey: `${season.id}-M${monthNum}`,
      label: `เดือนที่ ${monthNum} (${startLabel}–${endLabel})`,
      startDate: mStart,
      endDate: mEnd,
    });
    monthNum++;
  }

  await prisma.leaderboardPeriod.createMany({ data: periods });

  console.log(`✅ สร้าง Season "${season.name}" — ${weeklyPeriods.length} สัปดาห์, ${monthNum - 1} เดือน`);
  console.log(`   เริ่ม: ${toDateStr(seasonStart)}  จบ: ${toDateStr(seasonEnd)}`);
  return season;
}

// ตรวจและสร้าง season ถ้าจำเป็น (เรียกตอน server start)
async function ensureActiveSeason() {
  try {
    const active = await prisma.leaderboardSeason.findFirst({
      where: { status: 'active' },
    });

    if (active) {
      // ตรวจว่า season หมดอายุหรือยัง
      const now = new Date();
      if (now > active.endDate) {
        await prisma.leaderboardSeason.update({
          where: { id: active.id },
          data: { status: 'closed' },
        });
        console.log(`📅 Season "${active.name}" หมดอายุแล้ว — marked as closed`);
        // สร้าง season ใหม่
        const nextYear = active.endDate.getUTCFullYear(); // ปีของ endDate คือปีถัดไปหลังจบ season
        await createSeasonForYear(nextYear);
      }
      return;
    }

    // ไม่มี active season — สร้างใหม่
    const now = new Date();
    const year = now.getUTCMonth() >= 4 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
    // ถ้าตอนนี้อยู่หลัง พ.ค = ปีนี้, ถ้าก่อน พ.ค = season ของปีที่แล้ว
    await createSeasonForYear(year);
  } catch (err) {
    console.error('❌ ensureActiveSeason error:', err);
  }
}

module.exports = { ensureActiveSeason, createSeasonForYear };
