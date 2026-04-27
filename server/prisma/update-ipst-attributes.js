// update-ipst-attributes.js
// แก้ attributes ของโจทย์ ipst-p6-2558 ที่มีอยู่ใน DB ให้มี subject และ examGrade
// รัน: node server/prisma/update-ipst-attributes.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const questions = await prisma.question.findMany({
    where: { source: 'ipst-p6-2558' },
    select: { id: true, attributes: true },
  });

  console.log(`พบ ${questions.length} โจทย์ ipst-p6-2558`);

  let updated = 0;
  for (const q of questions) {
    const attrs = q.attributes || {};
    if (attrs.subject === 'math' && attrs.examGrade === 'p6') continue;
    await prisma.question.update({
      where: { id: q.id },
      data: { attributes: { ...attrs, subject: 'math', examGrade: 'p6' } },
    });
    updated++;
  }

  console.log(`✅ updated ${updated} โจทย์`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
