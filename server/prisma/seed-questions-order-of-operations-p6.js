const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = { examGrade: 'p6', topic: ['topic:order-of-operations'] };
const Q = (textTh, textEn, choices, answer, subtopic, skill, difficulty, trap = []) => ({
  textTh, textEn,
  choices: choices.map(c => ({ textTh: c[0], textEn: c[1] })),
  answer,
  attributes: { ...BASE, subtopic: [subtopic], skill: [skill], trap, difficulty },
  ownerOrg: 'system', createdBy: 'seed', updatedBy: 'seed',
  aiGenerated: false, needsReview: false,
});

const questions = [
  // subtopic: order-of-operations:bodmas-basic (20 ข้อ)
  // BODMAS: Brackets, Order (powers), Division, Multiplication, Addition, Subtraction
  // ระดับพื้นฐาน: ไม่มีวงเล็บ เฉพาะ +, -, ×, ÷
  Q('3 + 4 × 2 = ?',
    '3 + 4 × 2 = ?',
    [['14','14'],['11','11'],['10','10'],['8','8']], 1,
    'order-of-operations:bodmas-basic','calculate','easy',['left-to-right']),

  Q('10 - 2 × 3 = ?',
    '10 - 2 × 3 = ?',
    [['24','24'],['4','4'],['6','6'],['8','8']], 1,
    'order-of-operations:bodmas-basic','calculate','easy',['left-to-right']),

  Q('20 ÷ 4 + 5 = ?',
    '20 ÷ 4 + 5 = ?',
    [['10','10'],['7','7'],['25','25'],['6','6']], 0,
    'order-of-operations:bodmas-basic','calculate','easy'),

  Q('15 - 12 ÷ 4 = ?',
    '15 - 12 ÷ 4 = ?',
    [['3','3'],['12','12'],['9','9'],['18','18']], 1,
    'order-of-operations:bodmas-basic','calculate','easy',['left-to-right']),

  Q('2 + 3 × 4 - 1 = ?',
    '2 + 3 × 4 - 1 = ?',
    [['19','19'],['13','13'],['24','24'],['16','16']], 1,
    'order-of-operations:bodmas-basic','calculate','easy'),

  Q('18 ÷ 6 × 2 = ?',
    '18 ÷ 6 × 2 = ?',
    [['6','6'],['1','1'],['9','9'],['12','12']], 0,
    'order-of-operations:bodmas-basic','calculate','easy'),

  Q('5 × 3 + 4 × 2 = ?',
    '5 × 3 + 4 × 2 = ?',
    [['23','23'],['46','46'],['34','34'],['17','17']], 0,
    'order-of-operations:bodmas-basic','calculate','medium'),

  Q('24 ÷ 8 + 6 × 2 = ?',
    '24 ÷ 8 + 6 × 2 = ?',
    [['9','9'],['15','15'],['18','18'],['12','12']], 1,
    'order-of-operations:bodmas-basic','calculate','medium'),

  Q('30 - 4 × 5 + 6 = ?',
    '30 - 4 × 5 + 6 = ?',
    [['16','16'],['146','146'],['136','136'],['11','11']], 0,
    'order-of-operations:bodmas-basic','calculate','medium'),

  Q('7 + 9 ÷ 3 × 2 = ?',
    '7 + 9 ÷ 3 × 2 = ?',
    [['11','11'],['13','13'],['21','21'],['16','16']], 1,
    'order-of-operations:bodmas-basic','calculate','medium'),

  Q('ข้อใดคือผลลัพธ์ที่ถูกต้องของ 8 × 2 - 3 × 4',
    'What is the correct result of 8 × 2 - 3 × 4?',
    [['20','20'],['4','4'],['28','28'],['12','12']], 1,
    'order-of-operations:bodmas-basic','calculate','medium'),

  Q('50 ÷ 5 - 4 + 2 × 3 = ?',
    '50 ÷ 5 - 4 + 2 × 3 = ?',
    [['12','12'],['18','18'],['32','32'],['14','14']], 0,
    'order-of-operations:bodmas-basic','calculate','medium'),

  Q('ข้อใดคำนวณได้ถูกต้อง: 6 + 2 × 5',
    'Which calculation is correct: 6 + 2 × 5?',
    [['6 + 2 × 5 = 40','6 + 2 × 5 = 40'],['6 + 2 × 5 = 16','6 + 2 × 5 = 16'],['6 + 2 × 5 = 46','6 + 2 × 5 = 46'],['6 + 2 × 5 = 50','6 + 2 × 5 = 50']], 1,
    'order-of-operations:bodmas-basic','identify','easy',['left-to-right']),

  Q('ลำดับการคำนวณที่ถูกต้องสำหรับ 4 + 6 ÷ 2 คือ',
    'The correct order of operations for 4 + 6 ÷ 2 is:',
    [['(4+6) ÷ 2 = 5','(4+6) ÷ 2 = 5'],['4 + (6÷2) = 7','4 + (6÷2) = 7'],['4 + 6 - 2 = 8','4 + 6 - 2 = 8'],['(4+6+2) = 12','(4+6+2) = 12']], 1,
    'order-of-operations:bodmas-basic','identify','easy'),

  Q('3 × 4 + 5 × 2 - 10 = ?',
    '3 × 4 + 5 × 2 - 10 = ?',
    [['12','12'],['80','80'],['22','22'],['32','32']], 0,
    'order-of-operations:bodmas-basic','calculate','medium'),

  Q('40 ÷ 8 + 7 × 3 - 10 = ?',
    '40 ÷ 8 + 7 × 3 - 10 = ?',
    [['16','16'],['27','27'],['10','10'],['6','6']], 0,
    'order-of-operations:bodmas-basic','calculate','hard'),

  Q('100 - 50 ÷ 5 × 2 + 5 = ?',
    '100 - 50 ÷ 5 × 2 + 5 = ?',
    [['85','85'],['125','125'],['25','25'],['55','55']], 0,
    'order-of-operations:bodmas-basic','calculate','hard'),

  Q('ถ้าคำนวณ 2 + 3 × 4 โดยไม่สนใจลำดับก่อนหลัง จะได้คำตอบผิดไปเท่าไร (คำตอบถูกคือ 14)',
    'If 2 + 3 × 4 is calculated left-to-right ignoring order of operations, the wrong answer is 20. How much off is it from the correct answer of 14?',
    [['4','4'],['6','6'],['8','8'],['10','10']], 1,
    'order-of-operations:bodmas-basic','identify','hard',['left-to-right']),

  Q('ข้อใดมีค่าเท่ากับ 24',
    'Which expression equals 24?',
    [['3 + 3 × 7','3 + 3 × 7'],['4 × 5 + 4','4 × 5 + 4'],['30 - 2 × 3','30 - 2 × 3'],['6 × 3 + 2 × 3','6 × 3 + 2 × 3']], 2,
    'order-of-operations:bodmas-basic','identify','hard'),

  Q('12 ÷ 4 × 3 + 2 × 5 - 8 = ?',
    '12 ÷ 4 × 3 + 2 × 5 - 8 = ?',
    [['11','11'],['27','27'],['16','16'],['6','6']], 0,
    'order-of-operations:bodmas-basic','calculate','hard'),

  // subtopic: order-of-operations:bodmas-brackets (20 ข้อ)
  Q('(3 + 4) × 2 = ?',
    '(3 + 4) × 2 = ?',
    [['11','11'],['14','14'],['10','10'],['16','16']], 1,
    'order-of-operations:bodmas-brackets','calculate','easy'),

  Q('(10 - 3) × 4 = ?',
    '(10 - 3) × 4 = ?',
    [['34','34'],['28','28'],['22','22'],['32','32']], 1,
    'order-of-operations:bodmas-brackets','calculate','easy'),

  Q('20 ÷ (2 + 3) = ?',
    '20 ÷ (2 + 3) = ?',
    [['13','13'],['7','7'],['4','4'],['12','12']], 2,
    'order-of-operations:bodmas-brackets','calculate','easy'),

  Q('(8 + 4) ÷ (2 × 3) = ?',
    '(8 + 4) ÷ (2 × 3) = ?',
    [['1','1'],['2','2'],['3','3'],['4','4']], 1,
    'order-of-operations:bodmas-brackets','calculate','easy'),

  Q('5 × (3 + 2) - 4 = ?',
    '5 × (3 + 2) - 4 = ?',
    [['21','21'],['29','29'],['35','35'],['11','11']], 0,
    'order-of-operations:bodmas-brackets','calculate','easy'),

  Q('(15 - 9) × (4 + 2) = ?',
    '(15 - 9) × (4 + 2) = ?',
    [['24','24'],['36','36'],['18','18'],['30','30']], 1,
    'order-of-operations:bodmas-brackets','calculate','medium'),

  Q('40 ÷ (5 × 2) + 3 = ?',
    '40 ÷ (5 × 2) + 3 = ?',
    [['7','7'],['11','11'],['23','23'],['5','5']], 0,
    'order-of-operations:bodmas-brackets','calculate','medium'),

  Q('3 × (4 + 5 × 2) = ?',
    '3 × (4 + 5 × 2) = ?',
    [['54','54'],['42','42'],['33','33'],['81','81']], 1,
    'order-of-operations:bodmas-brackets','calculate','medium'),

  Q('(20 - 4 × 3) + 10 = ?',
    '(20 - 4 × 3) + 10 = ?',
    [['82','82'],['18','18'],['26','26'],['88','88']], 1,
    'order-of-operations:bodmas-brackets','calculate','medium',['left-to-right-inside-bracket']),

  Q('ข้อใดมีค่าต่างกันระหว่าง "มีวงเล็บ" กับ "ไม่มีวงเล็บ" สำหรับ (6 + 4) × 3 กับ 6 + 4 × 3',
    'What is the difference between (6 + 4) × 3 and 6 + 4 × 3?',
    [['8','8'],['12','12'],['6','6'],['0','0']], 0,
    'order-of-operations:bodmas-brackets','identify','medium'),

  Q('(100 - 64) ÷ 4 + 8 = ?',
    '(100 - 64) ÷ 4 + 8 = ?',
    [['17','17'],['25','25'],['16','16'],['28','28']], 1,
    'order-of-operations:bodmas-brackets','calculate','medium'),

  Q('7 × (10 - 3) - (4 + 2) × 5 = ?',
    '7 × (10 - 3) - (4 + 2) × 5 = ?',
    [['19','19'],['49','49'],['29','29'],['24','24']], 0,
    'order-of-operations:bodmas-brackets','calculate','hard'),

  Q('ใส่วงเล็บให้ถูกที่ เพื่อให้ 5 + 3 × 4 = 32',
    'Add brackets so that 5 + 3 × 4 = 32.',
    [['5 + (3 × 4) = 32','5 + (3 × 4) = 32'],['(5 + 3) × 4 = 32','(5 + 3) × 4 = 32'],['5 + 3 + 4 = 12','5 + 3 + 4 = 12'],['5 × 3 + 4 = 19','5 × 3 + 4 = 19']], 1,
    'order-of-operations:bodmas-brackets','identify','hard'),

  Q('ใส่วงเล็บให้ถูกที่ เพื่อให้ 10 - 2 × 3 = 24',
    'Add brackets so that 10 - 2 × 3 = 24.',
    [['10 - (2 × 3) = 4','10 - (2 × 3) = 4'],['(10 - 2) × 3 = 24','(10 - 2) × 3 = 24'],['10 × (2 - 3) = -10','10 × (2 - 3) = -10'],['(10 + 2) × 3 = 36','(10 + 2) × 3 = 36']], 1,
    'order-of-operations:bodmas-brackets','identify','hard'),

  Q('2 × (3 + 4 × (5 - 2)) = ?',
    '2 × (3 + 4 × (5 - 2)) = ?',
    [['30','30'],['34','34'],['24','24'],['42','42']], 0,
    'order-of-operations:bodmas-brackets','calculate','hard'),

  Q('(2 + 3) × (4 + 5) ÷ (1 + 2) = ?',
    '(2 + 3) × (4 + 5) ÷ (1 + 2) = ?',
    [['10','10'],['12','12'],['15','15'],['6','6']], 2,
    'order-of-operations:bodmas-brackets','calculate','hard'),

  Q('ข้อใดให้คำตอบเท่ากับ 10',
    'Which expression equals 10?',
    [['(4 + 2) × 3 - 8','(4 + 2) × 3 - 8'],['4 + (2 × 3) - 8','4 + (2 × 3) - 8'],['(4 + 2 × 3) - 8','(4 + 2 × 3) - 8'],['4 × (2 + 3) - 10','4 × (2 + 3) - 10']], 0,
    'order-of-operations:bodmas-brackets','identify','hard'),

  Q('50 - (4 × 5 + 3 × 2) = ?',
    '50 - (4 × 5 + 3 × 2) = ?',
    [['24','24'],['12','12'],['14','14'],['36','36']], 0,
    'order-of-operations:bodmas-brackets','calculate','medium'),

  Q('(7 + 3) × 2 - (8 ÷ 4 + 3) = ?',
    '(7 + 3) × 2 - (8 ÷ 4 + 3) = ?',
    [['12','12'],['15','15'],['10','10'],['20','20']], 1,
    'order-of-operations:bodmas-brackets','calculate','hard'),

  Q('วงเล็บในการคำนวณมีหน้าที่อะไร',
    'What is the purpose of brackets in calculations?',
    [['ทำให้คูณก่อนเสมอ','Always multiply first'],['เปลี่ยนลำดับการคำนวณให้คำนวณส่วนในวงเล็บก่อน','Change the order so the part inside brackets is calculated first'],['ทำให้ตัวเลขมีค่ามากขึ้น','Make numbers larger'],['ใช้เมื่อบวกและลบเท่านั้น','Used only for addition and subtraction']], 1,
    'order-of-operations:bodmas-brackets','identify','easy'),

  // subtopic: order-of-operations:bodmas-mixed (20 ข้อ)
  Q('(5 + 3) × 2 + 4 ÷ 2 = ?',
    '(5 + 3) × 2 + 4 ÷ 2 = ?',
    [['18','18'],['20','20'],['14','14'],['22','22']], 0,
    'order-of-operations:bodmas-mixed','calculate','medium'),

  Q('10 + (6 - 2) × 3 ÷ 4 = ?',
    '10 + (6 - 2) × 3 ÷ 4 = ?',
    [['14','14'],['13','13'],['12','12'],['16','16']], 1,
    'order-of-operations:bodmas-mixed','calculate','medium'),

  Q('(8 + 4) ÷ 3 × (5 - 2) = ?',
    '(8 + 4) ÷ 3 × (5 - 2) = ?',
    [['6','6'],['9','9'],['12','12'],['4','4']], 2,
    'order-of-operations:bodmas-mixed','calculate','medium'),

  Q('20 - (3 + 2) × 2 + 6 ÷ 3 = ?',
    '20 - (3 + 2) × 2 + 6 ÷ 3 = ?',
    [['14','14'],['12','12'],['10','10'],['16','16']], 0,
    'order-of-operations:bodmas-mixed','calculate','medium'),

  Q('(12 ÷ 4 + 3) × (8 - 5) = ?',
    '(12 ÷ 4 + 3) × (8 - 5) = ?',
    [['18','18'],['27','27'],['9','9'],['21','21']], 0,
    'order-of-operations:bodmas-mixed','calculate','medium'),

  Q('4 × (9 - 4 ÷ 2) + 5 = ?',
    '4 × (9 - 4 ÷ 2) + 5 = ?',
    [['32','32'],['33','33'],['34','34'],['35','35']], 1,
    'order-of-operations:bodmas-mixed','calculate','medium'),

  Q('(3 × 4 + 2) × (10 - 8) = ?',
    '(3 × 4 + 2) × (10 - 8) = ?',
    [['24','24'],['28','28'],['32','32'],['36','36']], 1,
    'order-of-operations:bodmas-mixed','calculate','medium'),

  Q('100 ÷ (4 + 6) × 2 - 5 × 3 = ?',
    '100 ÷ (4 + 6) × 2 - 5 × 3 = ?',
    [['5','5'],['25','25'],['10','10'],['15','15']], 0,
    'order-of-operations:bodmas-mixed','calculate','hard'),

  Q('(2 + 3) × (4 + 3 × 2) - 10 = ?',
    '(2 + 3) × (4 + 3 × 2) - 10 = ?',
    [['40','40'],['50','50'],['60','60'],['30','30']], 0,
    'order-of-operations:bodmas-mixed','calculate','hard'),

  Q('ข้อใดให้คำตอบ 5 สำหรับ □ + (3 × 4 - 6) ÷ 2 = 8',
    'What value of □ satisfies □ + (3 × 4 - 6) ÷ 2 = 8?',
    [['3','3'],['5','5'],['8','8'],['2','2']], 1,
    'order-of-operations:bodmas-mixed','identify','hard'),

  Q('(15 ÷ 3 + 2) × (4 × 2 - 6) ÷ 7 = ?',
    '(15 ÷ 3 + 2) × (4 × 2 - 6) ÷ 7 = ?',
    [['2','2'],['3','3'],['4','4'],['7','7']], 0,
    'order-of-operations:bodmas-mixed','calculate','hard'),

  Q('ลำดับการคำนวณที่ถูกต้องตามหลัก BODMAS คือ',
    'The correct order of operations according to BODMAS is:',
    [['บวก, ลบ, คูณ, หาร, วงเล็บ','Addition, Subtraction, Multiplication, Division, Brackets'],['วงเล็บ, คูณ/หาร, บวก/ลบ','Brackets, Multiplication/Division, Addition/Subtraction'],['วงเล็บ, บวก/ลบ, คูณ/หาร','Brackets, Addition/Subtraction, Multiplication/Division'],['คูณ, หาร, บวก, ลบ, วงเล็บ','Multiplication, Division, Addition, Subtraction, Brackets']], 1,
    'order-of-operations:bodmas-mixed','identify','easy'),

  Q('5 + 2 × (8 - 3) - 4 ÷ 2 = ?',
    '5 + 2 × (8 - 3) - 4 ÷ 2 = ?',
    [['15','15'],['13','13'],['17','17'],['20','20']], 0,
    'order-of-operations:bodmas-mixed','calculate','medium'),

  Q('(7 × 2 - 4) ÷ (3 + 2 × 2 - 3) = ?',
    '(7 × 2 - 4) ÷ (3 + 2 × 2 - 3) = ?',
    [['5','5'],['2','2'],['3','3'],['10','10']], 2,
    'order-of-operations:bodmas-mixed','calculate','hard'),

  Q('ข้อใดต่อไปนี้ถูกต้อง',
    'Which of the following is correct?',
    [['3 + 5 × 2 = 16','3 + 5 × 2 = 16'],['(3 + 5) × 2 = 16','(3 + 5) × 2 = 16'],['3 + 5 × 2 = 13','3 + 5 × 2 = 13'],['(3 + 5) × 2 = 13','(3 + 5) × 2 = 13']], 1,
    'order-of-operations:bodmas-mixed','identify','easy'),

  Q('18 ÷ (2 + 4) × 3 - 1 = ?',
    '18 ÷ (2 + 4) × 3 - 1 = ?',
    [['8','8'],['9','9'],['10','10'],['11','11']], 0,
    'order-of-operations:bodmas-mixed','calculate','medium'),

  Q('คำนวณ: (4 + 3 × 2) ÷ (10 ÷ 5) + (3 × 3 - 4)',
    'Calculate: (4 + 3 × 2) ÷ (10 ÷ 5) + (3 × 3 - 4)',
    [['10','10'],['10.5','10.5'],['9','9'],['11','11']], 0,
    'order-of-operations:bodmas-mixed','calculate','hard'),

  Q('ค่าของ □ ใน (□ - 3) × 4 + 2 = 22 คือ',
    'The value of □ in (□ - 3) × 4 + 2 = 22 is:',
    [['5','5'],['6','6'],['7','7'],['8','8']], 2,
    'order-of-operations:bodmas-mixed','identify','hard'),

  Q('ข้อใดให้ค่าเท่ากัน',
    'Which pair of expressions gives the same value?',
    [['2 + 3 × 4 = (2+3) × 4','2 + 3 × 4 = (2+3) × 4'],['(6 + 4) ÷ 2 = 6 + 4 ÷ 2','(6 + 4) ÷ 2 = 6 + 4 ÷ 2'],['(5-2) × 3 = 5 - 2 × 3','(5-2) × 3 = 5 - 2 × 3'],['4 × (2+1) = 4 × 2 + 4 × 1','4 × (2+1) = 4 × 2 + 4 × 1']], 3,
    'order-of-operations:bodmas-mixed','identify','hard'),

  Q('(6 + 4) ÷ 2 × 3 - (7 - 4) × 2 = ?',
    '(6 + 4) ÷ 2 × 3 - (7 - 4) × 2 = ?',
    [['9','9'],['8','8'],['7','7'],['6','6']], 0,
    'order-of-operations:bodmas-mixed','calculate','hard'),

  // subtopic: order-of-operations:bodmas-word-problem (20 ข้อ)
  Q('แม่ซื้อแอปเปิ้ล 3 กิโลกรัมๆ ละ 50 บาท และส้ม 2 กิโลกรัมๆ ละ 40 บาท จ่ายเงินรวมเท่าไร',
    'Mom bought 3 kg of apples at 50 baht/kg and 2 kg of oranges at 40 baht/kg. How much in total?',
    [['270 บาท','270 baht'],['230 บาท','230 baht'],['300 บาท','300 baht'],['410 บาท','410 baht']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','easy'),

  Q('ห้องเรียนมีโต๊ะ 5 แถว แถวละ 6 ตัว และเก้าอี้ครู 1 ตัว มีเฟอร์นิเจอร์ทั้งหมดกี่ชิ้น',
    'A classroom has 5 rows of 6 desks, plus 1 teacher chair. How many pieces of furniture total?',
    [['31','31'],['36','36'],['30','30'],['37','37']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','easy'),

  Q('พ่อมีเงิน 500 บาท ซื้อของ 3 ชิ้นๆ ละ 80 บาท เหลือเงินเท่าไร',
    'Dad has 500 baht, buys 3 items at 80 baht each. How much is left?',
    [['260 บาท','260 baht'],['240 บาท','240 baht'],['220 บาท','220 baht'],['200 บาท','200 baht']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','easy'),

  Q('นักเรียน 4 กลุ่ม กลุ่มละ 5 คน ทำงาน 3 ชั่วโมง ถ้าแต่ละคนได้รับค่าจ้างชั่วโมงละ 20 บาท ค่าจ้างทั้งหมดเป็นเท่าไร',
    '4 groups of 5 students work 3 hours. If each person earns 20 baht/hour, what is the total pay?',
    [['1,200 บาท','1,200 baht'],['600 บาท','600 baht'],['400 บาท','400 baht'],['300 บาท','300 baht']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','medium'),

  Q('ร้านอาหารขายก๋วยเตี๋ยว 120 ชาม เช้า 40 ชาม กลางวัน 50 ชาม เย็น ที่เหลือ ชามละ 40 บาท รายได้ตอนเย็นเป็นเท่าไร',
    'A restaurant sells 120 bowls of noodles: 40 in morning, 50 at lunch, rest in evening at 40 baht/bowl. What is the evening revenue?',
    [['1,200 บาท','1,200 baht'],['1,600 บาท','1,600 baht'],['2,000 บาท','2,000 baht'],['800 บาท','800 baht']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','medium'),

  Q('สวนมีแอปเปิ้ล 200 ผล แจก 3 กลุ่ม กลุ่มละเท่าๆ กัน แต่ละกลุ่มมี 4 คน แต่ละคนได้รับกี่ผล',
    'An orchard has 200 apples divided equally among 3 groups of 4 people each. How many apples per person?',
    [['50 ผล','50 apples'],['25 ผล','25 apples'],['17 ผล','17 apples'],['16 ผล','16 apples']], 2,
    'order-of-operations:bodmas-word-problem','word-problem','hard'),

  Q('โรงงานผลิตสินค้า 8 ชั่วโมงต่อวัน ชั่วโมงละ 50 ชิ้น แต่ตรวจพบของเสีย 20 ชิ้นต่อวัน สินค้าดีต่อวันมีกี่ชิ้น',
    'A factory produces 50 items/hour for 8 hours/day, with 20 defective items/day. How many good items per day?',
    [['380 ชิ้น','380 items'],['400 ชิ้น','400 items'],['420 ชิ้น','420 items'],['360 ชิ้น','360 items']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','medium'),

  Q('นักเรียน 3 คน เก็บเงินซื้อของขวัญ คนละ 150 บาท ซื้อหนังสือราคา 250 บาท และของเล่นราคา 180 บาท เหลือเงินเท่าไร',
    '3 students each contribute 150 baht to buy gifts. They buy a book for 250 baht and a toy for 180 baht. How much is left?',
    [['20 บาท','20 baht'],['50 บาท','50 baht'],['70 บาท','70 baht'],['0 บาท','0 baht']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','medium'),

  Q('ปลูกต้นไม้ 5 แถว แถวละ 8 ต้น เอาออก 6 ต้น แล้วปลูกเพิ่ม 3 แถว แถวละ 4 ต้น มีต้นไม้ทั้งหมดกี่ต้น',
    'Plant 5 rows × 8 trees = 40 trees, remove 6, then plant 3 more rows × 4. Total trees?',
    [['46 ต้น','46 trees'],['54 ต้น','54 trees'],['58 ต้น','58 trees'],['62 ต้น','62 trees']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','hard'),

  Q('แม่ทำขนม 3 ถาด ถาดละ 12 ชิ้น กินไป 5 ชิ้น แบ่งให้เพื่อนบ้าน 2 บ้าน บ้านละเท่าๆ กัน แต่ละบ้านได้รับกี่ชิ้น',
    'Mom bakes 3 trays × 12 pieces, eats 5, then shares equally with 2 neighboring houses. How many pieces per house?',
    [['17 ชิ้น','17 pieces'],['17.5 ชิ้น','17.5 pieces'],['18 ชิ้น','18 pieces'],['15 ชิ้น','15 pieces']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','hard'),

  Q('ร้านขายเสื้อผ้า เช้าขาย 15 ตัว กลางวันขาย 2 เท่าของเช้า เย็นขายน้อยกว่ากลางวัน 8 ตัว ขายรวมทั้งวันกี่ตัว',
    'A clothes shop sells 15 in morning, twice that at noon, and 8 fewer than noon in evening. Total sold?',
    [['67 ตัว','67 pieces'],['68 ตัว','68 pieces'],['57 ตัว','57 pieces'],['72 ตัว','72 pieces']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','medium'),

  Q('นักเรียน 30 คน แบ่งกลุ่มทำโครงงาน กลุ่มละ 5 คน แต่ละกลุ่มต้องซื้อกระดาษ 3 แผ่น แผ่นละ 2 บาท ค่าใช้จ่ายรวมทั้งหมดเป็นเท่าไร',
    '30 students form groups of 5. Each group buys 3 sheets of paper at 2 baht/sheet. Total cost?',
    [['36 บาท','36 baht'],['40 บาท','40 baht'],['30 บาท','30 baht'],['24 บาท','24 baht']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','medium'),

  Q('สวนสัตว์มีสิงโต 4 ตัว เสือ 3 ตัว แต่ละตัวกินเนื้อวันละ 5 กิโลกรัม อาหารทั้งหมดสำหรับ 7 วันเป็นเท่าไร',
    'A zoo has 4 lions and 3 tigers, each eating 5 kg of meat/day. Total meat for 7 days?',
    [['245 กิโลกรัม','245 kg'],['210 กิโลกรัม','210 kg'],['105 กิโลกรัม','105 kg'],['70 กิโลกรัม','70 kg']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','medium'),

  Q('ราคาปกติของเสื้อตัวละ 200 บาท ลดราคา 25% ซื้อ 3 ตัว จ่ายเงินทั้งหมดเท่าไร',
    'A shirt normally costs 200 baht, discounted 25%. Buy 3 shirts. Total payment?',
    [['450 บาท','450 baht'],['400 บาท','400 baht'],['500 บาท','500 baht'],['600 บาท','600 baht']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','hard'),

  Q('ห้องหนึ่งมีความยาว 8 เมตร กว้าง 5 เมตร ปูพรม 2 ห้อง แต่เว้นพื้นที่ 4 ตร.ม. ในแต่ละห้อง พื้นที่พรมทั้งหมดเป็นเท่าไร',
    'A room is 8m × 5m. Carpet 2 rooms but leave 4 m² uncarpeted in each room. Total carpeted area?',
    [['72 ตร.ม.','72 m²'],['76 ตร.ม.','76 m²'],['80 ตร.ม.','80 m²'],['68 ตร.ม.','68 m²']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','hard'),

  Q('รถไฟออกเดินทางเวลา 08:00 น. ถึงสถานีแรกเวลา 10:00 น. รับผู้โดยสารเพิ่ม 45 คน ผู้โดยสารทั้งหมดเป็น 120 คน ผู้โดยสารเริ่มต้นมีกี่คน',
    'A train departs at 08:00, arrives at the first station at 10:00, picks up 45 more passengers totaling 120. How many passengers at departure?',
    [['75 คน','75 people'],['65 คน','65 people'],['80 คน','80 people'],['85 คน','85 people']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','easy'),

  Q('โต๊ะวางของมีสินค้า 4 แถว แถวละ 6 ชิ้น ขายไป 10 ชิ้น แล้วเติมสินค้าอีก 2 เท่าของที่ขายไป มีสินค้าทั้งหมดกี่ชิ้น',
    'A shelf has 4 rows × 6 items, sells 10, then restocks double what was sold. How many items total?',
    [['34 ชิ้น','34 items'],['44 ชิ้น','44 items'],['24 ชิ้น','24 items'],['54 ชิ้น','54 items']], 1,
    'order-of-operations:bodmas-word-problem','word-problem','hard'),

  Q('บ้านใช้ไฟฟ้าวันละ 15 หน่วย ค่าไฟหน่วยละ 4 บาท ถ้าได้รับส่วนลด 50 บาทต่อเดือน ค่าไฟ 30 วันเป็นเท่าไร',
    'A house uses 15 units of electricity/day at 4 baht/unit, with a 50-baht monthly discount. What is the 30-day bill?',
    [['1,750 บาท','1,750 baht'],['1,800 บาท','1,800 baht'],['1,850 บาท','1,850 baht'],['1,700 บาท','1,700 baht']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','hard'),

  Q('สนามฟุตบอลมีที่นั่ง 5,000 ที่ ขายบัตร 3 ประเภท ประเภทละ 1,000 ที่ ราคา 100, 200, 300 บาท ส่วนที่เหลือ 2,000 ที่ ราคา 50 บาท รายได้ทั้งหมดเป็นเท่าไร',
    'A stadium has 5,000 seats: 3 types of 1,000 seats at 100, 200, 300 baht; remaining 2,000 at 50 baht. Total revenue?',
    [['700,000 บาท','700,000 baht'],['650,000 บาท','650,000 baht'],['750,000 บาท','750,000 baht'],['600,000 บาท','600,000 baht']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','hard'),

  Q('เด็ก 6 คน แบ่งขนม 48 ชิ้นเท่าๆ กัน แล้วกิน 3 ชิ้น แต่ได้รับเพิ่มอีก 5 ชิ้น แต่ละคนมีขนมกี่ชิ้น',
    '6 children share 48 candies equally, each eats 3, then receives 5 more. How many candies does each child have?',
    [['10 ชิ้น','10 pieces'],['8 ชิ้น','8 pieces'],['11 ชิ้น','11 pieces'],['6 ชิ้น','6 pieces']], 0,
    'order-of-operations:bodmas-word-problem','word-problem','medium'),
];

async function main() {
  const counts = {};
  for (const q of questions) {
    await prisma.question.create({ data: q });
    const sub = q.attributes.subtopic[0];
    counts[sub] = (counts[sub] || 0) + 1;
  }
  console.log(`✅ สร้างข้อสอบ ${questions.length} ข้อ (topic:order-of-operations, p6)`);
  for (const [k, v] of Object.entries(counts)) console.log(`   ${k}: ${v} ข้อ`);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
