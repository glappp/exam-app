/**
 * leaderboard.js — Leaderboard API พร้อมระบบ Ticket-before-play
 *
 * POST /api/leaderboard/enter        — ใช้ ticket เพื่อเข้าแข่ง (คืน session token)
 * POST /api/leaderboard/submit       — บันทึกคะแนนพร้อม token ที่ได้จาก enter
 * GET  /api/leaderboard              — ดู rankings (?league=A|B|C&week=2026-W18)
 * GET  /api/leaderboard/my-league    — ดู league ของผู้ใช้ปัจจุบัน
 */
const express = require('express')
const router  = express.Router()
const crypto  = require('crypto')
const { PrismaClient } = require('@prisma/client')
const prisma  = new PrismaClient()

const {
  getCurrentGrade, getDefaultLeague, isLeagueLocked, getWeekKey, todayICT,
} = require('../../utils/gamification')

const { awardTicket } = require('../../utils/xp-service')
const { grantBox }   = require('./box')

// ── In-memory session token store ────────────────────────────────────────────
// Map<token, { userId, league, activity, expiresAt }>
const activeTokens = new Map()
const TOKEN_TTL_MS = 60 * 60 * 1000  // 1 ชั่วโมง

// ล้าง token ที่หมดอายุทุก 10 นาที
setInterval(() => {
  const now = Date.now()
  for (const [token, data] of activeTokens) {
    if (data.expiresAt <= now) activeTokens.delete(token)
  }
}, 10 * 60 * 1000)

// ── Auth helper ───────────────────────────────────────────────────────────────
function requireLogin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' })
  next()
}

// ── League validation ─────────────────────────────────────────────────────────
/**
 * ตรวจว่า grade นี้สามารถเข้า league ที่ต้องการได้ไหม
 * p4 → B only, p5/p6 → C only, p1-p3 → any
 */
function canJoinLeague(grade, requestedLeague) {
  if (isLeagueLocked(grade)) {
    return getDefaultLeague(grade) === requestedLeague
  }
  return ['A', 'B', 'C'].includes(requestedLeague)
}

// ── GET /api/leaderboard/my-league ───────────────────────────────────────────
router.get('/my-league', requireLogin, async (req, res) => {
  try {
    const userId  = req.session.userId
    const profile = await prisma.studentProfile.findFirst({
      where: { userId, status: 'active' },
      select: { enrollmentGrade: true, enrollmentYear: true }
    })

    const grade  = getCurrentGrade(profile?.enrollmentGrade, profile?.enrollmentYear)
    const league = getDefaultLeague(grade)
    const locked = isLeagueLocked(grade)

    const wallet = await prisma.ticketWallet.findUnique({ where: { userId } })

    res.json({ grade, league, locked, ticketBalance: wallet?.balance ?? 0 })
  } catch (err) {
    console.error('❌ my-league error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ── POST /api/leaderboard/enter ───────────────────────────────────────────────
// Body: { league: "A"|"B"|"C", activity: "grand_prix"|"daily_mission" }
router.post('/enter', requireLogin, async (req, res) => {
  try {
    const userId   = req.session.userId
    const { league, activity = 'grand_prix' } = req.body

    if (!['A','B','C'].includes(league)) {
      return res.status(400).json({ error: 'league ไม่ถูกต้อง' })
    }

    if (!['grand_prix','daily_mission'].includes(activity)) {
      return res.status(400).json({ error: 'activity ไม่ถูกต้อง' })
    }

    // ตรวจสอบ grade → league lock
    const profile = await prisma.studentProfile.findFirst({
      where: { userId, status: 'active' },
      select: { enrollmentGrade: true, enrollmentYear: true }
    })
    const grade = getCurrentGrade(profile?.enrollmentGrade, profile?.enrollmentYear)

    if (!canJoinLeague(grade, league)) {
      const correctLeague = getDefaultLeague(grade)
      return res.status(403).json({
        error: `ชั้น ${grade} ต้องแข่งใน League ${correctLeague} เท่านั้น`
      })
    }

    // ตรวจ ticket
    const wallet = await prisma.ticketWallet.findUnique({ where: { userId } })
    if (!wallet || wallet.balance < 1) {
      return res.status(402).json({ error: 'ตั๋วไม่พอ กรุณาทำภารกิจเพื่อรับตั๋วเพิ่ม' })
    }

    // ตัด ticket 1 ใบ
    await awardTicket(prisma, userId, -1, 'use_competitive',
      `เข้าแข่ง League ${league} (${activity})`)

    // สร้าง token
    const token = crypto.randomBytes(24).toString('hex')
    const weekKey = getWeekKey()
    activeTokens.set(token, {
      userId,
      league,
      activity,
      weekKey,
      grade,
      expiresAt: Date.now() + TOKEN_TTL_MS,
    })

    const newBalance = (wallet.balance) - 1
    res.json({ token, league, weekKey, ticketBalance: newBalance })

  } catch (err) {
    console.error('❌ leaderboard/enter error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ── POST /api/leaderboard/submit ──────────────────────────────────────────────
// Body: { token, score }
router.post('/submit', requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId
    const { token, score } = req.body

    if (!token || score === undefined) {
      return res.status(400).json({ error: 'ต้องส่ง token และ score' })
    }

    const session = activeTokens.get(token)
    if (!session) {
      return res.status(400).json({ error: 'token ไม่ถูกต้องหรือหมดอายุ (กรุณาใช้ตั๋วใหม่)' })
    }
    if (session.userId !== userId) {
      return res.status(403).json({ error: 'token นี้ไม่ใช่ของคุณ' })
    }
    if (session.expiresAt <= Date.now()) {
      activeTokens.delete(token)
      return res.status(400).json({ error: 'token หมดอายุแล้ว (กรุณาใช้ตั๋วใหม่)' })
    }

    const { league, activity, weekKey } = session

    // บันทึก score
    const record = await prisma.weeklyLeaderboard.create({
      data: { userId, weekKey, league, activity, score, ticketsUsed: 1 }
    })

    // ลบ token ทิ้ง (ใช้แล้วหมด)
    activeTokens.delete(token)

    // ดึง rank ปัจจุบันของผู้ใช้ใน week นี้
    const rank = await getUserRank(userId, league, weekKey)

    res.json({ success: true, id: record.id, rank, weekKey, league })

  } catch (err) {
    console.error('❌ leaderboard/submit error:', err)
    res.status(500).json({ error: 'บันทึกคะแนนไม่สำเร็จ' })
  }
})

// ── GET /api/leaderboard ──────────────────────────────────────────────────────
// Query: ?league=B&week=2026-W18 (week optional, default = current week)
router.get('/', requireLogin, async (req, res) => {
  try {
    const league  = req.query.league || 'C'
    const weekKey = req.query.week || getWeekKey()

    if (!['A','B','C'].includes(league)) {
      return res.status(400).json({ error: 'league ไม่ถูกต้อง' })
    }

    // ดึง top scores per user (max score ของแต่ละคนในสัปดาห์นี้)
    const entries = await prisma.weeklyLeaderboard.findMany({
      where: { league, weekKey },
      orderBy: { score: 'desc' },
    })

    // Group by userId → เก็บ max score
    const userBestMap = new Map()
    for (const e of entries) {
      const best = userBestMap.get(e.userId)
      if (!best || e.score > best.score) {
        userBestMap.set(e.userId, e)
      }
    }

    // เรียงลำดับ score สูงสุด
    const sorted = [...userBestMap.values()].sort((a, b) => b.score - a.score)
    const top = sorted.slice(0, 20)

    // ดึงชื่อผู้ใช้
    const userIds = top.map(e => e.userId)
    const users   = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, username: true }
    })
    const userMap = Object.fromEntries(users.map(u => [u.id, u]))

    // ดึง StudentProfile เพื่อแสดงชั้น
    const profiles = await prisma.studentProfile.findMany({
      where: { userId: { in: userIds }, status: 'active' },
      select: { userId: true, enrollmentGrade: true, enrollmentYear: true }
    })
    const profileMap = Object.fromEntries(profiles.map(p => [p.userId, p]))

    const rankings = top.map((e, i) => {
      const user    = userMap[e.userId] || {}
      const profile = profileMap[e.userId] || {}
      const grade   = getCurrentGrade(profile.enrollmentGrade, profile.enrollmentYear)
      return {
        rank:      i + 1,
        userId:    e.userId,
        name:      user.firstName || user.username || `ผู้ใช้ ${e.userId}`,
        grade,
        score:     e.score,
        activity:  e.activity,
        createdAt: e.createdAt,
      }
    })

    // count total entries
    const totalEntries = await prisma.weeklyLeaderboard.count({ where: { league, weekKey } })

    res.json({ league, weekKey, rankings, totalEntries })

  } catch (err) {
    console.error('❌ leaderboard GET error:', err)
    res.status(500).json({ error: 'โหลด leaderboard ไม่สำเร็จ' })
  }
})

// ── GET /api/leaderboard/history ─────────────────────────────────────────────
// ดูประวัติการแข่งของตัวเองในสัปดาห์นี้
router.get('/history', requireLogin, async (req, res) => {
  try {
    const userId  = req.session.userId
    const weekKey = req.query.week || getWeekKey()
    const league  = req.query.league

    const where = { userId, weekKey }
    if (league) where.league = league

    const history = await prisma.weeklyLeaderboard.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    res.json({ history, weekKey })
  } catch (err) {
    console.error('❌ leaderboard/history error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ── POST /api/leaderboard/settle (admin only) ─────────────────────────────────
// รันสิ้นสัปดาห์ → แจก Gold Box ให้ top 3 ทุก league
// Body: { week: "2026-W18" }  (optional, default = สัปดาห์ล่าสุดที่ผ่านมา)
router.post('/settle', async (req, res) => {
  try {
    // ตรวจสิทธิ์ admin
    if (!['admin', 'school_admin', 'teacher'].includes(req.session?.role)) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์' })
    }

    // คำนวณ weekKey ที่จะ settle (default = สัปดาห์ที่แล้ว)
    const weekKey = req.body?.week || (() => {
      const d = new Date()
      d.setDate(d.getDate() - 7)   // สัปดาห์ที่แล้ว
      return getWeekKey(d)
    })()

    const LEAGUES     = ['A', 'B', 'C']
    const GOLD_PRIZES = { 1: 3, 2: 2, 3: 1 }  // อันดับ 1 = 3 กล่อง, 2 = 2 กล่อง, 3 = 1 กล่อง
    const settled     = []

    for (const league of LEAGUES) {
      const entries = await prisma.weeklyLeaderboard.findMany({
        where: { league, weekKey },
        orderBy: { score: 'desc' },
      })

      // Group by userId → max score
      const userBestMap = new Map()
      for (const e of entries) {
        const best = userBestMap.get(e.userId)
        if (!best || e.score > best.score) userBestMap.set(e.userId, e)
      }
      const ranked = [...userBestMap.values()].sort((a, b) => b.score - a.score)

      for (let i = 0; i < Math.min(3, ranked.length); i++) {
        const rank    = i + 1
        const userId  = ranked[i].userId
        const boxes   = GOLD_PRIZES[rank]
        await grantBox(userId, 'gold', boxes)
        settled.push({ league, rank, userId, goldBoxes: boxes, score: ranked[i].score })
      }
    }

    res.json({ success: true, weekKey, settled })

  } catch (err) {
    console.error('❌ leaderboard/settle error:', err)
    res.status(500).json({ error: 'settle ไม่สำเร็จ' })
  }
})

// ── Helper: คำนวณ rank ของ userId ในสัปดาห์นี้ ──────────────────────────────
async function getUserRank(userId, league, weekKey) {
  const entries = await prisma.weeklyLeaderboard.findMany({
    where: { league, weekKey },
    orderBy: { score: 'desc' },
  })

  // Group by userId → max score
  const userBestMap = new Map()
  for (const e of entries) {
    const best = userBestMap.get(e.userId)
    if (!best || e.score > best.score) {
      userBestMap.set(e.userId, e)
    }
  }

  const sorted = [...userBestMap.values()].sort((a, b) => b.score - a.score)
  const idx    = sorted.findIndex(e => e.userId === userId)
  return idx === -1 ? null : idx + 1
}

module.exports = router
