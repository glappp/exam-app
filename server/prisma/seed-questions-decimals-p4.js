// seed-questions-decimals-p4.js
// topic:decimals, grade p4, 6 subtopics × 20 ข้อ = 120 ข้อ
// (multiply/divide ข้าม — minGrade = 5)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = { examGrade: 'p4', topic: ['topic:decimals'] };
const Q = (textTh, textEn, choices, answer, subtopic, skill, difficulty, trap = []) => ({
  textTh, textEn,
  choices: choices.map(c => ({ textTh: c[0], textEn: c[1] })),
  answer,
  attributes: { ...BASE, subtopic: [subtopic], skill: [skill], trap, difficulty },
  ownerOrg: 'system', createdBy: 'seed', updatedBy: 'seed',
  aiGenerated: false, needsReview: false,
});

const questions = [

  // ─── subtopic:decimals-concept (20 ข้อ) ───────────────────────────────────
  Q('0.5 อ่านว่าอย่างไร?',
    'How do you read 0.5?',
    [['ห้าสิบ','Fifty'],['ศูนย์จุดห้า','Zero point five'],['ห้าในสิบ','Five tenths'],['ห้าร้อย','Five hundred']],
    1, 'subtopic:decimals-concept', 'skill:arithmetic', 1),

  Q('ทศนิยม 0.3 มีค่าเท่ากับเศษส่วนใด?',
    'The decimal 0.3 equals which fraction?',
    [['3/100','3/100'],['3/10','3/10'],['30/10','30/10'],['1/3','1/3']],
    1, 'subtopic:decimals-concept', 'skill:arithmetic', 1),

  Q('"สองจุดห้า" เขียนเป็นตัวเลขว่า?',
    'Write "two point five" as a number.',
    [['25','25'],['2.5','2.5'],['0.25','0.25'],['25.0','25.0']],
    1, 'subtopic:decimals-concept', 'skill:arithmetic', 1),

  Q('เลข 7 ในทศนิยม 3.7 อยู่ในหลักใด?',
    'The digit 7 in 3.7 is in which place?',
    [['หลักหน่วย','Units place'],['หลักสิบ','Tens place'],['หลักทศนิยมที่ 1','First decimal place'],['หลักทศนิยมที่ 2','Second decimal place']],
    2, 'subtopic:decimals-concept', 'skill:arithmetic', 1),

  Q('0.07 มีค่าเท่ากับเท่าไร?',
    'What is the value of 0.07?',
    [['7/10','7/10'],['7/100','7/100'],['7/1000','7/1000'],['70/100','70/100']],
    1, 'subtopic:decimals-concept', 'skill:arithmetic', 2),

  Q('"สี่จุดสองห้า" เขียนเป็นตัวเลขว่า?',
    'Write "four point two five" as a number.',
    [['4.025','4.025'],['4.25','4.25'],['42.5','42.5'],['0.425','0.425']],
    1, 'subtopic:decimals-concept', 'skill:arithmetic', 1),

  Q('ทศนิยม 1.6 มีค่าอยู่ระหว่างจำนวนเต็มใดสองจำนวน?',
    'The decimal 1.6 is between which two whole numbers?',
    [['0 และ 1','0 and 1'],['1 และ 2','1 and 2'],['2 และ 3','2 and 3'],['6 และ 7','6 and 7']],
    1, 'subtopic:decimals-concept', 'skill:arithmetic', 1),

  Q('เลข 4 ในทศนิยม 5.04 อยู่ในหลักใด?',
    'The digit 4 in 5.04 is in which place?',
    [['หลักสิบ','Tens place'],['หลักทศนิยมที่ 1','First decimal place'],['หลักทศนิยมที่ 2','Second decimal place'],['หลักหน่วย','Units place']],
    2, 'subtopic:decimals-concept', 'skill:arithmetic', 2),

  Q('0.9 อ่านว่าอย่างไร?',
    'How do you read 0.9?',
    [['เก้าสิบ','Ninety'],['ศูนย์จุดเก้า','Zero point nine'],['เก้าร้อย','Nine hundred'],['เก้าพัน','Nine thousand']],
    1, 'subtopic:decimals-concept', 'skill:arithmetic', 1),

  Q('ทศนิยม 0.50 และ 0.5 มีค่า?',
    'Do 0.50 and 0.5 have the same value?',
    [['0.50 > 0.5','0.50 > 0.5'],['0.50 < 0.5','0.50 < 0.5'],['0.50 = 0.5','0.50 = 0.5'],['บอกไม่ได้','Cannot tell']],
    2, 'subtopic:decimals-concept', 'skill:arithmetic', 2, ['trap:confusing-choice']),

  Q('"สามจุดศูนย์หก" เขียนเป็นตัวเลขว่า?',
    'Write "three point zero six" as a number.',
    [['3.6','3.6'],['3.06','3.06'],['30.6','30.6'],['0.306','0.306']],
    1, 'subtopic:decimals-concept', 'skill:arithmetic', 2, ['trap:misread']),

  Q('ทศนิยม 12.34 มีตัวเลขกี่ตำแหน่งหลังจุดทศนิยม?',
    'How many decimal places does 12.34 have?',
    [['1 ตำแหน่ง','1 place'],['2 ตำแหน่ง','2 places'],['3 ตำแหน่ง','3 places'],['4 ตำแหน่ง','4 places']],
    1, 'subtopic:decimals-concept', 'skill:arithmetic', 1),

  Q('เลข 5 ในทศนิยม 25.38 อยู่ในหลักใด?',
    'The digit 5 in 25.38 is in which place?',
    [['หลักหมื่น','Ten-thousands'],['หลักพัน','Thousands'],['หลักสิบ','Tens'],['หลักหน่วย','Units']],
    3, 'subtopic:decimals-concept', 'skill:arithmetic', 2),

  Q('0.01 มีค่าเท่ากับข้อใด?',
    'What does 0.01 equal?',
    [['1/10','1/10'],['1/100','1/100'],['1/1000','1/1000'],['10/100','10/100']],
    1, 'subtopic:decimals-concept', 'skill:arithmetic', 1),

  Q('ทศนิยมใดมีค่าเท่ากับ 7/10?',
    'Which decimal equals 7/10?',
    [['0.07','0.07'],['0.7','0.7'],['7.0','7.0'],['70.0','70.0']],
    1, 'subtopic:decimals-concept', 'skill:arithmetic', 1),

  Q('"ศูนย์จุดศูนย์แปด" เขียนเป็นตัวเลขว่า?',
    'Write "zero point zero eight" as a number.',
    [['0.8','0.8'],['0.08','0.08'],['8.0','8.0'],['0.008','0.008']],
    1, 'subtopic:decimals-concept', 'skill:arithmetic', 2, ['trap:misread']),

  Q('ทศนิยม 6.09 อ่านว่าอย่างไร?',
    'How do you read 6.09?',
    [['หกจุดเก้า','Six point nine'],['หกจุดศูนย์เก้า','Six point zero nine'],['หกสิบเก้า','Sixty-nine'],['หกจุดเก้าสิบ','Six point ninety']],
    1, 'subtopic:decimals-concept', 'skill:arithmetic', 2, ['trap:misread']),

  Q('ค่าประจำหลักของเลข 3 ในทศนิยม 0.03 คือ?',
    'What is the place value of 3 in 0.03?',
    [['3/10','3/10'],['3/100','3/100'],['3/1000','3/1000'],['30/100','30/100']],
    1, 'subtopic:decimals-concept', 'skill:arithmetic', 2),

  Q('ทศนิยมใดมีค่าเท่ากับ 45/100?',
    'Which decimal equals 45/100?',
    [['4.5','4.5'],['0.45','0.45'],['0.045','0.045'],['45.0','45.0']],
    1, 'subtopic:decimals-concept', 'skill:arithmetic', 2),

  Q('1.0 กับ 1 มีค่า?',
    'Do 1.0 and 1 have the same value?',
    [['1.0 > 1','1.0 > 1'],['1.0 < 1','1.0 < 1'],['1.0 = 1','1.0 = 1'],['บอกไม่ได้','Cannot tell']],
    2, 'subtopic:decimals-concept', 'skill:arithmetic', 1),

  // ─── subtopic:decimals-compare (20 ข้อ) ───────────────────────────────────
  Q('0.3 กับ 0.7 ข้อใดถูกต้อง?',
    '0.3 compared to 0.7 — which is correct?',
    [['0.3 > 0.7','0.3 > 0.7'],['0.3 = 0.7','0.3 = 0.7'],['0.3 < 0.7','0.3 < 0.7'],['เปรียบเทียบไม่ได้','Cannot compare']],
    2, 'subtopic:decimals-compare', 'skill:arithmetic', 1),

  Q('ทศนิยมใดมากที่สุด?',
    'Which decimal is the greatest?',
    [['0.5','0.5'],['0.8','0.8'],['0.3','0.3'],['0.1','0.1']],
    1, 'subtopic:decimals-compare', 'skill:arithmetic', 1),

  Q('1.5 กับ 1.9 ข้อใดถูกต้อง?',
    '1.5 compared to 1.9 — which is correct?',
    [['1.5 > 1.9','1.5 > 1.9'],['1.5 = 1.9','1.5 = 1.9'],['1.5 < 1.9','1.5 < 1.9'],['เปรียบเทียบไม่ได้','Cannot compare']],
    2, 'subtopic:decimals-compare', 'skill:arithmetic', 1),

  Q('เรียง 0.2, 0.8, 0.5 จากน้อยไปมาก ข้อใดถูกต้อง?',
    'Arrange 0.2, 0.8, 0.5 from least to greatest.',
    [['0.8, 0.5, 0.2','0.8, 0.5, 0.2'],['0.2, 0.5, 0.8','0.2, 0.5, 0.8'],['0.5, 0.2, 0.8','0.5, 0.2, 0.8'],['0.2, 0.8, 0.5','0.2, 0.8, 0.5']],
    1, 'subtopic:decimals-compare', 'skill:arithmetic', 1),

  Q('3.4 กับ 3.40 ข้อใดถูกต้อง?',
    '3.4 compared to 3.40 — which is correct?',
    [['3.4 > 3.40','3.4 > 3.40'],['3.4 < 3.40','3.4 < 3.40'],['3.4 = 3.40','3.4 = 3.40'],['เปรียบเทียบไม่ได้','Cannot compare']],
    2, 'subtopic:decimals-compare', 'skill:arithmetic', 2, ['trap:confusing-choice']),

  Q('ทศนิยมใดน้อยที่สุด?',
    'Which decimal is the smallest?',
    [['2.5','2.5'],['2.15','2.15'],['2.9','2.9'],['2.05','2.05']],
    3, 'subtopic:decimals-compare', 'skill:arithmetic', 2, ['trap:confusing-choice']),

  Q('0.09 กับ 0.1 ข้อใดถูกต้อง?',
    '0.09 compared to 0.1 — which is correct?',
    [['0.09 > 0.1','0.09 > 0.1'],['0.09 = 0.1','0.09 = 0.1'],['0.09 < 0.1','0.09 < 0.1'],['เปรียบเทียบไม่ได้','Cannot compare']],
    2, 'subtopic:decimals-compare', 'skill:arithmetic', 2, ['trap:confusing-choice']),

  Q('เรียง 4.1, 4.01, 4.10, 4.001 จากมากไปน้อย ข้อใดถูกต้อง?',
    'Arrange 4.1, 4.01, 4.10, 4.001 from greatest to least.',
    [['4.1, 4.10, 4.01, 4.001','4.1, 4.10, 4.01, 4.001'],
     ['4.1, 4.01, 4.10, 4.001','4.1, 4.01, 4.10, 4.001'],
     ['4.001, 4.01, 4.1, 4.10','4.001, 4.01, 4.1, 4.10'],
     ['4.10, 4.1, 4.01, 4.001','4.10, 4.1, 4.01, 4.001']],
    3, 'subtopic:decimals-compare', 'skill:arithmetic', 3, ['trap:confusing-choice']),

  Q('ข้อใดถูกต้อง?',
    'Which statement is correct?',
    [['0.5 < 0.05','0.5 < 0.05'],['1.2 > 1.9','1.2 > 1.9'],['3.7 > 3.5','3.7 > 3.5'],['0.8 < 0.08','0.8 < 0.08']],
    2, 'subtopic:decimals-compare', 'skill:arithmetic', 1),

  Q('ทศนิยมใดมีค่ามากกว่า 2.6?',
    'Which decimal is greater than 2.6?',
    [['2.5','2.5'],['2.06','2.06'],['2.7','2.7'],['2.60','2.60']],
    2, 'subtopic:decimals-compare', 'skill:arithmetic', 1),

  Q('5.30 กับ 5.3 ข้อใดถูกต้อง?',
    '5.30 compared to 5.3 — which is correct?',
    [['5.30 > 5.3','5.30 > 5.3'],['5.30 = 5.3','5.30 = 5.3'],['5.30 < 5.3','5.30 < 5.3'],['เปรียบเทียบไม่ได้','Cannot compare']],
    1, 'subtopic:decimals-compare', 'skill:arithmetic', 2, ['trap:confusing-choice']),

  Q('เรียง 0.3, 0.03, 3.0, 0.30 จากน้อยไปมาก ข้อใดถูกต้อง?',
    'Arrange 0.3, 0.03, 3.0, 0.30 from least to greatest.',
    [['0.03, 0.3, 0.30, 3.0','0.03, 0.3, 0.30, 3.0'],
     ['0.3, 0.03, 0.30, 3.0','0.3, 0.03, 0.30, 3.0'],
     ['3.0, 0.30, 0.3, 0.03','3.0, 0.30, 0.3, 0.03'],
     ['0.03, 0.30, 0.3, 3.0','0.03, 0.30, 0.3, 3.0']],
    0, 'subtopic:decimals-compare', 'skill:arithmetic', 3, ['trap:confusing-choice']),

  Q('ทศนิยมใดน้อยกว่า 0.5?',
    'Which decimal is less than 0.5?',
    [['0.6','0.6'],['0.50','0.50'],['0.49','0.49'],['0.51','0.51']],
    2, 'subtopic:decimals-compare', 'skill:arithmetic', 2),

  Q('7.8 กับ 8.7 ข้อใดถูกต้อง?',
    '7.8 compared to 8.7 — which is correct?',
    [['7.8 > 8.7','7.8 > 8.7'],['7.8 = 8.7','7.8 = 8.7'],['7.8 < 8.7','7.8 < 8.7'],['เปรียบเทียบไม่ได้','Cannot compare']],
    2, 'subtopic:decimals-compare', 'skill:arithmetic', 1),

  Q('ทศนิยมใดมีค่ามากที่สุด?',
    'Which decimal is the greatest?',
    [['1.09','1.09'],['1.9','1.9'],['1.90','1.90'],['1.099','1.099']],
    1, 'subtopic:decimals-compare', 'skill:arithmetic', 2, ['trap:confusing-choice']),

  Q('0.25 กับ 0.52 ข้อใดถูกต้อง?',
    '0.25 compared to 0.52 — which is correct?',
    [['0.25 > 0.52','0.25 > 0.52'],['0.25 = 0.52','0.25 = 0.52'],['0.25 < 0.52','0.25 < 0.52'],['เปรียบเทียบไม่ได้','Cannot compare']],
    2, 'subtopic:decimals-compare', 'skill:arithmetic', 1),

  Q('เรียง 2.4, 2.04, 2.44, 2.40 จากน้อยไปมาก ข้อใดถูกต้อง?',
    'Arrange 2.4, 2.04, 2.44, 2.40 from least to greatest.',
    [['2.04, 2.4, 2.40, 2.44','2.04, 2.4, 2.40, 2.44'],
     ['2.4, 2.04, 2.40, 2.44','2.4, 2.04, 2.40, 2.44'],
     ['2.44, 2.40, 2.4, 2.04','2.44, 2.40, 2.4, 2.04'],
     ['2.04, 2.40, 2.4, 2.44','2.04, 2.40, 2.4, 2.44']],
    0, 'subtopic:decimals-compare', 'skill:arithmetic', 3, ['trap:confusing-choice']),

  Q('ข้อใดถูกต้อง?',
    'Which statement is correct?',
    [['0.1 < 0.01','0.1 < 0.01'],['0.10 = 0.1','0.10 = 0.1'],['1.5 < 1.05','1.5 < 1.05'],['2.3 > 3.2','2.3 > 3.2']],
    1, 'subtopic:decimals-compare', 'skill:arithmetic', 2, ['trap:confusing-choice']),

  Q('ทศนิยมใดอยู่ระหว่าง 0.3 และ 0.5?',
    'Which decimal is between 0.3 and 0.5?',
    [['0.2','0.2'],['0.6','0.6'],['0.4','0.4'],['0.55','0.55']],
    2, 'subtopic:decimals-compare', 'skill:arithmetic', 1),

  Q('ทศนิยมใดน้อยกว่า 1.0?',
    'Which decimal is less than 1.0?',
    [['1.1','1.1'],['1.01','1.01'],['0.99','0.99'],['1.10','1.10']],
    2, 'subtopic:decimals-compare', 'skill:arithmetic', 1),

  // ─── subtopic:decimals-add (20 ข้อ) ───────────────────────────────────────
  Q('0.3 + 0.5 = ?',
    '0.3 + 0.5 = ?',
    [['0.35','0.35'],['0.8','0.8'],['8.0','8.0'],['0.08','0.08']],
    1, 'subtopic:decimals-add', 'skill:arithmetic', 1),

  Q('1.2 + 3.4 = ?',
    '1.2 + 3.4 = ?',
    [['4.6','4.6'],['4.56','4.56'],['34.12','34.12'],['46.0','46.0']],
    0, 'subtopic:decimals-add', 'skill:arithmetic', 1),

  Q('0.7 + 0.6 = ?',
    '0.7 + 0.6 = ?',
    [['0.13','0.13'],['1.3','1.3'],['13.0','13.0'],['0.76','0.76']],
    1, 'subtopic:decimals-add', 'skill:arithmetic', 1),

  Q('2.5 + 1.8 = ?',
    '2.5 + 1.8 = ?',
    [['3.13','3.13'],['4.3','4.3'],['3.3','3.3'],['4.13','4.13']],
    1, 'subtopic:decimals-add', 'skill:arithmetic', 2),

  Q('0.25 + 0.34 = ?',
    '0.25 + 0.34 = ?',
    [['0.59','0.59'],['5.9','5.9'],['0.059','0.059'],['59.0','59.0']],
    0, 'subtopic:decimals-add', 'skill:arithmetic', 1),

  Q('5.0 + 3.7 = ?',
    '5.0 + 3.7 = ?',
    [['8.7','8.7'],['8.07','8.07'],['0.87','0.87'],['87.0','87.0']],
    0, 'subtopic:decimals-add', 'skill:arithmetic', 1),

  Q('1.45 + 2.30 = ?',
    '1.45 + 2.30 = ?',
    [['3.75','3.75'],['3.50','3.50'],['37.5','37.5'],['3.70','3.70']],
    0, 'subtopic:decimals-add', 'skill:arithmetic', 2),

  Q('0.8 + 0.8 = ?',
    '0.8 + 0.8 = ?',
    [['0.16','0.16'],['1.6','1.6'],['16.0','16.0'],['0.88','0.88']],
    1, 'subtopic:decimals-add', 'skill:arithmetic', 1),

  Q('3.14 + 1.86 = ?',
    '3.14 + 1.86 = ?',
    [['4.90','4.90'],['5.00','5.00'],['4.00','4.00'],['5.10','5.10']],
    1, 'subtopic:decimals-add', 'skill:arithmetic', 2),

  Q('0.06 + 0.04 = ?',
    '0.06 + 0.04 = ?',
    [['0.10','0.10'],['0.010','0.010'],['1.0','1.0'],['0.0010','0.0010']],
    0, 'subtopic:decimals-add', 'skill:arithmetic', 2),

  Q('12.5 + 7.5 = ?',
    '12.5 + 7.5 = ?',
    [['19.0','19.0'],['20.0','20.0'],['19.10','19.10'],['20.10','20.10']],
    1, 'subtopic:decimals-add', 'skill:arithmetic', 1),

  Q('4.72 + 3.18 = ?',
    '4.72 + 3.18 = ?',
    [['7.80','7.80'],['7.90','7.90'],['8.90','8.90'],['7.10','7.10']],
    1, 'subtopic:decimals-add', 'skill:arithmetic', 2),

  Q('0.4 + 0.06 = ?',
    '0.4 + 0.06 = ?',
    [['0.10','0.10'],['0.46','0.46'],['1.0','1.0'],['4.6','4.6']],
    1, 'subtopic:decimals-add', 'skill:arithmetic', 2, ['trap:confusing-choice']),

  Q('9.9 + 0.1 = ?',
    '9.9 + 0.1 = ?',
    [['9.10','9.10'],['10.0','10.0'],['9.91','9.91'],['10.1','10.1']],
    1, 'subtopic:decimals-add', 'skill:arithmetic', 1),

  Q('1.1 + 1.1 + 1.1 = ?',
    '1.1 + 1.1 + 1.1 = ?',
    [['3.3','3.3'],['3.13','3.13'],['3.03','3.03'],['33.0','33.0']],
    0, 'subtopic:decimals-add', 'skill:arithmetic', 2),

  Q('0.50 + 0.50 = ?',
    '0.50 + 0.50 = ?',
    [['0.100','0.100'],['1.00','1.00'],['0.010','0.010'],['10.0','10.0']],
    1, 'subtopic:decimals-add', 'skill:arithmetic', 1),

  Q('6.37 + 2.45 = ?',
    '6.37 + 2.45 = ?',
    [['8.72','8.72'],['8.82','8.82'],['8.92','8.92'],['9.82','9.82']],
    1, 'subtopic:decimals-add', 'skill:arithmetic', 2),

  Q('จำนวนที่บวก 3.5 แล้วได้ 10.0 คือ?',
    'What number added to 3.5 gives 10.0?',
    [['6.5','6.5'],['7.5','7.5'],['6.0','6.0'],['7.0','7.0']],
    0, 'subtopic:decimals-add', 'skill:arithmetic', 2),

  Q('0.99 + 0.01 = ?',
    '0.99 + 0.01 = ?',
    [['0.910','0.910'],['1.00','1.00'],['0.100','0.100'],['1.01','1.01']],
    1, 'subtopic:decimals-add', 'skill:arithmetic', 1),

  Q('5.25 + _____ = 10.00',
    '5.25 + _____ = 10.00',
    [['4.75','4.75'],['5.75','5.75'],['4.85','4.85'],['5.25','5.25']],
    0, 'subtopic:decimals-add', 'skill:arithmetic', 3),

  // ─── subtopic:decimals-subtract (20 ข้อ) ──────────────────────────────────
  Q('0.9 - 0.4 = ?',
    '0.9 - 0.4 = ?',
    [['0.5','0.5'],['0.13','0.13'],['1.3','1.3'],['5.0','5.0']],
    0, 'subtopic:decimals-subtract', 'skill:arithmetic', 1),

  Q('3.8 - 1.5 = ?',
    '3.8 - 1.5 = ?',
    [['2.3','2.3'],['2.13','2.13'],['5.3','5.3'],['1.3','1.3']],
    0, 'subtopic:decimals-subtract', 'skill:arithmetic', 1),

  Q('1.0 - 0.3 = ?',
    '1.0 - 0.3 = ?',
    [['0.7','0.7'],['0.03','0.03'],['1.3','1.3'],['7.0','7.0']],
    0, 'subtopic:decimals-subtract', 'skill:arithmetic', 1),

  Q('5.6 - 2.4 = ?',
    '5.6 - 2.4 = ?',
    [['8.0','8.0'],['3.2','3.2'],['2.3','2.3'],['3.20','3.20']],
    1, 'subtopic:decimals-subtract', 'skill:arithmetic', 1),

  Q('0.75 - 0.25 = ?',
    '0.75 - 0.25 = ?',
    [['0.25','0.25'],['0.50','0.50'],['1.0','1.0'],['0.100','0.100']],
    1, 'subtopic:decimals-subtract', 'skill:arithmetic', 1),

  Q('10.0 - 3.5 = ?',
    '10.0 - 3.5 = ?',
    [['6.5','6.5'],['7.5','7.5'],['6.0','6.0'],['7.0','7.0']],
    0, 'subtopic:decimals-subtract', 'skill:arithmetic', 1),

  Q('4.82 - 1.61 = ?',
    '4.82 - 1.61 = ?',
    [['3.21','3.21'],['3.11','3.11'],['3.31','3.31'],['6.43','6.43']],
    0, 'subtopic:decimals-subtract', 'skill:arithmetic', 2),

  Q('2.0 - 0.6 = ?',
    '2.0 - 0.6 = ?',
    [['1.4','1.4'],['1.6','1.6'],['2.6','2.6'],['1.40','1.40']],
    0, 'subtopic:decimals-subtract', 'skill:arithmetic', 2),

  Q('9.5 - 9.5 = ?',
    '9.5 - 9.5 = ?',
    [['1','1'],['0.0','0.0'],['18.0','18.0'],['0.5','0.5']],
    1, 'subtopic:decimals-subtract', 'skill:arithmetic', 1),

  Q('0.80 - 0.35 = ?',
    '0.80 - 0.35 = ?',
    [['0.45','0.45'],['0.55','0.55'],['0.35','0.35'],['1.15','1.15']],
    0, 'subtopic:decimals-subtract', 'skill:arithmetic', 2),

  Q('7.00 - 2.50 = ?',
    '7.00 - 2.50 = ?',
    [['4.50','4.50'],['5.50','5.50'],['4.00','4.00'],['9.50','9.50']],
    0, 'subtopic:decimals-subtract', 'skill:arithmetic', 1),

  Q('1.5 - 0.8 = ?',
    '1.5 - 0.8 = ?',
    [['0.3','0.3'],['0.7','0.7'],['1.3','1.3'],['2.3','2.3']],
    1, 'subtopic:decimals-subtract', 'skill:arithmetic', 2),

  Q('5.00 - 1.75 = ?',
    '5.00 - 1.75 = ?',
    [['3.25','3.25'],['4.25','4.25'],['3.75','3.75'],['4.75','4.75']],
    0, 'subtopic:decimals-subtract', 'skill:arithmetic', 2),

  Q('0.9 - 0.09 = ?',
    '0.9 - 0.09 = ?',
    [['0.0','0.0'],['0.81','0.81'],['0.89','0.89'],['0.81','0.81']],
    1, 'subtopic:decimals-subtract', 'skill:arithmetic', 3, ['trap:confusing-choice']),

  Q('3.3 - _____ = 1.1',
    '3.3 - _____ = 1.1',
    [['1.1','1.1'],['2.2','2.2'],['4.4','4.4'],['2.0','2.0']],
    1, 'subtopic:decimals-subtract', 'skill:arithmetic', 2),

  Q('12.50 - 7.25 = ?',
    '12.50 - 7.25 = ?',
    [['5.25','5.25'],['5.35','5.35'],['4.25','4.25'],['5.15','5.15']],
    0, 'subtopic:decimals-subtract', 'skill:arithmetic', 2),

  Q('6.0 - 0.6 = ?',
    '6.0 - 0.6 = ?',
    [['5.0','5.0'],['5.4','5.4'],['6.6','6.6'],['5.6','5.6']],
    1, 'subtopic:decimals-subtract', 'skill:arithmetic', 2),

  Q('ผลต่างของ 8.75 และ 3.50 คือ?',
    'What is the difference between 8.75 and 3.50?',
    [['5.25','5.25'],['5.35','5.35'],['5.15','5.15'],['12.25','12.25']],
    0, 'subtopic:decimals-subtract', 'skill:arithmetic', 2),

  Q('2.00 - 0.05 = ?',
    '2.00 - 0.05 = ?',
    [['1.05','1.05'],['1.95','1.95'],['1.90','1.90'],['2.05','2.05']],
    1, 'subtopic:decimals-subtract', 'skill:arithmetic', 2),

  Q('10.00 - 4.56 = ?',
    '10.00 - 4.56 = ?',
    [['5.44','5.44'],['6.44','6.44'],['5.54','5.54'],['6.54','6.54']],
    0, 'subtopic:decimals-subtract', 'skill:arithmetic', 3),

  // ─── subtopic:decimals-convert (20 ข้อ) ───────────────────────────────────
  Q('1/10 เขียนเป็นทศนิยมว่า?',
    'Write 1/10 as a decimal.',
    [['1.0','1.0'],['0.1','0.1'],['0.01','0.01'],['10.0','10.0']],
    1, 'subtopic:decimals-convert', 'skill:conversion', 1),

  Q('0.5 เขียนเป็นเศษส่วนว่า?',
    'Write 0.5 as a fraction.',
    [['5/10','5/10'],['1/2','1/2'],['5/100','5/100'],['ทั้ง ก และ ข','Both A and B']],
    3, 'subtopic:decimals-convert', 'skill:conversion', 2),

  Q('3/10 เขียนเป็นทศนิยมว่า?',
    'Write 3/10 as a decimal.',
    [['3.0','3.0'],['0.3','0.3'],['0.03','0.03'],['30.0','30.0']],
    1, 'subtopic:decimals-convert', 'skill:conversion', 1),

  Q('0.25 เขียนเป็นเศษส่วนว่า?',
    'Write 0.25 as a fraction.',
    [['25/10','25/10'],['2/5','2/5'],['25/100','25/100'],['1/4','1/4']],
    2, 'subtopic:decimals-convert', 'skill:conversion', 2),

  Q('7/100 เขียนเป็นทศนิยมว่า?',
    'Write 7/100 as a decimal.',
    [['7.0','7.0'],['0.7','0.7'],['0.07','0.07'],['0.007','0.007']],
    2, 'subtopic:decimals-convert', 'skill:conversion', 2),

  Q('0.8 เขียนเป็นเศษส่วนว่า?',
    'Write 0.8 as a fraction.',
    [['8/100','8/100'],['8/10','8/10'],['4/5','4/5'],['ทั้ง ข และ ค','Both B and C']],
    3, 'subtopic:decimals-convert', 'skill:conversion', 2),

  Q('1/4 เขียนเป็นทศนิยมว่า?',
    'Write 1/4 as a decimal.',
    [['0.14','0.14'],['0.25','0.25'],['0.4','0.4'],['4.0','4.0']],
    1, 'subtopic:decimals-convert', 'skill:conversion', 2),

  Q('0.75 เขียนเป็นเศษส่วนว่า?',
    'Write 0.75 as a fraction.',
    [['75/10','75/10'],['3/4','3/4'],['75/100','75/100'],['ทั้ง ข และ ค','Both B and C']],
    3, 'subtopic:decimals-convert', 'skill:conversion', 2),

  Q('50/100 เขียนเป็นทศนิยมว่า?',
    'Write 50/100 as a decimal.',
    [['5.0','5.0'],['0.5','0.5'],['0.05','0.05'],['50.0','50.0']],
    1, 'subtopic:decimals-convert', 'skill:conversion', 2),

  Q('0.1 เขียนเป็นเศษส่วนว่า?',
    'Write 0.1 as a fraction.',
    [['10/1','10/1'],['1/10','1/10'],['1/100','1/100'],['1/1000','1/1000']],
    1, 'subtopic:decimals-convert', 'skill:conversion', 1),

  Q('1/2 เขียนเป็นทศนิยมว่า?',
    'Write 1/2 as a decimal.',
    [['0.12','0.12'],['1.2','1.2'],['0.5','0.5'],['2.0','2.0']],
    2, 'subtopic:decimals-convert', 'skill:conversion', 1),

  Q('0.04 เขียนเป็นเศษส่วนว่า?',
    'Write 0.04 as a fraction.',
    [['4/10','4/10'],['4/100','4/100'],['1/25','1/25'],['ทั้ง ข และ ค','Both B and C']],
    3, 'subtopic:decimals-convert', 'skill:conversion', 2),

  Q('2/5 เขียนเป็นทศนิยมว่า?',
    'Write 2/5 as a decimal.',
    [['0.25','0.25'],['0.4','0.4'],['2.5','2.5'],['0.45','0.45']],
    1, 'subtopic:decimals-convert', 'skill:conversion', 2),

  Q('0.6 เขียนเป็นเศษส่วนอย่างง่ายว่า?',
    'Write 0.6 as a fraction in lowest terms.',
    [['6/10','6/10'],['3/5','3/5'],['6/100','6/100'],['2/3','2/3']],
    1, 'subtopic:decimals-convert', 'skill:conversion', 2),

  Q('ทศนิยมใดมีค่าเท่ากับ 1/5?',
    'Which decimal equals 1/5?',
    [['0.15','0.15'],['0.2','0.2'],['0.5','0.5'],['5.0','5.0']],
    1, 'subtopic:decimals-convert', 'skill:conversion', 2),

  Q('0.02 เขียนเป็นเศษส่วนว่า?',
    'Write 0.02 as a fraction.',
    [['2/10','2/10'],['2/100','2/100'],['1/50','1/50'],['ทั้ง ข และ ค','Both B and C']],
    3, 'subtopic:decimals-convert', 'skill:conversion', 2),

  Q('3/5 เขียนเป็นทศนิยมว่า?',
    'Write 3/5 as a decimal.',
    [['3.5','3.5'],['0.35','0.35'],['0.6','0.6'],['0.3','0.3']],
    2, 'subtopic:decimals-convert', 'skill:conversion', 2),

  Q('0.9 เท่ากับเศษส่วนใดบ้าง?',
    'Which fraction(s) equal 0.9?',
    [['9/10','9/10'],['90/100','90/100'],['9/100','9/100'],['ทั้ง ก และ ข','Both A and B']],
    3, 'subtopic:decimals-convert', 'skill:conversion', 2),

  Q('ทศนิยมใดมีค่าเท่ากับ 4/5?',
    'Which decimal equals 4/5?',
    [['0.45','0.45'],['4.5','4.5'],['0.8','0.8'],['0.4','0.4']],
    2, 'subtopic:decimals-convert', 'skill:conversion', 2),

  Q('ทศนิยมใดมีค่าเท่ากับ 1/20?',
    'Which decimal equals 1/20?',
    [['0.1','0.1'],['0.5','0.5'],['0.05','0.05'],['0.02','0.02']],
    2, 'subtopic:decimals-convert', 'skill:conversion', 3),

  // ─── subtopic:decimals-word-problem (20 ข้อ) ──────────────────────────────
  Q('น้ำหนักกระเป๋าใบแรก 3.5 กิโลกรัม ใบที่สอง 2.8 กิโลกรัม รวมน้ำหนักทั้งหมดกี่กิโลกรัม?',
    'Bag 1 weighs 3.5 kg and bag 2 weighs 2.8 kg. What is the total weight?',
    [['6.3','6.3'],['6.13','6.13'],['5.3','5.3'],['1.3','1.3']],
    0, 'subtopic:decimals-word-problem', 'skill:word-problem', 1),

  Q('ซื้อของราคา 45.75 บาท จ่ายด้วยธนบัตร 100 บาท ได้รับเงินทอนกี่บาท?',
    'Items cost 45.75 baht. Paid with 100 baht. How much change?',
    [['54.25','54.25'],['55.25','55.25'],['54.75','54.75'],['45.75','45.75']],
    0, 'subtopic:decimals-word-problem', 'skill:word-problem', 2),

  Q('เส้นเชือกยาว 5.0 เมตร ตัดออกไป 1.5 เมตร เหลือเชือกกี่เมตร?',
    'A rope is 5.0 m. 1.5 m is cut off. How much remains?',
    [['3.5','3.5'],['6.5','6.5'],['4.5','4.5'],['3.0','3.0']],
    0, 'subtopic:decimals-word-problem', 'skill:word-problem', 1),

  Q('วิ่งวันแรก 2.4 กิโลเมตร วันที่สอง 3.6 กิโลเมตร รวมวิ่งทั้งสองวันกี่กิโลเมตร?',
    'Ran 2.4 km on day 1 and 3.6 km on day 2. Total km run?',
    [['5.0','5.0'],['6.0','6.0'],['1.2','1.2'],['5.10','5.10']],
    1, 'subtopic:decimals-word-problem', 'skill:word-problem', 1),

  Q('ส้มหนัก 0.75 กิโลกรัม มะม่วงหนัก 0.85 กิโลกรัม ผลไม้สองชนิดหนักรวมกันกี่กิโลกรัม?',
    'An orange weighs 0.75 kg and a mango 0.85 kg. What is the total weight?',
    [['1.50','1.50'],['1.60','1.60'],['1.55','1.55'],['0.10','0.10']],
    1, 'subtopic:decimals-word-problem', 'skill:word-problem', 2),

  Q('ผ้า 2 ผืน ยาว 1.5 เมตร และ 2.3 เมตร รวมยาวกี่เมตร?',
    'Two pieces of fabric are 1.5 m and 2.3 m. What is the total length?',
    [['3.8','3.8'],['3.18','3.18'],['0.8','0.8'],['38.0','38.0']],
    0, 'subtopic:decimals-word-problem', 'skill:word-problem', 1),

  Q('ความสูงของพี่ 1.65 เมตร น้องเตี้ยกว่าพี่ 0.12 เมตร น้องสูงกี่เมตร?',
    'Big sibling is 1.65 m tall. Younger sibling is 0.12 m shorter. How tall is the younger sibling?',
    [['1.53','1.53'],['1.77','1.77'],['1.63','1.63'],['1.52','1.52']],
    0, 'subtopic:decimals-word-problem', 'skill:word-problem', 2),

  Q('ซื้อน้ำผลไม้ 2 ขวด ราคาขวดละ 12.50 บาท จ่ายเงินทั้งหมดกี่บาท?',
    'Bought 2 juice bottles at 12.50 baht each. How much in total?',
    [['24.00','24.00'],['25.00','25.00'],['24.50','24.50'],['25.50','25.50']],
    1, 'subtopic:decimals-word-problem', 'skill:word-problem', 2),

  Q('ถังน้ำมี 8.5 ลิตร ใช้ไป 3.2 ลิตร เหลือน้ำกี่ลิตร?',
    'A tank has 8.5 L. 3.2 L is used. How much remains?',
    [['11.7','11.7'],['5.3','5.3'],['5.7','5.7'],['6.3','6.3']],
    1, 'subtopic:decimals-word-problem', 'skill:word-problem', 1),

  Q('โจทำงาน 4.5 ชั่วโมงเช้า และ 3.5 ชั่วโมงบ่าย รวมทำงานกี่ชั่วโมง?',
    'Jo works 4.5 hours in the morning and 3.5 hours in the afternoon. Total hours worked?',
    [['7.5','7.5'],['8.0','8.0'],['8.5','8.5'],['7.0','7.0']],
    1, 'subtopic:decimals-word-problem', 'skill:word-problem', 1),

  Q('ราคาสินค้า 3 ชิ้น คือ 5.50, 3.25 และ 1.75 บาท รวมจ่ายทั้งหมดกี่บาท?',
    'Three items cost 5.50, 3.25, and 1.75 baht. Total cost?',
    [['9.50','9.50'],['10.50','10.50'],['10.00','10.00'],['9.75','9.75']],
    1, 'subtopic:decimals-word-problem', 'skill:multi-step', 2),

  Q('น้ำหนักตอนเช้า 45.6 กิโลกรัม ตอนเย็น 45.2 กิโลกรัม น้ำหนักลดลงกี่กิโลกรัม?',
    'Morning weight: 45.6 kg. Evening weight: 45.2 kg. How much weight was lost?',
    [['90.8','90.8'],['0.4','0.4'],['0.6','0.6'],['1.4','1.4']],
    1, 'subtopic:decimals-word-problem', 'skill:word-problem', 1),

  Q('ราคาขนม 2 ชนิด คือ 8.50 และ 6.75 บาท ถ้ามีเงิน 20 บาท จะเหลือเงินกี่บาท?',
    'Two snacks cost 8.50 and 6.75 baht. If you have 20 baht, how much is left?',
    [['4.75','4.75'],['5.25','5.25'],['4.25','4.25'],['5.75','5.75']],
    0, 'subtopic:decimals-word-problem', 'skill:multi-step', 2),

  Q('เดินทาง 3 วัน วันแรก 12.5 กม. วันที่สอง 8.3 กม. วันที่สาม 9.7 กม. รวมระยะทางทั้งหมดกี่กม.?',
    'Walked 12.5 km, 8.3 km, and 9.7 km over 3 days. Total distance?',
    [['29.5','29.5'],['30.5','30.5'],['31.5','31.5'],['30.0','30.0']],
    1, 'subtopic:decimals-word-problem', 'skill:multi-step', 2),

  Q('ซื้อผัก 2 ชนิด ชนิดแรกหนัก 1.2 กก. ชนิดที่สองหนัก 0.8 กก. รวมหนักกี่กิโลกรัม?',
    'Bought two vegetables weighing 1.2 kg and 0.8 kg. Total weight?',
    [['1.10','1.10'],['2.0','2.0'],['0.4','0.4'],['2.10','2.10']],
    1, 'subtopic:decimals-word-problem', 'skill:word-problem', 1),

  Q('เส้นด้ายยาว 10.00 เมตร ใช้ตัดเสื้อไป 3.75 เมตร เหลือด้ายกี่เมตร?',
    'Thread is 10.00 m. 3.75 m is used. How much remains?',
    [['6.25','6.25'],['7.25','7.25'],['6.75','6.75'],['7.75','7.75']],
    0, 'subtopic:decimals-word-problem', 'skill:word-problem', 2),

  Q('แม่ซื้อเนื้อ 0.75 กก. และปลา 0.50 กก. รวมซื้ออาหารหนักกี่กิโลกรัม?',
    'Mother bought 0.75 kg of meat and 0.50 kg of fish. Total weight?',
    [['1.25','1.25'],['1.30','1.30'],['0.25','0.25'],['1.00','1.00']],
    0, 'subtopic:decimals-word-problem', 'skill:word-problem', 1),

  Q('อุณหภูมิตอนเช้า 28.5 องศา ตอนบ่ายสูงขึ้น 4.3 องศา อุณหภูมิตอนบ่ายเป็นเท่าไร?',
    'Morning temperature is 28.5°C. It rises 4.3°C by afternoon. What is the afternoon temperature?',
    [['32.8','32.8'],['33.8','33.8'],['24.2','24.2'],['32.2','32.2']],
    0, 'subtopic:decimals-word-problem', 'skill:word-problem', 2),

  Q('ราคาหนังสือ 3 เล่ม คือ 35.50, 28.75 และ 45.00 บาท ซื้อครบทุกเล่มจ่ายเงินกี่บาท?',
    'Three books cost 35.50, 28.75, and 45.00 baht. Total cost?',
    [['108.25','108.25'],['109.25','109.25'],['107.25','107.25'],['110.25','110.25']],
    1, 'subtopic:decimals-word-problem', 'skill:multi-step', 3),

  Q('รถวิ่งไป 45.6 กม. แล้วหยุดพัก จากนั้นวิ่งต่ออีก 32.8 กม. รวมวิ่งไปทั้งหมดกี่กิโลเมตร?',
    'A car travels 45.6 km, rests, then travels another 32.8 km. Total distance?',
    [['77.4','77.4'],['78.4','78.4'],['77.6','77.6'],['12.8','12.8']],
    1, 'subtopic:decimals-word-problem', 'skill:word-problem', 2),

];

async function main() {
  let count = 0;
  for (const q of questions) {
    await prisma.question.create({ data: q });
    count++;
  }
  console.log(`✅ สร้างข้อสอบ ${count} ข้อ (topic:decimals, p4)`);
  const summary = {};
  for (const q of questions) {
    const sub = q.attributes.subtopic[0];
    summary[sub] = (summary[sub] || 0) + 1;
  }
  for (const [k, v] of Object.entries(summary)) console.log(`   ${k}: ${v} ข้อ`);
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
