const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();
const data = JSON.parse(fs.readFileSync('./sample_questions.json', 'utf8'));
console.log(data[0]); // สำหรับตรวจสอบเบื้องต้น

async function main() {
  const data = JSON.parse(fs.readFileSync('./sample_questions.json', 'utf8'));

  for (const q of data) {
    try {
      // ✅ เช็กว่า field จำเป็นครบ (id ไม่ต้องเช็กแล้ว)
      if (!q.textTh || !q.textEn || !q.choices || !q.attributes || !q.code) {
        console.warn(`⚠️ ข้อมูลไม่ครบ: code=${q.code || 'ไม่มี'}`);
        continue;
      }

      const created = await prisma.question.create({
        data: {
          // ❌ ไม่ต้องใส่ id → Prisma จะสร้าง cuid ให้เอง
          code: q.code,
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
          score: q.score || 1,
          ownerOrg: q.ownerOrg || 'me',
          createdBy: q.createdBy || 'system',
          updatedBy: q.updatedBy || 'system'
        }
      });

      console.log(`✅ เพิ่มโจทย์ ID: ${created.id} → ${created.code} → ${created.textTh.slice(0, 40)}...`);
    } catch (err) {
      console.error(`❌ เพิ่มโจทย์ล้มเหลว: code=${q.code || 'ไม่มี'}`);
      console.error(err.message);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
