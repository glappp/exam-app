// seed-questions-statistics-p5.js
// topic:statistics, grade p5, 2 subtopics × 20 ข้อ = 40 ข้อ
// subtopic: statistics-line-chart, statistics-mean (minGrade = 5)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = { examGrade: 'p5', topic: ['topic:statistics'] };
const Q = (textTh, textEn, choices, answer, subtopic, skill, difficulty, trap = []) => ({
  textTh, textEn,
  choices: choices.map(c => ({ textTh: c[0], textEn: c[1] })),
  answer,
  attributes: { ...BASE, subtopic: [subtopic], skill: [skill], trap, difficulty },
  ownerOrg: 'system', createdBy: 'seed', updatedBy: 'seed',
  aiGenerated: false, needsReview: false,
});

const questions = [

  // ─── subtopic:statistics-line-chart (20 ข้อ) ─────────────────────────────
  // ชุดข้อมูล A: อุณหภูมิรายวัน จ=30, อ=32, พ=28, พฤ=35, ศ=31 (°C)
  Q('แผนภูมิเส้นแสดงอุณหภูมิ 5 วัน: จันทร์ 30°C อังคาร 32°C พุธ 28°C พฤหัส 35°C ศุกร์ 31°C — วันใดมีอุณหภูมิสูงที่สุด?',
    'A line graph shows daily temperature: Mon 30°C, Tue 32°C, Wed 28°C, Thu 35°C, Fri 31°C. Which day is hottest?',
    [['จันทร์','Monday'],['อังคาร','Tuesday'],['พุธ','Wednesday'],['พฤหัสบดี','Thursday']],
    3, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 1),

  Q('แผนภูมิเส้นแสดงอุณหภูมิ 5 วัน: จันทร์ 30°C อังคาร 32°C พุธ 28°C พฤหัส 35°C ศุกร์ 31°C — วันใดมีอุณหภูมิต่ำที่สุด?',
    'A line graph shows daily temperature: Mon 30°C, Tue 32°C, Wed 28°C, Thu 35°C, Fri 31°C. Which day is coolest?',
    [['จันทร์','Monday'],['อังคาร','Tuesday'],['พุธ','Wednesday'],['ศุกร์','Friday']],
    2, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 1),

  Q('แผนภูมิเส้นแสดงอุณหภูมิ 5 วัน: จันทร์ 30°C อังคาร 32°C พุธ 28°C พฤหัส 35°C ศุกร์ 31°C — อุณหภูมิเพิ่มขึ้นจากวันจันทร์ถึงวันอังคารเท่าไร?',
    'Temperature: Mon 30°C, Tue 32°C, Wed 28°C, Thu 35°C, Fri 31°C. How much did temperature rise from Monday to Tuesday?',
    [['1°C','1°C'],['2°C','2°C'],['5°C','5°C'],['3°C','3°C']],
    1, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 1),

  Q('แผนภูมิเส้นแสดงอุณหภูมิ 5 วัน: จันทร์ 30°C อังคาร 32°C พุธ 28°C พฤหัส 35°C ศุกร์ 31°C — ความแตกต่างระหว่างอุณหภูมิสูงสุดและต่ำสุดคือ?',
    'Temperature: Mon 30°C, Tue 32°C, Wed 28°C, Thu 35°C, Fri 31°C. What is the difference between highest and lowest?',
    [['5°C','5°C'],['7°C','7°C'],['3°C','3°C'],['9°C','9°C']],
    1, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 2),

  // ชุดข้อมูล B: ยอดขาย ม.ค.=50, ก.พ.=60, มี.ค.=45, เม.ย.=70, พ.ค.=65 (หน่วย)
  Q('แผนภูมิเส้นแสดงยอดขาย 5 เดือน: ม.ค. 50 ก.พ. 60 มี.ค. 45 เม.ย. 70 พ.ค. 65 — เดือนใดขายได้มากที่สุด?',
    'A line graph shows monthly sales: Jan 50, Feb 60, Mar 45, Apr 70, May 65. Which month had the highest sales?',
    [['มกราคม','January'],['กุมภาพันธ์','February'],['มีนาคม','March'],['เมษายน','April']],
    3, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 1),

  Q('แผนภูมิเส้นแสดงยอดขาย 5 เดือน: ม.ค. 50 ก.พ. 60 มี.ค. 45 เม.ย. 70 พ.ค. 65 — เดือนใดยอดขายลดลงจากเดือนก่อน?',
    'Sales: Jan 50, Feb 60, Mar 45, Apr 70, May 65. Which month had lower sales than the month before?',
    [['มกราคม','January'],['กุมภาพันธ์','February'],['มีนาคม','March'],['พฤษภาคม','May']],
    2, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 2),

  Q('แผนภูมิเส้นแสดงยอดขาย 5 เดือน: ม.ค. 50 ก.พ. 60 มี.ค. 45 เม.ย. 70 พ.ค. 65 — ยอดขายเพิ่มขึ้นจาก ม.ค. ถึง ก.พ. เท่าไร?',
    'Sales: Jan 50, Feb 60, Mar 45, Apr 70, May 65. How much did sales increase from January to February?',
    [['5','5'],['10','10'],['15','15'],['20','20']],
    1, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 1),

  Q('แผนภูมิเส้นแสดงยอดขาย 5 เดือน: ม.ค. 50 ก.พ. 60 มี.ค. 45 เม.ย. 70 พ.ค. 65 — ยอดขาย พ.ค. ลดลงจาก เม.ย. เท่าไร?',
    'Sales: Jan 50, Feb 60, Mar 45, Apr 70, May 65. How much did sales fall from April to May?',
    [['5','5'],['15','15'],['10','10'],['20','20']],
    0, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 2),

  Q('แผนภูมิเส้นแสดงยอดขาย 5 เดือน: ม.ค. 50 ก.พ. 60 มี.ค. 45 เม.ย. 70 พ.ค. 65 — ยอดขายรวม 5 เดือนเท่าไร?',
    'Sales: Jan 50, Feb 60, Mar 45, Apr 70, May 65. What are the total sales over 5 months?',
    [['270','270'],['280','280'],['290','290'],['300','300']],
    2, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 2),

  // ชุดข้อมูล C: นักเรียน ป.1=40, ป.2=35, ป.3=45, ป.4=50, ป.5=42
  Q('แผนภูมิเส้นแสดงจำนวนนักเรียนแต่ละชั้น: ป.1=40 ป.2=35 ป.3=45 ป.4=50 ป.5=42 — ชั้นใดมีนักเรียนมากที่สุด?',
    'A line graph shows student counts: G1=40, G2=35, G3=45, G4=50, G5=42. Which grade has the most students?',
    [['ป.1','G1'],['ป.2','G2'],['ป.3','G3'],['ป.4','G4']],
    3, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 1),

  Q('แผนภูมิเส้นแสดงจำนวนนักเรียนแต่ละชั้น: ป.1=40 ป.2=35 ป.3=45 ป.4=50 ป.5=42 — ชั้นใดมีนักเรียนน้อยที่สุด?',
    'Student counts: G1=40, G2=35, G3=45, G4=50, G5=42. Which grade has the fewest students?',
    [['ป.1','G1'],['ป.2','G2'],['ป.4','G4'],['ป.5','G5']],
    1, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 1),

  Q('แผนภูมิเส้นแสดงจำนวนนักเรียนแต่ละชั้น: ป.1=40 ป.2=35 ป.3=45 ป.4=50 ป.5=42 — จำนวนนักเรียนเพิ่มขึ้นจาก ป.3 ถึง ป.4 เท่าไร?',
    'Student counts: G1=40, G2=35, G3=45, G4=50, G5=42. How much did the count increase from G3 to G4?',
    [['3 คน','3'],['5 คน','5'],['7 คน','7'],['10 คน','10']],
    1, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 2),

  Q('แผนภูมิเส้นแสดงจำนวนนักเรียนแต่ละชั้น: ป.1=40 ป.2=35 ป.3=45 ป.4=50 ป.5=42 — ป.1 กับ ป.5 จำนวนต่างกันกี่คน?',
    'Student counts: G1=40, G2=35, G3=45, G4=50, G5=42. How many more students does G5 have than G1?',
    [['2 คน','2'],['5 คน','5'],['8 คน','8'],['3 คน','3']],
    0, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 2),

  // ชุดข้อมูล D: ปริมาณน้ำฝน ม.ค.=20, ก.พ.=15, มี.ค.=30, เม.ย.=25, พ.ค.=40 (มม.)
  Q('แผนภูมิเส้นแสดงปริมาณน้ำฝน (มม.): ม.ค.=20 ก.พ.=15 มี.ค.=30 เม.ย.=25 พ.ค.=40 — เดือนใดฝนตกมากที่สุด?',
    'Rainfall (mm): Jan=20, Feb=15, Mar=30, Apr=25, May=40. Which month had the most rain?',
    [['มกราคม','January'],['มีนาคม','March'],['เมษายน','April'],['พฤษภาคม','May']],
    3, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 1),

  Q('แผนภูมิเส้นแสดงปริมาณน้ำฝน (มม.): ม.ค.=20 ก.พ.=15 มี.ค.=30 เม.ย.=25 พ.ค.=40 — เดือนใดฝนตกน้อยที่สุด?',
    'Rainfall (mm): Jan=20, Feb=15, Mar=30, Apr=25, May=40. Which month had the least rain?',
    [['มกราคม','January'],['กุมภาพันธ์','February'],['มีนาคม','March'],['เมษายน','April']],
    1, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 1),

  Q('แผนภูมิเส้นแสดงปริมาณน้ำฝน (มม.): ม.ค.=20 ก.พ.=15 มี.ค.=30 เม.ย.=25 พ.ค.=40 — ปริมาณน้ำฝนเพิ่มขึ้นจาก มี.ค. ถึง พ.ค. เท่าไร?',
    'Rainfall (mm): Jan=20, Feb=15, Mar=30, Apr=25, May=40. How much did rainfall increase from March to May?',
    [['5 มม.','5 mm'],['10 มม.','10 mm'],['15 มม.','15 mm'],['20 มม.','20 mm']],
    1, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 2),

  Q('แผนภูมิเส้นแสดงปริมาณน้ำฝน (มม.): ม.ค.=20 ก.พ.=15 มี.ค.=30 เม.ย.=25 พ.ค.=40 — ปริมาณน้ำฝนรวม 5 เดือนเท่าไร?',
    'Rainfall (mm): Jan=20, Feb=15, Mar=30, Apr=25, May=40. What is the total rainfall over 5 months?',
    [['120 มม.','120 mm'],['125 มม.','125 mm'],['130 มม.','130 mm'],['135 มม.','135 mm']],
    2, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 2),

  Q('ถ้าเส้นในแผนภูมิเส้นมีทิศทางชี้ขึ้น แสดงว่าข้อมูลเป็นอย่างไร?',
    'If the line in a line graph trends upward, what does it indicate?',
    [['ข้อมูลคงที่','Data is constant'],['ข้อมูลลดลง','Data is decreasing'],['ข้อมูลเพิ่มขึ้น','Data is increasing'],['ข้อมูลไม่สม่ำเสมอ','Data is irregular']],
    2, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 1),

  Q('แผนภูมิเส้นเหมาะกับการนำเสนอข้อมูลประเภทใดมากที่สุด?',
    'Line graphs are best suited for displaying which type of data?',
    [['ข้อมูลเปรียบเทียบหมวดหมู่','Comparing categories'],['การเปลี่ยนแปลงตามช่วงเวลา','Changes over time'],['สัดส่วนของส่วนรวม','Parts of a whole'],['การกระจายของข้อมูล','Distribution of data']],
    1, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 1),

  Q('แกน x (แนวนอน) ในแผนภูมิเส้นที่แสดงข้อมูลรายเดือนมักแสดงอะไร?',
    'In a line graph showing monthly data, what does the x-axis (horizontal) typically show?',
    [['จำนวน/ปริมาณ','Amount/Quantity'],['ชื่อเดือน','Month names'],['เปอร์เซ็นต์','Percentage'],['ค่าเฉลี่ย','Average']],
    1, 'subtopic:statistics-line-chart', 'skill:visual-reasoning', 1),

  // ─── subtopic:statistics-mean (20 ข้อ) ───────────────────────────────────
  Q('ค่าเฉลี่ย (mean) คำนวณจากสูตรใด?',
    'Which formula gives the mean?',
    [['ค่าสูงสุด − ค่าต่ำสุด','Maximum − Minimum'],['ผลรวมทั้งหมด ÷ จำนวนข้อมูล','Sum of all values ÷ Number of values'],['ค่ากลางของข้อมูล','Middle value'],['ค่าที่พบบ่อยที่สุด','Most frequent value']],
    1, 'subtopic:statistics-mean', 'skill:formula', 1),

  Q('คะแนน 4 วิชา: 80, 70, 90, 60 — ค่าเฉลี่ยคะแนนคือเท่าไร?',
    'Scores in 4 subjects: 80, 70, 90, 60. What is the mean score?',
    [['70','70'],['75','75'],['80','80'],['85','85']],
    1, 'subtopic:statistics-mean', 'skill:formula', 1),

  Q('อุณหภูมิ 3 วัน: 28°C, 32°C, 30°C — ค่าเฉลี่ยอุณหภูมิคือเท่าไร?',
    'Temperatures over 3 days: 28°C, 32°C, 30°C. What is the mean temperature?',
    [['28°C','28°C'],['30°C','30°C'],['32°C','32°C'],['34°C','34°C']],
    1, 'subtopic:statistics-mean', 'skill:formula', 1),

  Q('ความสูง 5 คน: 140, 145, 150, 135, 130 ซม. — ค่าเฉลี่ยคือเท่าไร?',
    'Heights of 5 people: 140, 145, 150, 135, 130 cm. What is the mean?',
    [['135 ซม.','135 cm'],['140 ซม.','140 cm'],['145 ซม.','145 cm'],['150 ซม.','150 cm']],
    1, 'subtopic:statistics-mean', 'skill:formula', 2),

  Q('คะแนน 3 ครั้ง: 85, 75, 80 — ค่าเฉลี่ยคือเท่าไร?',
    'Three test scores: 85, 75, 80. What is the mean?',
    [['75','75'],['78','78'],['80','80'],['85','85']],
    2, 'subtopic:statistics-mean', 'skill:formula', 1),

  Q('จำนวน 4 ตัว: 10, 20, 30, 40 — ค่าเฉลี่ยคือเท่าไร?',
    'Four numbers: 10, 20, 30, 40. What is the mean?',
    [['20','20'],['25','25'],['30','30'],['100','100']],
    1, 'subtopic:statistics-mean', 'skill:formula', 1),

  Q('คะแนน 5 วิชา รวมกันได้ 400 คะแนน — ค่าเฉลี่ยคือเท่าไร?',
    'Scores for 5 subjects total 400. What is the mean score?',
    [['60','60'],['70','70'],['80','80'],['90','90']],
    2, 'subtopic:statistics-mean', 'skill:formula', 1),

  Q('ค่าเฉลี่ยของตัวเลข 4 ตัวคือ 15 ผลรวมของตัวเลขทั้งหมดคือเท่าไร?',
    'The mean of 4 numbers is 15. What is the total sum?',
    [['19','19'],['45','45'],['60','60'],['75','75']],
    2, 'subtopic:statistics-mean', 'skill:formula', 2),

  Q('น้ำหนัก 4 คน: 45, 50, 55, 40 กก. — ค่าเฉลี่ยคือเท่าไร?',
    'Weights of 4 people: 45, 50, 55, 40 kg. What is the mean?',
    [['45 กก.','45 kg'],['47.5 กก.','47.5 kg'],['50 กก.','50 kg'],['52.5 กก.','52.5 kg']],
    1, 'subtopic:statistics-mean', 'skill:formula', 2),

  Q('คะแนน 5 คน: 60, 70, 80, 90, 100 — ค่าเฉลี่ยคือเท่าไร?',
    'Five students scored: 60, 70, 80, 90, 100. What is the mean?',
    [['70','70'],['75','75'],['80','80'],['85','85']],
    2, 'subtopic:statistics-mean', 'skill:formula', 1),

  Q('อายุ 3 คน: 10, 12, 14 ปี — ค่าเฉลี่ยอายุคือเท่าไร?',
    'Ages of 3 people: 10, 12, 14 years. What is the mean age?',
    [['10 ปี','10 years'],['11 ปี','11 years'],['12 ปี','12 years'],['14 ปี','14 years']],
    2, 'subtopic:statistics-mean', 'skill:formula', 1),

  Q('ยอดขาย 5 วัน: 100, 150, 200, 120, 130 บาท — ค่าเฉลี่ยยอดขายต่อวันคือเท่าไร?',
    'Sales over 5 days: 100, 150, 200, 120, 130 baht. What is the mean daily sales?',
    [['130 บาท','130 baht'],['140 บาท','140 baht'],['150 บาท','150 baht'],['160 บาท','160 baht']],
    1, 'subtopic:statistics-mean', 'skill:formula', 2),

  Q('คะแนน 4 วิชา มีค่าเฉลี่ย 75 คะแนน ผลรวมคะแนนทั้ง 4 วิชาคือเท่าไร?',
    'Mean score of 4 subjects is 75. What is the total score of all 4 subjects?',
    [['79','79'],['150','150'],['300','300'],['400','400']],
    2, 'subtopic:statistics-mean', 'skill:formula', 2),

  Q('ตัวเลข 3 ตัว: 5, 10, ? ค่าเฉลี่ยเท่ากับ 10 ตัวเลขที่หายไปคือเท่าไร?',
    'Three numbers: 5, 10, ? The mean is 10. What is the missing number?',
    [['10','10'],['15','15'],['20','20'],['25','25']],
    1, 'subtopic:statistics-mean', 'skill:formula', 3),

  Q('จำนวน 6 ตัว รวมกันได้ 90 ค่าเฉลี่ยคือเท่าไร?',
    'Six numbers sum to 90. What is the mean?',
    [['12','12'],['15','15'],['18','18'],['20','20']],
    1, 'subtopic:statistics-mean', 'skill:formula', 1),

  Q('คะแนน 2 ครั้ง: 60, 80 — ค่าเฉลี่ยคือเท่าไร?',
    'Two test scores: 60 and 80. What is the mean?',
    [['60','60'],['65','65'],['70','70'],['75','75']],
    2, 'subtopic:statistics-mean', 'skill:formula', 1),

  Q('ราคาผลไม้ 4 ชนิด: 20, 30, 40, 50 บาท — ค่าเฉลี่ยราคาคือเท่าไร?',
    'Prices of 4 fruits: 20, 30, 40, 50 baht. What is the mean price?',
    [['30 บาท','30 baht'],['35 บาท','35 baht'],['40 บาท','40 baht'],['45 บาท','45 baht']],
    1, 'subtopic:statistics-mean', 'skill:formula', 1),

  Q('อุณหภูมิ 4 วัน: 30, 32, 28, 34°C — ค่าเฉลี่ยคือเท่าไร?',
    'Temperatures over 4 days: 30, 32, 28, 34°C. What is the mean?',
    [['30°C','30°C'],['31°C','31°C'],['32°C','32°C'],['33°C','33°C']],
    1, 'subtopic:statistics-mean', 'skill:formula', 2),

  Q('คะแนน 5 คน มีค่าเฉลี่ย 80 คะแนน ผลรวมคะแนนคือเท่าไร?',
    'Mean score of 5 students is 80. What is the total of all scores?',
    [['85','85'],['160','160'],['400','400'],['500','500']],
    2, 'subtopic:statistics-mean', 'skill:formula', 2),

  Q('คะแนน 4 วิชา: 75, 85, 95, 65 — ค่าเฉลี่ยคือเท่าไร?',
    'Scores in 4 subjects: 75, 85, 95, 65. What is the mean?',
    [['75','75'],['78','78'],['80','80'],['85','85']],
    2, 'subtopic:statistics-mean', 'skill:formula', 2),

];

async function main() {
  let count = 0;
  for (const q of questions) {
    await prisma.question.create({ data: q });
    count++;
  }
  console.log(`✅ สร้างข้อสอบ ${count} ข้อ (topic:statistics, p5)`);

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
