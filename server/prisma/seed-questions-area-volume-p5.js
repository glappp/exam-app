// seed-questions-area-volume-p5.js
// topic:area-volume, grade p5, 2 subtopics × 20 ข้อ = 40 ข้อ
// subtopic: area-rectangle, area-word-problem (minGrade = 5)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = { examGrade: 'p5', topic: ['topic:area-volume'] };
const Q = (textTh, textEn, choices, answer, subtopic, skill, difficulty, trap = []) => ({
  textTh, textEn,
  choices: choices.map(c => ({ textTh: c[0], textEn: c[1] })),
  answer,
  attributes: { ...BASE, subtopic: [subtopic], skill: [skill], trap, difficulty },
  ownerOrg: 'system', createdBy: 'seed', updatedBy: 'seed',
  aiGenerated: false, needsReview: false,
});

const questions = [

  // ─── subtopic:area-rectangle (20 ข้อ) ────────────────────────────────────
  Q('สูตรคำนวณพื้นที่สี่เหลี่ยมมุมฉากคือข้อใด?',
    'Which formula gives the area of a rectangle?',
    [['ยาว + กว้าง','length + width'],['2 × (ยาว + กว้าง)','2 × (length + width)'],['ยาว × กว้าง','length × width'],['ยาว × กว้าง × สูง','length × width × height']],
    2, 'subtopic:area-rectangle', 'skill:formula', 1),

  Q('สี่เหลี่ยมมุมฉากยาว 6 ซม. กว้าง 4 ซม. มีพื้นที่เท่าไร?',
    'A rectangle is 6 cm long and 4 cm wide. What is the area?',
    [['10 ซม.²','10 cm²'],['20 ซม.²','20 cm²'],['24 ซม.²','24 cm²'],['48 ซม.²','48 cm²']],
    2, 'subtopic:area-rectangle', 'skill:formula', 1),

  Q('สี่เหลี่ยมจัตุรัสด้านยาว 5 ซม. มีพื้นที่เท่าไร?',
    'A square has sides of 5 cm. What is the area?',
    [['10 ซม.²','10 cm²'],['20 ซม.²','20 cm²'],['25 ซม.²','25 cm²'],['100 ซม.²','100 cm²']],
    2, 'subtopic:area-rectangle', 'skill:formula', 1),

  Q('สี่เหลี่ยมมุมฉากยาว 10 ซม. กว้าง 3 ซม. มีพื้นที่เท่าไร?',
    'A rectangle is 10 cm long and 3 cm wide. What is the area?',
    [['13 ซม.²','13 cm²'],['26 ซม.²','26 cm²'],['30 ซม.²','30 cm²'],['100 ซม.²','100 cm²']],
    2, 'subtopic:area-rectangle', 'skill:formula', 1),

  Q('สี่เหลี่ยมมุมฉากยาว 7 ซม. กว้าง 5 ซม. มีพื้นที่เท่าไร?',
    'A rectangle is 7 cm long and 5 cm wide. What is the area?',
    [['12 ซม.²','12 cm²'],['24 ซม.²','24 cm²'],['35 ซม.²','35 cm²'],['70 ซม.²','70 cm²']],
    2, 'subtopic:area-rectangle', 'skill:formula', 1),

  Q('สี่เหลี่ยมจัตุรัสด้านยาว 9 ซม. มีพื้นที่เท่าไร?',
    'A square has sides of 9 cm. What is the area?',
    [['18 ซม.²','18 cm²'],['36 ซม.²','36 cm²'],['72 ซม.²','72 cm²'],['81 ซม.²','81 cm²']],
    3, 'subtopic:area-rectangle', 'skill:formula', 1),

  Q('สี่เหลี่ยมมุมฉากยาว 12 ซม. กว้าง 5 ซม. มีพื้นที่เท่าไร?',
    'A rectangle is 12 cm long and 5 cm wide. What is the area?',
    [['17 ซม.²','17 cm²'],['34 ซม.²','34 cm²'],['60 ซม.²','60 cm²'],['120 ซม.²','120 cm²']],
    2, 'subtopic:area-rectangle', 'skill:formula', 1),

  Q('สี่เหลี่ยมมุมฉากยาว 8 ซม. กว้าง 6 ซม. มีพื้นที่เท่าไร?',
    'A rectangle is 8 cm long and 6 cm wide. What is the area?',
    [['14 ซม.²','14 cm²'],['28 ซม.²','28 cm²'],['48 ซม.²','48 cm²'],['96 ซม.²','96 cm²']],
    2, 'subtopic:area-rectangle', 'skill:formula', 1),

  Q('สี่เหลี่ยมจัตุรัสด้านยาว 4 ซม. มีพื้นที่เท่าไร?',
    'A square has sides of 4 cm. What is the area?',
    [['8 ซม.²','8 cm²'],['12 ซม.²','12 cm²'],['16 ซม.²','16 cm²'],['64 ซม.²','64 cm²']],
    2, 'subtopic:area-rectangle', 'skill:formula', 1),

  Q('สี่เหลี่ยมมุมฉากยาว 15 ซม. กว้าง 6 ซม. มีพื้นที่เท่าไร?',
    'A rectangle is 15 cm long and 6 cm wide. What is the area?',
    [['21 ซม.²','21 cm²'],['42 ซม.²','42 cm²'],['90 ซม.²','90 cm²'],['180 ซม.²','180 cm²']],
    2, 'subtopic:area-rectangle', 'skill:formula', 2),

  Q('สี่เหลี่ยมมุมฉากยาว 9 ซม. กว้าง 7 ซม. มีพื้นที่เท่าไร?',
    'A rectangle is 9 cm long and 7 cm wide. What is the area?',
    [['16 ซม.²','16 cm²'],['32 ซม.²','32 cm²'],['63 ซม.²','63 cm²'],['126 ซม.²','126 cm²']],
    2, 'subtopic:area-rectangle', 'skill:formula', 1),

  Q('สี่เหลี่ยมมุมฉากพื้นที่ 48 ซม.² กว้าง 6 ซม. ยาวเท่าไร?',
    'A rectangle has area 48 cm² and width 6 cm. What is the length?',
    [['6 ซม.','6 cm'],['8 ซม.','8 cm'],['42 ซม.','42 cm'],['54 ซม.','54 cm']],
    1, 'subtopic:area-rectangle', 'skill:formula', 2),

  Q('สี่เหลี่ยมจัตุรัสพื้นที่ 36 ซม.² ด้านยาวเท่าไร?',
    'A square has area 36 cm². What is the length of each side?',
    [['4 ซม.','4 cm'],['6 ซม.','6 cm'],['9 ซม.','9 cm'],['18 ซม.','18 cm']],
    1, 'subtopic:area-rectangle', 'skill:formula', 2),

  Q('สี่เหลี่ยมมุมฉากยาว 20 ซม. กว้าง 8 ซม. มีพื้นที่เท่าไร?',
    'A rectangle is 20 cm long and 8 cm wide. What is the area?',
    [['28 ซม.²','28 cm²'],['56 ซม.²','56 cm²'],['160 ซม.²','160 cm²'],['320 ซม.²','320 cm²']],
    2, 'subtopic:area-rectangle', 'skill:formula', 1),

  Q('สี่เหลี่ยมมุมฉากยาว 11 ซม. กว้าง 4 ซม. มีพื้นที่เท่าไร?',
    'A rectangle is 11 cm long and 4 cm wide. What is the area?',
    [['15 ซม.²','15 cm²'],['30 ซม.²','30 cm²'],['44 ซม.²','44 cm²'],['88 ซม.²','88 cm²']],
    2, 'subtopic:area-rectangle', 'skill:formula', 1),

  Q('สี่เหลี่ยมมุมฉากพื้นที่ 72 ซม.² กว้าง 8 ซม. ยาวเท่าไร?',
    'A rectangle has area 72 cm² and width 8 cm. What is the length?',
    [['7 ซม.','7 cm'],['9 ซม.','9 cm'],['64 ซม.','64 cm'],['80 ซม.','80 cm']],
    1, 'subtopic:area-rectangle', 'skill:formula', 2),

  Q('สี่เหลี่ยมจัตุรัสด้านยาว 7 ซม. มีพื้นที่เท่าไร?',
    'A square has sides of 7 cm. What is the area?',
    [['14 ซม.²','14 cm²'],['28 ซม.²','28 cm²'],['49 ซม.²','49 cm²'],['98 ซม.²','98 cm²']],
    2, 'subtopic:area-rectangle', 'skill:formula', 1),

  Q('สี่เหลี่ยมมุมฉากยาว 13 ซม. กว้าง 3 ซม. มีพื้นที่เท่าไร?',
    'A rectangle is 13 cm long and 3 cm wide. What is the area?',
    [['16 ซม.²','16 cm²'],['32 ซม.²','32 cm²'],['39 ซม.²','39 cm²'],['78 ซม.²','78 cm²']],
    2, 'subtopic:area-rectangle', 'skill:formula', 1),

  Q('สี่เหลี่ยมมุมฉากยาว 14 ซม. กว้าง 5 ซม. มีพื้นที่เท่าไร?',
    'A rectangle is 14 cm long and 5 cm wide. What is the area?',
    [['19 ซม.²','19 cm²'],['38 ซม.²','38 cm²'],['70 ซม.²','70 cm²'],['140 ซม.²','140 cm²']],
    2, 'subtopic:area-rectangle', 'skill:formula', 1),

  Q('หน่วยที่ใช้วัดพื้นที่คือข้อใด?',
    'Which is the correct unit for measuring area?',
    [['เซนติเมตร (ซม.)','Centimetre (cm)'],['ตารางเซนติเมตร (ซม.²)','Square centimetre (cm²)'],['ลูกบาศก์เซนติเมตร (ซม.³)','Cubic centimetre (cm³)'],['กรัม (ก.)','Gram (g)']],
    1, 'subtopic:area-rectangle', 'skill:arithmetic', 1),

  // ─── subtopic:area-word-problem (20 ข้อ) ─────────────────────────────────
  Q('ห้องสี่เหลี่ยมมุมฉากยาว 5 เมตร กว้าง 4 เมตร มีพื้นที่ห้องเท่าไร?',
    'A rectangular room is 5 m long and 4 m wide. What is the area of the room?',
    [['9 ตร.ม.','9 m²'],['18 ตร.ม.','18 m²'],['20 ตร.ม.','20 m²'],['45 ตร.ม.','45 m²']],
    2, 'subtopic:area-word-problem', 'skill:word-problem', 1),

  Q('สวนรูปสี่เหลี่ยมจัตุรัสด้านยาว 8 เมตร มีพื้นที่เท่าไร?',
    'A square garden has sides of 8 m. What is the area?',
    [['16 ตร.ม.','16 m²'],['32 ตร.ม.','32 m²'],['64 ตร.ม.','64 m²'],['128 ตร.ม.','128 m²']],
    2, 'subtopic:area-word-problem', 'skill:word-problem', 1),

  Q('แปลงผักยาว 12 เมตร กว้าง 6 เมตร มีพื้นที่เท่าไร?',
    'A vegetable patch is 12 m long and 6 m wide. What is the area?',
    [['18 ตร.ม.','18 m²'],['36 ตร.ม.','36 m²'],['72 ตร.ม.','72 m²'],['144 ตร.ม.','144 m²']],
    2, 'subtopic:area-word-problem', 'skill:word-problem', 1),

  Q('ห้องเรียนยาว 10 เมตร กว้าง 7 เมตร ต้องปูพรมทั้งห้อง ต้องใช้พรมกี่ตารางเมตร?',
    'A classroom is 10 m long and 7 m wide. How many square metres of carpet are needed to cover the whole floor?',
    [['17 ตร.ม.','17 m²'],['34 ตร.ม.','34 m²'],['70 ตร.ม.','70 m²'],['140 ตร.ม.','140 m²']],
    2, 'subtopic:area-word-problem', 'skill:word-problem', 1),

  Q('สระว่ายน้ำรูปสี่เหลี่ยมยาว 25 เมตร กว้าง 10 เมตร มีพื้นที่ผิวน้ำเท่าไร?',
    'A rectangular swimming pool is 25 m long and 10 m wide. What is the surface area of the water?',
    [['35 ตร.ม.','35 m²'],['70 ตร.ม.','70 m²'],['250 ตร.ม.','250 m²'],['500 ตร.ม.','500 m²']],
    2, 'subtopic:area-word-problem', 'skill:word-problem', 1),

  Q('แปลงดอกไม้กว้าง 4 เมตร มีพื้นที่ 28 ตร.ม. แปลงดอกไม้ยาวเท่าไร?',
    'A flower bed is 4 m wide and has an area of 28 m². How long is it?',
    [['4 เมตร','4 m'],['7 เมตร','7 m'],['24 เมตร','24 m'],['32 เมตร','32 m']],
    1, 'subtopic:area-word-problem', 'skill:word-problem', 2),

  Q('พื้นห้องน้ำสี่เหลี่ยมจัตุรัสมีพื้นที่ 25 ตร.ม. ด้านยาวเท่าไร?',
    'A square bathroom floor has an area of 25 m². How long is each side?',
    [['4 เมตร','4 m'],['5 เมตร','5 m'],['6 เมตร','6 m'],['12.5 เมตร','12.5 m']],
    1, 'subtopic:area-word-problem', 'skill:word-problem', 2),

  Q('ป้ายโฆษณายาว 3 เมตร กว้าง 1.5 เมตร มีพื้นที่เท่าไร?',
    'A billboard is 3 m long and 1.5 m wide. What is the area?',
    [['4.5 ตร.ม.','4.5 m²'],['5 ตร.ม.','5 m²'],['9 ตร.ม.','9 m²'],['4 ตร.ม.','4 m²']],
    0, 'subtopic:area-word-problem', 'skill:word-problem', 2),

  Q('กระเบื้องขนาด 0.5 × 0.5 เมตร ต้องใช้กี่แผ่นเพื่อปูพื้นห้องขนาด 5 × 4 เมตร?',
    'Tiles are 0.5 m × 0.5 m. How many tiles are needed to cover a 5 m × 4 m floor?',
    [['20 แผ่น','20 tiles'],['40 แผ่น','40 tiles'],['80 แผ่น','80 tiles'],['160 แผ่น','160 tiles']],
    2, 'subtopic:area-word-problem', 'skill:multi-step', 3),

  Q('ผ้าสี่เหลี่ยมยาว 2 เมตร กว้าง 1.5 เมตร มีพื้นที่เท่าไร?',
    'A rectangular cloth is 2 m long and 1.5 m wide. What is the area?',
    [['3 ตร.ม.','3 m²'],['3.5 ตร.ม.','3.5 m²'],['7 ตร.ม.','7 m²'],['4 ตร.ม.','4 m²']],
    0, 'subtopic:area-word-problem', 'skill:word-problem', 2),

  Q('แปลงนาขนาด 20 × 15 เมตร มีพื้นที่เท่าไร?',
    'A rice field is 20 m × 15 m. What is the area?',
    [['35 ตร.ม.','35 m²'],['70 ตร.ม.','70 m²'],['300 ตร.ม.','300 m²'],['600 ตร.ม.','600 m²']],
    2, 'subtopic:area-word-problem', 'skill:word-problem', 1),

  Q('ต้องทาสีผนังห้องสี่เหลี่ยมยาว 6 เมตร กว้าง 4 เมตร สีทา 1 ถังทาได้ 12 ตร.ม. ต้องใช้กี่ถัง?',
    'A room floor is 6 m × 4 m. One can of paint covers 12 m². How many cans are needed?',
    [['1 ถัง','1 can'],['2 ถัง','2 cans'],['3 ถัง','3 cans'],['4 ถัง','4 cans']],
    1, 'subtopic:area-word-problem', 'skill:multi-step', 3),

  Q('กระเบื้องราคาแผ่นละ 150 บาท ต้องปูพื้นห้องขนาด 5 × 4 เมตร (กระเบื้องแผ่นละ 1 ตร.ม.) ค่าใช้จ่ายเท่าไร?',
    'Tiles cost 150 baht each (1 m² per tile). How much is needed to tile a 5 m × 4 m floor?',
    [['150 บาท','150 baht'],['1,500 บาท','1,500 baht'],['3,000 บาท','3,000 baht'],['6,000 บาท','6,000 baht']],
    2, 'subtopic:area-word-problem', 'skill:multi-step', 3),

  Q('แปลงผักแปลงแรกยาว 8 เมตร กว้าง 5 เมตร แปลงที่สองยาว 10 เมตร กว้าง 3 เมตร แปลงใดมีพื้นที่มากกว่า?',
    'Plot A is 8 m × 5 m and Plot B is 10 m × 3 m. Which has the greater area?',
    [['แปลงแรก (40 ตร.ม.)','Plot A (40 m²)'],['แปลงที่สอง (30 ตร.ม.)','Plot B (30 m²)'],['เท่ากัน','They are equal'],['แปลงที่สอง (50 ตร.ม.)','Plot B (50 m²)']],
    0, 'subtopic:area-word-problem', 'skill:multi-step', 2),

  Q('สี่เหลี่ยมจัตุรัสพื้นที่ 64 ตร.ม. ด้านยาวเท่าไร?',
    'A square has an area of 64 m². How long is each side?',
    [['6 เมตร','6 m'],['7 เมตร','7 m'],['8 เมตร','8 m'],['16 เมตร','16 m']],
    2, 'subtopic:area-word-problem', 'skill:word-problem', 2),

  Q('ห้องยาว 9 เมตร กว้าง 6 เมตร ปูพื้นด้วยกระเบื้องขนาด 1 × 1 เมตร ต้องใช้กี่แผ่น?',
    'A room is 9 m × 6 m. It is tiled with 1 m × 1 m tiles. How many tiles are needed?',
    [['15 แผ่น','15 tiles'],['30 แผ่น','30 tiles'],['54 แผ่น','54 tiles'],['108 แผ่น','108 tiles']],
    2, 'subtopic:area-word-problem', 'skill:word-problem', 2),

  Q('แปลงผักมีพื้นที่ 56 ตร.ม. กว้าง 7 เมตร ยาวเท่าไร?',
    'A vegetable plot has area 56 m² and is 7 m wide. How long is it?',
    [['6 เมตร','6 m'],['7 เมตร','7 m'],['8 เมตร','8 m'],['49 เมตร','49 m']],
    2, 'subtopic:area-word-problem', 'skill:word-problem', 2),

  Q('บึงน้ำรูปสี่เหลี่ยมผืนผ้ายาว 100 เมตร กว้าง 60 เมตร มีพื้นที่เท่าไร?',
    'A rectangular pond is 100 m long and 60 m wide. What is the area?',
    [['160 ตร.ม.','160 m²'],['320 ตร.ม.','320 m²'],['6,000 ตร.ม.','6,000 m²'],['60,000 ตร.ม.','60,000 m²']],
    2, 'subtopic:area-word-problem', 'skill:word-problem', 2),

  Q('สนามฟุตบอลยาว 90 เมตร กว้าง 60 เมตร มีพื้นที่เท่าไร?',
    'A football pitch is 90 m long and 60 m wide. What is the area?',
    [['150 ตร.ม.','150 m²'],['540 ตร.ม.','540 m²'],['5,400 ตร.ม.','5,400 m²'],['54,000 ตร.ม.','54,000 m²']],
    2, 'subtopic:area-word-problem', 'skill:word-problem', 2),

  Q('กระดาษยาว 30 ซม. กว้าง 20 ซม. มีพื้นที่เท่าไร?',
    'A sheet of paper is 30 cm long and 20 cm wide. What is the area?',
    [['50 ซม.²','50 cm²'],['100 ซม.²','100 cm²'],['600 ซม.²','600 cm²'],['1,200 ซม.²','1,200 cm²']],
    2, 'subtopic:area-word-problem', 'skill:word-problem', 1),

];

async function main() {
  let count = 0;
  for (const q of questions) {
    await prisma.question.create({ data: q });
    count++;
  }
  console.log(`✅ สร้างข้อสอบ ${count} ข้อ (topic:area-volume, p5)`);

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
