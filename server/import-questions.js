const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

const data = JSON.parse(fs.readFileSync('./sample_questions.json', 'utf8'));
console.log(data[0]); // ← เพิ่มบรรทัดนี้


async function main() {
  const data = JSON.parse(fs.readFileSync('./sample_questions.json', 'utf8'));

  for (const q of data) {
    try {
      // เช็กว่ามี textTh จริง
      if (!q.textTh || !q.textEn || !q.choices || !q.attributes) {
        console.warn(`⚠️ ข้อมูลไม่ครบ: ${q.id || 'ไม่ทราบ ID'}`);
        continue;
      }

      const created = await prisma.question.create({
        data: {
          id: q.id,
          textTh: q.textTh,
          textEn: q.textEn,
          image: q.image || null,
          choices: q.choices,
          answer: q.answer,
          attributes: q.attributes,
          difficulty: q.difficulty,
          source: q.source,
          derivedFrom: q.derivedFrom,
          estimatedTimeSec: q.estimatedTimeSec,
          ownerOrg: q.ownerOrg,
          createdBy: q.createdBy || 'system', 
          updatedBy: q.updatedBy || 'system',
        }
      });

      console.log(`✅ เพิ่มโจทย์ ID: ${created.id} → ${created.textTh.slice(0, 40)}...`);
    } catch (err) {
      console.error(`❌ เพิ่มโจทย์ล้มเหลว: ${q.id || 'ไม่ทราบ ID'}`);
      console.error(err.message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
