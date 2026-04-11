// seed-questions-geometry-p5.js
// topic:geometry, grade p5, 1 subtopic × 20 ข้อ = 20 ข้อ
// subtopic: geometry-circle (minGrade = 5)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = { examGrade: 'p5', topic: ['topic:geometry'] };
const Q = (textTh, textEn, choices, answer, subtopic, skill, difficulty, trap = []) => ({
  textTh, textEn,
  choices: choices.map(c => ({ textTh: c[0], textEn: c[1] })),
  answer,
  attributes: { ...BASE, subtopic: [subtopic], skill: [skill], trap, difficulty },
  ownerOrg: 'system', createdBy: 'seed', updatedBy: 'seed',
  aiGenerated: false, needsReview: false,
});

const questions = [

  // ─── subtopic:geometry-circle (20 ข้อ) ───────────────────────────────────
  Q('ส่วนใดของวงกลมที่วัดระยะจากจุดศูนย์กลางถึงเส้นรอบวง?',
    'Which part of a circle measures the distance from the centre to the circumference?',
    [['เส้นผ่านศูนย์กลาง','Diameter'],['รัศมี','Radius'],['เส้นรอบวง','Circumference'],['คอร์ด','Chord']],
    1, 'subtopic:geometry-circle', 'skill:arithmetic', 1),

  Q('จุดศูนย์กลางของวงกลมอยู่ที่ไหน?',
    'Where is the centre of a circle?',
    [['บนเส้นรอบวง','On the circumference'],['ตรงกลางวงกลมพอดี','Exactly in the middle of the circle'],['นอกวงกลม','Outside the circle'],['ที่ปลายเส้นผ่านศูนย์กลาง','At the end of the diameter']],
    1, 'subtopic:geometry-circle', 'skill:arithmetic', 1),

  Q('เส้นผ่านศูนย์กลางของวงกลมคืออะไร?',
    'What is the diameter of a circle?',
    [['เส้นจากศูนย์กลางถึงขอบ','A line from the centre to the edge'],['เส้นผ่านศูนย์กลางจากขอบถึงขอบ','A line through the centre from edge to edge'],['เส้นรอบวงทั้งหมด','The full circumference'],['เส้นที่เชื่อมสองจุดบนขอบใดก็ได้','Any line connecting two points on the edge']],
    1, 'subtopic:geometry-circle', 'skill:arithmetic', 1),

  Q('วงกลมรัศมี 5 ซม. มีเส้นผ่านศูนย์กลางยาวเท่าไร?',
    'A circle has a radius of 5 cm. What is the diameter?',
    [['5 ซม.','5 cm'],['10 ซม.','10 cm'],['15 ซม.','15 cm'],['25 ซม.','25 cm']],
    1, 'subtopic:geometry-circle', 'skill:arithmetic', 1),

  Q('วงกลมเส้นผ่านศูนย์กลาง 12 ซม. มีรัศมียาวเท่าไร?',
    'A circle has a diameter of 12 cm. What is the radius?',
    [['3 ซม.','3 cm'],['6 ซม.','6 cm'],['12 ซม.','12 cm'],['24 ซม.','24 cm']],
    1, 'subtopic:geometry-circle', 'skill:arithmetic', 1),

  Q('วงกลมรัศมี 14 ซม. มีเส้นผ่านศูนย์กลางยาวเท่าไร?',
    'A circle has a radius of 14 cm. What is the diameter?',
    [['7 ซม.','7 cm'],['14 ซม.','14 cm'],['28 ซม.','28 cm'],['56 ซม.','56 cm']],
    2, 'subtopic:geometry-circle', 'skill:arithmetic', 1),

  Q('เส้นผ่านศูนย์กลางวงกลมยาว 6 ซม. รัศมียาวเท่าไร?',
    'A circle has a diameter of 6 cm. What is the radius?',
    [['1.5 ซม.','1.5 cm'],['3 ซม.','3 cm'],['6 ซม.','6 cm'],['12 ซม.','12 cm']],
    1, 'subtopic:geometry-circle', 'skill:arithmetic', 1),

  Q('สูตรคำนวณเส้นรอบวงของวงกลมคือข้อใด?',
    'Which formula is used to calculate the circumference of a circle?',
    [['πr²','πr²'],['2πr','2πr'],['πr','πr'],['2r','2r']],
    1, 'subtopic:geometry-circle', 'skill:formula', 1),

  Q('วงกลมรัศมี 7 ซม. มีเส้นรอบวงเท่าไร? (ใช้ π ≈ 22/7)',
    'A circle has radius 7 cm. What is the circumference? (use π ≈ 22/7)',
    [['22 ซม.','22 cm'],['44 ซม.','44 cm'],['154 ซม.','154 cm'],['11 ซม.','11 cm']],
    1, 'subtopic:geometry-circle', 'skill:formula', 2),

  Q('วงกลมเส้นผ่านศูนย์กลาง 10 ซม. มีเส้นรอบวงเท่าไร? (ใช้ π ≈ 3.14)',
    'A circle has diameter 10 cm. What is the circumference? (use π ≈ 3.14)',
    [['31.4 ซม.','31.4 cm'],['62.8 ซม.','62.8 cm'],['15.7 ซม.','15.7 cm'],['314 ซม.','314 cm']],
    0, 'subtopic:geometry-circle', 'skill:formula', 2),

  Q('วงกลมรัศมี 5 ซม. มีเส้นรอบวงเท่าไร? (ใช้ π ≈ 3.14)',
    'A circle has radius 5 cm. What is the circumference? (use π ≈ 3.14)',
    [['15.7 ซม.','15.7 cm'],['31.4 ซม.','31.4 cm'],['78.5 ซม.','78.5 cm'],['62.8 ซม.','62.8 cm']],
    1, 'subtopic:geometry-circle', 'skill:formula', 2),

  Q('วงกลมเส้นผ่านศูนย์กลาง 20 ซม. มีเส้นรอบวงเท่าไร? (ใช้ π ≈ 3.14)',
    'A circle has diameter 20 cm. What is the circumference? (use π ≈ 3.14)',
    [['62.8 ซม.','62.8 cm'],['31.4 ซม.','31.4 cm'],['125.6 ซม.','125.6 cm'],['6.28 ซม.','6.28 cm']],
    0, 'subtopic:geometry-circle', 'skill:formula', 2),

  Q('วงกลมรัศมี 10 ซม. มีเส้นรอบวงเท่าไร? (ใช้ π ≈ 3.14)',
    'A circle has radius 10 cm. What is the circumference? (use π ≈ 3.14)',
    [['31.4 ซม.','31.4 cm'],['314 ซม.','314 cm'],['62.8 ซม.','62.8 cm'],['6.28 ซม.','6.28 cm']],
    2, 'subtopic:geometry-circle', 'skill:formula', 2),

  Q('คอร์ด (chord) ของวงกลมคืออะไร?',
    'What is a chord of a circle?',
    [['เส้นรัศมี','A radius'],['เส้นผ่านศูนย์กลาง','A diameter'],['เส้นตรงที่เชื่อมสองจุดบนเส้นรอบวง','A line connecting two points on the circumference'],['เส้นรอบวง','The circumference']],
    2, 'subtopic:geometry-circle', 'skill:arithmetic', 2),

  Q('เส้นผ่านศูนย์กลางเป็นคอร์ดที่ยาวที่สุดของวงกลม ข้อความนี้ถูกต้องหรือไม่?',
    'The diameter is the longest chord of a circle. Is this correct?',
    [['ผิด เพราะรัศมียาวกว่าเส้นผ่านศูนย์กลาง','Incorrect, the radius is longer'],['ผิด เพราะเส้นรอบวงยาวกว่า','Incorrect, the circumference is longer'],['ถูกต้อง เส้นผ่านศูนย์กลางยาวที่สุด','Correct, the diameter is the longest'],['ผิด เพราะคอร์ดอื่นอาจยาวกว่าได้','Incorrect, other chords may be longer']],
    2, 'subtopic:geometry-circle', 'skill:proof', 2),

  Q('วงกลมวงหนึ่งมีเส้นรอบวง 62.8 ซม. มีรัศมีเท่าไร? (ใช้ π ≈ 3.14)',
    'A circle has a circumference of 62.8 cm. What is the radius? (use π ≈ 3.14)',
    [['5 ซม.','5 cm'],['10 ซม.','10 cm'],['20 ซม.','20 cm'],['31.4 ซม.','31.4 cm']],
    1, 'subtopic:geometry-circle', 'skill:formula', 3),

  Q('รัศมีของวงกลมยาว r เซนติเมตร เส้นผ่านศูนย์กลางยาวเท่าไร?',
    'A circle has radius r cm. What is the diameter?',
    [['r/2 ซม.','r/2 cm'],['r ซม.','r cm'],['2r ซม.','2r cm'],['r² ซม.','r² cm']],
    2, 'subtopic:geometry-circle', 'skill:arithmetic', 1),

  Q('วงล้อรัศมี 7 ซม. หมุนครบ 1 รอบ กลิ้งไปได้ระยะทางเท่าไร? (ใช้ π ≈ 22/7)',
    'A wheel has radius 7 cm. When it completes one full rotation, how far does it roll? (use π ≈ 22/7)',
    [['22 ซม.','22 cm'],['44 ซม.','44 cm'],['154 ซม.','154 cm'],['88 ซม.','88 cm']],
    1, 'subtopic:geometry-circle', 'skill:word-problem', 2),

  Q('สนามวิ่งวงกลมรัศมี 21 เมตร วิ่งรอบสนามหนึ่งรอบได้ระยะทางเท่าไร? (ใช้ π ≈ 22/7)',
    'A circular track has radius 21 m. What is the distance of one lap? (use π ≈ 22/7)',
    [['66 เมตร','66 m'],['132 เมตร','132 m'],['44 เมตร','44 m'],['1,386 เมตร','1,386 m']],
    1, 'subtopic:geometry-circle', 'skill:word-problem', 2),

  Q('นาฬิกาวงกลมเส้นผ่านศูนย์กลาง 28 ซม. มีเส้นรอบวงเท่าไร? (ใช้ π ≈ 22/7)',
    'A circular clock has diameter 28 cm. What is the circumference? (use π ≈ 22/7)',
    [['44 ซม.','44 cm'],['88 ซม.','88 cm'],['176 ซม.','176 cm'],['616 ซม.','616 cm']],
    1, 'subtopic:geometry-circle', 'skill:word-problem', 2),

];

async function main() {
  let count = 0;
  for (const q of questions) {
    await prisma.question.create({ data: q });
    count++;
  }
  console.log(`✅ สร้างข้อสอบ ${count} ข้อ (topic:geometry, p5)`);

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
