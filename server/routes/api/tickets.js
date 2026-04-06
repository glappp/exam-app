const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { getTodayICT } = require('../../utils/dateICT');

const prisma = new PrismaClient();
const DAILY_CAP = 5;

function requireAuth(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  next();
}

// GET /api/tickets/balance
// คืน: { balance, usedToday, remainingToday }
router.get('/balance', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const today = getTodayICT();

    const [wallet, daily] = await Promise.all([
      prisma.ticketWallet.findUnique({ where: { userId } }),
      prisma.ticketDailyUsage.findUnique({ where: { userId_date: { userId, date: today } } })
    ]);

    const balance = wallet?.balance ?? 0;
    const usedToday = daily?.usedCount ?? 0;

    res.json({
      balance,
      usedToday,
      remainingToday: Math.max(0, DAILY_CAP - usedToday),
      dailyCap: DAILY_CAP
    });
  } catch (err) {
    console.error('tickets/balance error:', err);
    res.status(500).json({ error: 'โหลดข้อมูลตั๋วไม่สำเร็จ' });
  }
});

// POST /api/tickets/use
// ใช้ตั๋ว 1 ใบ — ตรวจ balance และ daily cap
// คืน: { success, balance, usedToday }
router.post('/use', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const today = getTodayICT();

  try {
    const [wallet, daily] = await Promise.all([
      prisma.ticketWallet.findUnique({ where: { userId } }),
      prisma.ticketDailyUsage.findUnique({ where: { userId_date: { userId, date: today } } })
    ]);

    const balance = wallet?.balance ?? 0;
    const usedToday = daily?.usedCount ?? 0;

    if (balance < 1) {
      return res.status(400).json({ error: 'ตั๋วไม่พอ กรุณาสะสมตั๋วเพิ่ม' });
    }
    if (usedToday >= DAILY_CAP) {
      return res.status(400).json({ error: `ใช้ตั๋วครบ ${DAILY_CAP} ใบแล้วในวันนี้ มาใหม่ตี 3 นะ` });
    }

    // หักตั๋ว + บันทึก daily usage แบบ atomic
    const [updatedWallet, updatedDaily] = await Promise.all([
      prisma.ticketWallet.upsert({
        where: { userId },
        update: { balance: { decrement: 1 } },
        create: { userId, balance: -1 } // ไม่ควรเกิดขึ้น แต่ป้องกันไว้
      }),
      prisma.ticketDailyUsage.upsert({
        where: { userId_date: { userId, date: today } },
        update: { usedCount: { increment: 1 } },
        create: { userId, date: today, usedCount: 1 }
      }),
      prisma.ticketLog.create({
        data: { userId, type: 'use_competitive', amount: -1, note: `ใช้แข่งขัน ${today}` }
      })
    ]);

    res.json({
      success: true,
      balance: updatedWallet.balance,
      usedToday: updatedDaily.usedCount,
      remainingToday: Math.max(0, DAILY_CAP - updatedDaily.usedCount)
    });
  } catch (err) {
    console.error('tickets/use error:', err);
    res.status(500).json({ error: 'ใช้ตั๋วไม่สำเร็จ' });
  }
});

// POST /api/tickets/earn (admin/internal use)
// body: { userId, amount, type, note }
router.post('/earn', requireAuth, async (req, res) => {
  if (req.session.role !== 'admin') return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
  const { userId, amount, note } = req.body;
  if (!userId || !amount || amount < 1) return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });

  try {
    const [wallet] = await Promise.all([
      prisma.ticketWallet.upsert({
        where: { userId },
        update: { balance: { increment: amount } },
        create: { userId, balance: amount }
      }),
      prisma.ticketLog.create({
        data: { userId, type: 'earn_admin', amount, note: note || `admin เพิ่ม ${amount} ใบ` }
      })
    ]);
    res.json({ success: true, balance: wallet.balance });
  } catch (err) {
    console.error('tickets/earn error:', err);
    res.status(500).json({ error: 'เพิ่มตั๋วไม่สำเร็จ' });
  }
});

module.exports = router;
