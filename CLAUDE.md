# CLAUDE.md — exam-app

## การทำงานอัตโนมัติ

ทำงานได้เลยโดยไม่ต้องขออนุญาติก่อน สำหรับ:
- แก้ไขและสร้างไฟล์ในโปรเจกต์นี้
- รัน git add, commit, merge
- รัน npm install, npm run dev, prisma migrate
- รัน server และ test commands

ไม่ต้อง confirm ก่อน เว้นแต่:
- force push ไปยัง remote
- ลบ branch หรือ drop database
- เปลี่ยน production config โดยไม่ได้บอก

## Stack

- Backend: Node.js + Express
- Database: SQLite via Prisma
- Frontend: Vanilla JS
- Deploy: Render.com

## Conventions

- commit message: `type: short description` (feat, fix, docs, refactor)
- ภาษาใน comment และ commit: ไทยได้
- ไม่ต้องสร้าง README หรือ doc file ถ้าไม่ได้ขอ
