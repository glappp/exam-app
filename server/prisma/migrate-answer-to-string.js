// migrate-answer-to-string.js — แปลง answer: Int → String ('a'/'b'/'c'/'d')
// รันก่อน prisma db push
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1) แปลง Question.answer จาก Int เป็น 'a'/'b'/'c'/'d'
  await prisma.$executeRawUnsafe(`
    UPDATE "Question" SET answer = CASE CAST(answer AS INTEGER)
      WHEN 0 THEN 'a' WHEN 1 THEN 'b' WHEN 2 THEN 'c' WHEN 3 THEN 'd'
      ELSE NULL END
    WHERE answer IS NOT NULL
      AND answer NOT IN ('a','b','c','d')
  `);
  const qCount = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as n FROM "Question" WHERE answer IN ('a','b','c','d')`);
  console.log(`✅ Question.answer แปลงแล้ว ${qCount[0].n} แถว`);

  // 2) เพิ่ม type column ใน Question (ถ้ายังไม่มี)
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'mc'
  `).catch(() => {
    // SQLite ไม่รองรับ IF NOT EXISTS — ถ้า error แปลว่ามีแล้ว (ข้ามได้)
  });

  // 3) เพิ่ม selectedAnswer column ใน ExamAnswer (ถ้ายังไม่มี)
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ExamAnswer" ADD COLUMN "selectedAnswer" TEXT NOT NULL DEFAULT 'a'
  `).catch(() => {});

  // 4) populate selectedAnswer จาก selectedIdx
  await prisma.$executeRawUnsafe(`
    UPDATE "ExamAnswer" SET selectedAnswer = CASE selectedIdx
      WHEN 0 THEN 'a' WHEN 1 THEN 'b' WHEN 2 THEN 'c' WHEN 3 THEN 'd'
      ELSE 'a' END
  `);
  const aCount = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as n FROM "ExamAnswer"`);
  console.log(`✅ ExamAnswer.selectedAnswer แปลงแล้ว ${aCount[0].n} แถว`);

  console.log('\n✅ Migration เสร็จ — รัน prisma db push ต่อได้เลย');
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
