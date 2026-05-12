const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function requireAdmin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  if (req.session.role !== 'admin') return res.status(403).json({ error: 'สิทธิ์ไม่เพียงพอ' });
  next();
}

// GET /api/admin/users — all users + profile summary
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, username: true, firstName: true, lastName: true,
        email: true, role: true, createdAt: true,
        studentProfiles: {
          select: {
            grade: true, school: true, academicYear: true,
            _count: { select: { examResults: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'โหลด users ล้มเหลว' });
  }
});

// GET /api/admin/results — recent exam results with user info
router.get('/results', requireAdmin, async (req, res) => {
  try {
    const results = await prisma.examResult.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        studentProfile: {
          select: {
            grade: true, school: true, academicYear: true,
            user: { select: { firstName: true, lastName: true, username: true } }
          }
        }
      }
    });
    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'โหลดผลสอบล้มเหลว' });
  }
});

// GET /api/admin/stats — summary numbers
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [userCount, questionCount, resultCount] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.examResult.count()
    ]);
    res.json({ userCount, questionCount, resultCount });
  } catch (err) {
    res.status(500).json({ error: 'โหลด stats ล้มเหลว' });
  }
});

// PATCH /api/admin/users/:id/role — change user role (+schoolId optional)
router.patch('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { role, schoolId } = req.body;
    if (!['admin', 'school_admin', 'teacher', 'student'].includes(role)) {
      return res.status(400).json({ error: 'role ไม่ถูกต้อง' });
    }
    const data = { role };
    if (schoolId !== undefined) data.schoolId = schoolId ? parseInt(schoolId) : null;
    const user = await prisma.user.update({ where: { id: parseInt(req.params.id) }, data });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'เปลี่ยน role ล้มเหลว' });
  }
});

// ── Schools ──────────────────────────────────────────────

// GET /api/admin/schools
router.get('/schools', requireAdmin, async (req, res) => {
  try {
    const schools = await prisma.school.findMany({ orderBy: { province: 'asc' } });
    res.json({ schools });
  } catch (err) {
    res.status(500).json({ error: 'โหลดโรงเรียนล้มเหลว' });
  }
});

// POST /api/admin/schools
router.post('/schools', requireAdmin, async (req, res) => {
  try {
    const { name, district, province } = req.body;
    if (!name || !district || !province) return res.status(400).json({ error: 'กรอกข้อมูลไม่ครบ' });
    const school = await prisma.school.create({ data: { name, district, province } });
    res.json({ success: true, school });
  } catch (err) {
    res.status(500).json({ error: 'สร้างโรงเรียนล้มเหลว' });
  }
});

// PATCH /api/admin/schools/:id
router.patch('/schools/:id', requireAdmin, async (req, res) => {
  try {
    const { name, district, province, isActive } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (district !== undefined) data.district = district;
    if (province !== undefined) data.province = province;
    if (isActive !== undefined) data.isActive = isActive;
    const school = await prisma.school.update({ where: { id: parseInt(req.params.id) }, data });
    res.json({ success: true, school });
  } catch (err) {
    res.status(500).json({ error: 'แก้ไขโรงเรียนล้มเหลว' });
  }
});

// DELETE /api/admin/schools/:id
router.delete('/schools/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.school.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ลบโรงเรียนล้มเหลว' });
  }
});

// GET /api/admin/question-reports — รายการ report จากนักเรียน
router.get('/question-reports', requireAdmin, async (req, res) => {
  try {
    const reports = await prisma.questionReport.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    // ดึง question code + text พร้อมกัน
    const qIds = [...new Set(reports.map(r => r.questionId))];
    const questions = await prisma.question.findMany({
      where: { id: { in: qIds } },
      select: { id: true, code: true, textTh: true },
    });
    const qMap = Object.fromEntries(questions.map(q => [q.id, q]));

    const result = reports.map(r => ({
      ...r,
      questionCode: qMap[r.questionId]?.code || '#' + r.questionId.slice(-6),
      questionText: qMap[r.questionId]?.textTh?.slice(0, 60) || '',
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/question-reports/:id — ลบ report (mark resolved)
router.delete('/question-reports/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.questionReport.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Reset Password ───────────────────────────────────────────

// POST /api/admin/users/:id/reset-password
router.post('/users/:id/reset-password', requireAdmin, async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const hashed = await bcrypt.hash(pin, 10);
    await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { password: hashed, mustChangePassword: true },
    });
    res.json({ ok: true, pin });
  } catch (err) {
    res.status(500).json({ error: 'reset password ล้มเหลว' });
  }
});

// ── Bulk User Import ─────────────────────────────────────────

// POST /api/admin/users/bulk-import
// Body: { rows: [{firstName, lastName, username, password, grade, academicYear, school, district, province, classroom?, studentCode?, email?}], preview: bool }
router.post('/users/bulk-import', requireAdmin, async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { rows, preview = false } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'ไม่มีข้อมูลให้นำเข้า' });
    }

    const REQUIRED = ['firstName', 'lastName', 'username', 'password', 'grade', 'academicYear', 'school', 'district', 'province'];
    const results = [];

    // ดึง username ที่มีอยู่แล้ว
    const usernames = rows.map(r => (r.username || '').trim()).filter(Boolean);
    const existing = await prisma.user.findMany({
      where: { username: { in: usernames } },
      select: { username: true }
    });
    const existingSet = new Set(existing.map(u => u.username));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;
      const errors = [];

      for (const field of REQUIRED) {
        if (!row[field] || !String(row[field]).trim()) {
          errors.push(`ขาดฟิลด์ ${field}`);
        }
      }
      if (row.username && existingSet.has(row.username.trim())) {
        errors.push('username ซ้ำในระบบ');
      }
      if (row.password && String(row.password).trim().length < 4) {
        errors.push('password สั้นเกินไป (ต้องมีอย่างน้อย 4 ตัว)');
      }

      results.push({
        row: rowNum,
        username: row.username,
        firstName: row.firstName,
        lastName: row.lastName,
        grade: row.grade,
        school: row.school,
        errors,
        status: errors.length ? 'error' : 'ok'
      });
    }

    if (preview) {
      return res.json({ results, canImport: results.every(r => r.status === 'ok') });
    }

    // ทำ import จริง — เฉพาะ row ที่ ok
    const okRows = rows.filter((_, i) => results[i].status === 'ok');
    let imported = 0;
    for (const row of okRows) {
      const hashed = await bcrypt.hash(String(row.password).trim(), 10);
      await prisma.user.create({
        data: {
          username: row.username.trim(),
          password: hashed,
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          email: row.email?.trim() || '',
          role: 'student',
          studentProfiles: {
            create: {
              academicYear: String(row.academicYear).trim(),
              school: row.school.trim(),
              district: row.district.trim(),
              province: row.province.trim(),
              grade: row.grade.trim(),
              classroom: row.classroom?.trim() || null,
              studentCode: row.studentCode?.trim() || null
            }
          }
        }
      });
      imported++;
    }

    res.json({ success: true, imported, skipped: rows.length - imported });
  } catch (err) {
    console.error('bulk-import error:', err);
    res.status(500).json({ error: 'นำเข้าผู้ใช้ล้มเหลว: ' + err.message });
  }
});

// ── Invite Codes ─────────────────────────────────────────────

// GET /api/admin/invite-codes
router.get('/invite-codes', requireAdmin, async (req, res) => {
  try {
    const codes = await prisma.inviteCode.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ codes });
  } catch (err) {
    res.status(500).json({ error: 'โหลด invite codes ล้มเหลว' });
  }
});

// POST /api/admin/invite-codes — สร้าง code ใหม่
router.post('/invite-codes', requireAdmin, async (req, res) => {
  try {
    const { code, maxUses = 1, note, expiresAt } = req.body;
    if (!code) return res.status(400).json({ error: 'กรุณากรอก code' });
    const invite = await prisma.inviteCode.create({
      data: {
        code: code.trim().toUpperCase(),
        maxUses: parseInt(maxUses),
        note,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: req.session.username
      }
    });
    res.json({ success: true, invite });
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'รหัสนี้มีอยู่แล้ว' });
    res.status(500).json({ error: 'สร้าง invite code ล้มเหลว' });
  }
});

// PATCH /api/admin/invite-codes/:id/deactivate — ปิดใช้งาน
router.patch('/invite-codes/:id/deactivate', requireAdmin, async (req, res) => {
  try {
    await prisma.inviteCode.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ปิด invite code ล้มเหลว' });
  }
});

// ── Admin Test Mode (Impersonation) ──────────────────────────

// GET /api/admin/test-accounts — list accounts username รูปแบบ a1, a2, ... (a ตามด้วยตัวเลข)
router.get('/test-accounts', requireAdmin, async (req, res) => {
  try {
    const all = await prisma.user.findMany({
      where: { username: { startsWith: 'a' } },
      select: { id: true, username: true, firstName: true, lastName: true, role: true }
    });
    const users = all
      .filter(u => /^a\d+$/.test(u.username))
      .sort((a, b) => {
        const na = parseInt(a.username.slice(1)), nb = parseInt(b.username.slice(1));
        return na - nb;
      });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/impersonate/:userId — สลับ session ไปเป็น user นั้น
router.post('/impersonate/:userId', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true, firstName: true, lastName: true }
    });
    if (!target) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });

    // บันทึก admin session ก่อนสลับ
    req.session.adminBackup = {
      userId: req.session.userId,
      username: req.session.username,
      role: req.session.role,
      user: req.session.user,
      firstName: req.session.firstName
    };

    // สลับเป็น target user
    req.session.userId = target.id;
    req.session.username = target.username;
    req.session.role = target.role;
    req.session.firstName = target.firstName;
    req.session.user = { id: target.id, username: target.username, role: target.role, firstName: target.firstName, lastName: target.lastName };

    res.json({ success: true, impersonating: target.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/impersonate/exit — คืน session admin
router.post('/impersonate/exit', async (req, res) => {
  const backup = req.session.adminBackup;
  if (!backup) return res.status(400).json({ error: 'ไม่ได้อยู่ใน impersonate mode' });

  req.session.userId = backup.userId;
  req.session.username = backup.username;
  req.session.role = backup.role;
  req.session.user = backup.user;
  req.session.firstName = backup.firstName;
  delete req.session.adminBackup;

  res.json({ success: true });
});

// ── Login Logs ─────────────────────────────────────────────

// GET /api/admin/login-logs — ประวัติ login ล่าสุด 200 รายการ
router.get('/login-logs', requireAdmin, async (req, res) => {
  try {
    const logs = await prisma.loginLog.findMany({
      orderBy: { loginAt: 'desc' },
      take: 200
    });
    // join user info
    const userIds = [...new Set(logs.map(l => l.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, firstName: true, lastName: true, role: true }
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));
    const result = logs.map(l => ({ ...l, user: userMap[l.userId] || null }));
    res.json({ logs: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── RewardClaim ────────────────────────────────────────────────────────────────

// GET /api/admin/reward-claims
router.get('/reward-claims', requireAdmin, async (req, res) => {
  try {
    const claims = await prisma.rewardClaim.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { reward: { select: { name: true, description: true, type: true } } }
    });
    const userIds = [...new Set(claims.map(c => c.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, firstName: true, lastName: true }
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));
    res.json({ claims: claims.map(c => ({ ...c, user: userMap[c.userId] || null })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/reward-claims/:id/claim — mark as claimed
router.patch('/reward-claims/:id/claim', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const claim = await prisma.rewardClaim.findUnique({ where: { id } });
    if (!claim) return res.status(404).json({ error: 'ไม่พบ claim' });
    if (claim.status === 'claimed') return res.status(400).json({ error: 'claim นี้ส่งมอบแล้ว' });
    const updated = await prisma.rewardClaim.update({
      where: { id },
      data: { status: 'claimed', claimedAt: new Date(), claimedBy: req.session.username || 'admin' }
    });
    res.json({ success: true, claim: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
