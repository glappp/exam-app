const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = { examGrade: 'p6', topic: ['topic:statistics'] };
const Q = (textTh, textEn, choices, answer, subtopic, skill, difficulty, trap = []) => ({
  textTh, textEn,
  choices: choices.map(c => ({ textTh: c[0], textEn: c[1] })),
  answer,
  attributes: { ...BASE, subtopic: [subtopic], skill: [skill], trap, difficulty },
  ownerOrg: 'system', createdBy: 'seed', updatedBy: 'seed',
  aiGenerated: false, needsReview: false,
});

const questions = [
  // subtopic: statistics:pie-chart (20 ข้อ)
  Q('แผนภูมิวงกลมที่มีมุม 360° แสดงข้อมูลทั้งหมดคิดเป็นกี่เปอร์เซ็นต์',
    'A pie chart with 360° represents what percentage of the total data?',
    [['50%','50%'],['75%','75%'],['100%','100%'],['200%','200%']], 2,
    'statistics:pie-chart','read-chart','easy'),

  Q('ถ้าส่วนหนึ่งในแผนภูมิวงกลมมีมุม 90° คิดเป็นกี่เปอร์เซ็นต์ของทั้งหมด',
    'If a sector of a pie chart has an angle of 90°, what percentage of the whole does it represent?',
    [['15%','15%'],['25%','25%'],['30%','30%'],['45%','45%']], 1,
    'statistics:pie-chart','read-chart','easy'),

  Q('ถ้าส่วนหนึ่งในแผนภูมิวงกลมมีมุม 180° คิดเป็นกี่เปอร์เซ็นต์ของทั้งหมด',
    'If a sector of a pie chart has an angle of 180°, what percentage of the whole does it represent?',
    [['25%','25%'],['33%','33%'],['50%','50%'],['75%','75%']], 2,
    'statistics:pie-chart','read-chart','easy'),

  Q('ถ้าส่วนหนึ่งในแผนภูมิวงกลมคิดเป็น 25% มุมของส่วนนั้นเท่ากับเท่าไร',
    'If a sector of a pie chart represents 25%, what is the angle of that sector?',
    [['45°','45°'],['60°','60°'],['90°','90°'],['120°','120°']], 2,
    'statistics:pie-chart','calculate','easy'),

  Q('ถ้าส่วนหนึ่งในแผนภูมิวงกลมคิดเป็น 50% มุมของส่วนนั้นเท่ากับเท่าไร',
    'If a sector of a pie chart represents 50%, what is the angle of that sector?',
    [['90°','90°'],['120°','120°'],['150°','150°'],['180°','180°']], 3,
    'statistics:pie-chart','calculate','easy'),

  Q('ถ้าส่วนหนึ่งในแผนภูมิวงกลมคิดเป็น 75% มุมของส่วนนั้นเท่ากับเท่าไร',
    'If a sector of a pie chart represents 75%, what is the angle of that sector?',
    [['180°','180°'],['240°','240°'],['270°','270°'],['300°','300°']], 2,
    'statistics:pie-chart','calculate','medium'),

  Q('นักเรียน 120 คน ชอบวิชาคณิตศาสตร์ 30 คน ถ้าแสดงด้วยแผนภูมิวงกลม มุมของส่วน "คณิตศาสตร์" เท่ากับเท่าไร',
    '120 students, 30 like mathematics. In a pie chart, what is the angle for "mathematics"?',
    [['60°','60°'],['75°','75°'],['90°','90°'],['120°','120°']], 2,
    'statistics:pie-chart','calculate','medium'),

  Q('นักเรียน 200 คน ชอบกีฬา 50 คน ถ้าแสดงด้วยแผนภูมิวงกลม มุมของส่วน "กีฬา" เท่ากับเท่าไร',
    '200 students, 50 like sports. In a pie chart, what is the angle for "sports"?',
    [['45°','45°'],['60°','60°'],['75°','75%'],['90°','90°']], 3,
    'statistics:pie-chart','calculate','medium'),

  Q('แผนภูมิวงกลมแสดงค่าใช้จ่ายรายเดือน ส่วนอาหารมีมุม 144° คิดเป็นกี่เปอร์เซ็นต์ของรายจ่ายทั้งหมด',
    'A pie chart shows monthly expenses. Food has an angle of 144°. What percentage of total expenses is this?',
    [['30%','30%'],['36%','36%'],['40%','40%'],['45%','45%']], 2,
    'statistics:pie-chart','calculate','medium'),

  Q('แผนภูมิวงกลมแสดงประเภทผลไม้ที่ขายได้ ส่วนมะม่วงมีมุม 72° มะม่วงคิดเป็นกี่เปอร์เซ็นต์ของผลไม้ทั้งหมด',
    'A pie chart shows fruit sales. Mango has an angle of 72°. What percentage of total fruit is mango?',
    [['15%','15%'],['18%','18%'],['20%','20%'],['24%','24%']], 2,
    'statistics:pie-chart','calculate','medium'),

  Q('แผนภูมิวงกลมแสดงประเภทยานพาหนะ รถยนต์ 40% รถจักรยานยนต์ 30% จักรยาน 20% อื่นๆ 10% ถ้ามีรถทั้งหมด 360 คัน มีรถยนต์กี่คัน',
    'A pie chart shows vehicle types: cars 40%, motorbikes 30%, bicycles 20%, others 10%. If there are 360 vehicles total, how many cars are there?',
    [['108','108'],['120','120'],['144','144'],['160','160']], 2,
    'statistics:pie-chart','word-problem','medium'),

  Q('แผนภูมิวงกลมแสดงสีที่นักเรียนชอบ สีแดง 45° สีน้ำเงิน 90° สีเขียว 135° สีอื่นๆ 90° นักเรียนมี 240 คน มีนักเรียนที่ชอบสีเขียวกี่คน',
    'A pie chart shows favorite colors: red 45°, blue 90°, green 135°, others 90°. There are 240 students. How many like green?',
    [['60','60'],['75','75'],['80','80'],['90','90']], 3,
    'statistics:pie-chart','word-problem','medium'),

  Q('แผนภูมิวงกลมแสดงการใช้เวลาในหนึ่งวัน นอนหลับ 8 ชั่วโมง โรงเรียน 6 ชั่วโมง เล่น 4 ชั่วโมง อื่นๆ 6 ชั่วโมง มุมของส่วน "นอนหลับ" เท่ากับเท่าไร',
    'A pie chart shows daily time use: sleep 8h, school 6h, play 4h, others 6h. What is the angle for "sleep"?',
    [['90°','90°'],['100°','100°'],['120°','120°'],['135°','135°']], 2,
    'statistics:pie-chart','calculate','medium'),

  Q('แผนภูมิวงกลมแสดงหมู่เลือด นักเรียน 180 คน หมู่เลือด A มุม 120° มีนักเรียนหมู่เลือด A กี่คน',
    'A pie chart shows blood types of 180 students. Blood type A has an angle of 120°. How many students have blood type A?',
    [['45','45'],['54','54'],['60','60'],['72','72']], 2,
    'statistics:pie-chart','word-problem','medium'),

  Q('ข้อมูลการขายสินค้า: เสื้อ 90 ตัว กางเกง 60 ตัว รองเท้า 30 คู่ ถ้าแสดงด้วยแผนภูมิวงกลม มุมของส่วน "กางเกง" เท่ากับเท่าไร',
    'Sales data: shirts 90, pants 60, shoes 30. In a pie chart, what is the angle for "pants"?',
    [['90°','90°'],['100°','100°'],['108°','108°'],['120°','120°']], 3,
    'statistics:pie-chart','calculate','hard'),

  Q('แผนภูมิวงกลมแสดงคะแนนสอบของห้อง ได้ A มุม 54° ได้ B มุม 108° ได้ C มุม 126° ได้ D มุม 72° ถ้ามีนักเรียน 100 คน มีนักเรียนที่ได้ A กี่คน',
    'A pie chart shows exam grades: A=54°, B=108°, C=126°, D=72°. If there are 100 students, how many got A?',
    [['10','10'],['12','12'],['15','15'],['18','18']], 2,
    'statistics:pie-chart','word-problem','hard'),

  Q('แผนภูมิวงกลมแสดงสัดส่วนรายได้ครอบครัว อาหาร 30% ค่าเช่า 25% ค่าเดินทาง 15% การศึกษา 20% อื่นๆ 10% ถ้ารายได้ 12,000 บาท ใช้จ่ายด้านการศึกษาเท่าไร',
    'A pie chart shows family income: food 30%, rent 25%, transport 15%, education 20%, others 10%. If income is 12,000 baht, how much is spent on education?',
    [['1,800','1,800'],['2,000','2,000'],['2,400','2,400'],['3,000','3,000']], 2,
    'statistics:pie-chart','word-problem','hard'),

  Q('ข้อใดเป็นการแปลงเปอร์เซ็นต์เป็นมุมที่ถูกต้อง สำหรับแผนภูมิวงกลม',
    'Which is the correct conversion from percentage to angle for a pie chart?',
    [['10% = 18°','10% = 18°'],['20% = 60°','20% = 60°'],['30% = 90°','30% = 90°'],['40% = 160°','40% = 160°']], 0,
    'statistics:pie-chart','calculate','hard'),

  Q('แผนภูมิวงกลมมี 4 ส่วน มุม 60°, 90°, 120° และ x° ค่า x เท่ากับเท่าไร',
    'A pie chart has 4 sectors with angles 60°, 90°, 120°, and x°. What is x?',
    [['80°','80°'],['90°','90°'],['100°','100°'],['120°','120°']], 1,
    'statistics:pie-chart','calculate','medium'),

  Q('แผนภูมิวงกลมแสดงผลไม้ที่นักเรียน 360 คนชอบ มะม่วง 30% ส้ม 25% กล้วย 20% อื่นๆ 25% มีนักเรียนที่ชอบมะม่วงกี่คน',
    '360 students\' favorite fruits shown in a pie chart: mango 30%, orange 25%, banana 20%, others 25%. How many students like mango?',
    [['90','90'],['100','100'],['108','108'],['120','120']], 2,
    'statistics:pie-chart','word-problem','easy'),
];

async function main() {
  const counts = {};
  for (const q of questions) {
    await prisma.question.create({ data: q });
    const sub = q.attributes.subtopic[0];
    counts[sub] = (counts[sub] || 0) + 1;
  }
  console.log(`✅ สร้างข้อสอบ ${questions.length} ข้อ (topic:statistics, p6)`);
  for (const [k, v] of Object.entries(counts)) console.log(`   ${k}: ${v} ข้อ`);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
