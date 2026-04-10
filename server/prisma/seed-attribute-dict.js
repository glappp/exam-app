// server/prisma/seed-attribute-dict.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const data = [
  // ─── TOPIC (grade: null = ข้ามชั้น) ──────────────────────────────────────
  { key: 'topic:whole-numbers',       type: 'topic', th: 'จำนวนนับและการดำเนินการ',  en: 'Whole Numbers and Operations', grade: null, minGrade: null },
  { key: 'topic:fractions',           type: 'topic', th: 'เศษส่วน',                  en: 'Fractions',                    grade: null, minGrade: null },
  { key: 'topic:decimals',            type: 'topic', th: 'ทศนิยม',                   en: 'Decimals',                     grade: null, minGrade: null },
  { key: 'topic:percentage',          type: 'topic', th: 'ร้อยละ',                   en: 'Percentage',                   grade: null, minGrade: null },
  { key: 'topic:ratio',               type: 'topic', th: 'อัตราส่วนและสัดส่วน',      en: 'Ratio and Proportion',         grade: null, minGrade: null },
  { key: 'topic:geometry',            type: 'topic', th: 'เรขาคณิต',                 en: 'Geometry',                     grade: null, minGrade: null },
  { key: 'topic:measurement',         type: 'topic', th: 'การวัด',                   en: 'Measurement',                  grade: null, minGrade: null },
  { key: 'topic:area-volume',         type: 'topic', th: 'พื้นที่และปริมาตร',        en: 'Area and Volume',              grade: null, minGrade: null },
  { key: 'topic:statistics',          type: 'topic', th: 'สถิติ',                    en: 'Statistics',                   grade: null, minGrade: null },
  { key: 'topic:order-of-operations', type: 'topic', th: 'ลำดับการดำเนินการ',        en: 'Order of Operations',          grade: null, minGrade: null },

  // ─── SUBTOPIC: whole-numbers ──────────────────────────────────────────────
  { key: 'subtopic:whole-numbers-read-write',   type: 'subtopic', th: 'การอ่านและเขียนจำนวน',          en: 'Reading and Writing Numbers',     grade: null, minGrade: 4 },
  { key: 'subtopic:whole-numbers-compare',      type: 'subtopic', th: 'การเปรียบเทียบและเรียงลำดับ',   en: 'Comparing and Ordering',          grade: null, minGrade: 4 },
  { key: 'subtopic:whole-numbers-add',          type: 'subtopic', th: 'การบวก',                        en: 'Addition',                        grade: null, minGrade: 4 },
  { key: 'subtopic:whole-numbers-subtract',     type: 'subtopic', th: 'การลบ',                         en: 'Subtraction',                     grade: null, minGrade: 4 },
  { key: 'subtopic:whole-numbers-multiply',     type: 'subtopic', th: 'การคูณ',                        en: 'Multiplication',                  grade: null, minGrade: 4 },
  { key: 'subtopic:whole-numbers-divide',       type: 'subtopic', th: 'การหาร',                        en: 'Division',                        grade: null, minGrade: 4 },
  { key: 'subtopic:whole-numbers-word-problem', type: 'subtopic', th: 'โจทย์ปัญหา',                   en: 'Word Problems',                   grade: null, minGrade: 4 },

  // ─── SUBTOPIC: fractions ──────────────────────────────────────────────────
  { key: 'subtopic:fractions-concept',      type: 'subtopic', th: 'ความหมายและการอ่านเศษส่วน',    en: 'Fraction Concepts',               grade: null, minGrade: 4 },
  { key: 'subtopic:fractions-compare',      type: 'subtopic', th: 'การเปรียบเทียบเศษส่วน',        en: 'Comparing Fractions',             grade: null, minGrade: 4 },
  { key: 'subtopic:fractions-add-like',     type: 'subtopic', th: 'การบวกเศษส่วนเหมือนส่วน',     en: 'Adding Like Fractions',           grade: null, minGrade: 4 },
  { key: 'subtopic:fractions-add-unlike',   type: 'subtopic', th: 'การบวกเศษส่วนต่างส่วน',       en: 'Adding Unlike Fractions',         grade: null, minGrade: 5 },
  { key: 'subtopic:fractions-subtract',     type: 'subtopic', th: 'การลบเศษส่วน',                 en: 'Subtracting Fractions',           grade: null, minGrade: 4 },
  { key: 'subtopic:fractions-multiply',     type: 'subtopic', th: 'การคูณเศษส่วน',                en: 'Multiplying Fractions',           grade: null, minGrade: 5 },
  { key: 'subtopic:fractions-divide',       type: 'subtopic', th: 'การหารเศษส่วน',                en: 'Dividing Fractions',              grade: null, minGrade: 5 },
  { key: 'subtopic:fractions-mixed',        type: 'subtopic', th: 'เศษเกินและจำนวนคละ',           en: 'Mixed Numbers',                   grade: null, minGrade: 4 },
  { key: 'subtopic:fractions-word-problem', type: 'subtopic', th: 'โจทย์ปัญหาเศษส่วน',           en: 'Fraction Word Problems',          grade: null, minGrade: 4 },

  // ─── SUBTOPIC: decimals ───────────────────────────────────────────────────
  { key: 'subtopic:decimals-concept',      type: 'subtopic', th: 'ความหมายและการอ่านทศนิยม',  en: 'Decimal Concepts',                grade: null, minGrade: 4 },
  { key: 'subtopic:decimals-compare',      type: 'subtopic', th: 'การเปรียบเทียบทศนิยม',      en: 'Comparing Decimals',              grade: null, minGrade: 4 },
  { key: 'subtopic:decimals-add',          type: 'subtopic', th: 'การบวกทศนิยม',               en: 'Adding Decimals',                 grade: null, minGrade: 4 },
  { key: 'subtopic:decimals-subtract',     type: 'subtopic', th: 'การลบทศนิยม',                en: 'Subtracting Decimals',            grade: null, minGrade: 4 },
  { key: 'subtopic:decimals-multiply',     type: 'subtopic', th: 'การคูณทศนิยม',               en: 'Multiplying Decimals',            grade: null, minGrade: 5 },
  { key: 'subtopic:decimals-divide',       type: 'subtopic', th: 'การหารทศนิยม',               en: 'Dividing Decimals',               grade: null, minGrade: 5 },
  { key: 'subtopic:decimals-convert',      type: 'subtopic', th: 'การแปลงเศษส่วนและทศนิยม',   en: 'Converting Fractions/Decimals',   grade: null, minGrade: 4 },
  { key: 'subtopic:decimals-word-problem', type: 'subtopic', th: 'โจทย์ปัญหาทศนิยม',          en: 'Decimal Word Problems',           grade: null, minGrade: 4 },

  // ─── SUBTOPIC: percentage ─────────────────────────────────────────────────
  { key: 'subtopic:percentage-concept',      type: 'subtopic', th: 'ความหมายร้อยละ',                   en: 'Percentage Concepts',          grade: null, minGrade: 5 },
  { key: 'subtopic:percentage-convert',      type: 'subtopic', th: 'แปลงร้อยละ↔เศษส่วน↔ทศนิยม',       en: 'Converting Percentages',       grade: null, minGrade: 5 },
  { key: 'subtopic:percentage-of-amount',    type: 'subtopic', th: 'หาร้อยละของจำนวน',                 en: 'Finding Percentage of Amount', grade: null, minGrade: 5 },
  { key: 'subtopic:percentage-word-problem', type: 'subtopic', th: 'โจทย์ปัญหาร้อยละ',                en: 'Percentage Word Problems',     grade: null, minGrade: 5 },

  // ─── SUBTOPIC: ratio ──────────────────────────────────────────────────────
  { key: 'subtopic:ratio-concept',      type: 'subtopic', th: 'ความหมายอัตราส่วน',      en: 'Ratio Concepts',       grade: null, minGrade: 6 },
  { key: 'subtopic:ratio-simplify',     type: 'subtopic', th: 'การทำอัตราส่วนให้ง่าย',  en: 'Simplifying Ratios',   grade: null, minGrade: 6 },
  { key: 'subtopic:ratio-proportion',   type: 'subtopic', th: 'สัดส่วน',                en: 'Proportion',           grade: null, minGrade: 6 },
  { key: 'subtopic:ratio-word-problem', type: 'subtopic', th: 'โจทย์ปัญหาอัตราส่วน',   en: 'Ratio Word Problems',  grade: null, minGrade: 6 },

  // ─── SUBTOPIC: geometry ───────────────────────────────────────────────────
  { key: 'subtopic:geometry-shapes',        type: 'subtopic', th: 'รูปเรขาคณิตพื้นฐาน',   en: 'Basic Shapes',        grade: null, minGrade: 4 },
  { key: 'subtopic:geometry-angle',         type: 'subtopic', th: 'มุมและการวัดมุม',        en: 'Angles',              grade: null, minGrade: 4 },
  { key: 'subtopic:geometry-triangle',      type: 'subtopic', th: 'สามเหลี่ยม',             en: 'Triangles',           grade: null, minGrade: 4 },
  { key: 'subtopic:geometry-quadrilateral', type: 'subtopic', th: 'สี่เหลี่ยม',             en: 'Quadrilaterals',      grade: null, minGrade: 4 },
  { key: 'subtopic:geometry-circle',        type: 'subtopic', th: 'วงกลม',                  en: 'Circles',             grade: null, minGrade: 5 },
  { key: 'subtopic:geometry-symmetry',      type: 'subtopic', th: 'สมมาตร',                 en: 'Symmetry',            grade: null, minGrade: 4 },
  { key: 'subtopic:geometry-coordinate',    type: 'subtopic', th: 'กราฟและพิกัด',           en: 'Coordinates',         grade: null, minGrade: 6 },

  // ─── SUBTOPIC: measurement ────────────────────────────────────────────────
  { key: 'subtopic:measurement-length',       type: 'subtopic', th: 'ความยาวและระยะทาง', en: 'Length and Distance',  grade: null, minGrade: 4 },
  { key: 'subtopic:measurement-weight',       type: 'subtopic', th: 'น้ำหนัก',            en: 'Weight',               grade: null, minGrade: 4 },
  { key: 'subtopic:measurement-liquid',       type: 'subtopic', th: 'ปริมาณของเหลว',      en: 'Liquid Volume',        grade: null, minGrade: 4 },
  { key: 'subtopic:measurement-time',         type: 'subtopic', th: 'เวลา',               en: 'Time',                 grade: null, minGrade: 4 },
  { key: 'subtopic:measurement-convert',      type: 'subtopic', th: 'การแปลงหน่วยวัด',   en: 'Unit Conversion',      grade: null, minGrade: 4 },
  { key: 'subtopic:measurement-word-problem', type: 'subtopic', th: 'โจทย์ปัญหาการวัด',  en: 'Measurement Problems', grade: null, minGrade: 4 },

  // ─── SUBTOPIC: area-volume ────────────────────────────────────────────────
  { key: 'subtopic:area-rectangle',     type: 'subtopic', th: 'พื้นที่สี่เหลี่ยมมุมฉาก',      en: 'Rectangle Area',       grade: null, minGrade: 5 },
  { key: 'subtopic:area-triangle',      type: 'subtopic', th: 'พื้นที่สามเหลี่ยม',             en: 'Triangle Area',        grade: null, minGrade: 6 },
  { key: 'subtopic:area-parallelogram', type: 'subtopic', th: 'พื้นที่สี่เหลี่ยมด้านขนาน',    en: 'Parallelogram Area',   grade: null, minGrade: 6 },
  { key: 'subtopic:area-trapezoid',     type: 'subtopic', th: 'พื้นที่สี่เหลี่ยมคางหมู',      en: 'Trapezoid Area',       grade: null, minGrade: 6 },
  { key: 'subtopic:area-combined',      type: 'subtopic', th: 'พื้นที่รูปซับซ้อน',            en: 'Combined Area',        grade: null, minGrade: 6 },
  { key: 'subtopic:volume-cuboid',      type: 'subtopic', th: 'ปริมาตรทรงสี่เหลี่ยมมุมฉาก',   en: 'Cuboid Volume',        grade: null, minGrade: 6 },
  { key: 'subtopic:area-word-problem',  type: 'subtopic', th: 'โจทย์ปัญหาพื้นที่และปริมาตร',  en: 'Area/Volume Problems', grade: null, minGrade: 5 },

  // ─── SUBTOPIC: statistics ─────────────────────────────────────────────────
  { key: 'subtopic:statistics-read-table',   type: 'subtopic', th: 'การอ่านตาราง',       en: 'Reading Tables',      grade: null, minGrade: 4 },
  { key: 'subtopic:statistics-read-chart',   type: 'subtopic', th: 'การอ่านแผนภูมิ',     en: 'Reading Charts',      grade: null, minGrade: 4 },
  { key: 'subtopic:statistics-bar-chart',    type: 'subtopic', th: 'แผนภูมิแท่ง',        en: 'Bar Charts',          grade: null, minGrade: 4 },
  { key: 'subtopic:statistics-line-chart',   type: 'subtopic', th: 'แผนภูมิเส้น',        en: 'Line Charts',         grade: null, minGrade: 5 },
  { key: 'subtopic:statistics-pie-chart',    type: 'subtopic', th: 'แผนภูมิวงกลม',       en: 'Pie Charts',          grade: null, minGrade: 6 },
  { key: 'subtopic:statistics-mean',         type: 'subtopic', th: 'ค่าเฉลี่ย',          en: 'Mean',                grade: null, minGrade: 5 },
  { key: 'subtopic:statistics-word-problem', type: 'subtopic', th: 'โจทย์ปัญหาสถิติ',    en: 'Statistics Problems', grade: null, minGrade: 4 },

  // ─── SUBTOPIC: order-of-operations ───────────────────────────────────────
  { key: 'subtopic:bodmas-basic',        type: 'subtopic', th: 'ลำดับการดำเนินการพื้นฐาน', en: 'Basic Order of Operations', grade: null, minGrade: 6 },
  { key: 'subtopic:bodmas-brackets',     type: 'subtopic', th: 'การใช้วงเล็บ',              en: 'Using Brackets',            grade: null, minGrade: 6 },
  { key: 'subtopic:bodmas-mixed',        type: 'subtopic', th: 'ผสมหลายการดำเนินการ',       en: 'Mixed Operations',          grade: null, minGrade: 6 },
  { key: 'subtopic:bodmas-word-problem', type: 'subtopic', th: 'โจทย์ปัญหา',               en: 'Word Problems',             grade: null, minGrade: 6 },

  // ─── SKILL ────────────────────────────────────────────────────────────────
  { key: 'skill:arithmetic',       type: 'skill', th: 'คำนวณตัวเลขตรงๆ',          en: 'Arithmetic Computation', grade: null, minGrade: null },
  { key: 'skill:mental-math',      type: 'skill', th: 'คิดเลขในใจ',                en: 'Mental Math',            grade: null, minGrade: null },
  { key: 'skill:estimation',       type: 'skill', th: 'ประมาณค่า',                 en: 'Estimation',             grade: null, minGrade: null },
  { key: 'skill:word-problem',     type: 'skill', th: 'แปลโจทย์ปัญหาเป็นสมการ',   en: 'Word Problem Solving',   grade: null, minGrade: null },
  { key: 'skill:visual-reasoning', type: 'skill', th: 'ใช้รูปภาพหรือแผนภาพช่วย', en: 'Visual Reasoning',       grade: null, minGrade: null },
  { key: 'skill:multi-step',       type: 'skill', th: 'แก้ปัญหาหลายขั้นตอน',      en: 'Multi-step Problem',     grade: null, minGrade: null },
  { key: 'skill:formula',          type: 'skill', th: 'จำและใช้สูตร',              en: 'Apply Formula',          grade: null, minGrade: null },
  { key: 'skill:conversion',       type: 'skill', th: 'แปลงหน่วย',                 en: 'Unit Conversion',        grade: null, minGrade: null },
  { key: 'skill:pattern',          type: 'skill', th: 'มองเห็นรูปแบบและลำดับ',    en: 'Pattern Recognition',    grade: null, minGrade: null },
  { key: 'skill:proof',            type: 'skill', th: 'อ้างเหตุผลและพิสูจน์',     en: 'Proof and Reasoning',    grade: null, minGrade: null },

  // ─── TRAP ─────────────────────────────────────────────────────────────────
  { key: 'trap:misread',          type: 'trap', th: 'อ่านโจทย์ผิดหรือข้ามข้อมูล',      en: 'Misread Question',          grade: null, minGrade: null },
  { key: 'trap:wrong-unit',       type: 'trap', th: 'ใช้หน่วยผิดหรือลืมแปลงหน่วย',     en: 'Wrong Unit',                grade: null, minGrade: null },
  { key: 'trap:misorder',         type: 'trap', th: 'ลำดับการคำนวณผิด',                 en: 'Wrong Order of Operations', grade: null, minGrade: null },
  { key: 'trap:sign-error',       type: 'trap', th: 'สับสนเรื่องบวก/ลบ/คูณ/หาร',       en: 'Sign Error',                grade: null, minGrade: null },
  { key: 'trap:partial-answer',   type: 'trap', th: 'ตอบแค่บางส่วน ไม่ครบคำถาม',       en: 'Partial Answer',            grade: null, minGrade: null },
  { key: 'trap:extra-info',       type: 'trap', th: 'หลงข้อมูลที่ไม่จำเป็น',            en: 'Misleading Extra Info',     grade: null, minGrade: null },
  { key: 'trap:rounding',         type: 'trap', th: 'ปัดเศษผิดหรือปัดผิดจุด',           en: 'Rounding Error',            grade: null, minGrade: null },
  { key: 'trap:confusing-choice', type: 'trap', th: 'ตัวเลือกใกล้เคียงกันจนสับสน',      en: 'Confusing Similar Choices', grade: null, minGrade: null },
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
  console.log(`   topic: 10 | subtopic: ${data.filter(d => d.type === 'subtopic').length} | skill: 10 | trap: 8`);
}

main()
  .catch(e => { console.error('❌ Seed ล้มเหลว:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
