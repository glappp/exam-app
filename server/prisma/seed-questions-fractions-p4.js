// seed-questions-fractions-p4.js
// topic:fractions, grade p4, 6 subtopics × 20 ข้อ = 120 ข้อ
// (add-unlike/multiply/divide ข้าม — minGrade = 5)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = { examGrade: 'p4', topic: ['topic:fractions'] };
const Q = (textTh, textEn, choices, answer, subtopic, skill, difficulty, trap = []) => ({
  textTh, textEn,
  choices: choices.map(c => ({ textTh: c[0], textEn: c[1] })),
  answer,
  attributes: { ...BASE, subtopic: [subtopic], skill: [skill], trap, difficulty },
  ownerOrg: 'system', createdBy: 'seed', updatedBy: 'seed',
  aiGenerated: false, needsReview: false,
});

const questions = [

  // ─── subtopic:fractions-concept (20 ข้อ) ──────────────────────────────────
  Q('รูปวงกลมถูกแบ่งเป็น 8 ส่วนเท่าๆ กัน แรเงาไว้ 3 ส่วน ส่วนที่แรเงาคิดเป็นเศษส่วนเท่าไร?',
    'A circle is divided into 8 equal parts. 3 parts are shaded. What fraction is shaded?',
    [['3/8','3/8'],['5/8','5/8'],['8/3','8/3'],['3/5','3/5']],
    0, 'subtopic:fractions-concept', 'skill:arithmetic', 1),

  Q('ตัวส่วนของเศษส่วน 7/12 คือ?',
    'What is the denominator of 7/12?',
    [['7','7'],['12','12'],['5','5'],['19','19']],
    1, 'subtopic:fractions-concept', 'skill:arithmetic', 1),

  Q('5/8 หมายความว่า?',
    'What does 5/8 mean?',
    [['แบ่งเป็น 5 ส่วนเท่าๆ กัน แล้วนำมา 8 ส่วน','Divided into 5 equal parts, take 8 parts'],
     ['แบ่งเป็น 8 ส่วนเท่าๆ กัน แล้วนำมา 5 ส่วน','Divided into 8 equal parts, take 5 parts'],
     ['แบ่งเป็น 13 ส่วนเท่าๆ กัน','Divided into 13 equal parts'],
     ['แบ่งเป็น 8 ส่วน นำมาทั้งหมด 8 ส่วน','Divided into 8 parts, take all 8']],
    1, 'subtopic:fractions-concept', 'skill:arithmetic', 1),

  Q('เศษส่วนใดมีค่าเท่ากับ 1/2?',
    'Which fraction equals 1/2?',
    [['2/6','2/6'],['3/6','3/6'],['2/3','2/3'],['1/4','1/4']],
    1, 'subtopic:fractions-concept', 'skill:arithmetic', 2),

  Q('เศษส่วนใดเป็นเศษส่วนแท้ (ตัวเศษน้อยกว่าตัวส่วน)?',
    'Which is a proper fraction (numerator less than denominator)?',
    [['9/9','9/9'],['10/7','10/7'],['3/5','3/5'],['8/3','8/3']],
    2, 'subtopic:fractions-concept', 'skill:arithmetic', 1),

  Q('เศษส่วนใดมีค่าเท่ากับ 1?',
    'Which fraction equals 1?',
    [['5/4','5/4'],['5/5','5/5'],['5/6','5/6'],['4/5','4/5']],
    1, 'subtopic:fractions-concept', 'skill:arithmetic', 1),

  Q('เศษส่วนใดมีค่ามากกว่า 1?',
    'Which fraction has a value greater than 1?',
    [['3/4','3/4'],['7/8','7/8'],['5/5','5/5'],['9/7','9/7']],
    3, 'subtopic:fractions-concept', 'skill:arithmetic', 2),

  Q('1/4 ของ 20 คือ?',
    '1/4 of 20 is?',
    [['4','4'],['5','5'],['10','10'],['15','15']],
    1, 'subtopic:fractions-concept', 'skill:arithmetic', 2),

  Q('เศษส่วนใดเท่ากับ 2/3?',
    'Which fraction equals 2/3?',
    [['4/9','4/9'],['4/6','4/6'],['3/9','3/9'],['3/4','3/4']],
    1, 'subtopic:fractions-concept', 'skill:arithmetic', 2),

  Q('ถ้าแบ่งเค้กเป็น 6 ชิ้นเท่าๆ กัน กินไป 4 ชิ้น เหลือเค้กคิดเป็นเศษส่วนเท่าไร?',
    'A cake is cut into 6 equal pieces. 4 pieces are eaten. What fraction remains?',
    [['4/6','4/6'],['2/6','2/6'],['6/2','6/2'],['6/4','6/4']],
    1, 'subtopic:fractions-concept', 'skill:arithmetic', 1),

  Q('เศษส่วนใดเป็นเศษเกิน (ตัวเศษมากกว่าตัวส่วน)?',
    'Which is an improper fraction (numerator greater than denominator)?',
    [['5/8','5/8'],['3/4','3/4'],['11/9','11/9'],['7/10','7/10']],
    2, 'subtopic:fractions-concept', 'skill:arithmetic', 1),

  Q('ตัวเศษของ 9/11 คือ?',
    'What is the numerator of 9/11?',
    [['9','9'],['11','11'],['2','2'],['20','20']],
    0, 'subtopic:fractions-concept', 'skill:arithmetic', 1),

  Q('เศษส่วน 6/6 มีค่าเท่ากับ?',
    'What is the value of 6/6?',
    [['0','0'],['6','6'],['1/6','1/6'],['1','1']],
    3, 'subtopic:fractions-concept', 'skill:arithmetic', 1),

  Q('เส้นตรงถูกแบ่งเป็น 10 ส่วนเท่าๆ กัน จุดที่ตำแหน่ง 7 ส่วน อยู่ที่เศษส่วนใด?',
    'A line is divided into 10 equal parts. A point at position 7 represents which fraction?',
    [['7/10','7/10'],['3/10','3/10'],['10/7','10/7'],['7/3','7/3']],
    0, 'subtopic:fractions-concept', 'skill:arithmetic', 1),

  Q('1/3 ของ 12 คือ?',
    '1/3 of 12 is?',
    [['3','3'],['4','4'],['6','6'],['9','9']],
    1, 'subtopic:fractions-concept', 'skill:arithmetic', 2),

  Q('เศษส่วนใดมีค่าเท่ากับ 3/4?',
    'Which fraction equals 3/4?',
    [['6/8','6/8'],['4/6','4/6'],['9/16','9/16'],['5/8','5/8']],
    0, 'subtopic:fractions-concept', 'skill:arithmetic', 2),

  Q('วงกลมถูกแบ่งเป็น 5 ส่วนเท่าๆ กัน แรเงา 2 ส่วน ส่วนที่ไม่ได้แรเงาคิดเป็นเศษส่วนเท่าไร?',
    'A circle is divided into 5 equal parts. 2 parts are shaded. What fraction is NOT shaded?',
    [['2/5','2/5'],['5/3','5/3'],['3/5','3/5'],['5/2','5/2']],
    2, 'subtopic:fractions-concept', 'skill:arithmetic', 1),

  Q('เศษส่วนใดเท่ากับ 1/4?',
    'Which fraction equals 1/4?',
    [['2/6','2/6'],['3/12','3/12'],['4/8','4/8'],['2/10','2/10']],
    1, 'subtopic:fractions-concept', 'skill:arithmetic', 2),

  Q('แอปเปิ้ล 1 ผล แบ่งเป็น 4 ส่วนเท่าๆ กัน น้องกิน 1 ส่วน น้องกินแอปเปิ้ลไปกี่ส่วน?',
    'An apple is cut into 4 equal parts. A younger sibling eats 1 part. What fraction was eaten?',
    [['1/4','1/4'],['4/1','4/1'],['3/4','3/4'],['4/4','4/4']],
    0, 'subtopic:fractions-concept', 'skill:arithmetic', 1),

  Q('เศษส่วนใดมีค่าเท่ากับ 0?',
    'Which fraction equals 0?',
    [['1/5','1/5'],['5/1','5/1'],['0/5','0/5'],['5/5','5/5']],
    2, 'subtopic:fractions-concept', 'skill:arithmetic', 2),

  // ─── subtopic:fractions-compare (20 ข้อ) ──────────────────────────────────
  Q('3/8 กับ 5/8 ข้อใดถูกต้อง?',
    '3/8 compared to 5/8 — which is correct?',
    [['3/8 > 5/8','3/8 > 5/8'],['3/8 = 5/8','3/8 = 5/8'],['3/8 < 5/8','3/8 < 5/8'],['เปรียบเทียบไม่ได้','Cannot compare']],
    2, 'subtopic:fractions-compare', 'skill:arithmetic', 1),

  Q('เศษส่วนใดมากที่สุด? 2/7, 4/7, 1/7, 6/7',
    'Which fraction is the greatest? 2/7, 4/7, 1/7, 6/7',
    [['2/7','2/7'],['4/7','4/7'],['1/7','1/7'],['6/7','6/7']],
    3, 'subtopic:fractions-compare', 'skill:arithmetic', 1),

  Q('เรียง 1/5, 3/5, 2/5 จากน้อยไปมาก ข้อใดถูกต้อง?',
    'Arrange 1/5, 3/5, 2/5 from least to greatest.',
    [['1/5, 3/5, 2/5','1/5, 3/5, 2/5'],
     ['1/5, 2/5, 3/5','1/5, 2/5, 3/5'],
     ['3/5, 2/5, 1/5','3/5, 2/5, 1/5'],
     ['2/5, 1/5, 3/5','2/5, 1/5, 3/5']],
    1, 'subtopic:fractions-compare', 'skill:arithmetic', 1),

  Q('1/3 กับ 1/5 ข้อใดถูกต้อง? (ตัวเศษเท่ากัน ตัวส่วนต่างกัน)',
    '1/3 compared to 1/5 — which is correct? (same numerator, different denominator)',
    [['1/3 < 1/5','1/3 < 1/5'],['1/3 = 1/5','1/3 = 1/5'],['1/3 > 1/5','1/3 > 1/5'],['เปรียบเทียบไม่ได้','Cannot compare']],
    2, 'subtopic:fractions-compare', 'skill:arithmetic', 2, ['trap:misread']),

  Q('เศษส่วนใดน้อยที่สุด? 1/2, 1/4, 1/3, 1/6',
    'Which fraction is the smallest? 1/2, 1/4, 1/3, 1/6',
    [['1/2','1/2'],['1/4','1/4'],['1/3','1/3'],['1/6','1/6']],
    3, 'subtopic:fractions-compare', 'skill:arithmetic', 2, ['trap:misread']),

  Q('เรียง 1/2, 1/4, 1/8 จากมากไปน้อย ข้อใดถูกต้อง?',
    'Arrange 1/2, 1/4, 1/8 from greatest to least.',
    [['1/2, 1/4, 1/8','1/2, 1/4, 1/8'],
     ['1/8, 1/4, 1/2','1/8, 1/4, 1/2'],
     ['1/4, 1/2, 1/8','1/4, 1/2, 1/8'],
     ['1/8, 1/2, 1/4','1/8, 1/2, 1/4']],
    0, 'subtopic:fractions-compare', 'skill:arithmetic', 2, ['trap:misread']),

  Q('5/9 กับ 4/9 ข้อใดถูกต้อง?',
    '5/9 compared to 4/9 — which is correct?',
    [['5/9 < 4/9','5/9 < 4/9'],['5/9 = 4/9','5/9 = 4/9'],['5/9 > 4/9','5/9 > 4/9'],['เปรียบเทียบไม่ได้','Cannot compare']],
    2, 'subtopic:fractions-compare', 'skill:arithmetic', 1),

  Q('เศษส่วนใดมีค่ามากกว่า 3/5?',
    'Which fraction is greater than 3/5?',
    [['2/5','2/5'],['1/5','1/5'],['4/5','4/5'],['3/5','3/5']],
    2, 'subtopic:fractions-compare', 'skill:arithmetic', 1),

  Q('เรียง 5/6, 1/6, 4/6, 2/6 จากน้อยไปมาก ข้อใดถูกต้อง?',
    'Arrange 5/6, 1/6, 4/6, 2/6 from least to greatest.',
    [['1/6, 2/6, 4/6, 5/6','1/6, 2/6, 4/6, 5/6'],
     ['5/6, 4/6, 2/6, 1/6','5/6, 4/6, 2/6, 1/6'],
     ['1/6, 4/6, 2/6, 5/6','1/6, 4/6, 2/6, 5/6'],
     ['2/6, 1/6, 5/6, 4/6','2/6, 1/6, 5/6, 4/6']],
    0, 'subtopic:fractions-compare', 'skill:arithmetic', 2),

  Q('ข้อใดถูกต้อง?',
    'Which statement is correct?',
    [['2/3 < 1/3','2/3 < 1/3'],['3/4 > 2/4','3/4 > 2/4'],['5/8 < 3/8','5/8 < 3/8'],['4/7 > 5/7','4/7 > 5/7']],
    1, 'subtopic:fractions-compare', 'skill:arithmetic', 1),

  Q('1/4 กับ 1/2 เปรียบเทียบกัน?',
    'Compare 1/4 and 1/2.',
    [['1/4 > 1/2','1/4 > 1/2'],['1/4 = 1/2','1/4 = 1/2'],['1/4 < 1/2','1/4 < 1/2'],['เปรียบเทียบไม่ได้','Cannot compare']],
    2, 'subtopic:fractions-compare', 'skill:arithmetic', 1),

  Q('เศษส่วนใดมีค่ามากที่สุด? 3/10, 7/10, 1/10, 9/10',
    'Which fraction is the greatest? 3/10, 7/10, 1/10, 9/10',
    [['3/10','3/10'],['7/10','7/10'],['1/10','1/10'],['9/10','9/10']],
    3, 'subtopic:fractions-compare', 'skill:arithmetic', 1),

  Q('2/3 กับ 2/5 ข้อใดถูกต้อง?',
    '2/3 compared to 2/5 — which is correct?',
    [['2/3 < 2/5','2/3 < 2/5'],['2/3 = 2/5','2/3 = 2/5'],['2/3 > 2/5','2/3 > 2/5'],['เปรียบเทียบไม่ได้','Cannot compare']],
    2, 'subtopic:fractions-compare', 'skill:arithmetic', 2, ['trap:misread']),

  Q('เรียง 3/8, 7/8, 5/8, 1/8 จากมากไปน้อย ข้อใดถูกต้อง?',
    'Arrange 3/8, 7/8, 5/8, 1/8 from greatest to least.',
    [['7/8, 5/8, 3/8, 1/8','7/8, 5/8, 3/8, 1/8'],
     ['1/8, 3/8, 5/8, 7/8','1/8, 3/8, 5/8, 7/8'],
     ['5/8, 7/8, 1/8, 3/8','5/8, 7/8, 1/8, 3/8'],
     ['7/8, 3/8, 5/8, 1/8','7/8, 3/8, 5/8, 1/8']],
    0, 'subtopic:fractions-compare', 'skill:arithmetic', 1),

  Q('เศษส่วนใดน้อยกว่า 3/7?',
    'Which fraction is less than 3/7?',
    [['4/7','4/7'],['5/7','5/7'],['2/7','2/7'],['6/7','6/7']],
    2, 'subtopic:fractions-compare', 'skill:arithmetic', 1),

  Q('ข้อใดเรียงจากน้อยไปมากถูกต้อง?',
    'Which list is correctly arranged from least to greatest?',
    [['1/6, 4/6, 2/6, 5/6','1/6, 4/6, 2/6, 5/6'],
     ['1/6, 2/6, 4/6, 5/6','1/6, 2/6, 4/6, 5/6'],
     ['4/6, 5/6, 1/6, 2/6','4/6, 5/6, 1/6, 2/6'],
     ['5/6, 4/6, 2/6, 1/6','5/6, 4/6, 2/6, 1/6']],
    1, 'subtopic:fractions-compare', 'skill:arithmetic', 1),

  Q('1/2 เปรียบกับ 1/3 ข้อใดถูก?',
    'Compare 1/2 and 1/3 — which is correct?',
    [['1/2 < 1/3','1/2 < 1/3'],['1/2 = 1/3','1/2 = 1/3'],['1/2 > 1/3','1/2 > 1/3'],['เปรียบเทียบไม่ได้','Cannot compare']],
    2, 'subtopic:fractions-compare', 'skill:arithmetic', 1),

  Q('เศษส่วนใดมีค่าอยู่ระหว่าง 2/9 และ 5/9?',
    'Which fraction has a value between 2/9 and 5/9?',
    [['1/9','1/9'],['6/9','6/9'],['3/9','3/9'],['8/9','8/9']],
    2, 'subtopic:fractions-compare', 'skill:arithmetic', 2),

  Q('เรียง 1/4, 1/2, 1/3, 1/8 จากมากไปน้อย ข้อใดถูกต้อง?',
    'Arrange 1/4, 1/2, 1/3, 1/8 from greatest to least.',
    [['1/2, 1/3, 1/4, 1/8','1/2, 1/3, 1/4, 1/8'],
     ['1/8, 1/4, 1/3, 1/2','1/8, 1/4, 1/3, 1/2'],
     ['1/2, 1/4, 1/3, 1/8','1/2, 1/4, 1/3, 1/8'],
     ['1/3, 1/2, 1/4, 1/8','1/3, 1/2, 1/4, 1/8']],
    0, 'subtopic:fractions-compare', 'skill:arithmetic', 3, ['trap:misread']),

  Q('น้ำในแก้ว A มี 3/4 ของแก้ว น้ำในแก้ว B มี 2/4 ของแก้ว แก้วไหนมีน้ำมากกว่า?',
    'Glass A has 3/4 of water. Glass B has 2/4. Which glass has more water?',
    [['แก้ว A','Glass A'],['แก้ว B','Glass B'],['เท่ากัน','Equal'],['บอกไม่ได้','Cannot tell']],
    0, 'subtopic:fractions-compare', 'skill:word-problem', 1),

  // ─── subtopic:fractions-add-like (20 ข้อ) ─────────────────────────────────
  Q('1/5 + 2/5 = ?',
    '1/5 + 2/5 = ?',
    [['3/10','3/10'],['3/5','3/5'],['2/10','2/10'],['1/5','1/5']],
    1, 'subtopic:fractions-add-like', 'skill:arithmetic', 1),

  Q('2/7 + 3/7 = ?',
    '2/7 + 3/7 = ?',
    [['5/14','5/14'],['6/7','6/7'],['5/7','5/7'],['1/7','1/7']],
    2, 'subtopic:fractions-add-like', 'skill:arithmetic', 1),

  Q('1/4 + 2/4 = ?',
    '1/4 + 2/4 = ?',
    [['3/8','3/8'],['3/4','3/4'],['1/2','1/2'],['2/4','2/4']],
    1, 'subtopic:fractions-add-like', 'skill:arithmetic', 1),

  Q('3/8 + 4/8 = ?',
    '3/8 + 4/8 = ?',
    [['7/16','7/16'],['1/8','1/8'],['7/8','7/8'],['8/8','8/8']],
    2, 'subtopic:fractions-add-like', 'skill:arithmetic', 1),

  Q('5/9 + 3/9 = ?',
    '5/9 + 3/9 = ?',
    [['8/18','8/18'],['8/9','8/9'],['2/9','2/9'],['9/9','9/9']],
    1, 'subtopic:fractions-add-like', 'skill:arithmetic', 1),

  Q('2/6 + 3/6 = ?',
    '2/6 + 3/6 = ?',
    [['5/12','5/12'],['5/6','5/6'],['1/6','1/6'],['6/6','6/6']],
    1, 'subtopic:fractions-add-like', 'skill:arithmetic', 1),

  Q('1/3 + 1/3 = ?',
    '1/3 + 1/3 = ?',
    [['1/6','1/6'],['2/3','2/3'],['2/6','2/6'],['3/3','3/3']],
    1, 'subtopic:fractions-add-like', 'skill:arithmetic', 1),

  Q('4/10 + 5/10 = ?',
    '4/10 + 5/10 = ?',
    [['9/20','9/20'],['9/10','9/10'],['1/10','1/10'],['10/10','10/10']],
    1, 'subtopic:fractions-add-like', 'skill:arithmetic', 1),

  Q('1/6 + 4/6 = ?',
    '1/6 + 4/6 = ?',
    [['5/12','5/12'],['3/6','3/6'],['5/6','5/6'],['4/6','4/6']],
    2, 'subtopic:fractions-add-like', 'skill:arithmetic', 1),

  Q('3/5 + 1/5 = ?',
    '3/5 + 1/5 = ?',
    [['4/10','4/10'],['2/5','2/5'],['4/5','4/5'],['5/5','5/5']],
    2, 'subtopic:fractions-add-like', 'skill:arithmetic', 1),

  Q('2/9 + 5/9 = ?',
    '2/9 + 5/9 = ?',
    [['7/18','7/18'],['3/9','3/9'],['7/9','7/9'],['9/9','9/9']],
    2, 'subtopic:fractions-add-like', 'skill:arithmetic', 1),

  Q('1/8 + 3/8 = ?',
    '1/8 + 3/8 = ?',
    [['4/16','4/16'],['4/8','4/8'],['2/8','2/8'],['3/8','3/8']],
    1, 'subtopic:fractions-add-like', 'skill:arithmetic', 1),

  Q('3/7 + 3/7 = ?',
    '3/7 + 3/7 = ?',
    [['6/14','6/14'],['0/7','0/7'],['6/7','6/7'],['7/7','7/7']],
    2, 'subtopic:fractions-add-like', 'skill:arithmetic', 1),

  Q('2/10 + 7/10 = ?',
    '2/10 + 7/10 = ?',
    [['9/20','9/20'],['5/10','5/10'],['9/10','9/10'],['10/10','10/10']],
    2, 'subtopic:fractions-add-like', 'skill:arithmetic', 1),

  Q('1/12 + 5/12 = ?',
    '1/12 + 5/12 = ?',
    [['6/24','6/24'],['4/12','4/12'],['6/12','6/12'],['5/12','5/12']],
    2, 'subtopic:fractions-add-like', 'skill:arithmetic', 1),

  Q('4/9 + 4/9 = ?',
    '4/9 + 4/9 = ?',
    [['8/18','8/18'],['8/9','8/9'],['0/9','0/9'],['9/9','9/9']],
    1, 'subtopic:fractions-add-like', 'skill:arithmetic', 1),

  Q('5/11 + 4/11 = ?',
    '5/11 + 4/11 = ?',
    [['9/22','9/22'],['1/11','1/11'],['9/11','9/11'],['10/11','10/11']],
    2, 'subtopic:fractions-add-like', 'skill:arithmetic', 1),

  Q('5/8 + 4/8 = ?',
    '5/8 + 4/8 = ?',
    [['9/16','9/16'],['9/8','9/8'],['1/8','1/8'],['8/8','8/8']],
    1, 'subtopic:fractions-add-like', 'skill:arithmetic', 2),

  Q('6/7 + 3/7 = ?',
    '6/7 + 3/7 = ?',
    [['9/14','9/14'],['3/7','3/7'],['2/7','2/7'],['9/7','9/7']],
    3, 'subtopic:fractions-add-like', 'skill:arithmetic', 2),

  Q('3/4 + 2/4 = ?',
    '3/4 + 2/4 = ?',
    [['5/8','5/8'],['1/4','1/4'],['5/4','5/4'],['4/4','4/4']],
    2, 'subtopic:fractions-add-like', 'skill:arithmetic', 2),

  // ─── subtopic:fractions-subtract (20 ข้อ) ─────────────────────────────────
  Q('4/5 - 1/5 = ?',
    '4/5 - 1/5 = ?',
    [['5/5','5/5'],['3/5','3/5'],['3/10','3/10'],['1/5','1/5']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 1),

  Q('3/4 - 1/4 = ?',
    '3/4 - 1/4 = ?',
    [['4/4','4/4'],['2/4','2/4'],['2/8','2/8'],['3/4','3/4']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 1),

  Q('7/9 - 3/9 = ?',
    '7/9 - 3/9 = ?',
    [['4/9','4/9'],['10/9','10/9'],['4/18','4/18'],['3/9','3/9']],
    0, 'subtopic:fractions-subtract', 'skill:arithmetic', 1),

  Q('5/8 - 2/8 = ?',
    '5/8 - 2/8 = ?',
    [['7/8','7/8'],['3/8','3/8'],['3/16','3/16'],['2/8','2/8']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 1),

  Q('6/7 - 4/7 = ?',
    '6/7 - 4/7 = ?',
    [['10/7','10/7'],['2/7','2/7'],['2/14','2/14'],['4/7','4/7']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 1),

  Q('8/10 - 5/10 = ?',
    '8/10 - 5/10 = ?',
    [['13/10','13/10'],['3/10','3/10'],['3/20','3/20'],['5/10','5/10']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 1),

  Q('5/6 - 3/6 = ?',
    '5/6 - 3/6 = ?',
    [['8/6','8/6'],['2/6','2/6'],['2/12','2/12'],['3/6','3/6']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 1),

  Q('9/10 - 6/10 = ?',
    '9/10 - 6/10 = ?',
    [['15/10','15/10'],['3/10','3/10'],['3/20','3/20'],['6/10','6/10']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 1),

  Q('4/5 - 4/5 = ?',
    '4/5 - 4/5 = ?',
    [['8/5','8/5'],['0/5','0/5'],['1','1'],['4/10','4/10']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 1),

  Q('7/12 - 4/12 = ?',
    '7/12 - 4/12 = ?',
    [['11/12','11/12'],['3/12','3/12'],['3/24','3/24'],['4/12','4/12']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 1),

  Q('5/7 - 2/7 = ?',
    '5/7 - 2/7 = ?',
    [['7/7','7/7'],['3/7','3/7'],['3/14','3/14'],['2/7','2/7']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 1),

  Q('9/11 - 5/11 = ?',
    '9/11 - 5/11 = ?',
    [['14/11','14/11'],['4/11','4/11'],['4/22','4/22'],['5/11','5/11']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 1),

  Q('6/8 - 1/8 = ?',
    '6/8 - 1/8 = ?',
    [['7/8','7/8'],['5/8','5/8'],['5/16','5/16'],['1/8','1/8']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 1),

  Q('5/5 - 2/5 = ?',
    '5/5 - 2/5 = ?',
    [['7/5','7/5'],['3/5','3/5'],['3/10','3/10'],['2/5','2/5']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 2),

  Q('7/10 - 4/10 = ?',
    '7/10 - 4/10 = ?',
    [['11/10','11/10'],['3/10','3/10'],['3/20','3/20'],['4/10','4/10']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 1),

  Q('8/9 - 5/9 = ?',
    '8/9 - 5/9 = ?',
    [['13/9','13/9'],['3/9','3/9'],['3/18','3/18'],['5/9','5/9']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 1),

  Q('10/12 - 7/12 = ?',
    '10/12 - 7/12 = ?',
    [['17/12','17/12'],['3/12','3/12'],['3/24','3/24'],['7/12','7/12']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 1),

  Q('จำนวนที่ลบ 3/8 แล้วได้ 2/8 คือ?',
    'What number minus 3/8 equals 2/8?',
    [['1/8','1/8'],['5/8','5/8'],['6/8','6/8'],['4/8','4/8']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 2),

  Q('9/9 - 4/9 = ?',
    '9/9 - 4/9 = ?',
    [['13/9','13/9'],['5/9','5/9'],['4/9','4/9'],['5/18','5/18']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 2),

  Q('7/8 - _____ = 3/8',
    '7/8 - _____ = 3/8',
    [['10/8','10/8'],['4/8','4/8'],['3/8','3/8'],['7/8','7/8']],
    1, 'subtopic:fractions-subtract', 'skill:arithmetic', 2),

  // ─── subtopic:fractions-mixed (20 ข้อ) ────────────────────────────────────
  Q('5/3 เขียนเป็นจำนวนคละได้ว่า?',
    '5/3 written as a mixed number is?',
    [['1 และ 2/3','1 and 2/3'],['2 และ 1/3','2 and 1/3'],['1 และ 1/3','1 and 1/3'],['2 และ 2/3','2 and 2/3']],
    0, 'subtopic:fractions-mixed', 'skill:arithmetic', 2),

  Q('7/4 เขียนเป็นจำนวนคละได้ว่า?',
    '7/4 written as a mixed number is?',
    [['1 และ 3/4','1 and 3/4'],['2 และ 1/4','2 and 1/4'],['1 และ 1/4','1 and 1/4'],['2 และ 3/4','2 and 3/4']],
    0, 'subtopic:fractions-mixed', 'skill:arithmetic', 2),

  Q('"2 และ 1/3" เขียนเป็นเศษเกินว่า?',
    '"2 and 1/3" written as an improper fraction is?',
    [['5/3','5/3'],['7/3','7/3'],['6/3','6/3'],['8/3','8/3']],
    1, 'subtopic:fractions-mixed', 'skill:arithmetic', 2),

  Q('9/5 เขียนเป็นจำนวนคละได้ว่า?',
    '9/5 written as a mixed number is?',
    [['1 และ 3/5','1 and 3/5'],['2 และ 1/5','2 and 1/5'],['1 และ 4/5','1 and 4/5'],['1 และ 2/5','1 and 2/5']],
    2, 'subtopic:fractions-mixed', 'skill:arithmetic', 2),

  Q('11/4 เขียนเป็นจำนวนคละได้ว่า?',
    '11/4 written as a mixed number is?',
    [['2 และ 1/4','2 and 1/4'],['3 และ 1/4','3 and 1/4'],['2 และ 3/4','2 and 3/4'],['2 และ 2/4','2 and 2/4']],
    2, 'subtopic:fractions-mixed', 'skill:arithmetic', 2),

  Q('"3 และ 2/5" เขียนเป็นเศษเกินว่า?',
    '"3 and 2/5" written as an improper fraction is?',
    [['13/5','13/5'],['15/5','15/5'],['17/5','17/5'],['16/5','16/5']],
    2, 'subtopic:fractions-mixed', 'skill:arithmetic', 2),

  Q('เศษส่วนใดมีค่าเท่ากับ 1/2?',
    'Which fraction equals 1/2?',
    [['3/5','3/5'],['2/4','2/4'],['4/9','4/9'],['3/7','3/7']],
    1, 'subtopic:fractions-mixed', 'skill:arithmetic', 1),

  Q('"1 และ 1/2" เขียนเป็นเศษเกินว่า?',
    '"1 and 1/2" written as an improper fraction is?',
    [['2/2','2/2'],['3/2','3/2'],['4/2','4/2'],['1/2','1/2']],
    1, 'subtopic:fractions-mixed', 'skill:arithmetic', 2),

  Q('13/6 เขียนเป็นจำนวนคละได้ว่า?',
    '13/6 written as a mixed number is?',
    [['1 และ 5/6','1 and 5/6'],['3 และ 1/6','3 and 1/6'],['2 และ 1/6','2 and 1/6'],['2 และ 5/6','2 and 5/6']],
    2, 'subtopic:fractions-mixed', 'skill:arithmetic', 2),

  Q('"2 และ 3/4" เขียนเป็นเศษเกินว่า?',
    '"2 and 3/4" written as an improper fraction is?',
    [['9/4','9/4'],['10/4','10/4'],['11/4','11/4'],['12/4','12/4']],
    2, 'subtopic:fractions-mixed', 'skill:arithmetic', 2),

  Q('เศษส่วนใดมีค่าเท่ากับ 3/4?',
    'Which fraction equals 3/4?',
    [['6/8','6/8'],['4/8','4/8'],['5/8','5/8'],['2/4','2/4']],
    0, 'subtopic:fractions-mixed', 'skill:arithmetic', 2),

  Q('15/7 เขียนเป็นจำนวนคละได้ว่า?',
    '15/7 written as a mixed number is?',
    [['2 และ 1/7','2 and 1/7'],['2 และ 2/7','2 and 2/7'],['1 และ 6/7','1 and 6/7'],['3 และ 1/7','3 and 1/7']],
    0, 'subtopic:fractions-mixed', 'skill:arithmetic', 2),

  Q('เศษส่วนใดมีค่าเท่ากับ 2/5?',
    'Which fraction equals 2/5?',
    [['4/8','4/8'],['4/10','4/10'],['3/10','3/10'],['2/8','2/8']],
    1, 'subtopic:fractions-mixed', 'skill:arithmetic', 2),

  Q('"4 และ 1/3" เขียนเป็นเศษเกินว่า?',
    '"4 and 1/3" written as an improper fraction is?',
    [['12/3','12/3'],['13/3','13/3'],['14/3','14/3'],['11/3','11/3']],
    1, 'subtopic:fractions-mixed', 'skill:arithmetic', 2),

  Q('เศษส่วนใดมีค่าเท่ากับ 1 ทั้งหมด?',
    'Which fraction equals exactly 1?',
    [['7/6','7/6'],['5/5','5/5'],['5/6','5/6'],['6/7','6/7']],
    1, 'subtopic:fractions-mixed', 'skill:arithmetic', 1),

  Q('17/8 เขียนเป็นจำนวนคละได้ว่า?',
    '17/8 written as a mixed number is?',
    [['2 และ 3/8','2 and 3/8'],['3 และ 1/8','3 and 1/8'],['2 และ 1/8','2 and 1/8'],['2 และ 7/8','2 and 7/8']],
    2, 'subtopic:fractions-mixed', 'skill:arithmetic', 3),

  Q('"3 และ 1/4" เขียนเป็นเศษเกินว่า?',
    '"3 and 1/4" written as an improper fraction is?',
    [['10/4','10/4'],['11/4','11/4'],['12/4','12/4'],['13/4','13/4']],
    3, 'subtopic:fractions-mixed', 'skill:arithmetic', 2),

  Q('เศษส่วนใดเท่ากับ 1/3?',
    'Which fraction equals 1/3?',
    [['3/6','3/6'],['2/6','2/6'],['4/6','4/6'],['5/6','5/6']],
    1, 'subtopic:fractions-mixed', 'skill:arithmetic', 2),

  Q('19/9 เขียนเป็นจำนวนคละได้ว่า?',
    '19/9 written as a mixed number is?',
    [['2 และ 1/9','2 and 1/9'],['2 และ 2/9','2 and 2/9'],['1 และ 8/9','1 and 8/9'],['2 และ 8/9','2 and 8/9']],
    0, 'subtopic:fractions-mixed', 'skill:arithmetic', 3),

  Q('"1 และ 7/8" เขียนเป็นเศษเกินว่า?',
    '"1 and 7/8" written as an improper fraction is?',
    [['14/8','14/8'],['15/8','15/8'],['16/8','16/8'],['13/8','13/8']],
    1, 'subtopic:fractions-mixed', 'skill:arithmetic', 2),

  // ─── subtopic:fractions-word-problem (20 ข้อ) ─────────────────────────────
  Q('มีส้ม 1 ผล แบ่งเป็น 8 ชิ้น กินไปแล้ว 3 ชิ้น เหลือส้มอีกกี่ส่วน?',
    'An orange is cut into 8 pieces. 3 pieces are eaten. What fraction remains?',
    [['5/8','5/8'],['3/8','3/8'],['8/3','8/3'],['8/5','8/5']],
    0, 'subtopic:fractions-word-problem', 'skill:word-problem', 1),

  Q('แม่ทำพิซซ่า 1 ถาด แบ่งเป็น 6 ชิ้น พ่อกิน 1 ชิ้น แม่กิน 2 ชิ้น รวมกินไปทั้งหมดกี่ส่วน?',
    'A pizza is cut into 6 slices. Father eats 1, mother eats 2. What fraction was eaten in total?',
    [['3/6','3/6'],['1/6','1/6'],['2/6','2/6'],['6/3','6/3']],
    0, 'subtopic:fractions-word-problem', 'skill:word-problem', 1),

  Q('โจแบ่งริบบิ้นเป็น 5 ส่วนเท่าๆ กัน ใช้ไป 3 ส่วน เหลือริบบิ้นกี่ส่วน?',
    'Jo divides a ribbon into 5 equal parts and uses 3. What fraction remains?',
    [['3/5','3/5'],['2/5','2/5'],['5/3','5/3'],['5/2','5/2']],
    1, 'subtopic:fractions-word-problem', 'skill:word-problem', 1),

  Q('ถังน้ำมีน้ำอยู่ 2/7 ถัง ต้องเติมน้ำอีกกี่ส่วนจึงจะเต็มถัง?',
    'A tank is 2/7 full. How much more water is needed to fill it?',
    [['2/7','2/7'],['7/5','7/5'],['5/7','5/7'],['7/2','7/2']],
    2, 'subtopic:fractions-word-problem', 'skill:word-problem', 1),

  Q('ถนนยาว 1 กิโลเมตร ซ่อมแซมไปแล้ว 3/8 ยังไม่ได้ซ่อมอีกกี่ส่วน?',
    '1 km of road has been repaired 3/8. What fraction is not yet repaired?',
    [['3/8','3/8'],['5/8','5/8'],['8/5','8/5'],['8/3','8/3']],
    1, 'subtopic:fractions-word-problem', 'skill:word-problem', 1),

  Q('สวนผักปลูกผักบุ้ง 2/6 ส่วน และคะน้า 3/6 ส่วน ปลูกผักสองชนิดรวมกันกี่ส่วนของสวน?',
    'A garden has 2/6 morning glory and 3/6 kale. What fraction of the garden do both vegetables take?',
    [['1/6','1/6'],['5/12','5/12'],['5/6','5/6'],['6/5','6/5']],
    2, 'subtopic:fractions-word-problem', 'skill:word-problem', 1),

  Q('เก้ากินเค้ก 3/8 ของถาด เพื่อนกิน 2/8 ของถาด เหลือเค้กกี่ส่วน?',
    'Kao eats 3/8 of a cake and a friend eats 2/8. What fraction is left?',
    [['5/8','5/8'],['3/8','3/8'],['1/8','1/8'],['4/8','4/8']],
    1, 'subtopic:fractions-word-problem', 'skill:multi-step', 2),

  Q('สายไฟยาว 1 เส้น แบ่งเป็น 5 ส่วนเท่าๆ กัน ใช้ไป 2 ส่วน เหลือสายไฟกี่ส่วน?',
    'A wire is divided into 5 equal parts. 2 parts are used. What fraction remains?',
    [['2/5','2/5'],['3/5','3/5'],['5/2','5/2'],['5/3','5/3']],
    1, 'subtopic:fractions-word-problem', 'skill:word-problem', 1),

  Q('นักเรียน 1/5 เดินทางโดยรถโรงเรียน 2/5 โดยรถส่วนตัว ที่เหลือเดินมา นักเรียนที่เดินมีกี่ส่วน?',
    '1/5 of students come by school bus, 2/5 by car. What fraction walks?',
    [['2/5','2/5'],['3/5','3/5'],['1/5','1/5'],['4/5','4/5']],
    0, 'subtopic:fractions-word-problem', 'skill:multi-step', 2),

  Q('ผลไม้ 1/3 ถูกกิน อีก 1/3 เน่าเสีย เหลือผลไม้ดีกี่ส่วน?',
    '1/3 of fruits are eaten and 1/3 go bad. What fraction of good fruit remains?',
    [['2/3','2/3'],['1/3','1/3'],['0/3','0/3'],['3/3','3/3']],
    1, 'subtopic:fractions-word-problem', 'skill:multi-step', 2),

  Q('แม่ทำแยม 1 โหล แจกไป 5/12 โหล เหลือแยมกี่ส่วนของโหล?',
    'Mother made 1 jar of jam and gave away 5/12. What fraction remains?',
    [['5/12','5/12'],['12/5','12/5'],['12/7','12/7'],['7/12','7/12']],
    3, 'subtopic:fractions-word-problem', 'skill:word-problem', 1),

  Q('น้ำผลไม้ 1 กล่อง ดื่มไป 5/8 เหลือกี่ส่วน?',
    'A juice box is 5/8 drunk. What fraction is left?',
    [['5/8','5/8'],['3/8','3/8'],['8/5','8/5'],['8/3','8/3']],
    1, 'subtopic:fractions-word-problem', 'skill:word-problem', 1),

  Q('สีน้ำมีสีแดง 3/7 ถัง สีน้ำเงิน 2/7 ถัง รวมกันมีสีน้ำทั้งหมดกี่ส่วนของถัง?',
    'There is 3/7 tank of red paint and 2/7 tank of blue paint. How much paint in total?',
    [['1/7','1/7'],['5/14','5/14'],['5/7','5/7'],['7/5','7/5']],
    2, 'subtopic:fractions-word-problem', 'skill:word-problem', 1),

  Q('แถวต้นไม้มีสีเขียว 4/9 สีน้ำตาล 2/9 ที่เหลือสีขาว สีขาวมีกี่ส่วน?',
    'A row of trees has 4/9 green and 2/9 brown. What fraction is white?',
    [['6/9','6/9'],['2/9','2/9'],['3/9','3/9'],['4/9','4/9']],
    2, 'subtopic:fractions-word-problem', 'skill:multi-step', 2),

  Q('ยายปักผ้าเสร็จ 4/9 ส่วน เหลืออีกกี่ส่วนที่ยังไม่ได้ปัก?',
    'Grandma finished embroidering 4/9 of the cloth. How much is left to embroider?',
    [['4/9','4/9'],['9/4','9/4'],['5/9','5/9'],['9/5','9/5']],
    2, 'subtopic:fractions-word-problem', 'skill:word-problem', 1),

  Q('กระดาษ 1 แผ่น ตัดไปแล้ว 3/9 เหลือกระดาษกี่ส่วน?',
    'A sheet of paper has 3/9 cut off. What fraction remains?',
    [['3/9','3/9'],['9/3','9/3'],['6/9','6/9'],['9/6','9/6']],
    2, 'subtopic:fractions-word-problem', 'skill:word-problem', 1),

  Q('เชือกยาว 1 เส้น ตัดออกไป 1/4 และ 2/4 เหลือเชือกกี่ส่วน?',
    'A rope has 1/4 and 2/4 cut off. What fraction remains?',
    [['3/4','3/4'],['1/4','1/4'],['2/4','2/4'],['4/4','4/4']],
    1, 'subtopic:fractions-word-problem', 'skill:multi-step', 2),

  Q('เพื่อน 3 คน แบ่งเค้ก 1 ถาดออกเป็น 9 ชิ้นเท่าๆ กัน แต่ละคนกิน 2 ชิ้น เหลือเค้กกี่ส่วน?',
    '3 friends divide a cake into 9 equal pieces. Each eats 2 pieces. What fraction is left?',
    [['6/9','6/9'],['3/9','3/9'],['2/9','2/9'],['1/9','1/9']],
    1, 'subtopic:fractions-word-problem', 'skill:multi-step', 3),

  Q('โต๊ะยาว 1 เมตร วางของไว้ 2/5 เมตร ยังมีที่ว่างอีกกี่ส่วน?',
    'A 1-meter table has items taking 2/5 of its length. What fraction is empty?',
    [['2/5','2/5'],['5/2','5/2'],['3/5','3/5'],['5/3','5/3']],
    2, 'subtopic:fractions-word-problem', 'skill:word-problem', 1),

  Q('หม้อข้าวมีข้าว 7/8 หม้อ กินไป 4/8 เหลือข้าวกี่ส่วน?',
    'A rice pot is 7/8 full. 4/8 is eaten. What fraction of rice remains?',
    [['11/8','11/8'],['3/8','3/8'],['4/8','4/8'],['7/8','7/8']],
    1, 'subtopic:fractions-word-problem', 'skill:word-problem', 1),

];

async function main() {
  let count = 0;
  for (const q of questions) {
    await prisma.question.create({ data: q });
    count++;
  }
  console.log(`✅ สร้างข้อสอบ ${count} ข้อ (topic:fractions, p4)`);

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
