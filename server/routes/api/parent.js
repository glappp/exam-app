/**
 * parent.js — Parent Corner API
 *
 * GET  /api/parent/summary   — ยอดคงเหลือ + ประวัติล่าสุด
 * POST /api/parent/adjust    — ผู้ปกครองปรับ points เอง (+/-)
 * GET  /api/parent/reference — ตารางที่มาของ points (สำหรับแสดงบนหน้า)
 */
const express  = require('express')
const router   = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma   = new PrismaClient()

const { todayICT, PARENT_PTS } = require('../../utils/gamification')
const { awardParentPoints }    = require('../../utils/xp-service')

// ── Auth ──────────────────────────────────────────────────────────────────────
function requireLogin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' })
  next()
}

// ── GET /api/parent/summary ───────────────────────────────────────────────────
router.get('/summary', requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId
    const today  = todayICT()

    // ยอดคงเหลือ
    const bal = await prisma.parentPointBalance.findUnique({ where: { userId } })

    // ประวัติ 30 รายการล่าสุด
    const logs = await prisma.parentPointLog.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      take:    30,
    })

    // ยอดที่ได้/ใช้วันนี้
    const todayLogs  = logs.filter(l => l.date === today)
    const todayEarned = todayLogs
      .filter(l => l.amount > 0)
      .reduce((s, l) => s + l.amount, 0)
    const todaySpent = todayLogs
      .filter(l => l.amount < 0)
      .reduce((s, l) => s + Math.abs(l.amount), 0)

    res.json({
      balance:     bal?.balance     ?? 0,
      totalEarned: bal?.totalEarned ?? 0,
      today:       { earned: todayEarned, spent: todaySpent },
      logs,
    })
  } catch (err) {
    console.error('❌ parent/summary error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ── POST /api/parent/adjust ───────────────────────────────────────────────────
// Body: { amount: number (+ หรือ -), note: string }
router.post('/adjust', requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId
    let { amount, note } = req.body

    amount = parseInt(amount, 10)
    if (isNaN(amount) || amount === 0) {
      return res.status(400).json({ error: 'amount ต้องเป็นตัวเลขที่ไม่ใช่ 0' })
    }
    if (Math.abs(amount) > 500) {
      return res.status(400).json({ error: 'ปรับได้ครั้งละไม่เกิน 500 points' })
    }

    // ถ้าหัก — ตรวจยอดไม่ให้ติดลบ
    if (amount < 0) {
      const bal = await prisma.parentPointBalance.findUnique({ where: { userId } })
      const current = bal?.balance ?? 0
      if (current + amount < 0) {
        return res.status(400).json({
          error: `ยอดไม่พอ (มี ${current} pts, ต้องการหัก ${Math.abs(amount)} pts)`,
          balance: current,
        })
      }
    }

    await awardParentPoints(
      prisma, userId, amount, 'parent_manual',
      note?.trim() || (amount > 0 ? 'ผู้ปกครองเพิ่ม points' : 'ผู้ปกครองหัก points')
    )

    const newBal = await prisma.parentPointBalance.findUnique({ where: { userId } })
    res.json({
      success: true,
      balance: newBal?.balance ?? 0,
      adjusted: amount,
    })
  } catch (err) {
    console.error('❌ parent/adjust error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ── GET /api/parent/rewards ───────────────────────────────────────────────────
router.get('/rewards', requireLogin, async (req, res) => {
  try {
    const rewards = await prisma.parentReward.findMany({
      where:   { userId: req.session.userId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
    res.json({ rewards })
  } catch (err) {
    console.error('❌ parent/rewards GET error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ── POST /api/parent/rewards ──────────────────────────────────────────────────
// Body: { emoji, name, cost }
router.post('/rewards', requireLogin, async (req, res) => {
  try {
    const userId  = req.session.userId
    const { emoji, name, cost } = req.body

    const costNum = parseInt(cost, 10)
    if (!name?.trim()) return res.status(400).json({ error: 'ต้องระบุชื่อรางวัล' })
    if (isNaN(costNum) || costNum < 1) return res.status(400).json({ error: 'ราคาต้องเป็นตัวเลขมากกว่า 0' })
    if (costNum > 99999) return res.status(400).json({ error: 'ราคาสูงเกินไป' })

    // จำกัดไม่เกิน 30 รายการต่อผู้ใช้
    const count = await prisma.parentReward.count({ where: { userId } })
    if (count >= 30) return res.status(400).json({ error: 'มีรางวัลมากเกินไป (สูงสุด 30 รายการ)' })

    const reward = await prisma.parentReward.create({
      data: {
        userId,
        emoji: (emoji?.trim() || '🎁').slice(0, 8),
        name:  name.trim().slice(0, 60),
        cost:  costNum,
      }
    })
    res.json({ reward })
  } catch (err) {
    console.error('❌ parent/rewards POST error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ── DELETE /api/parent/rewards/:id ───────────────────────────────────────────
router.delete('/rewards/:id', requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId
    const id     = parseInt(req.params.id, 10)

    const reward = await prisma.parentReward.findFirst({ where: { id, userId } })
    if (!reward) return res.status(404).json({ error: 'ไม่พบรายการ' })

    await prisma.parentReward.delete({ where: { id } })
    res.json({ success: true })
  } catch (err) {
    console.error('❌ parent/rewards DELETE error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ── POST /api/parent/redeem ───────────────────────────────────────────────────
// Body: { rewardId: number }  (ต้องเป็น ParentReward ของ user นั้น)
router.post('/redeem', requireLogin, async (req, res) => {
  try {
    const userId    = req.session.userId
    const rewardId  = parseInt(req.body.rewardId, 10)

    if (isNaN(rewardId)) return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' })

    const reward = await prisma.parentReward.findFirst({ where: { id: rewardId, userId } })
    if (!reward) return res.status(404).json({ error: 'ไม่พบรายการรางวัล' })

    const bal     = await prisma.parentPointBalance.findUnique({ where: { userId } })
    const current = bal?.balance ?? 0
    if (current < reward.cost) {
      return res.status(400).json({
        error: `คะแนนไม่พอ (มี ${current} pts, ต้องการ ${reward.cost} pts)`,
        balance: current,
      })
    }

    await awardParentPoints(
      prisma, userId, -reward.cost, 'parent_redeem',
      `แลกรางวัล: ${reward.name}`
    )

    const newBal = await prisma.parentPointBalance.findUnique({ where: { userId } })
    res.json({ success: true, balance: newBal?.balance ?? 0, reward })
  } catch (err) {
    console.error('❌ parent/redeem error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ── GET /api/parent/reference ─────────────────────────────────────────────────
// ส่ง PARENT_PTS constants ไปให้หน้า client แสดงตาราง
router.get('/reference', requireLogin, async (req, res) => {
  res.json({
    table: [
      { activity: 'เข้าสู่ระบบ',                    points: PARENT_PTS.LOGIN,              freq: 'ต่อวัน' },
      { activity: 'Quick Quiz ตอบถูก',              points: PARENT_PTS.QUICK_QUIZ_CORRECT,  freq: 'ต่อข้อ (max 15/วัน)' },
      { activity: 'Daily Mission ตอบถูก',           points: PARENT_PTS.DAILY_CORRECT,       freq: 'ต่อข้อ (max 15/วัน)' },
      { activity: 'Daily Mission ครบ 5/5',          points: PARENT_PTS.DAILY_PERFECT,       freq: 'bonus/วัน' },
      { activity: 'ผ่าน subtopic ใหม่',             points: PARENT_PTS.SUBTOPIC_PASS,       freq: 'ถาวร (ครั้งเดียว)' },
      { activity: 'ผ่าน topic ใหม่',               points: PARENT_PTS.TOPIC_PASS,          freq: 'ถาวร (ครั้งเดียว)' },
      { activity: 'Weekly Challenge ผ่าน',          points: PARENT_PTS.WEEKLY_PASS,         freq: 'ต่อสัปดาห์' },
      { activity: 'Streak 7 วันติดต่อกัน',          points: PARENT_PTS.STREAK_7,            freq: 'ทุก 7 วัน' },
    ],
    maxPerDay: 60,
  })
})

module.exports = router
