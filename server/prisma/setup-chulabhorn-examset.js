// setup-chulabhorn-examset.js
// สร้าง ExamSetMetadata + อัปเดต score/questionNo ในโจทย์จุฬาภรณ์ 2565
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1) สร้าง ExamSetMetadata
  const existing = await prisma.examSetMetadata.findFirst({
    where: { questionSource: 'chulabhorn-2565' }
  });

  if (!existing) {
    await prisma.examSetMetadata.create({
      data: {
        grade: 'p6',
        year: '2565',
        label: 'จุฬาภรณ์ ป.6 ปี 2565',
        timeLimitSec: 5400, // 90 นาที
        blueprint: [
          { section: 1, count: 10, score: 1 },
          { section: 2, count: 10, score: 2 },
          { section: 3, count: 5,  score: 3 },
        ],
        isOfficial: true,
        questionSource: 'chulabhorn-2565',
        createdBy: 'seed',
        isActive: true,
      }
    });
    console.log('✅ สร้าง ExamSetMetadata จุฬาภรณ์ ป.6 2565');
  } else {
    console.log('⏭  ExamSetMetadata มีอยู่แล้ว');
  }

  // 2) ดึงโจทย์จุฬาภรณ์ (source เก็บอยู่ใน attributes เท่านั้น ยังไม่ได้อยู่ใน field)
  const all = await prisma.question.findMany({ orderBy: { createdAt: 'asc' } });
  const questions = all.filter(q => q.attributes?.source === 'chulabhorn-2565');
  console.log(`พบโจทย์จุฬาภรณ์: ${questions.length} ข้อ`);

  // 2b) ย้าย source จาก attributes → Question.source (top-level field)
  for (const q of questions) {
    if (q.source !== 'chulabhorn-2565') {
      await prisma.question.update({ where: { id: q.id }, data: { source: 'chulabhorn-2565' } });
    }
  }
  console.log('✅ set Question.source = chulabhorn-2565');

  // map questionNo ที่ถูกต้อง (27 ข้อ รวม 21.1/21.2/21.3)
  // ตอนที่ 1: ข้อ 1-10 (score=1), ตอนที่ 2: ข้อ 11-20 (score=2), ตอนที่ 3: ข้อ 22-25 (score=3)
  // ข้อ 21 แบ่งเป็น 3 ข้อย่อย → แต่ละข้อได้ score=1 (รวม 3 คะแนนพอดี)
  const scoreMap = (no) => {
    if (no <= 10) return 1;
    if (no <= 20) return 2;
    return 3;
  };

  // เรียงตาม textTh เพื่อจับ sequence
  // ใช้ createdAt เรียง แล้ว assign questionNo ตามลำดับที่ seed
  let updated = 0;
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const attrs = q.attributes || {};
    // คำนวณ questionNo จาก index (i=0 → q1, i=1 → q2, ...)
    // ข้อ 21.2 และ 21.3 ควรได้ questionNo 021 เหมือน 21.1
    // detect จาก textTh ว่าเป็น 21.2/21.3 หรือเปล่า
    const is21sub = q.textTh?.includes('21.2') || q.textTh?.includes('21.3');
    const qNo = is21sub
      ? attrs.questionNo || '021'  // keep 021
      : String(i + 1 - (questions.slice(0, i).filter(x => x.textTh?.includes('21.2') || x.textTh?.includes('21.3')).length)).padStart(3, '0');

    const numericNo = parseInt(qNo);
    // ข้อ 21.1/21.2/21.3 → score=1 ต่อข้อ (ทั้ง 3 ข้อรวมกัน = 3 คะแนนของตอนที่ 3)
    const is21group = is21sub || numericNo === 21;
    const score = is21group ? 1 : scoreMap(numericNo);

    if (attrs.questionNo !== qNo || attrs.score !== score) {
      await prisma.question.update({
        where: { id: q.id },
        data: { attributes: { ...attrs, questionNo: qNo, score } }
      });
      updated++;
    }
  }
  console.log(`✅ อัปเดต questionNo + score ใน ${updated} โจทย์`);

  // แสดงตัวอย่าง
  const samples = await prisma.question.findMany({
    where: { source: 'chulabhorn-2565' },
    select: { textTh: true, attributes: true },
    take: 5,
    orderBy: { createdAt: 'asc' }
  });
  for (const s of samples) {
    const a = s.attributes;
    console.log(`  ข้อ ${a.questionNo} score=${a.score} — ${s.textTh.slice(0,40)}`);
  }
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
