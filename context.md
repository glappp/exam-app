# context.md — exam-app

> อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง
> อัปเดตล่าสุด: 2026-04-09

---

## Project Overview

คลังข้อสอบออนไลน์สำหรับนักเรียนไทย ป.4–ม.3
- Stack: Node.js + Express + Prisma (SQLite) + Vanilla HTML/CSS/JS
- Repository: https://github.com/glappp/exam-app | Branch หลัก: `main`
- Server รันที่: `http://localhost:3001`
- Auth: session-based (`express-session`) — ทุก fetch ต้องใส่ `credentials: 'include'`

---

## Role System

| Role | ค่าใน DB | สิทธิ์ |
|------|----------|--------|
| `admin` | `"admin"` | Super admin — ทำได้ทุกอย่าง, จัดการโรงเรียน, เปลี่ยน role ใคร |
| `school_admin` | `"school_admin"` | 1 คนต่อโรงเรียน — สร้าง student accounts, อัปโหลดคะแนน, ขยับชั้น (เฉพาะโรงเรียนตัวเอง) |
| `teacher` | `"teacher"` | ดูภาพรวมคะแนนทุกห้องของโรงเรียนตัวเอง (read-only) |
| `student` | `"student"` | ทำข้อสอบ, ดูผลตัวเอง |

- `school_admin` และ `teacher` ผูกกับ `schoolId` (เพิ่มใน Phase 1)
- นักเรียน**ไม่สมัครเอง** — school_admin อัปโหลด CSV → ระบบสร้าง account (username = รหัสนักเรียน, password เริ่มต้น = `1111`)
- register.html ใช้สำหรับ teacher/school_admin เท่านั้น (admin approve role เอง)

---

## Database Models (schema.prisma)

### User
`id`, `username` (unique), `password` (bcrypt), `firstName`, `lastName`, `email`, `role`

### StudentProfile
ผูกกับ User — รองรับหลายปีการศึกษา
`userId`, `academicYear`, `school`, `district`, `province`, `grade`, `classroom`, `studentCode`

### ExamResult
ผูกกับ StudentProfile
`mode`, `score`, `total`, `durationSec`, `questionIds`, `userAnswers`, `weakAttributes`, `examSetCode`

### ClassroomScoreUpload
`uploadedById`, `academicYear`, `term` ("1"/"2"), `school`, `grade`, `subject`, `scores` (JSON), `stats` (JSON)
- `subject = "multi"` → matrix หลายวิชาพร้อมกัน
- `scores` JSON: `[{ studentCode, name, score, fullScore, grade, percentile, userId }]`
- aggregate key: `"year|term"` เช่น `"2565|1"`

### Question
`id` (cuid), `code`, `textTh`, `textEn`, `image`, `choices` (JSON), `answer`, `attributes` (JSON), `difficulty` (String)
- `difficulty` ใน Question เป็น String ("1"/"2"/"3") แต่ใน `attributes` เป็น Int

### MockBlueprint
`name`, `grade`, `timeLimitSec`, `totalQuestions`, `avgPassScore`, `topics` (JSON), `difficulty` (JSON)

### Gamification Models
- `PointTransaction`, `DailyMission`, `CharacterState` — XP, level
- `Announcement`, `AnnouncementRead` — ประกาศ
- `AttributeDictionary` — `key` (PK), `type`, `th`, `en`, `grade`

### Ticket Models (Phase 1)
```
TicketWallet      userId(unique), balance, updatedAt
TicketLog         userId, type, amount, note, createdAt
                  type: 'earn_mission' | 'earn_box' | 'earn_admin' | 'use_competitive'
TicketDailyUsage  userId, date(YYYY-MM-DD ICT), usedCount
                  @@unique([userId, date])
```

---

## API Endpoints หลัก

| Method | Path | หน้าที่ |
|--------|------|--------|
| POST | `/api/login` | Login → set session |
| GET | `/api/me` | session ปัจจุบัน |
| POST | `/api/logout` | Logout |
| GET | `/api/student/me` | User + profile + ผลสอบล่าสุด |
| PUT | `/api/student/profile` | Create/update StudentProfile |
| GET | `/api/classroom/my-scores` | นักเรียนดูคะแนนจากครู |
| GET | `/api/classroom/students` | รายชื่อนักเรียน |
| POST | `/api/classroom/score-entry` | กรอกคะแนนทีละวิชา |
| POST | `/api/classroom/matrix-entry` | กรอกคะแนนหลายวิชาพร้อมกัน |
| GET | `/api/classroom/export/:id` | ดาวน์โหลด CSV |
| GET | `/api/mock/blueprints` | blueprint ทั้งหมด |
| POST | `/api/mock/start` | สร้างชุดข้อสอบ mock |
| POST | `/api/mock/submit` | ส่งผล mock |
| POST | `/api/ai/generate-questions` | สร้างโจทย์ด้วย AI |
| GET | `/api/tickets/balance` | ยอดตั๋ว + ใช้ไปวันนี้ |
| POST | `/api/tickets/use` | หัก 1 ใบ (competitive mode) |

---

## หมายเหตุสำคัญ

- รูปภาพเก็บใน `server/uploads/` เสิร์ฟที่ `/uploads/`
- `weakAttributes` ใน ExamResult: flat object `{ "topic:xxx": -2 }` (ติดลบ = ผิด)
- Prisma: ต้อง `npx prisma db push` ทุกครั้งที่แก้ schema (ปิด server ก่อน บน Windows)
- Reset logic ตั๋ว: 3 AM ICT (UTC+7) — helper อยู่ใน `server/utils/dateICT.js`

---

## ⚠️ ข้อควรระวัง — อ่านก่อนแตะ code ทุกครั้ง

- **อย่าแก้ไข code ที่รันได้ปกติอยู่แล้ว** โดยไม่มีเหตุผล — ถ้า user บอกว่า "เมื่อวานรันได้" ให้เชื่อ และหา root cause จริงๆ ก่อน
- **อย่าเดาว่า code ผิด** แค่เพราะ server start ไม่ติดครั้งแรก — ให้อ่าน error message ให้ครบก่อนแก้

---

## Server Startup (สำคัญมาก)

โครงสร้างโปรเจกต์มี **2 package.json** — อย่าสับสน:

| ไฟล์ | ใช้สำหรับ | Prisma |
|------|-----------|--------|
| `/package.json` (root) | เก่า / ไม่ได้ใช้รัน server | 4.x (เก่า) |
| `/server/package.json` | **server จริง** | 6.x ✅ |

**วิธีรัน server ที่ถูกต้อง:**
```bash
cd server
npm start        # รัน node Index.js จาก server/
```

หรือจาก root:
```bash
npm --prefix server start
```

**launch.json ที่ถูกต้อง** (`.claude/launch.json`):
```json
{
  "configurations": [{
    "name": "Express Server",
    "runtimeExecutable": "npm",
    "runtimeArgs": ["--prefix", "server", "start"],
    "port": 3001
  }]
}
```

**ถ้ารัน server ใน worktree ใหม่ครั้งแรก** ต้อง:
```bash
cd server
npm install                   # ติดตั้ง dependencies
npx prisma generate           # สร้าง Prisma client
```

---

## Seed & Setup

```bash
cd server
node prisma/seed-attribute-dict.js          # AttributeDictionary 67 รายการ
node prisma/create-admin.js                 # admin (username: admin, password: admin1234)
node prisma/seed-demo-students.js           # demo students a1–a30 (password: 1111)
                                            # โรงเรียนฮั่วเคี้ยว ป.1/1 ปี 2565 ภาคเรียน 1
```

---

## Deploy บน Render

```
SESSION_SECRET=<random>
NODE_ENV=production
```
ถ้าใช้ R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

Build: `npm install` | Start: `npm start`

หลัง deploy ครั้งแรก (Render Shell):
```bash
cd server && npx prisma db push
node prisma/seed-attribute-dict.js
ADMIN_USERNAME=admin ADMIN_PASSWORD=<รหัส> node prisma/create-admin.js
```
