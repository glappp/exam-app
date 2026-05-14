/**
 * xp-service.js — บริการกลางสำหรับ award XP / Ticket / ParentPoints
 * ใช้ร่วมกันใน mission, submit-exam, grand-prix ฯลฯ
 */
const {
  XP, PARENT_PTS, TICKET,
  calcLevel, todayICT, getWeekKey,
} = require('./gamification')

const MAX_LEVEL = 20

/**
 * อัปเดต CharacterState และ streak
 * @param {PrismaClient} prisma
 * @param {number} userId
 * @param {number} xpAmount
 * @param {'activity'|'permanent'} xpType  — activity reset ทุกปี, permanent ไม่ reset
 * @returns {{ newLevel, leveledUp, ticketsFromOverflow }}
 */
async function logActivity(prisma, userId, type, amount, source, note) {
  try {
    await prisma.activityLog.create({ data: { userId, type, amount, source, note } })
  } catch (_) {}  // ไม่ให้ log error หยุด flow หลัก
}

async function awardXP(prisma, userId, xpAmount, xpType = 'activity', source = null, note = null) {
  if (xpAmount <= 0) return { newLevel: 1, leveledUp: false, ticketsFromOverflow: 0 }

  // upsert CharacterState
  let cs = await prisma.characterState.upsert({
    where:  { userId },
    create: { userId, level: 1, totalXp: 0, activityXp: 0, permanentXp: 0 },
    update: {},
  })

  const isActivity  = xpType === 'activity'
  const isPermanent = xpType === 'permanent'

  let newActivityXp  = cs.activityXp  + (isActivity  ? xpAmount : 0)
  let newPermanentXp = cs.permanentXp + (isPermanent ? xpAmount : 0)
  let newTotalXp     = cs.totalXp + xpAmount

  // LV20 overflow → tickets (เฉพาะ activity XP)
  let ticketsFromOverflow = 0
  const oldLevel = calcLevel(cs.activityXp + cs.permanentXp)

  if (isActivity && oldLevel >= MAX_LEVEL) {
    ticketsFromOverflow = Math.floor(xpAmount / TICKET.XP_OVERFLOW_RATE)
    if (ticketsFromOverflow > 0) {
      await awardTicket(prisma, userId, ticketsFromOverflow, 'earn_overflow',
        `LV20 overflow: ${xpAmount} XP → ${ticketsFromOverflow} ticket`)
    }
  }

  const newLevel  = calcLevel(newActivityXp + newPermanentXp)
  const leveledUp = newLevel > oldLevel

  await prisma.characterState.update({
    where: { userId },
    data: {
      totalXp:    newTotalXp,
      activityXp: newActivityXp,
      permanentXp: newPermanentXp,
      level:      Math.min(newLevel, MAX_LEVEL),
    },
  })

  // บันทึก activity log
  await logActivity(prisma, userId, 'xp', xpAmount, source, note)

  return { newLevel: Math.min(newLevel, MAX_LEVEL), leveledUp, ticketsFromOverflow }
}

/**
 * อัปเดต streak รายวัน — เรียกครั้งแรกของวัน
 * @returns {{ streak, milestoneHit }} milestoneHit = true ถ้าครบ 7 วัน
 */
async function updateStreak(prisma, userId) {
  const today = todayICT()
  let cs = await prisma.characterState.upsert({
    where:  { userId },
    create: { userId, level: 1, totalXp: 0, activityXp: 0, permanentXp: 0, lastActiveDate: null, currentStreak: 0 },
    update: {},
  })

  if (cs.lastActiveDate === today) {
    return { streak: cs.currentStreak, milestoneHit: false }
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = todayICT(yesterday)

  const newStreak = cs.lastActiveDate === yesterdayStr ? cs.currentStreak + 1 : 1
  const longestStreak = Math.max(cs.longestStreak, newStreak)
  const milestoneHit = newStreak % 7 === 0  // ทุก 7 วัน

  await prisma.characterState.update({
    where: { userId },
    data: {
      currentStreak:  newStreak,
      longestStreak,
      lastActiveDate: today,
    },
  })

  // streak milestone → ticket + parent points
  if (milestoneHit) {
    await awardTicket(prisma, userId, TICKET.STREAK_7, 'earn_mission', 'Streak 7 วัน')
    await awardParentPoints(prisma, userId, PARENT_PTS.STREAK_7, 'auto_streak', 'Streak 7 วัน')
    await awardXP(prisma, userId, XP.QUICK_QUIZ_CORRECT * 0, 'activity')  // ไม่ได้ XP จาก streak ตรงๆ
  }

  return { streak: newStreak, milestoneHit }
}

/**
 * Award ticket
 */
async function awardTicket(prisma, userId, amount, type, note) {
  if (amount <= 0) return
  await prisma.$transaction([
    prisma.ticketWallet.upsert({
      where:  { userId },
      create: { userId, balance: amount },
      update: { balance: { increment: amount } },
    }),
    prisma.ticketLog.create({
      data: { userId, type, amount, note },
    }),
  ])
  // บันทึก activity log (source = type เช่น 'earn_mission', 'earn_box', 'earn_overflow')
  await logActivity(prisma, userId, 'ticket', amount, type, note)
}

/**
 * Award Parent Points
 */
async function awardParentPoints(prisma, userId, amount, source, note) {
  if (amount === 0) return
  const today = todayICT()
  const isEarning = amount > 0

  await prisma.$transaction([
    prisma.parentPointBalance.upsert({
      where:  { userId },
      create: { userId, balance: amount, totalEarned: isEarning ? amount : 0 },
      update: {
        balance:     { increment: amount },
        totalEarned: isEarning ? { increment: amount } : undefined,
      },
    }),
    prisma.parentPointLog.create({
      data: { userId, amount, source, note, date: today },
    }),
  ])
}

/**
 * Award login bonus (เรียกวันละครั้ง)
 */
async function awardDailyLogin(prisma, userId) {
  const { streak, milestoneHit } = await updateStreak(prisma, userId)
  // parent points login bonus
  await awardParentPoints(prisma, userId, PARENT_PTS.LOGIN, 'auto_login', 'เข้าสู่ระบบ')
  return { streak, milestoneHit }
}

module.exports = {
  awardXP,
  awardTicket,
  awardParentPoints,
  awardDailyLogin,
  updateStreak,
  logActivity,
}
