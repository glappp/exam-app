// seed-questions-ratio-p6.js
// topic:ratio, grade p6, 4 subtopics × 20 ข้อ = 80 ข้อ
// subtopic: ratio-concept, ratio-simplify, ratio-proportion, ratio-word-problem
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const IDX_TO_LETTER = ['a','b','c','d'];
const BASE = { examGrade: 'p6', topic: ['topic:ratio'] };
const Q = (textTh, textEn, choices, answer, subtopic, skill, difficulty, trap = []) => ({
  textTh, textEn,
  choices: choices.map(c => ({ textTh: c[0], textEn: c[1] })),
  answer: IDX_TO_LETTER[answer] ?? answer,
  attributes: { ...BASE, subtopic: [subtopic], skill: [skill], trap, difficulty },
  ownerOrg: 'system', createdBy: 'seed', updatedBy: 'seed',
  aiGenerated: false, needsReview: false,
});

const questions = [

  // ─── subtopic:ratio-concept (20 ข้อ) ─────────────────────────────────────
  Q('"อัตราส่วน" คืออะไร?',
    'What is a "ratio"?',
    [['ผลรวมของสองจำนวน','The sum of two numbers'],['การเปรียบเทียบปริมาณสองสิ่ง','A comparison of two quantities'],['ผลคูณของสองจำนวน','The product of two numbers'],['ความแตกต่างของสองจำนวน','The difference of two numbers']],
    1, 'subtopic:ratio-concept', 'skill:arithmetic', 1),

  Q('อัตราส่วน 3:4 อ่านว่าอย่างไร?',
    'How do you read the ratio 3:4?',
    [['3 บวก 4','3 plus 4'],['3 ต่อ 4','3 to 4'],['3 คูณ 4','3 times 4'],['3 ลบ 4','3 minus 4']],
    1, 'subtopic:ratio-concept', 'skill:arithmetic', 1),

  Q('มีดินสอแดง 5 แท่ง ดินสอน้ำเงิน 3 แท่ง อัตราส่วนดินสอแดง:ดินสอน้ำเงิน คือ?',
    'There are 5 red pencils and 3 blue pencils. What is the ratio of red to blue?',
    [['3:5','3:5'],['5:3','5:3'],['5:8','5:8'],['3:8','3:8']],
    1, 'subtopic:ratio-concept', 'skill:arithmetic', 1),

  Q('รถยนต์ 5 คัน รถบรรทุก 2 คัน อัตราส่วนรถยนต์:รถบรรทุก คือ?',
    'There are 5 cars and 2 trucks. What is the ratio of cars to trucks?',
    [['2:5','2:5'],['5:7','5:7'],['5:2','5:2'],['7:5','7:5']],
    2, 'subtopic:ratio-concept', 'skill:arithmetic', 1),

  Q('อัตราส่วน 2:3 เท่ากับข้อใด?',
    'Which ratio is equal to 2:3?',
    [['4:5','4:5'],['4:6','4:6'],['6:4','6:4'],['3:5','3:5']],
    1, 'subtopic:ratio-concept', 'skill:arithmetic', 2),

  Q('อัตราส่วน 3:4 เท่ากับข้อใด?',
    'Which ratio is equal to 3:4?',
    [['6:9','6:9'],['6:8','6:8'],['4:6','4:6'],['4:3','4:3']],
    1, 'subtopic:ratio-concept', 'skill:arithmetic', 2),

  Q('ถ้า A:B = 5:2 แล้ว B:A เท่ากับ?',
    'If A:B = 5:2, what is B:A?',
    [['5:2','5:2'],['2:5','2:5'],['10:4','10:4'],['1:5','1:5']],
    1, 'subtopic:ratio-concept', 'skill:arithmetic', 2),

  Q('อัตราส่วน 1:1 หมายความว่าอย่างไร?',
    'What does the ratio 1:1 mean?',
    [['ปริมาณแรกเป็นสองเท่าของปริมาณที่สอง','The first is twice the second'],['ปริมาณทั้งสองเท่ากัน','Both quantities are equal'],['ปริมาณที่สองเป็นศูนย์','The second quantity is zero'],['ปริมาณแรกน้อยกว่า','The first is smaller']],
    1, 'subtopic:ratio-concept', 'skill:arithmetic', 1),

  Q('ถ้า A:B = 4:1 แสดงว่า A มีปริมาณเป็นกี่เท่าของ B?',
    'If A:B = 4:1, A is how many times greater than B?',
    [['1 เท่า','1 time'],['2 เท่า','2 times'],['4 เท่า','4 times'],['5 เท่า','5 times']],
    2, 'subtopic:ratio-concept', 'skill:arithmetic', 1),

  Q('นักเรียน 20 คน ชาย 8 คน หญิง 12 คน อัตราส่วนชาย:หญิง คือ?',
    '20 students: 8 boys and 12 girls. What is the ratio of boys to girls?',
    [['20:8','20:8'],['12:8','12:8'],['8:12','8:12'],['8:20','8:20']],
    2, 'subtopic:ratio-concept', 'skill:arithmetic', 1),

  Q('น้ำ 6 แก้ว น้ำผลไม้ 2 แก้ว อัตราส่วนน้ำผลไม้:น้ำ คือ?',
    '6 glasses of water and 2 glasses of juice. What is the ratio of juice to water?',
    [['6:2','6:2'],['2:6','2:6'],['8:2','8:2'],['2:8','2:8']],
    1, 'subtopic:ratio-concept', 'skill:arithmetic', 2,['trap:misread']),

  Q('อัตราส่วน 3:5 ไม่เท่ากับข้อใด?',
    'Which ratio is NOT equal to 3:5?',
    [['6:10','6:10'],['9:15','9:15'],['6:9','6:9'],['12:20','12:20']],
    2, 'subtopic:ratio-concept', 'skill:arithmetic', 2),

  Q('อัตราส่วน 4:6 เขียนเป็นเศษส่วนได้ว่า?',
    'The ratio 4:6 written as a fraction is?',
    [['6/4','6/4'],['4/6','4/6'],['4/10','4/10'],['6/10','6/10']],
    1, 'subtopic:ratio-concept', 'skill:arithmetic', 1),

  Q('ผลไม้รวม 15 ผล มะม่วง 6 ผล ส้ม 9 ผล อัตราส่วนมะม่วง:ส้ม คือ?',
    'Total 15 fruits: 6 mangoes and 9 oranges. What is the ratio of mangoes to oranges?',
    [['6:15','6:15'],['9:6','9:6'],['6:9','6:9'],['15:6','15:6']],
    2, 'subtopic:ratio-concept', 'skill:arithmetic', 1),

  Q('อัตราส่วน 5:10 เท่ากับข้อใด?',
    'Which ratio equals 5:10?',
    [['1:3','1:3'],['1:2','1:2'],['2:1','2:1'],['5:1','5:1']],
    1, 'subtopic:ratio-concept', 'skill:arithmetic', 2),

  Q('ถ้ามีแดงต่อน้ำเงิน = 2:3 และมีน้ำเงิน 9 ชิ้น แดงมีกี่ชิ้น?',
    'Red to blue = 2:3. If there are 9 blue, how many red?',
    [['3','3'],['6','6'],['9','9'],['12','12']],
    1, 'subtopic:ratio-concept', 'skill:arithmetic', 2),

  Q('อัตราส่วนใดแสดงว่าปริมาณแรกน้อยกว่าปริมาณที่สอง?',
    'Which ratio shows the first quantity is less than the second?',
    [['3:2','3:2'],['5:1','5:1'],['2:5','2:5'],['4:4','4:4']],
    2, 'subtopic:ratio-concept', 'skill:arithmetic', 1),

  Q('ผ้าสีแดง 4 เมตร ผ้าสีขาว 6 เมตร อัตราส่วนผ้าแดง:ผ้าทั้งหมด คือ?',
    '4 m red cloth and 6 m white cloth. What is the ratio of red cloth to total cloth?',
    [['4:6','4:6'],['4:10','4:10'],['6:4','6:4'],['6:10','6:10']],
    1, 'subtopic:ratio-concept', 'skill:arithmetic', 2),

  Q('อัตราส่วน 7:3 กับ 3:7 เหมือนหรือต่างกัน?',
    'Are the ratios 7:3 and 3:7 the same or different?',
    [['เหมือนกัน เพราะใช้ตัวเลขเดียวกัน','Same, because they use the same numbers'],['ต่างกัน เพราะลำดับสำคัญ','Different, because order matters'],['เหมือนกัน เพราะผลรวมเท่ากัน','Same, because sums are equal'],['ต่างกัน เพราะผลคูณต่างกัน','Different, because products differ']],
    1, 'subtopic:ratio-concept', 'skill:arithmetic', 2),

  Q('มาตราส่วน 1:100 บนแผนที่หมายความว่าอย่างไร?',
    'A map scale of 1:100 means?',
    [['1 ซม. บนแผนที่ = 1 ซม. จริง','1 cm on map = 1 cm real'],['1 ซม. บนแผนที่ = 100 ซม. จริง','1 cm on map = 100 cm real'],['100 ซม. บนแผนที่ = 1 ซม. จริง','100 cm on map = 1 cm real'],['1 ม. บนแผนที่ = 100 ม. จริง','1 m on map = 100 m real']],
    1, 'subtopic:ratio-concept', 'skill:arithmetic', 2),

  // ─── subtopic:ratio-simplify (20 ข้อ) ────────────────────────────────────
  Q('อัตราส่วน 6:9 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 6:9.',
    [['1:3','1:3'],['2:3','2:3'],['3:2','3:2'],['3:9','3:9']],
    1, 'subtopic:ratio-simplify', 'skill:arithmetic', 1),

  Q('อัตราส่วน 10:15 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 10:15.',
    [['1:2','1:2'],['2:3','2:3'],['3:5','3:5'],['5:10','5:10']],
    1, 'subtopic:ratio-simplify', 'skill:arithmetic', 1),

  Q('อัตราส่วน 12:16 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 12:16.',
    [['3:4','3:4'],['4:3','4:3'],['6:8','6:8'],['2:3','2:3']],
    0, 'subtopic:ratio-simplify', 'skill:arithmetic', 1),

  Q('อัตราส่วน 8:20 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 8:20.',
    [['4:10','4:10'],['2:5','2:5'],['1:3','1:3'],['4:5','4:5']],
    1, 'subtopic:ratio-simplify', 'skill:arithmetic', 1),

  Q('อัตราส่วน 15:25 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 15:25.',
    [['5:10','5:10'],['3:4','3:4'],['3:5','3:5'],['5:8','5:8']],
    2, 'subtopic:ratio-simplify', 'skill:arithmetic', 1),

  Q('อัตราส่วน 18:24 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 18:24.',
    [['2:3','2:3'],['3:4','3:4'],['6:8','6:8'],['9:12','9:12']],
    1, 'subtopic:ratio-simplify', 'skill:arithmetic', 2),

  Q('อัตราส่วน 14:21 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 14:21.',
    [['7:14','7:14'],['2:3','2:3'],['3:2','3:2'],['4:7','4:7']],
    1, 'subtopic:ratio-simplify', 'skill:arithmetic', 2),

  Q('อัตราส่วน 20:30 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 20:30.',
    [['4:5','4:5'],['2:3','2:3'],['10:15','10:15'],['1:2','1:2']],
    1, 'subtopic:ratio-simplify', 'skill:arithmetic', 1),

  Q('อัตราส่วน 9:15 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 9:15.',
    [['3:4','3:4'],['3:5','3:5'],['4:5','4:5'],['1:2','1:2']],
    1, 'subtopic:ratio-simplify', 'skill:arithmetic', 2),

  Q('อัตราส่วน 16:20 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 16:20.',
    [['8:10','8:10'],['3:4','3:4'],['4:5','4:5'],['2:3','2:3']],
    2, 'subtopic:ratio-simplify', 'skill:arithmetic', 2),

  Q('อัตราส่วน 6:18 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 6:18.',
    [['2:6','2:6'],['1:3','1:3'],['3:1','3:1'],['2:9','2:9']],
    1, 'subtopic:ratio-simplify', 'skill:arithmetic', 1),

  Q('อัตราส่วน 25:100 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 25:100.',
    [['5:20','5:20'],['1:5','1:5'],['1:4','1:4'],['5:4','5:4']],
    2, 'subtopic:ratio-simplify', 'skill:arithmetic', 2),

  Q('อัตราส่วน 30:45 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 30:45.',
    [['6:9','6:9'],['2:3','2:3'],['3:2','3:2'],['10:15','10:15']],
    1, 'subtopic:ratio-simplify', 'skill:arithmetic', 2),

  Q('อัตราส่วน 35:49 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 35:49.',
    [['7:9','7:9'],['5:8','5:8'],['5:7','5:7'],['7:5','7:5']],
    2, 'subtopic:ratio-simplify', 'skill:arithmetic', 3),

  Q('อัตราส่วน 27:36 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 27:36.',
    [['3:4','3:4'],['9:12','9:12'],['4:3','4:3'],['2:3','2:3']],
    0, 'subtopic:ratio-simplify', 'skill:arithmetic', 2),

  Q('อัตราส่วน 40:64 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 40:64.',
    [['4:6','4:6'],['5:8','5:8'],['8:5','8:5'],['10:16','10:16']],
    1, 'subtopic:ratio-simplify', 'skill:arithmetic', 3),

  Q('อัตราส่วน 15:45 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 15:45.',
    [['3:9','3:9'],['1:3','1:3'],['3:1','3:1'],['5:15','5:15']],
    1, 'subtopic:ratio-simplify', 'skill:arithmetic', 1),

  Q('อัตราส่วน 21:28 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 21:28.',
    [['7:8','7:8'],['3:4','3:4'],['4:3','4:3'],['3:7','3:7']],
    1, 'subtopic:ratio-simplify', 'skill:arithmetic', 2),

  Q('อัตราส่วน 24:36 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 24:36.',
    [['8:12','8:12'],['4:6','4:6'],['2:3','2:3'],['3:2','3:2']],
    2, 'subtopic:ratio-simplify', 'skill:arithmetic', 2),

  Q('อัตราส่วน 12:18 ในรูปอย่างต่ำคือ?',
    'Simplify the ratio 12:18.',
    [['4:6','4:6'],['2:3','2:3'],['6:9','6:9'],['3:2','3:2']],
    1, 'subtopic:ratio-simplify', 'skill:arithmetic', 1),

  // ─── subtopic:ratio-proportion (20 ข้อ) ──────────────────────────────────
  Q('ถ้า 2:3 = x:9 แล้ว x = ?',
    'If 2:3 = x:9, what is x?',
    [['3','3'],['6','6'],['9','9'],['18','18']],
    1, 'subtopic:ratio-proportion', 'skill:arithmetic', 1),

  Q('ถ้า 4:5 = 8:x แล้ว x = ?',
    'If 4:5 = 8:x, what is x?',
    [['8','8'],['10','10'],['12','12'],['5','5']],
    1, 'subtopic:ratio-proportion', 'skill:arithmetic', 1),

  Q('ถ้า 3:4 = 6:x แล้ว x = ?',
    'If 3:4 = 6:x, what is x?',
    [['6','6'],['7','7'],['8','8'],['9','9']],
    2, 'subtopic:ratio-proportion', 'skill:arithmetic', 1),

  Q('ถ้า 5:2 = 15:x แล้ว x = ?',
    'If 5:2 = 15:x, what is x?',
    [['3','3'],['5','5'],['6','6'],['10','10']],
    2, 'subtopic:ratio-proportion', 'skill:arithmetic', 2),

  Q('ถ้า 1:3 = x:12 แล้ว x = ?',
    'If 1:3 = x:12, what is x?',
    [['3','3'],['4','4'],['6','6'],['12','12']],
    1, 'subtopic:ratio-proportion', 'skill:arithmetic', 1),

  Q('ถ้า 2:5 = 6:x แล้ว x = ?',
    'If 2:5 = 6:x, what is x?',
    [['10','10'],['12','12'],['15','15'],['3','3']],
    2, 'subtopic:ratio-proportion', 'skill:arithmetic', 2),

  Q('ถ้า 3:7 = x:21 แล้ว x = ?',
    'If 3:7 = x:21, what is x?',
    [['7','7'],['9','9'],['12','12'],['3','3']],
    1, 'subtopic:ratio-proportion', 'skill:arithmetic', 2),

  Q('ถ้า 4:9 = 8:x แล้ว x = ?',
    'If 4:9 = 8:x, what is x?',
    [['9','9'],['16','16'],['18','18'],['36','36']],
    2, 'subtopic:ratio-proportion', 'skill:arithmetic', 2),

  Q('ถ้า 5:3 = x:9 แล้ว x = ?',
    'If 5:3 = x:9, what is x?',
    [['3','3'],['10','10'],['15','15'],['25','25']],
    2, 'subtopic:ratio-proportion', 'skill:arithmetic', 2),

  Q('ถ้า 2:7 = 4:x แล้ว x = ?',
    'If 2:7 = 4:x, what is x?',
    [['7','7'],['14','14'],['28','28'],['2','2']],
    1, 'subtopic:ratio-proportion', 'skill:arithmetic', 2),

  Q('ถ้า 6:5 = x:25 แล้ว x = ?',
    'If 6:5 = x:25, what is x?',
    [['25','25'],['28','28'],['30','30'],['36','36']],
    2, 'subtopic:ratio-proportion', 'skill:arithmetic', 2),

  Q('ถ้า 3:8 = 9:x แล้ว x = ?',
    'If 3:8 = 9:x, what is x?',
    [['3','3'],['16','16'],['24','24'],['27','27']],
    2, 'subtopic:ratio-proportion', 'skill:arithmetic', 2),

  Q('ถ้า 7:4 = 21:x แล้ว x = ?',
    'If 7:4 = 21:x, what is x?',
    [['7','7'],['12','12'],['14','14'],['28','28']],
    1, 'subtopic:ratio-proportion', 'skill:arithmetic', 2),

  Q('ถ้า 1:4 = x:20 แล้ว x = ?',
    'If 1:4 = x:20, what is x?',
    [['4','4'],['5','5'],['8','8'],['20','20']],
    1, 'subtopic:ratio-proportion', 'skill:arithmetic', 1),

  Q('ถ้า 5:6 = x:30 แล้ว x = ?',
    'If 5:6 = x:30, what is x?',
    [['6','6'],['20','20'],['25','25'],['30','30']],
    2, 'subtopic:ratio-proportion', 'skill:arithmetic', 2),

  Q('ถ้า 2:3 = 10:x แล้ว x = ?',
    'If 2:3 = 10:x, what is x?',
    [['6','6'],['12','12'],['15','15'],['20','20']],
    2, 'subtopic:ratio-proportion', 'skill:arithmetic', 2),

  Q('ถ้า 3:5 = x:20 แล้ว x = ?',
    'If 3:5 = x:20, what is x?',
    [['6','6'],['9','9'],['12','12'],['15','15']],
    2, 'subtopic:ratio-proportion', 'skill:arithmetic', 2),

  Q('ถ้า 4:7 = 12:x แล้ว x = ?',
    'If 4:7 = 12:x, what is x?',
    [['16','16'],['18','18'],['21','21'],['28','28']],
    2, 'subtopic:ratio-proportion', 'skill:arithmetic', 2),

  Q('ถ้า 9:4 = x:8 แล้ว x = ?',
    'If 9:4 = x:8, what is x?',
    [['9','9'],['16','16'],['18','18'],['36','36']],
    2, 'subtopic:ratio-proportion', 'skill:arithmetic', 3),

  Q('ถ้า 5:8 = 10:x แล้ว x = ?',
    'If 5:8 = 10:x, what is x?',
    [['8','8'],['13','13'],['16','16'],['20','20']],
    2, 'subtopic:ratio-proportion', 'skill:arithmetic', 2),

  // ─── subtopic:ratio-word-problem (20 ข้อ) ────────────────────────────────
  Q('น้ำตาล:แป้ง = 2:3 ถ้าใช้น้ำตาล 4 ช้อน ต้องใช้แป้งกี่ช้อน?',
    'Sugar:flour = 2:3. If 4 spoons of sugar are used, how many spoons of flour are needed?',
    [['4 ช้อน','4 spoons'],['6 ช้อน','6 spoons'],['8 ช้อน','8 spoons'],['3 ช้อน','3 spoons']],
    1, 'subtopic:ratio-word-problem', 'skill:word-problem', 1),

  Q('อัตราส่วนเด็กชาย:เด็กหญิง = 3:2 ถ้ามีเด็กหญิง 10 คน มีเด็กชายกี่คน?',
    'Boys to girls = 3:2. If there are 10 girls, how many boys are there?',
    [['10 คน','10'],['12 คน','12'],['15 คน','15'],['6 คน','6']],
    2, 'subtopic:ratio-word-problem', 'skill:word-problem', 2),

  Q('รถวิ่ง 3 กม. ใช้น้ำมัน 1 ลิตร อยากวิ่ง 12 กม. ต้องใช้น้ำมันกี่ลิตร?',
    'A car travels 3 km per litre of fuel. How many litres are needed to travel 12 km?',
    [['3 ลิตร','3 litres'],['4 ลิตร','4 litres'],['6 ลิตร','6 litres'],['12 ลิตร','12 litres']],
    1, 'subtopic:ratio-word-problem', 'skill:word-problem', 1),

  Q('ส้ม:แอปเปิล = 5:2 มีส้ม 15 ผล มีแอปเปิลกี่ผล?',
    'Oranges to apples = 5:2. If there are 15 oranges, how many apples are there?',
    [['3 ผล','3'],['6 ผล','6'],['9 ผล','9'],['10 ผล','10']],
    1, 'subtopic:ratio-word-problem', 'skill:word-problem', 2),

  Q('มีนักเรียนรวม 35 คน ชาย:หญิง = 4:3 มีนักเรียนหญิงกี่คน?',
    'Total 35 students. Boys to girls = 4:3. How many girls are there?',
    [['10 คน','10'],['12 คน','12'],['15 คน','15'],['20 คน','20']],
    2, 'subtopic:ratio-word-problem', 'skill:multi-step', 3),

  Q('น้ำ:น้ำผลไม้ = 3:1 ถ้าใช้น้ำผลไม้ 2 แก้ว ต้องใช้น้ำกี่แก้ว?',
    'Water to juice = 3:1. If 2 glasses of juice are used, how many glasses of water are needed?',
    [['2 แก้ว','2'],['4 แก้ว','4'],['6 แก้ว','6'],['8 แก้ว','8']],
    2, 'subtopic:ratio-word-problem', 'skill:word-problem', 2),

  Q('ราคาสินค้า A:B = 2:3 สินค้า A ราคา 100 บาท สินค้า B ราคาเท่าไร?',
    'Price of item A to B = 2:3. Item A costs 100 baht. What does item B cost?',
    [['100 บาท','100 baht'],['120 บาท','120 baht'],['150 บาท','150 baht'],['200 บาท','200 baht']],
    2, 'subtopic:ratio-word-problem', 'skill:word-problem', 2),

  Q('เดินทางไป:กลับ = 3:2 ไปใช้เวลา 30 นาที กลับใช้เวลาเท่าไร?',
    'Time going to coming back = 3:2. Going takes 30 minutes. How long is the return journey?',
    [['10 นาที','10 min'],['15 นาที','15 min'],['20 นาที','20 min'],['45 นาที','45 min']],
    2, 'subtopic:ratio-word-problem', 'skill:word-problem', 2),

  Q('ซีเมนต์:ทราย = 1:3 ใช้ซีเมนต์ 2 ถุง ต้องใช้ทรายกี่ถุง?',
    'Cement to sand = 1:3. If 2 bags of cement are used, how many bags of sand are needed?',
    [['2 ถุง','2'],['4 ถุง','4'],['6 ถุง','6'],['8 ถุง','8']],
    2, 'subtopic:ratio-word-problem', 'skill:word-problem', 1),

  Q('ความกว้าง:ความยาวของห้อง = 3:5 ความกว้าง 12 เมตร ความยาวเท่าไร?',
    'Width to length of a room = 3:5. Width is 12 m. What is the length?',
    [['15 เมตร','15 m'],['18 เมตร','18 m'],['20 เมตร','20 m'],['24 เมตร','24 m']],
    2, 'subtopic:ratio-word-problem', 'skill:word-problem', 2),

  Q('ใน 10 นาที ทำชิ้นงานได้ 15 ชิ้น ใน 20 นาที ทำได้กี่ชิ้น?',
    'In 10 minutes, 15 pieces are made. How many pieces are made in 20 minutes?',
    [['20 ชิ้น','20'],['25 ชิ้น','25'],['30 ชิ้น','30'],['35 ชิ้น','35']],
    2, 'subtopic:ratio-word-problem', 'skill:word-problem', 1),

  Q('น้ำมัน 5 ลิตร วิ่งได้ 60 กม. น้ำมัน 8 ลิตร วิ่งได้กี่กม.?',
    '5 litres of fuel cover 60 km. How far can 8 litres cover?',
    [['75 กม.','75 km'],['80 กม.','80 km'],['96 กม.','96 km'],['100 กม.','100 km']],
    2, 'subtopic:ratio-word-problem', 'skill:word-problem', 2),

  Q('ซื้อ 3 ชิ้น ราคา 45 บาท ซื้อ 5 ชิ้น ราคาเท่าไร?',
    '3 items cost 45 baht. How much do 5 items cost?',
    [['60 บาท','60 baht'],['70 บาท','70 baht'],['75 บาท','75 baht'],['90 บาท','90 baht']],
    2, 'subtopic:ratio-word-problem', 'skill:word-problem', 1),

  Q('น้ำยา:น้ำ = 1:9 ต้องการสารละลาย 100 มล. ต้องใช้น้ำยากี่มล.?',
    'Solution to water = 1:9. To make 100 ml of mixture, how many ml of solution are needed?',
    [['1 มล.','1 ml'],['9 มล.','9 ml'],['10 มล.','10 ml'],['90 มล.','90 ml']],
    2, 'subtopic:ratio-word-problem', 'skill:multi-step', 3),

  Q('ผลไม้รวม 40 ผล มะม่วง:ส้ม = 3:5 มีมะม่วงกี่ผล?',
    'Total 40 fruits. Mangoes to oranges = 3:5. How many mangoes?',
    [['8 ผล','8'],['12 ผล','12'],['15 ผล','15'],['24 ผล','24']],
    2, 'subtopic:ratio-word-problem', 'skill:multi-step', 3),

  Q('แบ่งเงิน 240 บาท ให้ A และ B ในอัตราส่วน 3:5 A ได้เงินเท่าไร?',
    '240 baht is divided between A and B in the ratio 3:5. How much does A get?',
    [['60 บาท','60 baht'],['80 บาท','80 baht'],['90 บาท','90 baht'],['150 บาท','150 baht']],
    2, 'subtopic:ratio-word-problem', 'skill:multi-step', 3),

  Q('ทำสีผสม น้ำเงิน:เหลือง = 2:3 ต้องการสีเหลือง 12 ช้อน ต้องใช้สีน้ำเงินกี่ช้อน?',
    'Mixed paint: blue to yellow = 2:3. If 12 spoons of yellow are needed, how many spoons of blue?',
    [['6 ช้อน','6'],['8 ช้อน','8'],['9 ช้อน','9'],['18 ช้อน','18']],
    1, 'subtopic:ratio-word-problem', 'skill:word-problem', 2),

  Q('ทองหนัก 15 กรัม เงินหนัก 5 กรัม อัตราส่วนทอง:เงิน คือ 3:1 ถ้าต้องการทอง 9 กรัม ต้องมีเงินกี่กรัม?',
    'Gold 15g, silver 5g gives ratio 3:1. If 9g of gold is needed, how many grams of silver?',
    [['1 กรัม','1 g'],['3 กรัม','3 g'],['5 กรัม','5 g'],['9 กรัม','9 g']],
    1, 'subtopic:ratio-word-problem', 'skill:word-problem', 2),

  Q('เดินได้ 4 กม. ใน 1 ชั่วโมง จะเดิน 10 กม. ใช้เวลากี่ชั่วโมง?',
    'Walking speed is 4 km per hour. How many hours to walk 10 km?',
    [['2 ชั่วโมง','2 hours'],['2.5 ชั่วโมง','2.5 hours'],['4 ชั่วโมง','4 hours'],['10 ชั่วโมง','10 hours']],
    1, 'subtopic:ratio-word-problem', 'skill:word-problem', 2),

  Q('แบ่งเงิน 360 บาท ให้สามคนในอัตราส่วน 1:2:3 คนแรกได้เงินเท่าไร?',
    '360 baht is divided among three people in the ratio 1:2:3. How much does the first person get?',
    [['36 บาท','36 baht'],['60 บาท','60 baht'],['120 บาท','120 baht'],['180 บาท','180 baht']],
    1, 'subtopic:ratio-word-problem', 'skill:multi-step', 3),

];

async function main() {
  let count = 0;
  for (const q of questions) {
    await prisma.question.create({ data: q });
    count++;
  }
  console.log(`✅ สร้างข้อสอบ ${count} ข้อ (topic:ratio, p6)`);

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
