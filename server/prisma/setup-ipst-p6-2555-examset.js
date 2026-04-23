// setup-ipst-p6-2555-examset.js
// สร้าง ExamSetMetadata + ตั้ง questionNo/score สำหรับข้อสอบสสวท ป.6 2555
// รัน: node server/prisma/setup-ipst-p6-2555-examset.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SOURCE = 'ipst-p6-2555';

async function main() {
  // 1) สร้าง ExamSetMetadata
  const existing = await prisma.examSetMetadata.findFirst({
    where: { questionSource: SOURCE }
  });

  if (!existing) {
    await prisma.examSetMetadata.create({
      data: {
        grade: 'p6',
        year: '2555',
        label: 'สสวท คณิตศาสตร์ ป.6 ปี 2555 (สอบคัดเลือกรอบที่ 1)',
        timeLimitSec: 7200,
        blueprint: [
          { section: 1, count: 40, score: 5 },
        ],
        isOfficial: true,
        questionSource: SOURCE,
        createdBy: 'seed',
        isActive: true,
      }
    });
    console.log(`✅ สร้าง ExamSetMetadata: ${SOURCE}`);
  } else {
    console.log('⏭  ExamSetMetadata มีอยู่แล้ว');
  }

  // 2) ดึงโจทย์ทั้งหมดและกรองเฉพาะ source=ipst-p6-2555
  const all = await prisma.question.findMany({ orderBy: { createdAt: 'asc' } });
  const questions = all.filter(q => q.attributes?.source === SOURCE);
  console.log(`พบโจทย์ ${SOURCE}: ${questions.length} ข้อ`);

  if (questions.length === 0) {
    console.log('⚠️  ยังไม่มีโจทย์ — รัน seed-questions-ipst-p6-2555.js ก่อน');
    return;
  }

  // 3) ตั้ง Question.source (top-level) และ questionNo, score ในทุกข้อ
  let updated = 0;
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const attrs = q.attributes || {};
    const qNo = String(i + 1).padStart(3, '0');
    const score = 5;

    const needsUpdate =
      q.source !== SOURCE ||
      attrs.questionNo !== qNo ||
      attrs.score !== score;

    if (needsUpdate) {
      await prisma.question.update({
        where: { id: q.id },
        data: {
          source: SOURCE,
          attributes: { ...attrs, questionNo: qNo, score },
        }
      });
      updated++;
    }
  }
  console.log(`✅ อัปเดต source + questionNo + score ใน ${updated} โจทย์`);

  // แสดงตัวอย่าง 5 ข้อแรก
  const samples = await prisma.question.findMany({
    where: { source: SOURCE },
    select: { textTh: true, content: true, attributes: true, shortAnswer: true },
    take: 5,
    orderBy: { createdAt: 'asc' },
  });
  console.log('\n📋 ตัวอย่างข้อแรก:');
  for (const s of samples) {
    const a = s.attributes;
    const preview = s.textTh ? s.textTh.slice(0, 50) : '[มี content blocks]';
    console.log(`  ข้อ ${a.questionNo} score=${a.score} ans=${s.shortAnswer?.[0] ?? '?'} — ${preview}`);
  }
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
