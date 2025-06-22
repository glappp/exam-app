// server/routes/login.js
const express = require('express');
const bcrypt = require('bcryptjs'); // ถ้าใช้ hash password
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { username }
  });

  if (!user) {
    return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้' });
  }

  const isMatch = await bcrypt.compare(password, user.password); // ถ้าไม่ได้ hash ใช้ === ได้เลย
  if (!isMatch) {
    return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
  }

  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName
  };

  res.json({ user: req.session.user });
});

// ✅ ต้อง export router
module.exports = router;
