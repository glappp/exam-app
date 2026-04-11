// seed-questions-fractions-p5.js
// topic:fractions, grade p5, 3 subtopics × 20 ข้อ = 60 ข้อ
// subtopic: add-unlike, multiply, divide (minGrade = 5)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = { examGrade: 'p5', topic: ['topic:fractions'] };
const Q = (textTh, textEn, choices, answer, subtopic, skill, difficulty, trap = []) => ({
  textTh, textEn,
  choices: choices.map(c => ({ textTh: c[0], textEn: c[1] })),
  answer,
  attributes: { ...BASE, subtopic: [subtopic], skill: [skill], trap, difficulty },
  ownerOrg: 'system', createdBy: 'seed', updatedBy: 'seed',
  aiGenerated: false, needsReview: false,
});

const questions = [

  // ─── subtopic:fractions-add-unlike (20 ข้อ) ──────────────────────────────
  Q('1/2 + 1/3 = ?',
    '1/2 + 1/3 = ?',
    [['2/5','2/5'],['5/6','5/6'],['2/6','2/6'],['5/12','5/12']],
    1, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 1),

  Q('1/4 + 1/2 = ?',
    '1/4 + 1/2 = ?',
    [['2/6','2/6'],['2/4','2/4'],['3/4','3/4'],['1/4','1/4']],
    2, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 1),

  Q('1/3 + 1/6 = ?',
    '1/3 + 1/6 = ?',
    [['2/9','2/9'],['1/2','1/2'],['2/6','2/6'],['1/3','1/3']],
    1, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 1),

  Q('1/2 + 1/4 = ?',
    '1/2 + 1/4 = ?',
    [['2/6','2/6'],['2/4','2/4'],['1/4','1/4'],['3/4','3/4']],
    3, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 1),

  Q('1/3 + 1/4 = ?',
    '1/3 + 1/4 = ?',
    [['2/7','2/7'],['7/12','7/12'],['4/12','4/12'],['3/12','3/12']],
    1, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 2),

  Q('3/4 + 1/8 = ?',
    '3/4 + 1/8 = ?',
    [['4/12','4/12'],['3/8','3/8'],['4/8','4/8'],['7/8','7/8']],
    3, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 1),

  Q('1/2 + 2/5 = ?',
    '1/2 + 2/5 = ?',
    [['3/7','3/7'],['7/10','7/10'],['4/10','4/10'],['9/10','9/10']],
    3, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 2),

  Q('2/3 + 1/6 = ?',
    '2/3 + 1/6 = ?',
    [['3/9','3/9'],['5/9','5/9'],['5/6','5/6'],['3/6','3/6']],
    2, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 1),

  Q('1/4 + 3/8 = ?',
    '1/4 + 3/8 = ?',
    [['4/12','4/12'],['5/8','5/8'],['3/8','3/8'],['4/8','4/8']],
    1, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 1),

  Q('1/6 + 1/4 = ?',
    '1/6 + 1/4 = ?',
    [['2/10','2/10'],['2/12','2/12'],['5/12','5/12'],['5/24','5/24']],
    2, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 2),

  Q('3/5 + 1/10 = ?',
    '3/5 + 1/10 = ?',
    [['4/15','4/15'],['4/10','4/10'],['7/10','7/10'],['7/15','7/15']],
    2, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 1),

  Q('1/4 + 5/12 = ?',
    '1/4 + 5/12 = ?',
    [['6/16','6/16'],['2/3','2/3'],['6/12','6/12'],['6/48','6/48']],
    1, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 2),

  Q('1/2 + 1/6 = ?',
    '1/2 + 1/6 = ?',
    [['1/3','1/3'],['2/8','2/8'],['2/3','2/3'],['1/8','1/8']],
    2, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 1),

  Q('3/4 + 1/6 = ?',
    '3/4 + 1/6 = ?',
    [['4/10','4/10'],['4/12','4/12'],['10/12','10/12'],['11/12','11/12']],
    3, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 2),

  Q('2/5 + 1/4 = ?',
    '2/5 + 1/4 = ?',
    [['3/9','3/9'],['3/20','3/20'],['13/20','13/20'],['7/20','7/20']],
    2, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 2),

  Q('5/6 + 1/3 = ?',
    '5/6 + 1/3 = ?',
    [['6/9','6/9'],['5/9','5/9'],['7/9','7/9'],['7/6','7/6']],
    3, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 2),

  Q('3/8 + 1/4 = ?',
    '3/8 + 1/4 = ?',
    [['4/12','4/12'],['5/8','5/8'],['4/8','4/8'],['3/4','3/4']],
    1, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 1),

  Q('2/3 + 3/4 = ?',
    '2/3 + 3/4 = ?',
    [['5/7','5/7'],['11/12','11/12'],['5/12','5/12'],['17/12','17/12']],
    3, 'subtopic:fractions-add-unlike', 'skill:arithmetic', 3),

  Q('มีน้ำ 1/2 ลิตร เติมน้ำเพิ่มอีก 1/3 ลิตร มีน้ำทั้งหมดกี่ลิตร?',
    'There is 1/2 litre of water. 1/3 litre more is added. How much water in total?',
    [['2/5','2/5'],['2/6','2/6'],['5/6','5/6'],['5/12','5/12']],
    2, 'subtopic:fractions-add-unlike', 'skill:word-problem', 1),

  Q('เดินจากบ้านถึงโรงเรียน 3/4 กิโลเมตร แล้วเดินอีก 1/8 กิโลเมตรถึงร้านค้า เดินทั้งหมดกี่กิโลเมตร?',
    'Walk 3/4 km from home to school, then 1/8 km more to a shop. Total distance walked?',
    [['4/12','4/12'],['3/8','3/8'],['7/8','7/8'],['4/8','4/8']],
    2, 'subtopic:fractions-add-unlike', 'skill:word-problem', 2),

  // ─── subtopic:fractions-multiply (20 ข้อ) ────────────────────────────────
  Q('1/2 × 1/3 = ?',
    '1/2 × 1/3 = ?',
    [['2/5','2/5'],['1/6','1/6'],['2/6','2/6'],['2/3','2/3']],
    1, 'subtopic:fractions-multiply', 'skill:arithmetic', 1),

  Q('2/3 × 3/4 = ?',
    '2/3 × 3/4 = ?',
    [['5/12','5/12'],['1/2','1/2'],['6/7','6/7'],['5/7','5/7']],
    1, 'subtopic:fractions-multiply', 'skill:arithmetic', 2),

  Q('3/4 × 2/5 = ?',
    '3/4 × 2/5 = ?',
    [['6/20','6/20'],['5/9','5/9'],['3/10','3/10'],['6/9','6/9']],
    2, 'subtopic:fractions-multiply', 'skill:arithmetic', 2),

  Q('1/3 × 1/4 = ?',
    '1/3 × 1/4 = ?',
    [['2/7','2/7'],['1/12','1/12'],['2/12','2/12'],['1/7','1/7']],
    1, 'subtopic:fractions-multiply', 'skill:arithmetic', 1),

  Q('2/5 × 5/6 = ?',
    '2/5 × 5/6 = ?',
    [['7/11','7/11'],['1/3','1/3'],['10/11','10/11'],['7/30','7/30']],
    1, 'subtopic:fractions-multiply', 'skill:arithmetic', 2),

  Q('3/5 × 2/3 = ?',
    '3/5 × 2/3 = ?',
    [['5/8','5/8'],['2/5','2/5'],['6/8','6/8'],['5/15','5/15']],
    1, 'subtopic:fractions-multiply', 'skill:arithmetic', 2),

  Q('4/5 × 3/4 = ?',
    '4/5 × 3/4 = ?',
    [['7/9','7/9'],['12/20','12/20'],['3/5','3/5'],['7/20','7/20']],
    2, 'subtopic:fractions-multiply', 'skill:arithmetic', 2),

  Q('1/2 × 3/4 = ?',
    '1/2 × 3/4 = ?',
    [['4/6','4/6'],['3/8','3/8'],['2/8','2/8'],['4/8','4/8']],
    1, 'subtopic:fractions-multiply', 'skill:arithmetic', 1),

  Q('5/6 × 2/5 = ?',
    '5/6 × 2/5 = ?',
    [['7/11','7/11'],['10/11','10/11'],['1/3','1/3'],['7/30','7/30']],
    2, 'subtopic:fractions-multiply', 'skill:arithmetic', 2),

  Q('2/3 × 1/4 = ?',
    '2/3 × 1/4 = ?',
    [['3/7','3/7'],['1/6','1/6'],['3/12','3/12'],['2/7','2/7']],
    1, 'subtopic:fractions-multiply', 'skill:arithmetic', 2),

  Q('3/4 × 4/9 = ?',
    '3/4 × 4/9 = ?',
    [['7/13','7/13'],['1/4','1/4'],['1/3','1/3'],['7/36','7/36']],
    2, 'subtopic:fractions-multiply', 'skill:arithmetic', 2),

  Q('1/2 × 4/5 = ?',
    '1/2 × 4/5 = ?',
    [['5/7','5/7'],['2/5','2/5'],['4/7','4/7'],['5/10','5/10']],
    1, 'subtopic:fractions-multiply', 'skill:arithmetic', 2),

  Q('3/8 × 2/3 = ?',
    '3/8 × 2/3 = ?',
    [['5/11','5/11'],['6/11','6/11'],['1/4','1/4'],['5/24','5/24']],
    2, 'subtopic:fractions-multiply', 'skill:arithmetic', 2),

  Q('5/6 × 3/5 = ?',
    '5/6 × 3/5 = ?',
    [['8/11','8/11'],['1/2','1/2'],['15/11','15/11'],['8/30','8/30']],
    1, 'subtopic:fractions-multiply', 'skill:arithmetic', 2),

  Q('2/7 × 7/8 = ?',
    '2/7 × 7/8 = ?',
    [['9/15','9/15'],['2/8','2/8'],['1/4','1/4'],['9/56','9/56']],
    2, 'subtopic:fractions-multiply', 'skill:arithmetic', 2),

  Q('3/5 × 5/9 = ?',
    '3/5 × 5/9 = ?',
    [['8/14','8/14'],['1/5','1/5'],['1/3','1/3'],['8/45','8/45']],
    2, 'subtopic:fractions-multiply', 'skill:arithmetic', 2),

  Q('1/4 × 8/9 = ?',
    '1/4 × 8/9 = ?',
    [['9/13','9/13'],['2/9','2/9'],['8/13','8/13'],['2/13','2/13']],
    1, 'subtopic:fractions-multiply', 'skill:arithmetic', 2),

  Q('นักเรียน 24 คน 3/4 ของนักเรียนเป็นผู้หญิง มีนักเรียนผู้หญิงกี่คน?',
    'There are 24 students. 3/4 are girls. How many girls are there?',
    [['16','16'],['18','18'],['20','20'],['6','6']],
    1, 'subtopic:fractions-multiply', 'skill:word-problem', 1),

  Q('มีผ้า 3/4 เมตร ใช้ 2/3 ของผ้า จะใช้ผ้าไปกี่เมตร?',
    'There is 3/4 metre of cloth. 2/3 of it is used. How many metres are used?',
    [['5/7','5/7'],['5/12','5/12'],['1/3','1/3'],['1/2','1/2']],
    3, 'subtopic:fractions-multiply', 'skill:word-problem', 2),

  Q('สวนมีพื้นที่ 5/6 ไร่ ปลูกผักไว้ 3/5 ของพื้นที่ มีพื้นที่ปลูกผักกี่ไร่?',
    'A garden has 5/6 rai. Vegetables are planted on 3/5 of the area. What is the planted area?',
    [['8/11','8/11'],['1/2','1/2'],['2/6','2/6'],['8/30','8/30']],
    1, 'subtopic:fractions-multiply', 'skill:word-problem', 2),

  // ─── subtopic:fractions-divide (20 ข้อ) ──────────────────────────────────
  Q('1/2 ÷ 1/4 = ?',
    '1/2 ÷ 1/4 = ?',
    [['1/8','1/8'],['1/4','1/4'],['2','2'],['4','4']],
    2, 'subtopic:fractions-divide', 'skill:arithmetic', 1),

  Q('2/3 ÷ 1/3 = ?',
    '2/3 ÷ 1/3 = ?',
    [['2/9','2/9'],['2','2'],['2/6','2/6'],['1/2','1/2']],
    1, 'subtopic:fractions-divide', 'skill:arithmetic', 1),

  Q('3/4 ÷ 1/2 = ?',
    '3/4 ÷ 1/2 = ?',
    [['3/8','3/8'],['3/2','3/2'],['6/8','6/8'],['1/2','1/2']],
    1, 'subtopic:fractions-divide', 'skill:arithmetic', 2),

  Q('1/3 ÷ 1/6 = ?',
    '1/3 ÷ 1/6 = ?',
    [['1/18','1/18'],['2/3','2/3'],['2','2'],['6/3','6/3']],
    2, 'subtopic:fractions-divide', 'skill:arithmetic', 1),

  Q('2/5 ÷ 2/5 = ?',
    '2/5 ÷ 2/5 = ?',
    [['4/25','4/25'],['4/5','4/5'],['1','1'],['5/2','5/2']],
    2, 'subtopic:fractions-divide', 'skill:arithmetic', 1),

  Q('3/4 ÷ 3/8 = ?',
    '3/4 ÷ 3/8 = ?',
    [['9/32','9/32'],['2','2'],['1','1'],['9/4','9/4']],
    1, 'subtopic:fractions-divide', 'skill:arithmetic', 2),

  Q('1/2 ÷ 3/4 = ?',
    '1/2 ÷ 3/4 = ?',
    [['3/8','3/8'],['2/3','2/3'],['1/3','1/3'],['4/3','4/3']],
    1, 'subtopic:fractions-divide', 'skill:arithmetic', 2),

  Q('4/5 ÷ 2/5 = ?',
    '4/5 ÷ 2/5 = ?',
    [['8/25','8/25'],['4/10','4/10'],['2','2'],['8/5','8/5']],
    2, 'subtopic:fractions-divide', 'skill:arithmetic', 1),

  Q('2/3 ÷ 4/9 = ?',
    '2/3 ÷ 4/9 = ?',
    [['8/27','8/27'],['8/3','8/3'],['3/2','3/2'],['2/6','2/6']],
    2, 'subtopic:fractions-divide', 'skill:arithmetic', 3),

  Q('5/6 ÷ 5/12 = ?',
    '5/6 ÷ 5/12 = ?',
    [['25/72','25/72'],['5/72','5/72'],['1/2','1/2'],['2','2']],
    3, 'subtopic:fractions-divide', 'skill:arithmetic', 2),

  Q('1/4 ÷ 1/2 = ?',
    '1/4 ÷ 1/2 = ?',
    [['1/8','1/8'],['1/2','1/2'],['2','2'],['1/4','1/4']],
    1, 'subtopic:fractions-divide', 'skill:arithmetic', 1),

  Q('3/5 ÷ 3/10 = ?',
    '3/5 ÷ 3/10 = ?',
    [['9/50','9/50'],['2','2'],['1/2','1/2'],['3/50','3/50']],
    1, 'subtopic:fractions-divide', 'skill:arithmetic', 2),

  Q('2/7 ÷ 4/7 = ?',
    '2/7 ÷ 4/7 = ?',
    [['8/49','8/49'],['8/7','8/7'],['1/2','1/2'],['7/4','7/4']],
    2, 'subtopic:fractions-divide', 'skill:arithmetic', 2),

  Q('3/4 ÷ 1/4 = ?',
    '3/4 ÷ 1/4 = ?',
    [['3/16','3/16'],['3/8','3/8'],['3','3'],['4/3','4/3']],
    2, 'subtopic:fractions-divide', 'skill:arithmetic', 1),

  Q('5/8 ÷ 5/4 = ?',
    '5/8 ÷ 5/4 = ?',
    [['25/32','25/32'],['1/2','1/2'],['2','2'],['4/8','4/8']],
    1, 'subtopic:fractions-divide', 'skill:arithmetic', 2),

  Q('4/9 ÷ 2/3 = ?',
    '4/9 ÷ 2/3 = ?',
    [['8/27','8/27'],['2/3','2/3'],['4/6','4/6'],['8/3','8/3']],
    1, 'subtopic:fractions-divide', 'skill:arithmetic', 2),

  Q('7/8 ÷ 7/4 = ?',
    '7/8 ÷ 7/4 = ?',
    [['49/32','49/32'],['1/2','1/2'],['7/2','7/2'],['1/4','1/4']],
    1, 'subtopic:fractions-divide', 'skill:arithmetic', 2),

  Q('มีผ้า 3/4 เมตร แบ่งออกเป็นชิ้นๆ ละ 3/8 เมตร จะได้กี่ชิ้น?',
    'There is 3/4 metre of cloth. Each piece is 3/8 metre. How many pieces can be cut?',
    [['9/32','9/32'],['3/2','3/2'],['2','2'],['1','1']],
    2, 'subtopic:fractions-divide', 'skill:word-problem', 2),

  Q('มีน้ำผลไม้ 2/3 ลิตร แบ่งใส่แก้วละ 1/6 ลิตร จะได้กี่แก้ว?',
    'There is 2/3 litre of juice. Each glass holds 1/6 litre. How many glasses can be filled?',
    [['2/18','2/18'],['1/4','1/4'],['4','4'],['2/9','2/9']],
    2, 'subtopic:fractions-divide', 'skill:word-problem', 2),

  Q('5/6 ÷ 1/3 = ?',
    '5/6 ÷ 1/3 = ?',
    [['5/18','5/18'],['5/9','5/9'],['5/2','5/2'],['2/5','2/5']],
    2, 'subtopic:fractions-divide', 'skill:arithmetic', 2),

];

async function main() {
  let count = 0;
  for (const q of questions) {
    await prisma.question.create({ data: q });
    count++;
  }
  console.log(`✅ สร้างข้อสอบ ${count} ข้อ (topic:fractions, p5)`);

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
