/**
 * box.js — Box System API
 *
 * GET  /api/box/inventory          — กล่องที่มีอยู่
 * POST /api/box/open               — เปิดกล่อง { boxType: "silver"|"gold" }
 * POST /api/box/grant  (admin)     — แจกกล่องให้ user { userId, boxType, amount }
 */
const express = require('express')
const router  = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma  = new PrismaClient()
const { awardXP, awardTicket, awardParentPoints } = require('../../utils/xp-service')

// ── Auth ──────────────────────────────────────────────────────────────────────
function requireLogin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' })
  next()
}
function requireAdmin(req, res, next) {
  if (!['admin', 'school_admin', 'teacher'].includes(req.session?.role))
    return res.status(403).json({ error: 'ไม่มีสิทธิ์' })
  next()
}

// ── Prize tables ──────────────────────────────────────────────────────────────
/*
  Silver Box — รางวัลสำหรับนักเรียนที่ทำ daily mission ครบ
    60% → XP (15–40 XP)
    25% → Parent Points (5–15 pts)
    12% → Ticket ×1
     3% → Gold Box ×1
*/
const SILVER_TABLE = [
  { weight: 60, type: 'xp',           min: 15, max: 40 },
  { weight: 25, type: 'parent_points', min: 5,  max: 15 },
  { weight: 12, type: 'ticket',        amount: 1 },
  { weight:  3, type: 'gold_box',      amount: 1 },
]

/*
  Gold Box — รางวัลพิเศษจากการแข่งขัน / weekly challenge
  (ไม่มี Gold Box ซ้ำ — ป้องกัน chain reaction)
    35% → XP (50–150 XP)
    20% → Parent Points (15–40 pts)
    30% → Ticket ×2
    10% → Digital Reward (จาก Reward table ที่ active)
     5% → Physical Reward
*/
const GOLD_TABLE = [
  { weight: 35, type: 'xp',           min: 50,  max: 150 },
  { weight: 20, type: 'parent_points', min: 15,  max: 40  },
  { weight: 30, type: 'ticket',        amount: 2 },
  { weight: 10, type: 'digital'                            },
  { weight:  5, type: 'physical'                           },
]

// ── Probability engine ────────────────────────────────────────────────────────
function weightedRoll(table) {
  const total = table.reduce((s, e) => s + e.weight, 0)
  let r = Math.random() * total
  for (const entry of table) {
    r -= entry.weight
    if (r <= 0) return entry
  }
  return table[table.length - 1]
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ── GET /api/box/inventory ────────────────────────────────────────────────────
router.get('/inventory', requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId
    const inv = await prisma.boxInventory.findUnique({ where: { userId } })
    res.json({
      silver: inv?.silverCount ?? 0,
      gold:   inv?.goldCount   ?? 0,
    })
  } catch (err) {
    console.error('❌ box inventory error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ── POST /api/box/open ────────────────────────────────────────────────────────
router.post('/open', requireLogin, async (req, res) => {
  try {
    const userId  = req.session.userId
    const { boxType } = req.body

    if (!['silver', 'gold'].includes(boxType)) {
      return res.status(400).json({ error: 'boxType ไม่ถูกต้อง' })
    }

    // ตรวจ inventory
    const inv = await prisma.boxInventory.findUnique({ where: { userId } })
    const field = boxType === 'silver' ? 'silverCount' : 'goldCount'
    if (!inv || inv[field] < 1) {
      return res.status(400).json({ error: `ไม่มีกล่อง ${boxType === 'silver' ? 'เงิน' : 'ทอง'} เหลือ` })
    }

    // หักกล่อง
    await prisma.boxInventory.update({
      where: { userId },
      data: { [field]: { decrement: 1 } }
    })

    // Roll รางวัล
    const table  = boxType === 'silver' ? SILVER_TABLE : GOLD_TABLE
    const rolled = weightedRoll(table)
    let rewardResult = { type: rolled.type }

    if (rolled.type === 'xp') {
      const amount = randInt(rolled.min, rolled.max)
      rewardResult.amount = amount
      await awardXP(prisma, userId, amount, 'activity')

    } else if (rolled.type === 'parent_points') {
      const amount = randInt(rolled.min, rolled.max)
      rewardResult.amount = amount
      await awardParentPoints(prisma, userId, amount, 'box_reward',
        `เปิดกล่อง ${boxType}`)

    } else if (rolled.type === 'ticket') {
      const amount = rolled.amount
      rewardResult.amount = amount
      await awardTicket(prisma, userId, amount, 'earn_box',
        `เปิดกล่อง ${boxType}`)

    } else if (rolled.type === 'gold_box') {
      rewardResult.amount = rolled.amount
      await grantBox(userId, 'gold', rolled.amount)

    } else if (rolled.type === 'digital' || rolled.type === 'physical') {
      // ดึง reward จาก Reward table (ที่ยังมีของเหลือ)
      const candidates = await prisma.reward.findMany({
        where: { type: rolled.type, isActive: true },
        orderBy: { createdAt: 'asc' },
      })
      const reward = candidates.find(r => r.claimedQty < r.quantity) || null

      if (reward) {
        rewardResult.rewardId   = reward.id
        rewardResult.rewardName = reward.name
        rewardResult.rewardDesc = reward.description
        // สร้าง RewardClaim
        const claimRef = `BOX-${Date.now()}-${userId}`
        await prisma.$transaction([
          prisma.rewardClaim.create({
            data: { userId, rewardId: reward.id, claimRef }
          }),
          prisma.reward.update({
            where: { id: reward.id },
            data:  { claimedQty: { increment: 1 } }
          })
        ])
        rewardResult.claimRef = claimRef
      } else {
        // fallback: ไม่มีของ → ให้ ticket แทน
        rewardResult = { type: 'ticket', amount: boxType === 'gold' ? 2 : 1, fallback: true }
        await awardTicket(prisma, userId, rewardResult.amount, 'earn_box',
          `เปิดกล่อง ${boxType} (fallback)`)
      }
    }

    // บันทึก BoxLog
    await prisma.boxLog.create({
      data: {
        userId,
        boxType,
        rewardType:   rewardResult.type,
        rewardAmount: rewardResult.amount ?? null,
        rewardId:     rewardResult.rewardId ?? null,
      }
    })

    // คืน inventory ปัจจุบัน
    const newInv = await prisma.boxInventory.findUnique({ where: { userId } })
    res.json({
      reward:    rewardResult,
      inventory: { silver: newInv?.silverCount ?? 0, gold: newInv?.goldCount ?? 0 }
    })

  } catch (err) {
    console.error('❌ box open error:', err)
    res.status(500).json({ error: 'เปิดกล่องไม่สำเร็จ' })
  }
})

// ── POST /api/box/grant (admin/system) ───────────────────────────────────────
router.post('/grant', requireLogin, requireAdmin, async (req, res) => {
  try {
    const { userId, boxType, amount = 1 } = req.body
    if (!userId || !['silver', 'gold'].includes(boxType)) {
      return res.status(400).json({ error: 'ข้อมูลไม่ครบ' })
    }
    await grantBox(parseInt(userId), boxType, parseInt(amount))
    res.json({ success: true, message: `แจก ${boxType} box ×${amount} ให้ user ${userId} แล้ว` })
  } catch (err) {
    console.error('❌ box grant error:', err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ── GET /api/box/history ──────────────────────────────────────────────────────
router.get('/history', requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId
    const logs = await prisma.boxLog.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    res.json({ history: logs })
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' })
  }
})

// ── Helper: grant box ─────────────────────────────────────────────────────────
async function grantBox(userId, boxType, amount = 1) {
  const field = boxType === 'silver' ? 'silverCount' : 'goldCount'
  await prisma.boxInventory.upsert({
    where:  { userId },
    create: { userId, [field]: amount },
    update: { [field]: { increment: amount } },
  })
}

// Export grantBox สำหรับ services อื่น
module.exports = router
module.exports.grantBox = grantBox
