const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

const data = JSON.parse(fs.readFileSync('./sample_questions.json', 'utf8'));
console.log(data[0]); // สำหรับตรวจสอบเบื้องต้น

async function main() {
  const data = JSON.parse(fs.readFileSync('./sample_questions.json', 'utf8'));

  for (const q of data) {
    try {
      // เช็กว่า field จำเป็นครบ
      if (!q.textTh || !q.textEn || !q.choices || !q.attributes) {
        console.warn(`⚠️ ข้อมูลไม่ครบ: ${q.id || 'ไม่ทราบ ID'}`);
        continue;
      }

    const created = await prisma.question.create({
      data: {
    id: q.id,
    code: q.code, // ✅ เพิ่มบรรทัดนี้
    textTh: q.textTh,
    textEn: q.textEn,
    image: q.image || null,
    choices: q.choices || [],
    answer: typeof q.answer === 'number' ? q.answer : null,
    shortAnswer: q.shortAnswer || null,
    attributes: q.attributes,
    source: q.source || null,
    derivedFrom: q.derivedFrom || null,
    estimatedTimeSec: q.estimatedTimeSec || null,
    ownerOrg: q.ownerOrg,
    createdBy: q.createdBy || 'system',
    updatedBy: q.updatedBy || 'system'
  }
});


      console.log(`✅ เพิ่มโจทย์ ID: ${created.id} → ${created.textTh.slice(0, 40)}...`);
    } catch (err) {
      console.error(`❌ เพิ่มโจทย์ล้มเหลว: ${q.id || 'ไม่ทราบ ID'}`);
      console.error(err.message);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
