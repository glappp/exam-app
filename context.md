# context.md — exam-app

> อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง
> อัปเดตล่าสุด: 2026-04-03

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

## แผนงานที่รอพัฒนา (Role & School System)

- **Phase 1** — `School` model, `schoolId` ใน User, role `school_admin`, Admin CRUD โรงเรียน
- **Phase 2** — Register ด้วย cascade dropdown (จังหวัด → อำเภอ → โรงเรียน)
- **Phase 3** — school_admin: อัปโหลด CSV roster, ขยับชั้น, reset password
- **Phase 4** — Teacher view: ภาพรวมคะแนนทุกห้อง (read-only)

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

### อื่นๆ
- `PointTransaction`, `DailyMission`, `CharacterState` — Gamification (XP, level)
- `Announcement`, `AnnouncementRead` — ประกาศ
- `AttributeDictionary` — `key` (PK), `type`, `th`, `en`, `grade`

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

---

## ระบบ Gamification — Phase 1-4 (เริ่ม 2026-04-06)

### ภาพรวม dependency chain
```
Phase 1: Ticket Infrastructure → Phase 2: Daily Mission → Phase 3: Box System → Phase 4: Leaderboard Period
```

### Phase 1 — Ticket Infrastructure ✅ (in progress)

**DB Models ใหม่:**
```
TicketWallet      userId(unique), balance, updatedAt
TicketLog         userId, type, amount, note, createdAt
                  type: 'earn_mission' | 'earn_box' | 'earn_admin' | 'use_competitive'
TicketDailyUsage  userId, date(YYYY-MM-DD ICT), usedCount
                  @@unique([userId, date])
```

**Reset logic:** 3 AM ICT (UTC+7) — helper อยู่ใน `server/utils/dateICT.js`

**API:**
- `GET /api/tickets/balance` — ยอดคงเหลือ + ใช้ไปวันนี้กี่ใบ (max 5/วัน)
- `POST /api/tickets/use` — ตรวจ cap → หัก 1 ใบ (ใช้ใน submit-exam เมื่อ competitive + useTicket)

**กฎ:**
- ใช้ได้สูงสุด 5 ใบ/วัน (reset 3 AM ICT)
- สะสมได้ไม่จำกัด
- competitive mode: ถ้า useTicket=true → บันทึก ExamResult, ถ้า false → เล่นได้แต่ไม่บันทึก

### Phase 2 — Daily Mission System (planned)

**DB Models ใหม่:**
```
MissionTemplate   id, name, description, type('question_count'|'session_count'),
                  targetCount, difficulty('easy'|'normal'|'hard'),
                  rewardType('silver_box'|'tickets'), rewardAmount,
                  isActive, school(optional), createdById
MissionProgress   userId, templateId, date(ICT), currentCount,
                  completed, rewardClaimed, completedAt
                  @@unique([userId, templateId, date])
```

**DailyMission model เดิม** → deprecate เมื่อ Phase 2 เสร็จ

**API:**
- `GET /api/missions/today` — missions + progress วันนี้
- `POST /api/missions/progress` — auto-trigger จาก submit-exam
- `GET/POST/PATCH /api/admin/missions` — admin CRUD templates

**Auto-trigger:** submit exam → server ตรวจ mission → ถ้าครบ → สร้าง RewardBox

### Phase 3 — Box System (planned)

**DB Model ใหม่:**
```
RewardBox   id, userId, boxType('silver'|'gold'),
            source('mission_complete'|'leaderboard_win'|'admin_gift'),
            sourceNote, openedAt, rewardJson, createdAt
```

**Loot Table:**
| กล่องเงิน | โอกาส | รางวัล |
|-----------|-------|--------|
| | 70% | ตั๋ว 2 ใบ |
| | 20% | ตั๋ว 3 ใบ |
| | 10% | ตั๋ว 5 ใบ + XP |

| กล่องทอง | โอกาส | รางวัล |
|----------|-------|--------|
| | 40% | ตั๋ว 5 ใบ |
| | 35% | ตั๋ว 10 ใบ |
| | 20% | ตั๋ว 10 ใบ + XP |
| | 5% | ตั๋ว 15 ใบ + XP ใหญ่ |

**API:**
- `GET /api/boxes` — กล่องที่ยังไม่ได้เปิด
- `POST /api/boxes/:id/open` → random reward → เพิ่ม ticket balance

### Phase 4 — Leaderboard Period & Gold Box (planned)

**DB Model ใหม่:**
```
CompetitionPeriod   id, name, startDate, endDate, grade(optional), isActive
```
- Admin กำหนดรอบ 7/14/30 วัน
- หมดรอบ → process top-N → ได้กล่องทอง
- Competitive mode บันทึกคะแนนลง period leaderboard (ต้องใช้ตั๋ว)

---

## หมายเหตุสำคัญ

- รูปภาพเก็บใน `server/uploads/` เสิร์ฟที่ `/uploads/`
- `weakAttributes` ใน ExamResult: flat object `{ "topic:xxx": -2 }` (ติดลบ = ผิด)
- Prisma: ต้อง `npx prisma db push` ทุกครั้งที่แก้ schema (ปิด server ก่อน บน Windows)

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
