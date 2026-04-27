// seed-subject-grade.js
// เพิ่ม subject และ grade entries ใน AttributeDictionary
// รัน: node server/prisma/seed-subject-grade.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const subjects = [
  { key: 'math',    type: 'subject', th: 'คณิตศาสตร์',  en: 'Mathematics' },
  { key: 'science', type: 'subject', th: 'วิทยาศาสตร์',  en: 'Science' },
  { key: 'thai',    type: 'subject', th: 'ภาษาไทย',      en: 'Thai Language' },
  { key: 'english', type: 'subject', th: 'ภาษาอังกฤษ',   en: 'English' },
  { key: 'social',  type: 'subject', th: 'สังคมศึกษา',   en: 'Social Studies' },
];

const grades = [
  { key: 'p1', type: 'grade', th: 'ป.1', en: 'Grade 1', grade: 1 },
  { key: 'p2', type: 'grade', th: 'ป.2', en: 'Grade 2', grade: 2 },
  { key: 'p3', type: 'grade', th: 'ป.3', en: 'Grade 3', grade: 3 },
  { key: 'p4', type: 'grade', th: 'ป.4', en: 'Grade 4', grade: 4 },
  { key: 'p5', type: 'grade', th: 'ป.5', en: 'Grade 5', grade: 5 },
  { key: 'p6', type: 'grade', th: 'ป.6', en: 'Grade 6', grade: 6 },
  { key: 'm1', type: 'grade', th: 'ม.1', en: 'Grade 7',  grade: 7 },
  { key: 'm2', type: 'grade', th: 'ม.2', en: 'Grade 8',  grade: 8 },
  { key: 'm3', type: 'grade', th: 'ม.3', en: 'Grade 9',  grade: 9 },
];

async function main() {
  const entries = [...subjects, ...grades];
  let created = 0;
  for (const e of entries) {
    await prisma.attributeDictionary.upsert({
      where: { key: e.key },
      update: { th: e.th, en: e.en },
      create: e,
    });
    created++;
  }
  console.log(`✅ upserted ${created} entries (subject + grade)`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
