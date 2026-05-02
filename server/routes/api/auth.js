// server/routes/api/auth.js
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { sendPasswordReset } = require('../../utils/email');

const router = express.Router();
const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'กรุณากรอกอีเมล' });

  // ไม่บอกว่าเจอหรือไม่เจอ email — ป้องกัน user enumeration
  const user = await prisma.user.findFirst({ where: { email: email.trim().toLowerCase() } });
  if (!user) return res.json({ ok: true });

  // ลบ token เก่า (ถ้ามี)
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 ชั่วโมง
  await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });

  const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const resetUrl = `${appUrl}/reset-password.html?token=${token}`;

  try {
    await sendPasswordReset(user.email, resetUrl);
  } catch (err) {
    console.error('Email send error:', err.message);
    // ไม่ return error — ไม่เปิดเผยว่า email ส่งไม่ได้
  }

  res.json({ ok: true });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return res.status(400).json({ error: 'ลิงก์หมดอายุหรือถูกใช้ไปแล้ว กรุณาขอใหม่' });
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hashed, mustChangePassword: false },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  res.json({ ok: true });
});

// POST /api/auth/change-password  (ต้อง login)
router.post('/change-password', async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: req.session.userId },
    data: { password: hashed, mustChangePassword: false },
  });

  res.json({ ok: true });
});

module.exports = router;
