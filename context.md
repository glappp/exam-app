# context.md — exam-app

> อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง
> อัปเดตล่าสุด: 2026-03-28

---

## Project Overview

คลังข้อสอบออนไลน์สำหรับนักเรียนไทย ป.4–ม.3
- Stack: Node.js + Express + Prisma (SQLite) + Vanilla HTML/CSS/JS
- Repository: https://github.com/glappp/exam-app | Branch หลัก: `main`

---

## สถานะระบบ (2026-03-28)

ระบบหลัก **ใช้งานได้จริงแล้ว** ครบ flow:
`login → เลือกโหมด → ทำข้อสอบ → submit → dashboard แสดงผล`

Authentication ใช้ **session-based** (`express-session`) ทุกหน้าแล้ว — ไม่มี localStorage อีกต่อไป

**พร้อม deploy บน Render แล้ว** (ดูขั้นตอน deploy ที่ด้านล่าง)

---

## โครงสร้างไฟล์สำคัญ

```
server/
  Index.js                        — Entry point, multer upload, routes
  storage.js                      — Abstraction layer: local multer / Cloudflare R2
  prisma/
    schema.prisma                 — Database schema (8 models)
    seed.js                       — Seed ExamSetMetadata
    seed-attribute-dict.js        — Seed AttributeDictionary (67 entries)
    create-admin.js               — สร้าง admin user ครั้งแรก
    dev.db                        — SQLite database
  routes/
    register.js, results.js, questions.js, exam-options.js
    api/
      attributeDictRoute.js       — CRUD /api/attribute-dict
      student.js                  — /api/student/me, /profile, /history
      admin.js                    — /api/admin/users, /results, /stats, PATCH role
      exam-set-random.js
      exam-set-official.js
      exam-sets.js
      submit-exam.js              — ตรวจคำตอบ + บันทึก ExamResult ลง StudentProfile

client/
  style.css                       — Design system (topbar, card, btn, table, badge, ...)
  login.html                      — Card layout, session auth
  register.html                   — Card layout, validation, auto-redirect
  dashboard.html                  — Stats, mode buttons, profile form, exam history, weakness chart
  practice.html                   — Session auth, topbar
  script.js                       — Practice mode logic (session tracking, submit, results)
  exam.html                       — Mode-card UI (official / practice)
  exam-official.html              — ข้อสอบจริง: session auth, timer, durationSec
  test-competitive.html           — สอบแข่งขัน: session auth, timer, durationSec
  result-competitive.html         — ผลสอบ (อ่านจาก localStorage, design system ใหม่)
  add-question.html               — เพิ่มโจทย์ (redesigned + attribute dict)
  edit-question.html              — แก้ไขโจทย์ + upload รูป
  list-questions.html             — รายการโจทย์ (pagination + filter + design system ใหม่)
  attribute-dict.html             — จัดการ AttributeDictionary
  admin.html                      — จัดการ users + ดูผลสอบ + เปลี่ยน role
```

---

## Database Models (schema.prisma)

### User
`id`, `username` (unique), `password` (bcrypt), `firstName`, `lastName`, `email`, `role` (admin/teacher/student)

### StudentProfile
ผูกกับ User, รองรับหลายปีการศึกษา
`userId`, `academicYear`, `school`, `district`, `province`, `grade`, `classroom`, `studentCode`

### ExamResult
ผูกกับ StudentProfile
`mode` (practice/adaptive/competitive/official), `score`, `total`, `durationSec`,
`questionIds` (JSON), `userAnswers` (JSON), `weakAttributes` (JSON flat map เช่น `{"topic:fractions-p6": -2}`)

### Question
- `id` — cuid
- `code` — human-readable เช่น `p6-pcc-2022-o-q001`
- `textTh`, `textEn`
- `image` — filename ใน `server/uploads/` (หรือ R2 key ถ้าใช้ R2)
- `choices` — JSON array `[{ textTh, textEn, image }]`
- `answer` — index คำตอบที่ถูก
- `attributes` — JSON:
  ```json
  { "subject": "math", "examGrade": "grade:p6", "year": "2022",
    "topic": ["topic:fractions-p6"], "skill": ["skill:mental-math"],
    "trap": ["trap:misread"], "difficulty": 2 }
  ```
- `difficulty` — String ("1"/"2"/"3") — **หมายเหตุ: ใน Question เป็น String แต่ใน attributes เป็น Int**

### AttributeDictionary
- `key` — PK เช่น `topic:area-p6`, `skill:mental-math`, `subject:math`, `grade:p4`
- `type` — `"subject"` | `"grade"` | `"topic"` | `"skill"` | `"trap"`
- `th`, `en`, `grade` (Int หรือ null)

---

## API Endpoints (ครบถ้วน)

| Method | Path | หน้าที่ |
|--------|------|--------|
| POST | `/api/login` | Login → set session |
| GET | `/api/me` | ดู session ปัจจุบัน |
| POST | `/api/logout` | Logout |
| POST | `/api/register` | สมัครสมาชิก + สร้าง StudentProfile |
| GET | `/api/student/me` | User + profile + 10 ผลสอบล่าสุด |
| PUT | `/api/student/profile` | Create/update StudentProfile ตามปีการศึกษา |
| GET | `/api/student/history` | ประวัติสอบ 50 รายการ |
| GET | `/api/admin/users` | รายชื่อ users ทั้งหมด (admin only) |
| GET | `/api/admin/results` | ผลสอบ 100 รายการล่าสุด (admin only) |
| GET | `/api/admin/stats` | สถิติ users/questions/results |
| PATCH | `/api/admin/users/:id/role` | เปลี่ยน role (admin only) |
| GET | `/api/attribute-dict` | ดึง AttributeDictionary |
| POST | `/api/attribute-dict` | เพิ่ม attribute |
| PUT | `/api/attribute-dict/:key` | แก้ไข attribute |
| DELETE | `/api/attribute-dict/:key` | ลบ attribute |
| GET | `/questions` | ดึงโจทย์แบบ paginated (`?page&keyword&difficulty&attrType&attrValue`) |
| GET | `/questions/all` | ดึงโจทย์ทั้งหมด (ใช้ใน practice mode) |
| GET | `/questions/:id` | ดึงโจทย์รายข้อ |
| PUT | `/questions/:id` | แก้ไขโจทย์ (multipart/form-data + images) |
| POST | `/add-question` | เพิ่มโจทย์ใหม่ (multipart/form-data) |
| GET | `/api/exam-set/random` | สุ่มข้อสอบ |
| GET | `/api/exam-set-official` | ข้อสอบจริง |
| POST | `/api/submit-exam` | ส่งคำตอบ → ตรวจ + บันทึก ExamResult |

**หมายเหตุ:** ทุก fetch ต้องใส่ `credentials: 'include'`

---

## Design System (style.css)

Class หลักที่ใช้ข้ามทุกหน้า:
- Layout: `.topbar`, `.page`, `.page-wide`, `.card`, `.card-title`
- Form: `.form-group`, `.form-row`
- Button: `.btn`, `.btn-primary`, `.btn-navy`, `.btn-ghost`, `.btn-danger`, `.btn-full`
- Exam: `.exam-layout`, `.question-area`, `.nav-sidebar`, `.question-box`, `.choices`, `.choice-btn`
- Misc: `.badge`, `.badge-success/error/info/warn`, `.msg`, `.table`, `.hidden`

---

## Seed

```bash
cd server
node prisma/seed-attribute-dict.js   # สร้าง AttributeDictionary 67 รายการ
node prisma/create-admin.js          # สร้าง admin user (username: admin, password: admin1234)
```

---

## Storage: Local vs Cloudflare R2

`server/storage.js` ตรวจ env vars อัตโนมัติ:
- **ไม่มี env** → ใช้ local `server/uploads/` (dev)
- **มี R2 env** → ใช้ Cloudflare R2 (prod)

ไฟล์จะถูกเสิร์ฟที่ `/uploads/:filename` เสมอ (local: static, R2: redirect)

---

## หมายเหตุสำคัญ

- `difficulty` ใน Question เก็บเป็น String ("1"/"2"/"3") แต่ใน `attributes` เป็น Int
- รูปภาพเก็บใน `server/uploads/` เสิร์ฟที่ `/uploads/`
- Session: `express-session` (cookie-based) — ใช้ `credentials: 'include'` ทุก fetch
- `weakAttributes` ใน ExamResult เป็น flat object `{ "topic:xxx": -2, "skill:yyy": -1 }` (ติดลบ = ผิด)
- Admin เข้าได้ที่ `/admin.html` — ต้อง role = `"admin"`

---

## ขั้นตอน Deploy บน Render

### 1. ตั้งค่า Environment Variables บน Render
```
SESSION_SECRET=<random string ยาวๆ>
NODE_ENV=production
```
ถ้าใช้ R2 เพิ่ม:
```
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=...
```

### 2. Build & Start Command
- Build: `npm install`
- Start: `npm start` (รัน `node server/Index.js`)

### 3. หลัง deploy ครั้งแรก (ทำผ่าน Render Shell)
```bash
# สร้าง schema บน DB
cd server && npx prisma db push

# Seed attribute dictionary
node prisma/seed-attribute-dict.js

# สร้าง admin user
ADMIN_USERNAME=admin ADMIN_PASSWORD=<รหัสที่ต้องการ> node prisma/create-admin.js
```

---

## งานที่เหลือ — แบ่งเป็น Phase

### Phase B — Adaptive & Recommendation (2–3 วัน)

1. **Adaptive mode ทำงานจริง**
   - ปุ่ม "ปรับจุดอ่อน" ใน dashboard ยังไป practice ธรรมดา
   - ต้องดึง weakAttributes จาก ExamResult ล่าสุด
   - สร้าง `/api/exam-set/adaptive` → filter questions ตาม weak topics
   - ส่ง `mode: 'adaptive'` ไป submit-exam

2. **Recommendation บน Dashboard**
   - เพิ่ม "แนะนำให้ฝึก" ใต้ weakness chart
   - Rule-based: topic ที่ score ติดลบ → แสดงชื่อ + ปุ่ม "ฝึกเลย"

---

### Phase C — Production Readiness (ครึ่งวัน)

3. **Rate limiting บน `/api/login`**
   - ป้องกัน brute force (เช่น 10 ครั้ง/นาที/IP)
   - ใช้ package `express-rate-limit`

---

### Phase D — Deploy (พร้อมแล้ว)

4. **Deploy จริง** — ทำตามขั้นตอนด้านบน
   - ถ้าใช้ R2: ติดตั้ง bucket + ตั้ง env vars + `npm install @aws-sdk/client-s3 multer-s3`
   - ถ้าไม่ใช้ R2: ได้เลย แต่รูปภาพหายทุก redeploy
