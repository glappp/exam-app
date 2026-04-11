// seed-questions-decimals-p5.js
// topic:decimals, grade p5, 2 subtopics × 20 ข้อ = 40 ข้อ
// subtopic: decimals-multiply, decimals-divide (minGrade = 5)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = { examGrade: 'p5', topic: ['topic:decimals'] };
const Q = (textTh, textEn, choices, answer, subtopic, skill, difficulty, trap = []) => ({
  textTh, textEn,
  choices: choices.map(c => ({ textTh: c[0], textEn: c[1] })),
  answer,
  attributes: { ...BASE, subtopic: [subtopic], skill: [skill], trap, difficulty },
  ownerOrg: 'system', createdBy: 'seed', updatedBy: 'seed',
  aiGenerated: false, needsReview: false,
});

const questions = [

  // ─── subtopic:decimals-multiply (20 ข้อ) ─────────────────────────────────
  Q('0.3 × 0.4 = ?',
    '0.3 × 0.4 = ?',
    [['0.12','0.12'],['1.2','1.2'],['12','12'],['0.012','0.012']],
    0, 'subtopic:decimals-multiply', 'skill:arithmetic', 1),

  Q('1.2 × 3 = ?',
    '1.2 × 3 = ?',
    [['3.6','3.6'],['36','36'],['0.36','0.36'],['3.06','3.06']],
    0, 'subtopic:decimals-multiply', 'skill:arithmetic', 1),

  Q('0.5 × 4 = ?',
    '0.5 × 4 = ?',
    [['0.20','0.20'],['2','2'],['20','20'],['0.02','0.02']],
    1, 'subtopic:decimals-multiply', 'skill:arithmetic', 1),

  Q('2.4 × 2 = ?',
    '2.4 × 2 = ?',
    [['48','48'],['4.8','4.8'],['0.48','0.48'],['4.08','4.08']],
    1, 'subtopic:decimals-multiply', 'skill:arithmetic', 1),

  Q('0.6 × 0.3 = ?',
    '0.6 × 0.3 = ?',
    [['1.8','1.8'],['0.018','0.018'],['0.18','0.18'],['18','18']],
    2, 'subtopic:decimals-multiply', 'skill:arithmetic', 2),

  Q('1.5 × 4 = ?',
    '1.5 × 4 = ?',
    [['60','60'],['0.60','0.60'],['6','6'],['0.060','0.060']],
    2, 'subtopic:decimals-multiply', 'skill:arithmetic', 1),

  Q('3.2 × 5 = ?',
    '3.2 × 5 = ?',
    [['1.6','1.6'],['16','16'],['160','160'],['0.16','0.16']],
    1, 'subtopic:decimals-multiply', 'skill:arithmetic', 1),

  Q('0.7 × 0.2 = ?',
    '0.7 × 0.2 = ?',
    [['0.14','0.14'],['1.4','1.4'],['14','14'],['0.014','0.014']],
    0, 'subtopic:decimals-multiply', 'skill:arithmetic', 2),

  Q('4.5 × 3 = ?',
    '4.5 × 3 = ?',
    [['1.35','1.35'],['135','135'],['13.5','13.5'],['0.135','0.135']],
    2, 'subtopic:decimals-multiply', 'skill:arithmetic', 1),

  Q('0.25 × 4 = ?',
    '0.25 × 4 = ?',
    [['10','10'],['1','1'],['0.1','0.1'],['100','100']],
    1, 'subtopic:decimals-multiply', 'skill:arithmetic', 2),

  Q('1.4 × 1.4 = ?',
    '1.4 × 1.4 = ?',
    [['2.8','2.8'],['1.96','1.96'],['19.6','19.6'],['0.196','0.196']],
    1, 'subtopic:decimals-multiply', 'skill:arithmetic', 3),

  Q('0.08 × 5 = ?',
    '0.08 × 5 = ?',
    [['4','4'],['0.4','0.4'],['40','40'],['0.04','0.04']],
    1, 'subtopic:decimals-multiply', 'skill:arithmetic', 2),

  Q('2.5 × 2.5 = ?',
    '2.5 × 2.5 = ?',
    [['5','5'],['5.25','5.25'],['6.25','6.25'],['62.5','62.5']],
    2, 'subtopic:decimals-multiply', 'skill:arithmetic', 3),

  Q('0.9 × 0.9 = ?',
    '0.9 × 0.9 = ?',
    [['1.8','1.8'],['0.81','0.81'],['8.1','8.1'],['0.081','0.081']],
    1, 'subtopic:decimals-multiply', 'skill:arithmetic', 2),

  Q('0.4 × 0.5 = ?',
    '0.4 × 0.5 = ?',
    [['2','2'],['0.2','0.2'],['20','20'],['0.02','0.02']],
    1, 'subtopic:decimals-multiply', 'skill:arithmetic', 2),

  Q('1.5 × 0.4 = ?',
    '1.5 × 0.4 = ?',
    [['0.6','0.6'],['6','6'],['0.06','0.06'],['60','60']],
    0, 'subtopic:decimals-multiply', 'skill:arithmetic', 2),

  Q('0.75 × 2 = ?',
    '0.75 × 2 = ?',
    [['0.15','0.15'],['15','15'],['1.5','1.5'],['150','150']],
    2, 'subtopic:decimals-multiply', 'skill:arithmetic', 2),

  Q('3.6 × 2 = ?',
    '3.6 × 2 = ?',
    [['0.72','0.72'],['72','72'],['7.2','7.2'],['7.02','7.02']],
    2, 'subtopic:decimals-multiply', 'skill:arithmetic', 1),

  Q('น้ำมัน 1 ลิตรราคา 35.50 บาท ซื้อ 2 ลิตร ต้องจ่ายเงินเท่าไร?',
    'Oil costs 35.50 baht per litre. What is the cost of 2 litres?',
    [['70.50 บาท','70.50 baht'],['71 บาท','71 baht'],['71.50 บาท','71.50 baht'],['70 บาท','70 baht']],
    1, 'subtopic:decimals-multiply', 'skill:word-problem', 1),

  Q('เชือกยาว 0.5 เมตร มีอยู่ 6 เส้น รวมยาวทั้งหมดเท่าไร?',
    'Each rope is 0.5 metre long. There are 6 ropes. What is the total length?',
    [['0.30 เมตร','0.30 metre'],['3 เมตร','3 metres'],['30 เมตร','30 metres'],['0.03 เมตร','0.03 metre']],
    1, 'subtopic:decimals-multiply', 'skill:word-problem', 1),

  // ─── subtopic:decimals-divide (20 ข้อ) ───────────────────────────────────
  Q('2.4 ÷ 2 = ?',
    '2.4 ÷ 2 = ?',
    [['12','12'],['0.12','0.12'],['1.2','1.2'],['0.012','0.012']],
    2, 'subtopic:decimals-divide', 'skill:arithmetic', 1),

  Q('0.6 ÷ 3 = ?',
    '0.6 ÷ 3 = ?',
    [['2','2'],['0.02','0.02'],['0.2','0.2'],['20','20']],
    2, 'subtopic:decimals-divide', 'skill:arithmetic', 1),

  Q('4.5 ÷ 5 = ?',
    '4.5 ÷ 5 = ?',
    [['9','9'],['0.09','0.09'],['0.9','0.9'],['90','90']],
    2, 'subtopic:decimals-divide', 'skill:arithmetic', 1),

  Q('0.8 ÷ 4 = ?',
    '0.8 ÷ 4 = ?',
    [['0.02','0.02'],['2','2'],['0.2','0.2'],['20','20']],
    2, 'subtopic:decimals-divide', 'skill:arithmetic', 1),

  Q('1.5 ÷ 3 = ?',
    '1.5 ÷ 3 = ?',
    [['5','5'],['0.05','0.05'],['0.5','0.5'],['50','50']],
    2, 'subtopic:decimals-divide', 'skill:arithmetic', 1),

  Q('3.6 ÷ 4 = ?',
    '3.6 ÷ 4 = ?',
    [['9','9'],['0.09','0.09'],['90','90'],['0.9','0.9']],
    3, 'subtopic:decimals-divide', 'skill:arithmetic', 1),

  Q('6.4 ÷ 8 = ?',
    '6.4 ÷ 8 = ?',
    [['8','8'],['0.08','0.08'],['80','80'],['0.8','0.8']],
    3, 'subtopic:decimals-divide', 'skill:arithmetic', 1),

  Q('7.2 ÷ 9 = ?',
    '7.2 ÷ 9 = ?',
    [['8','8'],['0.8','0.8'],['80','80'],['0.08','0.08']],
    1, 'subtopic:decimals-divide', 'skill:arithmetic', 1),

  Q('4.8 ÷ 6 = ?',
    '4.8 ÷ 6 = ?',
    [['0.08','0.08'],['8','8'],['0.8','0.8'],['80','80']],
    2, 'subtopic:decimals-divide', 'skill:arithmetic', 1),

  Q('5.6 ÷ 7 = ?',
    '5.6 ÷ 7 = ?',
    [['0.8','0.8'],['8','8'],['0.08','0.08'],['80','80']],
    0, 'subtopic:decimals-divide', 'skill:arithmetic', 1),

  Q('0.6 ÷ 0.2 = ?',
    '0.6 ÷ 0.2 = ?',
    [['0.3','0.3'],['30','30'],['3','3'],['0.03','0.03']],
    2, 'subtopic:decimals-divide', 'skill:arithmetic', 2),

  Q('1.2 ÷ 0.4 = ?',
    '1.2 ÷ 0.4 = ?',
    [['3','3'],['30','30'],['0.3','0.3'],['0.03','0.03']],
    0, 'subtopic:decimals-divide', 'skill:arithmetic', 2),

  Q('0.8 ÷ 0.2 = ?',
    '0.8 ÷ 0.2 = ?',
    [['0.4','0.4'],['40','40'],['0.04','0.04'],['4','4']],
    3, 'subtopic:decimals-divide', 'skill:arithmetic', 2),

  Q('2.5 ÷ 0.5 = ?',
    '2.5 ÷ 0.5 = ?',
    [['0.5','0.5'],['50','50'],['5','5'],['0.05','0.05']],
    2, 'subtopic:decimals-divide', 'skill:arithmetic', 2),

  Q('0.9 ÷ 0.3 = ?',
    '0.9 ÷ 0.3 = ?',
    [['0.3','0.3'],['0.03','0.03'],['3','3'],['30','30']],
    2, 'subtopic:decimals-divide', 'skill:arithmetic', 2),

  Q('1.8 ÷ 0.6 = ?',
    '1.8 ÷ 0.6 = ?',
    [['0.3','0.3'],['3','3'],['30','30'],['0.03','0.03']],
    1, 'subtopic:decimals-divide', 'skill:arithmetic', 2),

  Q('2.7 ÷ 0.9 = ?',
    '2.7 ÷ 0.9 = ?',
    [['0.3','0.3'],['30','30'],['3','3'],['0.03','0.03']],
    2, 'subtopic:decimals-divide', 'skill:arithmetic', 2),

  Q('0.4 ÷ 0.4 = ?',
    '0.4 ÷ 0.4 = ?',
    [['0','0'],['0.1','0.1'],['10','10'],['1','1']],
    3, 'subtopic:decimals-divide', 'skill:arithmetic', 2),

  Q('ผ้า 3.6 เมตร ตัดออกเป็นชิ้นๆ ละ 4 ชิ้นเท่าๆ กัน แต่ละชิ้นยาวเท่าไร?',
    'A 3.6-metre cloth is cut into 4 equal pieces. How long is each piece?',
    [['0.09 เมตร','0.09 metre'],['9 เมตร','9 metres'],['0.9 เมตร','0.9 metre'],['90 เมตร','90 metres']],
    2, 'subtopic:decimals-divide', 'skill:word-problem', 1),

  Q('มีน้ำ 1.5 ลิตร ใส่ขวด 3 ขวดเท่าๆ กัน แต่ละขวดมีน้ำกี่ลิตร?',
    'There is 1.5 litres of water shared equally into 3 bottles. How much is in each bottle?',
    [['5 ลิตร','5 litres'],['0.5 ลิตร','0.5 litre'],['50 ลิตร','50 litres'],['0.05 ลิตร','0.05 litre']],
    1, 'subtopic:decimals-divide', 'skill:word-problem', 1),

];

async function main() {
  let count = 0;
  for (const q of questions) {
    await prisma.question.create({ data: q });
    count++;
  }
  console.log(`✅ สร้างข้อสอบ ${count} ข้อ (topic:decimals, p5)`);

  const summary = {};
  for (const q of questions) {
    const sub = q.attributes.subtopic[0];
    summary[sub] = (summary[sub] || 0) + 1;
  }
  for (const [k, v] of Object.entries(summary)) {
    console.log(`   ${k}: ${v} ข้อ`);
  }
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
