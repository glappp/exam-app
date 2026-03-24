// server/prisma/seed-attribute-dict.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const data = [
  // ─── SUBJECT ───────────────────────────────────────────
  { key: 'subject:math',    type: 'subject', th: 'คณิตศาสตร์',  en: 'Mathematics', grade: null },
  { key: 'subject:science', type: 'subject', th: 'วิทยาศาสตร์', en: 'Science',      grade: null },
  { key: 'subject:thai',    type: 'subject', th: 'ภาษาไทย',     en: 'Thai',         grade: null },
  { key: 'subject:english', type: 'subject', th: 'ภาษาอังกฤษ',  en: 'English',      grade: null },
  { key: 'subject:social',  type: 'subject', th: 'สังคมศึกษา',  en: 'Social Studies', grade: null },

  // ─── GRADE ────────────────────────────────────────────
  { key: 'grade:p4', type: 'grade', th: 'ป.4', en: 'Grade 4', grade: 4 },
  { key: 'grade:p5', type: 'grade', th: 'ป.5', en: 'Grade 5', grade: 5 },
  { key: 'grade:p6', type: 'grade', th: 'ป.6', en: 'Grade 6', grade: 6 },
  { key: 'grade:m1', type: 'grade', th: 'ม.1', en: 'Grade 7', grade: 7 },
  { key: 'grade:m2', type: 'grade', th: 'ม.2', en: 'Grade 8', grade: 8 },
  { key: 'grade:m3', type: 'grade', th: 'ม.3', en: 'Grade 9', grade: 9 },

  // ─── TOPIC: MATH ป.4 ──────────────────────────────────
  { key: 'topic:numbers-p4',      type: 'topic', th: 'จำนวนนับและการดำเนินการ (ป.4)',  en: 'Numbers and Operations (Grade 4)',  grade: 4 },
  { key: 'topic:fractions-p4',    type: 'topic', th: 'เศษส่วน (ป.4)',                  en: 'Fractions (Grade 4)',               grade: 4 },
  { key: 'topic:decimals-p4',     type: 'topic', th: 'ทศนิยม (ป.4)',                   en: 'Decimals (Grade 4)',                grade: 4 },
  { key: 'topic:geometry-p4',     type: 'topic', th: 'เรขาคณิต (ป.4)',                 en: 'Geometry (Grade 4)',                grade: 4 },
  { key: 'topic:measurement-p4',  type: 'topic', th: 'การวัด (ป.4)',                   en: 'Measurement (Grade 4)',             grade: 4 },
  { key: 'topic:statistics-p4',   type: 'topic', th: 'สถิติและความน่าจะเป็น (ป.4)',    en: 'Statistics and Probability (Grade 4)', grade: 4 },

  // ─── TOPIC: MATH ป.5 ──────────────────────────────────
  { key: 'topic:numbers-p5',      type: 'topic', th: 'จำนวนนับและการดำเนินการ (ป.5)',  en: 'Numbers and Operations (Grade 5)',  grade: 5 },
  { key: 'topic:fractions-p5',    type: 'topic', th: 'เศษส่วน (ป.5)',                  en: 'Fractions (Grade 5)',               grade: 5 },
  { key: 'topic:decimals-p5',     type: 'topic', th: 'ทศนิยม (ป.5)',                   en: 'Decimals (Grade 5)',                grade: 5 },
  { key: 'topic:percentage-p5',   type: 'topic', th: 'ร้อยละ (ป.5)',                   en: 'Percentage (Grade 5)',              grade: 5 },
  { key: 'topic:geometry-p5',     type: 'topic', th: 'เรขาคณิต (ป.5)',                 en: 'Geometry (Grade 5)',                grade: 5 },
  { key: 'topic:measurement-p5',  type: 'topic', th: 'การวัด (ป.5)',                   en: 'Measurement (Grade 5)',             grade: 5 },
  { key: 'topic:statistics-p5',   type: 'topic', th: 'สถิติและความน่าจะเป็น (ป.5)',    en: 'Statistics and Probability (Grade 5)', grade: 5 },

  // ─── TOPIC: MATH ป.6 ──────────────────────────────────
  { key: 'topic:numbers-p6',      type: 'topic', th: 'จำนวนนับและการดำเนินการ (ป.6)',  en: 'Numbers and Operations (Grade 6)',  grade: 6 },
  { key: 'topic:fractions-p6',    type: 'topic', th: 'เศษส่วน (ป.6)',                  en: 'Fractions (Grade 6)',               grade: 6 },
  { key: 'topic:decimals-p6',     type: 'topic', th: 'ทศนิยม (ป.6)',                   en: 'Decimals (Grade 6)',                grade: 6 },
  { key: 'topic:percentage-p6',   type: 'topic', th: 'ร้อยละ (ป.6)',                   en: 'Percentage (Grade 6)',              grade: 6 },
  { key: 'topic:ratio-p6',        type: 'topic', th: 'อัตราส่วนและสัดส่วน (ป.6)',      en: 'Ratio and Proportion (Grade 6)',    grade: 6 },
  { key: 'topic:geometry-p6',     type: 'topic', th: 'เรขาคณิต (ป.6)',                 en: 'Geometry (Grade 6)',                grade: 6 },
  { key: 'topic:area-p6',         type: 'topic', th: 'พื้นที่และปริมาตร (ป.6)',        en: 'Area and Volume (Grade 6)',         grade: 6 },
  { key: 'topic:statistics-p6',   type: 'topic', th: 'สถิติและความน่าจะเป็น (ป.6)',    en: 'Statistics and Probability (Grade 6)', grade: 6 },
  { key: 'topic:bodmas-p6',       type: 'topic', th: 'ลำดับการดำเนินการ (ป.6)',        en: 'Order of Operations (Grade 6)',     grade: 6 },

  // ─── TOPIC: MATH ม.1 ──────────────────────────────────
  { key: 'topic:integers-m1',     type: 'topic', th: 'จำนวนเต็ม (ม.1)',                en: 'Integers (Grade 7)',                grade: 7 },
  { key: 'topic:fractions-m1',    type: 'topic', th: 'เศษส่วนและทศนิยม (ม.1)',         en: 'Fractions and Decimals (Grade 7)', grade: 7 },
  { key: 'topic:ratio-m1',        type: 'topic', th: 'อัตราส่วนและร้อยละ (ม.1)',       en: 'Ratio and Percentage (Grade 7)',   grade: 7 },
  { key: 'topic:algebra-m1',      type: 'topic', th: 'พีชคณิตเบื้องต้น (ม.1)',         en: 'Basic Algebra (Grade 7)',          grade: 7 },
  { key: 'topic:geometry-m1',     type: 'topic', th: 'เรขาคณิต (ม.1)',                 en: 'Geometry (Grade 7)',               grade: 7 },
  { key: 'topic:statistics-m1',   type: 'topic', th: 'สถิติ (ม.1)',                    en: 'Statistics (Grade 7)',             grade: 7 },

  // ─── TOPIC: MATH ม.2 ──────────────────────────────────
  { key: 'topic:linear-eq-m2',    type: 'topic', th: 'สมการเชิงเส้น (ม.2)',            en: 'Linear Equations (Grade 8)',       grade: 8 },
  { key: 'topic:inequalities-m2', type: 'topic', th: 'อสมการ (ม.2)',                   en: 'Inequalities (Grade 8)',           grade: 8 },
  { key: 'topic:geometry-m2',     type: 'topic', th: 'เรขาคณิต (ม.2)',                 en: 'Geometry (Grade 8)',               grade: 8 },
  { key: 'topic:similarity-m2',   type: 'topic', th: 'ความคล้าย (ม.2)',                en: 'Similarity (Grade 8)',             grade: 8 },
  { key: 'topic:statistics-m2',   type: 'topic', th: 'สถิติ (ม.2)',                    en: 'Statistics (Grade 8)',             grade: 8 },
  { key: 'topic:probability-m2',  type: 'topic', th: 'ความน่าจะเป็น (ม.2)',            en: 'Probability (Grade 8)',            grade: 8 },

  // ─── TOPIC: MATH ม.3 ──────────────────────────────────
  { key: 'topic:quadratic-m3',    type: 'topic', th: 'สมการกำลังสอง (ม.3)',            en: 'Quadratic Equations (Grade 9)',    grade: 9 },
  { key: 'topic:graph-m3',        type: 'topic', th: 'กราฟ (ม.3)',                     en: 'Graphs (Grade 9)',                 grade: 9 },
  { key: 'topic:pythagorean-m3',  type: 'topic', th: 'ทฤษฎีบทพีทาโกรัส (ม.3)',        en: 'Pythagorean Theorem (Grade 9)',    grade: 9 },
  { key: 'topic:circle-m3',       type: 'topic', th: 'วงกลม (ม.3)',                    en: 'Circles (Grade 9)',                grade: 9 },
  { key: 'topic:statistics-m3',   type: 'topic', th: 'สถิติ (ม.3)',                    en: 'Statistics (Grade 9)',             grade: 9 },
  { key: 'topic:probability-m3',  type: 'topic', th: 'ความน่าจะเป็น (ม.3)',            en: 'Probability (Grade 9)',            grade: 9 },

  // ─── SKILL (ไม่ผูกกับ grade) ──────────────────────────
  { key: 'skill:arithmetic',      type: 'skill', th: 'คำนวณตัวเลข',      en: 'Arithmetic Computation',    grade: null },
  { key: 'skill:mental-math',     type: 'skill', th: 'คิดเลขในใจ',        en: 'Mental Math',               grade: null },
  { key: 'skill:estimation',      type: 'skill', th: 'การประมาณค่า',      en: 'Estimation',                grade: null },
  { key: 'skill:word-problem',    type: 'skill', th: 'โจทย์ปัญหา',        en: 'Word Problem',              grade: null },
  { key: 'skill:visual-reasoning',type: 'skill', th: 'การใช้รูปภาพ/แผนภาพ', en: 'Visual Reasoning',       grade: null },
  { key: 'skill:pattern',         type: 'skill', th: 'รูปแบบและลำดับ',    en: 'Pattern Recognition',       grade: null },
  { key: 'skill:multi-step',      type: 'skill', th: 'หลายขั้นตอน',       en: 'Multi-step Problem',        grade: null },
  { key: 'skill:formula',         type: 'skill', th: 'ใช้สูตร',           en: 'Apply Formula',             grade: null },
  { key: 'skill:conversion',      type: 'skill', th: 'แปลงหน่วย',         en: 'Unit Conversion',           grade: null },
  { key: 'skill:proof',           type: 'skill', th: 'การพิสูจน์/อ้างเหตุผล', en: 'Proof and Reasoning',  grade: null },

  // ─── TRAP (ไม่ผูกกับ grade) ───────────────────────────
  { key: 'trap:misread',          type: 'trap', th: 'อ่านโจทย์ผิด',           en: 'Misread the Question',      grade: null },
  { key: 'trap:wrong-unit',       type: 'trap', th: 'หน่วยผิด',               en: 'Wrong Unit',                grade: null },
  { key: 'trap:misorder',         type: 'trap', th: 'ลำดับการคำนวณผิด',       en: 'Wrong Order of Operations', grade: null },
  { key: 'trap:confusing-choice', type: 'trap', th: 'ตัวเลือกใกล้เคียงกัน',   en: 'Confusing Similar Choices', grade: null },
  { key: 'trap:sign-error',       type: 'trap', th: 'สับสนเรื่องเครื่องหมาย', en: 'Sign Error',                grade: null },
  { key: 'trap:partial-answer',   type: 'trap', th: 'ตอบแค่บางส่วน',          en: 'Partial Answer',            grade: null },
  { key: 'trap:extra-info',       type: 'trap', th: 'ข้อมูลเกิน/หลอก',        en: 'Misleading Extra Info',     grade: null },
  { key: 'trap:rounding',         type: 'trap', th: 'ปัดเศษผิด',              en: 'Rounding Error',            grade: null },
];

async function main() {
  let created = 0;
  let updated = 0;

  for (const item of data) {
    const existing = await prisma.attributeDictionary.findUnique({ where: { key: item.key } });
    if (existing) {
      await prisma.attributeDictionary.update({ where: { key: item.key }, data: item });
      updated++;
    } else {
      await prisma.attributeDictionary.create({ data: item });
      created++;
    }
  }

  console.log(`✅ Seed เสร็จสิ้น: สร้างใหม่ ${created} รายการ, อัปเดต ${updated} รายการ`);
}

main()
  .catch(e => { console.error('❌ Seed ล้มเหลว:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
