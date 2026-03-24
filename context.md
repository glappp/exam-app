# context.md — exam-app

> อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง

---

## Project Overview

คลังข้อสอบออนไลน์สำหรับนักเรียนไทย ป.4–ม.3
- Stack: Node.js + Express + Prisma (SQLite) + Vanilla HTML/CSS/JS
- Repository: https://github.com/glappp/exam-app

---

## โครงสร้างไฟล์สำคัญ

```
server/
  Index.js                        — Entry point, routes หลัก, /add-question
  prisma/
    schema.prisma                 — Database schema
    seed.js                       — Seed ExamSetMetadata
    seed-attribute-dict.js        — Seed AttributeDictionary (subject/grade/topic/skill/trap)
  routes/
    login.js, register.js
    questions.js                  — GET /all, GET /:id, PUT /:id
    results.js
    exam-options.js
    api/
      attributeDictRoute.js       — CRUD /api/attribute-dict
      exam-set-random.js
      exam-set-official.js
      exam-sets.js
      submit-exam.js

client/
  login.html, dashboard.html
  practice.html
  test-competitive.html, exam-official.html
  add-question.html               — เพิ่มโจทย์ใหม่ (redesigned)
  edit-question.html              — แก้ไขโจทย์ (?id=xxx)
  list-questions.html             — รายการโจทย์ + ปุ่มแก้ไข
  attribute-dict.html             — จัดการ AttributeDictionary
  style.css                       — Design system
```

---

## Database Models (schema.prisma)

### Question
- `id` — cuid (auto)
- `code` — human-readable เช่น `p6-pcc-2022-o-q001`
- `textTh`, `textEn` — โจทย์ภาษาไทย/อังกฤษ
- `image` — path รูปภาพ
- `choices` — JSON array of `{ textTh, textEn, image }`
- `answer` — index คำตอบที่ถูก
- `attributes` — JSON โครงสร้างดังนี้:
  ```json
  {
    "subject": "math",
    "examGrade": "grade:p6",
    "year": "2022",
    "topic": ["topic:fractions-p6"],
    "skill": ["skill:mental-math"],
    "trap": ["trap:misread"],
    "difficulty": 2
  }
  ```
- `difficulty` — String ("1"/"2"/"3")
- `source`, `ownerOrg`, `createdBy`, `updatedBy`

### AttributeDictionary
- `key` — PK เช่น `topic:area-p6`, `skill:mental-math`, `subject:math`, `grade:p4`
- `type` — `"subject"` | `"grade"` | `"topic"` | `"skill"` | `"trap"`
- `th` — ชื่อภาษาไทย (แสดงใน UI)
- `en` — ชื่อภาษาอังกฤษ (ใช้สำหรับ AI วิเคราะห์)
- `grade` — Int หรือ null (ผูกกับ topic เท่านั้น)

### User / StudentProfile / ExamResult
- User → StudentProfile (1 user หลาย profile ตามปีการศึกษา)
- StudentProfile → ExamResult
- ยังไม่ได้ต่อสายกับ session (งานที่ค้าง)

---

## API Endpoints

| Method | Path | หน้าที่ |
|--------|------|--------|
| POST | `/api/login` | Login |
| GET | `/api/me` | ดู session ปัจจุบัน |
| POST | `/api/logout` | Logout |
| GET | `/api/attribute-dict` | ดึง AttributeDictionary (filter: ?type=, ?grade=) |
| POST | `/api/attribute-dict` | เพิ่ม attribute |
| PUT | `/api/attribute-dict/:key` | แก้ไข attribute |
| DELETE | `/api/attribute-dict/:key` | ลบ attribute |
| GET | `/questions/all` | ดึงโจทย์ทั้งหมด |
| GET | `/questions/:id` | ดึงโจทย์รายข้อ |
| PUT | `/questions/:id` | แก้ไขโจทย์ |
| POST | `/add-question` | เพิ่มโจทย์ใหม่ (multipart/form-data) |
| GET | `/api/exam-set` | สุ่มข้อสอบ |
| GET | `/api/exam-set-official` | ข้อสอบจริง |
| POST | `/api/submit-exam` | ส่งคำตอบ |

---

## การ Seed ข้อมูลเริ่มต้น

```bash
# Seed AttributeDictionary (subject/grade/topic/skill/trap สำหรับ math ป.4–ม.3)
node server/prisma/seed-attribute-dict.js
```

---

## งานที่ค้าง (ยังไม่ได้ทำ)

- [ ] ระบบ student personal database
  - เพิ่ม `studentProfileId` ใน session ตั้งแต่ login
  - API `/api/my-profile` และ `/api/my-history`
  - Dashboard แสดงประวัติและจุดอ่อนส่วนตัว
- [ ] GUI redesign (login/dashboard/practice/exam) — มีไฟล์แล้วแต่ยังไม่ commit

---

## หมายเหตุสำคัญ

- รอให้ผู้ใช้อนุมัติก่อนแก้ code ทุกครั้ง
- `difficulty` ใน Question เก็บเป็น String ("1"/"2"/"3") แต่ใน attributes เก็บเป็น Int
- รูปภาพเก็บใน `server/uploads/` และเสิร์ฟที่ `/uploads/`
- Session ใช้ `express-session` (cookie-based) — ต้องใช้ `credentials: include` ทุก fetch
