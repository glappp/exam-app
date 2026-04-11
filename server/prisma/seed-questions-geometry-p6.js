// seed-questions-geometry-p6.js
// topic:geometry, grade p6, 1 subtopic × 20 ข้อ = 20 ข้อ
// subtopic: geometry-coordinate (minGrade = 6)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = { examGrade: 'p6', topic: ['topic:geometry'] };
const Q = (textTh, textEn, choices, answer, subtopic, skill, difficulty, trap = []) => ({
  textTh, textEn,
  choices: choices.map(c => ({ textTh: c[0], textEn: c[1] })),
  answer,
  attributes: { ...BASE, subtopic: [subtopic], skill: [skill], trap, difficulty },
  ownerOrg: 'system', createdBy: 'seed', updatedBy: 'seed',
  aiGenerated: false, needsReview: false,
});

const questions = [

  // ─── subtopic:geometry-coordinate (20 ข้อ) ───────────────────────────────
  Q('ระบบพิกัดฉากประกอบด้วยแกนอะไรบ้าง?',
    'What axes make up a Cartesian coordinate system?',
    [['แกน x เพียงอย่างเดียว','Only the x-axis'],['แกน x และแกน y','The x-axis and y-axis'],['แกน x, y และ z','The x, y and z axes'],['แกน a และ b','The a and b axes']],
    1, 'subtopic:geometry-coordinate', 'skill:arithmetic', 1),

  Q('พิกัดของจุดกำเนิด (Origin) คือ?',
    'What are the coordinates of the origin?',
    [['(0, 1)','(0, 1)'],['(1, 0)','(1, 0)'],['(0, 0)','(0, 0)'],['(1, 1)','(1, 1)']],
    2, 'subtopic:geometry-coordinate', 'skill:arithmetic', 1),

  Q('ในพิกัด (x, y) ค่าใดเขียนก่อน?',
    'In the coordinate (x, y), which value is written first?',
    [['y','y'],['x','x'],['ค่าที่มากกว่า','The larger value'],['ขึ้นอยู่กับโจทย์','Depends on the problem']],
    1, 'subtopic:geometry-coordinate', 'skill:arithmetic', 1),

  Q('แกน x มีทิศทางอย่างไร?',
    'In which direction does the x-axis run?',
    [['แนวตั้ง','Vertical'],['แนวนอน','Horizontal'],['แนวทแยง','Diagonal'],['เป็นวงกลม','Circular']],
    1, 'subtopic:geometry-coordinate', 'skill:arithmetic', 1),

  Q('จุด (4, 7) มีค่า x เท่าไร?',
    'What is the x-coordinate of the point (4, 7)?',
    [['7','7'],['4','4'],['11','11'],['3','3']],
    1, 'subtopic:geometry-coordinate', 'skill:arithmetic', 1),

  Q('จุด (3, 9) มีค่า y เท่าไร?',
    'What is the y-coordinate of the point (3, 9)?',
    [['3','3'],['6','6'],['9','9'],['12','12']],
    2, 'subtopic:geometry-coordinate', 'skill:arithmetic', 1),

  Q('จุดใดอยู่บนแกน x?',
    'Which point lies on the x-axis?',
    [['(0, 5)','(0, 5)'],['(3, 0)','(3, 0)'],['(2, 4)','(2, 4)'],['(4, 6)','(4, 6)']],
    1, 'subtopic:geometry-coordinate', 'skill:arithmetic', 1),

  Q('จุดใดอยู่บนแกน y?',
    'Which point lies on the y-axis?',
    [['(5, 0)','(5, 0)'],['(0, 4)','(0, 4)'],['(3, 2)','(3, 2)'],['(6, 1)','(6, 1)']],
    1, 'subtopic:geometry-coordinate', 'skill:arithmetic', 1),

  Q('จุด A(2, 3) และ B(8, 3) ห่างกันกี่หน่วย?',
    'How far apart are points A(2, 3) and B(8, 3)?',
    [['3 หน่วย','3 units'],['5 หน่วย','5 units'],['6 หน่วย','6 units'],['11 หน่วย','11 units']],
    2, 'subtopic:geometry-coordinate', 'skill:arithmetic', 2),

  Q('จุด A(4, 1) และ B(4, 7) ห่างกันกี่หน่วย?',
    'How far apart are points A(4, 1) and B(4, 7)?',
    [['4 หน่วย','4 units'],['6 หน่วย','6 units'],['7 หน่วย','7 units'],['8 หน่วย','8 units']],
    1, 'subtopic:geometry-coordinate', 'skill:arithmetic', 2),

  Q('จุด A(1,2) B(5,2) C(5,6) D(1,6) เชื่อมกันเป็นรูปสี่เหลี่ยมชนิดใด?',
    'Points A(1,2), B(5,2), C(5,6), D(1,6) form which quadrilateral?',
    [['สี่เหลี่ยมผืนผ้า','Rectangle'],['สี่เหลี่ยมจัตุรัส','Square'],['สี่เหลี่ยมคางหมู','Trapezoid'],['สี่เหลี่ยมด้านขนาน','Parallelogram']],
    1, 'subtopic:geometry-coordinate', 'skill:visual-reasoning', 2),

  Q('จุด (5, 3) สะท้อนกับแกน y มีพิกัดเป็น?',
    'The reflection of point (5, 3) across the y-axis is?',
    [['(5, -3)','(5, -3)'],['(-5, 3)','(-5, 3)'],['(-5, -3)','(-5, -3)'],['(3, 5)','(3, 5)']],
    1, 'subtopic:geometry-coordinate', 'skill:visual-reasoning', 3),

  Q('จุด (2, 6) สะท้อนกับแกน x มีพิกัดเป็น?',
    'The reflection of point (2, 6) across the x-axis is?',
    [['(-2, 6)','(-2, 6)'],['(6, 2)','(6, 2)'],['(2, -6)','(2, -6)'],['(-2, -6)','(-2, -6)']],
    2, 'subtopic:geometry-coordinate', 'skill:visual-reasoning', 3),

  Q('จุด A(3, 2) และ B(3, 8) จุดกึ่งกลาง AB มีพิกัดเป็น?',
    'What is the midpoint of A(3, 2) and B(3, 8)?',
    [['(3, 4)','(3, 4)'],['(3, 5)','(3, 5)'],['(3, 6)','(3, 6)'],['(6, 5)','(6, 5)']],
    1, 'subtopic:geometry-coordinate', 'skill:arithmetic', 3),

  Q('จุด (4, 3) อยู่ห่างจากแกน y เป็นระยะเท่าไร?',
    'How far is the point (4, 3) from the y-axis?',
    [['3 หน่วย','3 units'],['4 หน่วย','4 units'],['7 หน่วย','7 units'],['12 หน่วย','12 units']],
    1, 'subtopic:geometry-coordinate', 'skill:arithmetic', 2),

  Q('จุด (4, 3) อยู่ห่างจากแกน x เป็นระยะเท่าไร?',
    'How far is the point (4, 3) from the x-axis?',
    [['3 หน่วย','3 units'],['4 หน่วย','4 units'],['7 หน่วย','7 units'],['12 หน่วย','12 units']],
    0, 'subtopic:geometry-coordinate', 'skill:arithmetic', 2),

  Q('จุด A(0,0) B(6,0) C(6,4) เชื่อมกันเป็นรูปสามเหลี่ยมชนิดใด?',
    'Points A(0,0), B(6,0), C(6,4) form which type of triangle?',
    [['หน้าจั่ว','Isosceles'],['ด้านเท่า','Equilateral'],['มุมฉาก','Right-angled'],['มุมป้าน','Obtuse']],
    2, 'subtopic:geometry-coordinate', 'skill:visual-reasoning', 2),

  Q('จุด A(1,3) B(7,3) C(7,8) D(1,8) เชื่อมกันเป็นสี่เหลี่ยมมีพื้นที่เท่าไร?',
    'Points A(1,3), B(7,3), C(7,8), D(1,8) form a rectangle. What is its area?',
    [['11 ตร.หน่วย','11 sq. units'],['22 ตร.หน่วย','22 sq. units'],['30 ตร.หน่วย','30 sq. units'],['60 ตร.หน่วย','60 sq. units']],
    2, 'subtopic:geometry-coordinate', 'skill:formula', 3),

  Q('จุด A(2, 5) เลื่อนไปทางขวา 3 หน่วย พิกัดใหม่ของ A คือ?',
    'Point A(2, 5) moves 3 units to the right. What are the new coordinates?',
    [['(2, 8)','(2, 8)'],['(5, 5)','(5, 5)'],['(-1, 5)','(-1, 5)'],['(2, 2)','(2, 2)']],
    1, 'subtopic:geometry-coordinate', 'skill:arithmetic', 2),

  Q('จุด B(4, 6) เลื่อนลง 4 หน่วย พิกัดใหม่ของ B คือ?',
    'Point B(4, 6) moves 4 units downward. What are the new coordinates?',
    [['(4, 10)','(4, 10)'],['(0, 6)','(0, 6)'],['(4, 2)','(4, 2)'],['(8, 6)','(8, 6)']],
    2, 'subtopic:geometry-coordinate', 'skill:arithmetic', 2),

];

async function main() {
  let count = 0;
  for (const q of questions) {
    await prisma.question.create({ data: q });
    count++;
  }
  console.log(`✅ สร้างข้อสอบ ${count} ข้อ (topic:geometry, p6)`);

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
