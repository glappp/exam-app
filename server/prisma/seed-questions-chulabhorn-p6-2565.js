// seed-questions-chulabhorn-p6-2565.js
// ข้อสอบจุฬาภรณ์วิทยาศาสตร์-คณิตศาสตร์ ป.6 ปีการศึกษา 2565
// 3 ตอน: ตอนที่1 (10ข้อ×1คะแนน), ตอนที่2 (10ข้อ×2คะแนน), ตอนที่3 (5ข้อ×3คะแนน)
// รวม 27 entries (ข้อ 21 แยกเป็น 3 sub-questions)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = {
  examGrade: 'p6',
  source: 'chulabhorn-2565',
  difficulty: 3,
};

const IDX_TO_LETTER = ['a','b','c','d'];
const Q = (textTh, textEn, choices, answer, subtopicKey, topicKey, trap = []) => ({
  textTh,
  textEn,
  choices: choices.map(c => ({ textTh: String(c), textEn: String(c) })),
  answer: IDX_TO_LETTER[answer] ?? answer,
  attributes: {
    ...BASE,
    topic: [`topic:${topicKey}`],
    subtopic: [`subtopic:${subtopicKey}`],
    skill: ['skill:logical-reasoning'],
    trap,
  },
  ownerOrg: 'system',
  createdBy: 'seed',
  updatedBy: 'seed',
  aiGenerated: false,
  needsReview: false,
});

const questions = [

  // ─── ตอนที่ 1 (10 ข้อ × 1 คะแนน) ────────────────────────────────────────

  // ข้อ 1 — ลำดับการคำนวณ (BODMAS)
  Q(
    '7 × 7 − 7 + 7 ÷ 7 มีค่าเท่ากับเท่าใด',
    'What is the value of 7 × 7 − 7 + 7 ÷ 7?',
    [40, 43, 46, 50],
    1,
    'order-of-operations-basic', 'order-of-operations',
  ),

  // ข้อ 2 — เศษส่วน
  Q(
    'กำหนดให้ A = 2¾ + 3/7, B = 6/8 × 4/7, C = 7/21 ÷ 8/9\nจงหาผลต่างระหว่างจำนวนที่มากที่สุดกับจำนวนที่น้อยที่สุด',
    'Given A = 2¾ + 3/7, B = 6/8 × 4/7, C = 7/21 ÷ 8/9\nFind the difference between the largest and smallest values.',
    [1, 2, 3, 4],
    2,
    'fraction-word-problem', 'fractions',
  ),

  // ข้อ 3 — รูปแบบตัวเลข
  Q(
    'พิจารณาแบบรูปดังนี้\nแบบรูปที่ 1: 1.1, 2.2, A, 26.4, 132, B\nแบบรูปที่ 2: 4.8, 2.4, C, 0.6, 0.3, D\n(×2, ×3, ×4, ×5, ×6 และ ÷2 ตามลำดับ)\nค่าของ (10×A) + B/2 + (100×C) − (1000×D) เท่ากับเท่าใด',
    'Consider the number patterns:\nPattern 1: 1.1, 2.2, A, 26.4, 132, B (×2, ×3, ×4, ×5, ×6)\nPattern 2: 4.8, 2.4, C, 0.6, 0.3, D (÷2 each step)\nFind the value of (10×A) + B/2 + (100×C) − (1000×D)',
    [390, 412, 432, 456],
    2,
    'sequence-pattern', 'whole-numbers',
  ),

  // ข้อ 4 — มุม เส้นขนาน
  Q(
    'กำหนดให้เส้นตรง PQ ขนานกับเส้นตรง RS เส้นตรง ℓ₁ และ ℓ₂ ตัดกับเส้นคู่ขนาน จากรูปที่กำหนดให้ มุมของมุม A เท่ากับเท่าใด\n(กำหนดมุม 65° ระหว่าง ℓ₁ และ ℓ₂ มุม 45° ที่เส้น RS)',
    'Lines PQ and RS are parallel. Lines ℓ₁ and ℓ₂ intersect the parallel lines. Given the figure with a 65° angle between ℓ₁ and ℓ₂, and a 45° angle at RS, what is the measure of angle A?',
    [115, 160, 135, 180],
    1,
    'parallel-lines-angles', 'geometry',
    ['trap:alternate-interior-angles'],
  ),

  // ข้อ 5 — แผนภูมิวงกลม
  Q(
    'แผนภูมิวงกลมแสดงการใช้น้ำในแต่ละวันของครอบครัวหนึ่ง ซึ่งมีสมาชิก 5 คน\nโดย: อาบน้ำ 240 ลิตร (แสดงด้วยมุม 144°), ซักผ้า 25%, ล้างจาน 10%\nถ้าครอบครัวนี้ใช้น้ำโดยเฉลี่ยวันละเท่ากัน ครอบครัวนี้ใช้น้ำทั้งหมดกี่ลิตรต่อวัน',
    'A pie chart shows daily water usage for a family of 5 members.\nShowings: bathing 240 liters (represented by 144°), washing clothes 25%, washing dishes 10%.\nHow many liters of water does the family use per day in total?',
    [480, 540, 660, 600],
    3,
    'pie-chart', 'statistics',
  ),

  // ข้อ 6 — นับรูปสี่เหลี่ยม
  Q(
    'จากรูปที่กำหนดให้ มีรูปสี่เหลี่ยมจัตุรัสทั้งหมดกี่รูป\n(รูปบันได L-shape ประกอบด้วย: สี่เหลี่ยม 1×1 = 12 รูป, 2×2 = 5 รูป, 3×3 = 1 รูป)',
    'From the given L-shaped staircase figure, how many squares are there in total?\n(1×1 squares = 12, 2×2 squares = 5, 3×3 squares = 1)',
    [18, 20, 22, 24],
    0,
    'counting-shapes', 'geometry',
  ),

  // ข้อ 7 — พื้นที่สี่เหลี่ยมและรูปแรเงา
  Q(
    'กำหนดให้ ABCD เป็นรูปสี่เหลี่ยมจัตุรัส พื้นที่รูปสี่เหลี่ยม ABCD เป็นกี่เท่าของพื้นที่ที่แรเงา\n(รูปมีเส้นแบ่งภายในเป็น 6 ส่วน ทำให้เกิดรูปแรเงาเล็กๆ)',
    'ABCD is a square. How many times is the area of square ABCD compared to the shaded region?\n(The figure has 6 dividing lines creating a small shaded region)',
    [16, 32, 128, 64],
    3,
    'area-square', 'geometry',
  ),

  // ข้อ 8 — ห.ร.ม. ตัดกระดาษ
  Q(
    'คุณครูจากกระดาษสี่เหลี่ยมผืนผ้าสองแผ่นซึ่งทั้งสองแผ่นมีขนาดแตกต่างกัน\nแผ่นที่หนึ่ง กว้าง 25 ซม. ยาว 35 ซม. แผ่นที่สอง กว้าง 28 ซม. ยาว 42 ซม.\nตัดกระดาษแต่ละแผ่นในรูปสี่เหลี่ยมจัตุรัสโดยให้แต่ละแผ่นมีความยาวด้านมากที่สุด\nจะตัดกระดาษทั้งสองแผ่นนี้เป็นสี่เหลี่ยมจัตุรัสได้ทั้งหมดกี่รูป',
    'A teacher has two rectangular sheets of paper: Sheet 1 is 25 cm × 35 cm, Sheet 2 is 28 cm × 42 cm.\nCut each sheet into the largest possible squares with no remainder.\nHow many squares can be cut from both sheets combined?',
    [35, 41, 44, 38],
    1,
    'gcf', 'whole-numbers',
  ),

  // ข้อ 9 — ร้อยละ
  Q(
    'สวนสัตว์แห่งหนึ่งขายบัตรเข้าชมการแสดงโลมา พบว่าวันที่สองขายบัตรได้ 375 ใบ ซึ่งเพิ่มขึ้นจากวันแรก 25%\nสวนสัตว์นี้ขายบัตรเข้าชมการแสดงโลมาในสองวันนี้ได้ทั้งหมดกี่ใบ',
    'A zoo sold dolphin show tickets. On the second day, 375 tickets were sold, which was 25% more than the first day.\nHow many tickets were sold on both days combined?',
    [575, 625, 725, 675],
    3,
    'percentage-word-problem', 'percentage',
  ),

  // ข้อ 10 — เหรียญ (สมการ)
  Q(
    'กระปุกออมสินใบหนึ่งมีเหรียญ 1 บาท เหรียญ 5 บาท และเหรียญ 10 บาท\nจำนวนเหรียญ 5 บาท เป็น 3/4 ของจำนวนเหรียญ 1 บาท\nจำนวนเหรียญ 10 บาท เป็น 1/2 ของจำนวนเหรียญ 5 บาท\nเมื่อนับเงินทั้งหมดในกระปุกออมสินพบว่ามีเงิน 204 บาท\nมีเหรียญในกระปุกออมสินทั้งหมดกี่เหรียญ',
    'A piggy bank contains 1-baht, 5-baht, and 10-baht coins.\nThe number of 5-baht coins is 3/4 of the 1-baht coins.\nThe number of 10-baht coins is 1/2 of the 5-baht coins.\nThe total amount is 204 baht.\nHow many coins are there in total?',
    [45, 48, 51, 54],
    2,
    'fraction-word-problem', 'fractions',
  ),

  // ─── ตอนที่ 2 (10 ข้อ × 2 คะแนน) ────────────────────────────────────────

  // ข้อ 11 — ตัวประกอบ จำนวนเฉพาะ
  Q(
    'กำหนดให้ A และ B เป็นจำนวนนับที่สอดคล้องกับเงื่อนไขต่อไปนี้\n1) A และ B เป็นตัวประกอบของ 2565\n2) A < B และ A เป็นจำนวนเฉพาะ\n3) 3 × A = (2 × B) + 3\nแล้ว A + B เท่ากับเท่าใด',
    'Let A and B be natural numbers satisfying:\n1) A and B are factors of 2565\n2) A < B and A is a prime number\n3) 3 × A = (2 × B) + 3\nWhat is the value of A + B?',
    [36, 46, 41, 51],
    1,
    'factors-multiples', 'whole-numbers',
  ),

  // ข้อ 12 — ค.ร.น. วิ่งรอบสนาม
  Q(
    'เฟย์ ฟาง แก้ว วิ่งรอบสนามที่เป็นรูปวงกลมโดยออกจากจุดเริ่มต้นพร้อมกัน\nเฟย์ใช้เวลาวิ่ง 1 รอบ เป็นครึ่งหนึ่งของแก้ว ฟางใช้เวลามากกว่าแก้ว 10 นาที\nถ้าทั้งสามคนใช้เวลาวิ่งรวมกัน 40 นาที ทั้งสามคนจะมาพบกันที่จุดเริ่มต้นอีกครั้งเมื่อผ่านไปน้อยที่สุดกี่นาที',
    'Faye, Fang, and Kaew run around a circular track starting together.\nFaye takes half the time of Kaew per lap; Fang takes 10 minutes more than Kaew.\nTheir combined total running time is 40 minutes.\nAfter how many minutes will all three meet again at the start?',
    [60, 66, 132, 264],
    2,
    'lcm', 'whole-numbers',
  ),

  // ข้อ 13 — จำนวนพาลินโดรม รถไฟ
  Q(
    'บนหน้าปัดนาฬิกาของรถไฟแสดงระยะทาง 35953 กิโลเมตร ซึ่งเป็นจำนวนพาลินโดรม\nถ้ารถไฟนี้วิ่งต่ออีก 3 ชั่วโมง โดยถึงสถานีปลายทางพอดี ด้วยอัตราเร็วไม่เกิน 80 กม./ชม.\nระยะทางที่ไกลที่สุดที่รถไฟนี้วิ่งได้ภายในเวลา 3 ชั่วโมง เท่ากับกี่กิโลเมตร',
    'A train odometer shows 35953 km which is a palindrome.\nThe train runs for 3 more hours to reach the destination at speed not exceeding 80 km/h.\nThe destination\'s odometer reading must also be a palindrome.\nWhat is the maximum distance the train can travel in 3 hours?',
    [180, 210, 240, 270],
    1,
    'number-properties', 'whole-numbers',
  ),

  // ข้อ 14 — มาตราส่วนแผนที่
  Q(
    'รถรับ-ส่งนักเรียน เดินทางจากจุดจอดรถไปยังบ้านของฟ้าใส จากนั้นไปยังบ้านน้ำหนาว\nแล้วกลับมายังโรงเรียน ตามแผนที่มาตราส่วน 1 ซม. : 2 กม.\nระยะทางรวมตามแผนที่คือ 3.6+1.8+3+4.4+4.2 ซม. (ไป-กลับ)\nถ้ารถรับ-ส่งนักเรียนใช้น้ำมัน 17 กม. ต่อ 1 ลิตร รถจะใช้น้ำมันกี่ลิตร',
    'A school bus travels from the parking point to Fah Sai\'s house, then to Nam Nao\'s house, and back to school.\nMap scale: 1 cm : 2 km. Total map distance (one way) = 3.6+1.8+3+4.4+4.2 cm.\nIf the bus uses 17 km per liter of fuel, how many liters does it use (round trip)?',
    [2, 3, 4, 5],
    2,
    'map-scale', 'measurement',
  ),

  // ข้อ 15 — มุม สี่เหลี่ยมจัตุรัสซ้อน
  Q(
    'เมื่อนำกระดาษรูปสี่เหลี่ยมจัตุรัสที่เท่ากันทุกประการ 4 แผ่น มาวางซ้อนกัน ดังรูป\nโดยมุม 25° เกิดจากการซ้อน ขนาดของมุม x + y เท่ากับเท่าใด',
    'Four congruent squares are overlapped as shown in the figure.\nGiven a 25° angle from the overlap, what is the measure of angle x + y?',
    [45, 65, 55, 75],
    1,
    'angle-properties', 'geometry',
  ),

  // ข้อ 16 — พื้นที่รวม วงกลมครึ่งซีก สามเหลี่ยม
  Q(
    'กำหนดให้ด้าน AB ยาว 20 หน่วย ด้าน BE ยาว 2 หน่วย ด้าน CF ยาว 9 หน่วย\nด้าน BC ยาว 14 หน่วย ถ้า AD เป็นเส้นผ่านศูนย์กลางของวงกลม\nพื้นที่ส่วนที่แรเงาเท่ากับกี่ตารางหน่วย (กำหนด π = 22/7)',
    'In the figure, AB = 20, BE = 2, CF = 9, BC = 14.\nAD is the diameter of a semicircle (π = 22/7).\nWhat is the area of the shaded region in square units?',
    [230, 247, 267, 257],
    3,
    'area-circle', 'area-volume',
  ),

  // ข้อ 17 — ปริมาตร ลูกบาศก์
  Q(
    'ถ้านำลูกบาศก์ไม้ขนาด 1 ลูกบาศก์หน่วย วางเรียงซ้อนกัน ดังรูป\nบรรจุลงในกล่องทรงลูกบาศก์ที่มีความยาวด้านละ 5 หน่วย\nจะต้องนำลูกบาศก์ไม้ขนาด 1 ลูกบาศก์หน่วยบรรจุเพิ่มกี่ลูกจึงจะเต็มกล่องพอดี\n(ปัจจุบันมีลูกบาศก์วางอยู่แล้ว 19 ลูก)',
    'Unit cubes are stacked as shown, then placed in a box (cube with side 5 units).\nCurrently 19 unit cubes are in the arrangement.\nHow many more unit cubes are needed to fill the box completely?',
    [96, 101, 106, 111],
    2,
    'volume-cuboid', 'area-volume',
  ),

  // ข้อ 18 — พื้นที่รูปแรเงา (ลายชีฟรอน)
  Q(
    'จากรูปที่กำหนดให้ พื้นที่ส่วนที่แรเงาเท่ากับกี่ตารางหน่วย\n(รูปสี่เหลี่ยมผืนผ้ากว้าง 25 หน่วย สูง 20 หน่วย มีแถบชีฟรอน 10 รูป แต่ละรูปกว้าง 5 สูง 10)',
    'From the given figure with chevron (diagonal stripe) pattern:\nA rectangle 25 × 20 units with 10 chevron shapes each 5 × 10 units.\nWhat is the total shaded area in square units?',
    [400, 500, 450, 550],
    1,
    'area-word-problem', 'area-volume',
  ),

  // ข้อ 19 — ร้อยละ ผีเสื้อ
  Q(
    'ปีเตอร์เป็นนักถ่ายภาพสัตว์ป่า เขาได้ข้อมูลว่า ตอนต้นปีฝูงแมวน้ำมีจำนวน 600 ตัว (300 คู่)\nในฤดูใบไม้ผลิแต่ละปี แมวน้ำแต่ละคู่เลี้ยงลูกแมวน้ำ 1 ตัว ตอนสิ้นปี 30% ของแมวน้ำทั้งหมด\n(ทั้งโตเต็มวัยและลูกแมวน้ำ) จะตายลง ถ้าสมมติฐานดังกล่าวเป็นจริง เมื่อสิ้นปีในฝูงนี้จะมีตัวกี่ตัว',
    'Peter is a wildlife photographer. At the start of the year, a seal colony has 600 seals (300 pairs).\nIn spring, each pair raises 1 pup. At year\'s end, 30% of all seals (adults and pups) die.\nIf these assumptions hold, how many seals remain at year\'s end?',
    [540, 630, 600, 680],
    1,
    'percentage-word-problem', 'percentage',
  ),

  // ข้อ 20 — เศษส่วน ถังน้ำ
  Q(
    'ถัง A, B และ C มีน้ำ 16 ลิตร 12 ลิตร และ 14 ลิตร ตามลำดับ\n1) เทน้ำ 3/8 ของถัง A ลงในถัง C จากนั้น\n2) เท 1/3 ของถัง B แบ่งลงในถัง A และ C เท่า ๆ กัน จากนั้น\n3) เท 4/11 ของถัง C กลับเข้าไปในถัง A\nสุดท้ายมีน้ำในถัง C กี่ลิตร',
    'Tanks A, B, and C contain 16, 12, and 14 liters respectively.\n1) Pour 3/8 of Tank A into Tank C.\n2) Divide 1/3 of Tank B equally between Tanks A and C.\n3) Pour 4/11 of Tank C back into Tank A.\nHow many liters remain in Tank C?',
    [10, 12, 16, 14],
    3,
    'fraction-word-problem', 'fractions',
  ),

  // ─── ตอนที่ 3 (5 ข้อ × 3 คะแนน) ────────────────────────────────────────
  // ข้อ 21 แยกเป็น 3 sub-questions

  // ข้อ 21.1 — รูบิค (แผนภาพเวนน์)
  Q(
    'จากการสำรวจนักเรียนระดับชั้นประถมศึกษาปีที่ 6 โรงเรียนแห่งหนึ่ง พบว่ามีนักเรียนที่มีรูบิคแบบต่างๆ\n- รูบิค 2×2 เพียงอย่างเดียว 25 คน, 3×3 เพียงอย่างเดียว 50 คน, 4×4 เพียงอย่างเดียว 15 คน\n- มีทั้ง 2×2 และ 3×3: 80 คน, มีทั้ง 2×2 และ 4×4: 45 คน, มีทั้ง 3×3 และ 4×4: 60 คน\n- มีรูบิคทั้ง 3 ชนิด: 30 คน และไม่มีรูบิคเลย\n21.1 นักเรียนมีรูบิคขนาด 2×2 กี่คน',
    'A survey of Grade 6 students found students owning different Rubik\'s cubes:\n- 2×2 only: 25, 3×3 only: 50, 4×4 only: 15\n- Both 2×2 and 3×3: 80, Both 2×2 and 4×4: 45, Both 3×3 and 4×4: 60\n- All three types: 30, None: unknown\n21.1 How many students have a 2×2 Rubik\'s cube?',
    [100, 110, 130, 120],
    3,
    'venn-diagram', 'whole-numbers',
  ),

  // ข้อ 21.2
  Q(
    'จากข้อมูลการสำรวจนักเรียนชั้น ป.6 เรื่องรูบิค (ข้อมูลเดียวกับข้อ 21.1)\n21.2 นักเรียนมีรูบิคขนาด 3×3 กี่คน',
    'Using the same Rubik\'s cube survey data from question 21.1.\n21.2 How many students have a 3×3 Rubik\'s cube?',
    [145, 160, 175, 190],
    1,
    'venn-diagram', 'whole-numbers',
  ),

  // ข้อ 21.3
  Q(
    'จากข้อมูลการสำรวจนักเรียนชั้น ป.6 เรื่องรูบิค (ข้อมูลเดียวกับข้อ 21.1)\n21.3 โรงเรียนแห่งนี้มีนักเรียนชั้นประถมศึกษาปีที่ 6 ทั้งหมดกี่คน',
    'Using the same Rubik\'s cube survey data from question 21.1.\n21.3 What is the total number of Grade 6 students in this school?',
    [185, 200, 215, 230],
    2,
    'venn-diagram', 'whole-numbers',
  ),

  // ข้อ 22 — floor function (เศษเหลือ)
  Q(
    'กำหนดให้ ⊛ และ ⊕ เป็นจำนวนนับใดๆ\nถ้า ⟨⊛⟩ แทน เศษที่เหลือจากการหาร ⊛ ด้วย 5\nและ [⊕] แทน เศษที่เหลือจากการหาร ⊕ ด้วย 4\nแล้วค่าของ ⟨15⟩+⟨16⟩+⟨17⟩+...+⟨98⟩+⟨99⟩ เท่ากับเท่าใด',
    'Define ⟨n⟩ = remainder when n is divided by 5, and [n] = remainder when n is divided by 4.\nFind the value of ⟨15⟩+⟨16⟩+⟨17⟩+...+⟨98⟩+⟨99⟩',
    [96, 112, 128, 144],
    2,
    'number-theory', 'whole-numbers',
  ),

  // ข้อ 23 — ตารางเมจิก (magic square)
  Q(
    'ถ้าเติมสัญลักษณ์ ●, ▲, ◆, ■ ลงในตารางที่กำหนดให้ครบทุกช่อง โดยทุกแถวทั้งแนวตั้งและแนวนอนจะต้องมีสัญลักษณ์ ●, ▲, ◆, ■ ปรากฏได้เพียงครั้งเดียว\nถ้า ● = 12, ▲ = 13, ◆ = 14, ■ = 15\nผลบวกของจำนวนที่แทนด้วยตัวอักษร A, B, C, D, E, F, G เท่ากับเท่าใด',
    'Fill a 4×4 grid with symbols ●, ▲, ◆, ■ so each row and column contains each symbol exactly once.\nGiven ● = 12, ▲ = 13, ◆ = 14, ■ = 15\nFind the sum of values represented by letters A, B, C, D, E, F, G.',
    [82, 88, 102, 96],
    3,
    'logical-reasoning', 'whole-numbers',
  ),

  // ข้อ 24 — ค.ร.น. ซื้อของ
  Q(
    'ร้านสะดวกซื้อแห่งหนึ่ง ส่งเสริมการขายน้ำผลไม้ 3 ชนิด แต่ละชนิดแถมแสตมป์ปลายขวดต่างกัน\n- น้ำส้ม 16 บาท/ขวด: ซื้อ 3 ขวด แถมแสตมป์จำนวรหนม 1 ดวง\n- น้ำแตงโม 20 บาท/ขวด: ซื้อ 3 ขวด แถมแสตมป์ 1 ดวง\n- น้ำสำไย 12 บาท/ขวด: ซื้อ 2 ขวด แถมแสตมป์ 1 ดวง\nเด็กคนหนึ่งอยากได้แสตมป์ทั้ง 3 ลายจึงขอให้คุณแม่ซื้อน้ำผลไม้ทั้ง 3 ชนิดโดยจ่ายเงินน้อยที่สุด\nจะได้แสตมป์ทั้งหมดกี่ดวง',
    'A convenience store promotes 3 juice flavors with stamp giveaways:\n- Orange 16B: buy 3 bottles get 1 stamp, Watermelon 20B: buy 3 get 1 stamp, Longan 12B: buy 2 get 1 stamp\nA child wants all 3 stamp designs. Their parent buys equal amounts of each flavor to minimize cost.\nHow many stamps in total does the child receive?',
    [15, 19, 17, 21],
    1,
    'lcm', 'whole-numbers',
  ),

  // ข้อ 25 — สามหลัก หารด้วย 5
  Q(
    'ถุงใบหนึ่งบรรจุลูกบอลขนาดเดียวกันที่มีหมายเลข 0 ถึง 9 ลูกละ 1 หมายเลข\nหยิบลูกบอลออกมาครั้งละ 3 ลูก เพื่อสร้างจำนวนสามหลักที่หารด้วย 5 ลงตัว\nจะเป็นไปได้ทั้งหมดกี่จำนวน',
    'A bag contains 10 balls numbered 0 to 9. Draw 3 balls at a time to form 3-digit numbers divisible by 5.\nHow many such 3-digit numbers are possible in total?',
    [108, 126, 136, 144],
    2,
    'number-patterns', 'whole-numbers',
  ),

];

async function main() {
  let count = 0;
  for (const q of questions) {
    await prisma.question.create({ data: q });
    count++;
  }
  console.log(`✅ สร้างข้อสอบ ${count} ข้อ (จุฬาภรณ์ 2565, p6)`);

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
