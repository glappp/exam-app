const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync('./import_examset.json', 'utf8'));

  try {
    const created = await prisma.examSetMetadata.create({
      data: {
        id: data.id,
        examType: data.examType,
        year: data.year,
        grade: data.grade,
        questionCount: data.questionCount,
        timeLimitSec: data.timeLimitSec,
        isOfficial: data.isOfficial,
        label: data.label || null,
        isActive: data.isActive ?? true,
      }
    });

    console.log(`✅ เพิ่มชุดข้อสอบ: ${created.label || created.id}`);
  } catch (err) {
    console.error(`❌ เพิ่มชุดข้อสอบล้มเหลว: ${data.id}`);
    console.error(err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
