// 📁 server/routes/register.js

const express = require("express");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// ✅ API สำหรับลงทะเบียนนักเรียน
router.post("/", async (req, res) => {
  const {
    username, password, firstName, lastName, email, role,
    academicYear, school, district, province, grade, classroom, studentCode
  } = req.body;

  try {
    // 🔐 ตรวจ username ซ้ำ
    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // 🔐 แฮชรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 🧑‍🎓 สร้าง User พร้อม StudentProfile แรก
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

    res.status(201).json({ message: "Register success", userId: newUser.id });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
