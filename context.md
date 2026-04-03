# context.md — exam-app

> อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง
> อัปเดตล่าสุด: 2026-04-03 (commit d7fa2b7)

---

## Project Overview

คลังข้อสอบออนไลน์สำหรับนักเรียนไทย ป.4–ม.3
- Stack: Node.js + Express + Prisma (SQLite) + Vanilla HTML/CSS/JS
- Repository: https://github.com/glappp/exam-app | Branch หลัก: `main`
- Server รันที่: `http://localhost:3001`

---

## สถานะระบบ (2026-04-03)

ระบบหลัก **ใช้งานได้จริงแล้ว** ครบ flow:
`login → เลือกโหมด → ทำข้อสอบ → submit → dashboard แสดงผล`

Authentication ใช้ **session-based** (`express-session`) ทุกหน้าแล้ว — ไม่มี localStorage อีกต่อไป

**ทุก Phase เสร็จสมบูรณ์แล้ว:**
- Phase 3: AI generate questions, Mock exam, Classroom scores ✅
- Student score report (`/student-report.html`) ✅
- Dashboard aggregate summary (คะแนนรวม, อันดับ, เฉลี่ย, SD) ✅
- Classroom term support (ภาคเรียน 1/2, aggregate key = `year|term`) ✅
- Phase B: Adaptive mode + Recommendation card ✅
- Phase C: Rate limiting `/api/login` (5 req/15 min/IP) ✅

---

## โครงสร้างไฟล์สำคัญ

```
server/
  Index.js                        — Entry point, multer upload, routes
  storage.js                      — Abstraction layer: local multer / Cloudflare R2
  prisma/
    schema.prisma                 — Database schema (11 models)
    seed.js                       — Seed ExamSetMetadata
    seed-attribute-dict.js        — Seed AttributeDictionary (67 entries)
    seed-demo-students.js         — สร้าง demo 30 คน (a1–a30/1111) + คะแนนจริง ป.1/1 ปี 2565
    create-admin.js               — สร้าง admin user ครั้งแรก
    dev.db                        — SQLite database
  routes/
    register.js, results.js, questions.js, exam-options.js
    api/
      attributeDictRoute.js       — CRUD /api/attribute-dict
      student.js                  — /api/student/me, /profile, /history
      admin.js                    — /api/admin/users, /results, /stats, PATCH role
      csv-upload.js               — /api/classroom/* (score upload, my-scores, history, export)
      announcements.js            — /api/announcements
      ai-generate.js              — /api/ai/generate-questions
      mock-exam.js                — /api/mock/blueprints, /start, /submit
      exam-set-random.js
      exam-set-official.js
      exam-sets.js
      submit-exam.js

client/
  style.css                       — Design system
  login.html / register.html
  dashboard.html                  — Stats, mode buttons, profile form, classroom scores card
  student-report.html             — รายงานคะแนนจากครู (score cards, bar chart, radar chart, history)
  practice.html / script.js
  exam.html / exam-official.html / test-competitive.html / result-competitive.html
  mock-exam.html / mock-setup.html
  ai-generate.html
  add-question.html / edit-question.html / list-questions.html
  attribute-dict.html / admin.html
  teacher-report.html
```

---

## Database Models (schema.prisma)

### User
`id`, `username` (unique), `password` (bcrypt), `firstName`, `lastName`, `email`, `role`

### StudentProfile
ผูกกับ User รองรับหลายปีการศึกษา
`userId`, `academicYear`, `school`, `district`, `province`, `grade`, `classroom`, `studentCode`

### ExamResult
ผูกกับ StudentProfile
`mode`, `score`, `total`, `durationSec`, `questionIds`, `userAnswers`, `weakAttributes`, `examSetCode`

### ClassroomScoreUpload
คะแนนที่ครูอัปโหลด/กรอก แยกตามวิชา
`uploadedById`, `academicYear`, **`term`** (ภาคเรียน "1"/"2"), `school`, `grade`, `subject`, `scores` (JSON), `stats` (JSON)

- `subject = "multi"` → matrix หลายวิชาพร้อมกัน
- `scores` JSON รูปแบบ: `[{ studentCode, name, score, fullScore, grade, percentile, userId }]`
- aggregate key ใน API: `"year|term"` เช่น `"2565|1"`

### Question
- `id` (cuid), `code` (human-readable เช่น `p6-pcc-2022-o-q001`)
- `textTh`, `textEn`, `image`, `choices` (JSON), `answer`, `attributes` (JSON)
- `difficulty` ใน Question เป็น String แต่ใน `attributes` เป็น Int

### MockBlueprint
Template ชุดข้อสอบ mock: `name`, `grade`, `timeLimitSec`, `totalQuestions`, `avgPassScore`, `topics` (JSON), `difficulty` (JSON)

### PointTransaction / DailyMission / CharacterState
Gamification: XP, level, daily mission

### AnnouncementRead / Announcement
ประกาศจาก admin/ครู

### AttributeDictionary
`key` (PK), `type`, `th`, `en`, `grade`

---

## API Endpoints หลัก

| Method | Path | หน้าที่ |
|--------|------|--------|
| POST | `/api/login` | Login → set session |
| GET | `/api/me` | ดู session ปัจจุบัน |
| POST | `/api/logout` | Logout |
| GET | `/api/student/me` | User + profile + ผลสอบล่าสุด |
| PUT | `/api/student/profile` | Create/update StudentProfile |
| GET | `/api/classroom/my-scores` | นักเรียนดูคะแนนจากครู (groupby year\|term, aggregates) |
| GET | `/api/classroom/students` | รายชื่อนักเรียน (teacher) |
| POST | `/api/classroom/score-entry` | กรอกคะแนนทีละวิชา |
| POST | `/api/classroom/matrix-entry` | กรอกคะแนนหลายวิชาพร้อมกัน |
| GET | `/api/classroom/history` | ประวัติ upload (teacher/admin) |
| GET | `/api/classroom/export/:id` | ดาวน์โหลด CSV |
| GET | `/api/mock/blueprints` | ดึง blueprint ทั้งหมด |
| POST | `/api/mock/start` | สร้างชุดข้อสอบ mock จาก blueprint |
| POST | `/api/mock/submit` | ส่งผล mock exam |
| GET | `/api/ai/generate-questions` | สร้างโจทย์ด้วย AI |
| GET | `/api/classroom/template` | ดาวน์โหลด CSV template |

**หมายเหตุ:** ทุก fetch ต้องใส่ `credentials: 'include'`

---

## Demo Data

```bash
cd server
node prisma/seed-demo-students.js
# สร้าง users a1–a30 (password: 1111)
# โรงเรียนฮั่วเคี้ยว, ป.1/1, ปีการศึกษา 2565 ภาคเรียน 1
# 16 วิชา, คะแนนจริงจาก Excel
# ข้ามถ้ามีอยู่แล้ว (safe to re-run)
```

---

## Student Report หน้า `/student-report.html`

- กลุ่มผลคะแนนตาม `year|term` key
- Section หลัก: score cards ทุกวิชา + bar chart + radar chart (my score vs class avg)
- Section history: ตารางทุก ปี+ภาค พร้อม percentile, rank, avg, SD
- Label format: `"📋 ปีการศึกษา 2565 ภาคเรียน 1"`

## Dashboard หน้า `/dashboard.html`

- Card "คะแนนจากครู (ปีการศึกษา 2565 ภาคเรียน 1)"
- Aggregate row: คะแนนรวม / อันดับ (🥇🥈🥉) / เฉลี่ยห้อง / SD
- ตาราง 8 วิชาล่าสุด + grade color + rank emoji
- ลิงก์ "ดูรายงานเต็ม →" ไป student-report.html

**สถานะ:** พร้อม fine-tune ทีละหน้า

---

## Design System (style.css)

Class หลัก:
- Layout: `.topbar`, `.page`, `.page-wide`, `.card`, `.card-title`
- Form: `.form-group`, `.form-row`
- Button: `.btn`, `.btn-primary`, `.btn-navy`, `.btn-ghost`, `.btn-danger`, `.btn-full`
- Exam: `.exam-layout`, `.question-area`, `.nav-sidebar`, `.question-box`, `.choices`, `.choice-btn`
- Misc: `.badge`, `.badge-success/error/info/warn`, `.msg`, `.table`, `.hidden`

---

## Seed Commands

```bash
cd server
node prisma/seed-attribute-dict.js   # AttributeDictionary 67 รายการ
node prisma/create-admin.js          # admin user (username: admin, password: admin1234)
node prisma/seed-demo-students.js    # demo students 30 คน
```

---

## หมายเหตุสำคัญ

- `difficulty` ใน Question เก็บเป็น String ("1"/"2"/"3") แต่ใน `attributes` เป็น Int
- รูปภาพเก็บใน `server/uploads/` เสิร์ฟที่ `/uploads/`
- Session: `express-session` (cookie-based) — ใช้ `credentials: 'include'` ทุก fetch
- `weakAttributes` ใน ExamResult เป็น flat object `{ "topic:xxx": -2 }` (ติดลบ = ผิด)
- Prisma client ต้อง regenerate ทุกครั้งที่แก้ schema: `npx prisma db push` (ปิด server ก่อน บน Windows)

---

## ขั้นตอน Deploy บน Render

### 1. Environment Variables
```
SESSION_SECRET=<random string>
NODE_ENV=production
```
ถ้าใช้ R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

### 2. Build & Start
- Build: `npm install`
- Start: `npm start`

---

## ขั้นตอน Deploy บน Render
```bash
cd server && npx prisma db push
node prisma/seed-attribute-dict.js
ADMIN_USERNAME=admin ADMIN_PASSWORD=<รหัส> node prisma/create-admin.js
```
