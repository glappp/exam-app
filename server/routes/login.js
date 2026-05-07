// server/routes/login.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({ where: { username }, select: { id: true, username: true, password: true, firstName: true, lastName: true, role: true, schoolId: true, firstLoginAt: true, mustChangePassword: true } });
  if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });

  // set session — ทั้ง .user และ flat fields เพื่อ compatibility
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.role = user.role;
  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  // บันทึก firstLoginAt ครั้งแรก
  if (!user.firstLoginAt) {
    await prisma.user.update({ where: { id: user.id }, data: { firstLoginAt: new Date() } });
  }

  // บันทึก login log
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || null;
  prisma.loginLog.create({ data: { userId: user.id, schoolId: user.schoolId || null, ip } }).catch(() => {});

  res.json({
    user: req.session.user,
    mustChangePassword: user.mustChangePassword,
  });
});

module.exports = router;
