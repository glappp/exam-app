// 📁 server/routes/register.js

const express = require("express");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

router.post("/", async (req, res) => {
  const {
    username, password, firstName, lastName, email, role,
    academicYear, school, district, province, grade, classroom, studentCode,
    inviteCode
  } = req.body;

  try {
    // ตรวจ invite code
    if (!inviteCode) {
      return res.status(400).json({ error: "กรุณากรอกรหัสเชิญ" });
    }

    const invite = await prisma.inviteCode.findUnique({ where: { code: inviteCode } });
    if (
      !invite ||
      !invite.isActive ||
      invite.usedCount >= invite.maxUses ||
      (invite.expiresAt && invite.expiresAt < new Date())
    ) {
      return res.status(400).json({ error: "รหัสเชิญไม่ถูกต้องหรือหมดอายุแล้ว" });
    }

    // ตรวจ email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: "กรุณากรอกอีเมลที่ถูกต้อง" });
    }

    // ตรวจ username ซ้ำ
    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      return res.status(400).json({ error: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // สร้าง User + StudentProfile
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        firstName,
        lastName,
        email,
        role: role || "student",
        studentProfiles: {
          create: {
            academicYear,
            school,
            district,
            province,
            grade,
            classroom,
            studentCode
          }
        }
      },
      include: { studentProfiles: true }
    });

    // นับการใช้ invite code + ปิดถ้าเต็มแล้ว
    const newUsed = invite.usedCount + 1;
    await prisma.inviteCode.update({
      where: { id: invite.id },
      data: {
        usedCount: newUsed,
        isActive: newUsed < invite.maxUses
      }
    });

    res.status(201).json({ message: "Register success", userId: newUser.id });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
