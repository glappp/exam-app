// seed-questions-percentage-p5.js
// topic:percentage, grade p5, 4 subtopics × 20 ข้อ = 80 ข้อ
// subtopic: percentage-concept, percentage-convert, percentage-of-amount, percentage-word-problem
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = { examGrade: 'p5', topic: ['topic:percentage'] };
const Q = (textTh, textEn, choices, answer, subtopic, skill, difficulty, trap = []) => ({
  textTh, textEn,
  choices: choices.map(c => ({ textTh: c[0], textEn: c[1] })),
  answer,
  attributes: { ...BASE, subtopic: [subtopic], skill: [skill], trap, difficulty },
  ownerOrg: 'system', createdBy: 'seed', updatedBy: 'seed',
  aiGenerated: false, needsReview: false,
});

const questions = [

  // ─── subtopic:percentage-concept (20 ข้อ) ────────────────────────────────
  Q('50% หมายความว่าอย่างไร?',
    'What does 50% mean?',
    [['50 ใน 10','50 out of 10'],['50 ใน 100','50 out of 100'],['5 ใน 100','5 out of 100'],['500 ใน 100','500 out of 100']],
    1, 'subtopic:percentage-concept', 'skill:arithmetic', 1),

  Q('25% หมายความว่าอย่างไร?',
    'What does 25% mean?',
    [['25 ใน 10','25 out of 10'],['2.5 ใน 100','2.5 out of 100'],['25 ใน 100','25 out of 100'],['250 ใน 100','250 out of 100']],
    2, 'subtopic:percentage-concept', 'skill:arithmetic', 1),

  Q('100% หมายความว่าอย่างไร?',
    'What does 100% mean?',
    [['ครึ่งหนึ่งของทั้งหมด','Half of the total'],['หนึ่งในสี่ของทั้งหมด','One quarter of the total'],['ทั้งหมด','The whole'],['สามในสี่ของทั้งหมด','Three quarters of the total']],
    2, 'subtopic:percentage-concept', 'skill:arithmetic', 1),

  Q('นักเรียน 100 คน สอบผ่าน 75 คน คิดเป็นกี่เปอร์เซ็นต์?',
    '75 out of 100 students passed an exam. What percentage passed?',
    [['25%','25%'],['75%','75%'],['50%','50%'],['70%','70%']],
    1, 'subtopic:percentage-concept', 'skill:arithmetic', 1),

  Q('สีแดง 40 ชิ้นจากทั้งหมด 100 ชิ้น คิดเป็นกี่เปอร์เซ็นต์?',
    '40 out of 100 pieces are red. What percentage is red?',
    [['40%','40%'],['60%','60%'],['4%','4%'],['400%','400%']],
    0, 'subtopic:percentage-concept', 'skill:arithmetic', 1),

  Q('ผลไม้ 100 ผล เน่า 5 ผล ผลไม้เน่าคิดเป็นกี่เปอร์เซ็นต์?',
    '5 out of 100 fruits are rotten. What percentage is rotten?',
    [['50%','50%'],['0.5%','0.5%'],['5%','5%'],['95%','95%']],
    2, 'subtopic:percentage-concept', 'skill:arithmetic', 1),

  Q('นักเรียน 100 คน เป็นผู้หญิง 60 คน นักเรียนชายคิดเป็นกี่เปอร์เซ็นต์?',
    '60 out of 100 students are girls. What percentage are boys?',
    [['60%','60%'],['40%','40%'],['160%','160%'],['6%','6%']],
    1, 'subtopic:percentage-concept', 'skill:arithmetic', 2),

  Q('รูปสี่เหลี่ยมถูกแรเงาครึ่งหนึ่ง คิดเป็นกี่เปอร์เซ็นต์?',
    'Half of a rectangle is shaded. What percentage is shaded?',
    [['25%','25%'],['100%','100%'],['50%','50%'],['75%','75%']],
    2, 'subtopic:percentage-concept', 'skill:arithmetic', 1),

  Q('0% หมายความว่าอย่างไร?',
    'What does 0% mean?',
    [['ทั้งหมด','The whole'],['ไม่มีเลย','None at all'],['ครึ่งหนึ่ง','Half'],['หนึ่งในสี่','One quarter']],
    1, 'subtopic:percentage-concept', 'skill:arithmetic', 1),

  Q('1% ของ 100 คือเท่าไร?',
    'What is 1% of 100?',
    [['10','10'],['100','100'],['0.1','0.1'],['1','1']],
    3, 'subtopic:percentage-concept', 'skill:arithmetic', 1),

  Q('ร้อยละ 30 หมายความว่าอย่างไร?',
    'What does "30 per cent" mean?',
    [['30 ใน 10','30 out of 10'],['3 ใน 100','3 out of 100'],['30 ใน 1,000','30 out of 1,000'],['30 ใน 100','30 out of 100']],
    3, 'subtopic:percentage-concept', 'skill:arithmetic', 1),

  Q('ส้ม 100 ผล แจกไป 20 ผล เหลือคิดเป็นกี่เปอร์เซ็นต์?',
    '20 out of 100 oranges are given away. What percentage remains?',
    [['20%','20%'],['80%','80%'],['8%','8%'],['200%','200%']],
    1, 'subtopic:percentage-concept', 'skill:arithmetic', 1),

  Q('ตัวเลขใดแสดงถึง "ทั้งหมด" ในหน่วยเปอร์เซ็นต์?',
    'Which number represents "the whole" in percentage?',
    [['10%','10%'],['50%','50%'],['100%','100%'],['1,000%','1,000%']],
    2, 'subtopic:percentage-concept', 'skill:arithmetic', 1),

  Q('มีนักเรียน 100 คน มาเรียน 95 คน ขาดเรียนคิดเป็นกี่เปอร์เซ็นต์?',
    '95 out of 100 students attend class. What percentage is absent?',
    [['95%','95%'],['5%','5%'],['0.5%','0.5%'],['50%','50%']],
    1, 'subtopic:percentage-concept', 'skill:arithmetic', 2),

  Q('หนังสือ 100 เล่ม อ่านแล้ว 45 เล่ม ยังไม่ได้อ่านคิดเป็นกี่เปอร์เซ็นต์?',
    '45 out of 100 books are read. What percentage is unread?',
    [['45%','45%'],['55%','55%'],['155%','155%'],['5.5%','5.5%']],
    1, 'subtopic:percentage-concept', 'skill:arithmetic', 2),

  Q('แถบสีเขียว 70% ที่เหลือเป็นสีแดง สีแดงมีกี่เปอร์เซ็นต์?',
    'A bar is 70% green. The rest is red. What percentage is red?',
    [['70%','70%'],['170%','170%'],['30%','30%'],['3%','3%']],
    2, 'subtopic:percentage-concept', 'skill:arithmetic', 2),

  Q('ร้อยละ 1 เท่ากับทศนิยมเท่าไร?',
    '1 per cent equals which decimal?',
    [['0.1','0.1'],['1','1'],['0.001','0.001'],['0.01','0.01']],
    3, 'subtopic:percentage-concept', 'skill:arithmetic', 2),

  Q('เปอร์เซ็นต์มาจากคำว่า "per cent" ซึ่งหมายถึง?',
    'The word "percent" comes from "per cent" which means?',
    [['ต่อ 10','per 10'],['ต่อ 1,000','per 1,000'],['ต่อ 100','per 100'],['ต่อ 1','per 1']],
    2, 'subtopic:percentage-concept', 'skill:arithmetic', 1),

  Q('ได้รับขนม 10 ชิ้น กิน 7 ชิ้น กินไปคิดเป็นกี่เปอร์เซ็นต์?',
    '7 out of 10 pieces of candy are eaten. What percentage was eaten?',
    [['7%','7%'],['70%','70%'],['30%','30%'],['700%','700%']],
    1, 'subtopic:percentage-concept', 'skill:arithmetic', 2),

  Q('ถ้ามีแผ่นกระดาษ 100 แผ่น ใช้ไป 3 แผ่น เหลือกี่เปอร์เซ็นต์?',
    '3 out of 100 sheets of paper are used. What percentage remains?',
    [['3%','3%'],['103%','103%'],['97%','97%'],['93%','93%']],
    2, 'subtopic:percentage-concept', 'skill:arithmetic', 2),

  // ─── subtopic:percentage-convert (20 ข้อ) ────────────────────────────────
  Q('50% เขียนเป็นเศษส่วนอย่างต่ำได้ว่า?',
    '50% written as a fraction in its simplest form is?',
    [['1/5','1/5'],['1/4','1/4'],['1/2','1/2'],['2/5','2/5']],
    2, 'subtopic:percentage-convert', 'skill:conversion', 1),

  Q('25% เขียนเป็นเศษส่วนอย่างต่ำได้ว่า?',
    '25% written as a fraction in its simplest form is?',
    [['1/2','1/2'],['1/4','1/4'],['1/5','1/5'],['1/3','1/3']],
    1, 'subtopic:percentage-convert', 'skill:conversion', 1),

  Q('1/4 เท่ากับกี่เปอร์เซ็นต์?',
    '1/4 equals what percentage?',
    [['40%','40%'],['25%','25%'],['20%','20%'],['4%','4%']],
    1, 'subtopic:percentage-convert', 'skill:conversion', 1),

  Q('0.5 เท่ากับกี่เปอร์เซ็นต์?',
    '0.5 equals what percentage?',
    [['5%','5%'],['0.5%','0.5%'],['500%','500%'],['50%','50%']],
    3, 'subtopic:percentage-convert', 'skill:conversion', 1),

  Q('75% เขียนเป็นทศนิยมได้ว่า?',
    '75% written as a decimal is?',
    [['7.5','7.5'],['0.075','0.075'],['75','75'],['0.75','0.75']],
    3, 'subtopic:percentage-convert', 'skill:conversion', 1),

  Q('1/2 เท่ากับกี่เปอร์เซ็นต์?',
    '1/2 equals what percentage?',
    [['20%','20%'],['25%','25%'],['50%','50%'],['12%','12%']],
    2, 'subtopic:percentage-convert', 'skill:conversion', 1),

  Q('0.25 เท่ากับกี่เปอร์เซ็นต์?',
    '0.25 equals what percentage?',
    [['2.5%','2.5%'],['250%','250%'],['0.25%','0.25%'],['25%','25%']],
    3, 'subtopic:percentage-convert', 'skill:conversion', 1),

  Q('3/4 เท่ากับกี่เปอร์เซ็นต์?',
    '3/4 equals what percentage?',
    [['34%','34%'],['43%','43%'],['75%','75%'],['80%','80%']],
    2, 'subtopic:percentage-convert', 'skill:conversion', 2),

  Q('0.1 เท่ากับกี่เปอร์เซ็นต์?',
    '0.1 equals what percentage?',
    [['1%','1%'],['100%','100%'],['10%','10%'],['0.1%','0.1%']],
    2, 'subtopic:percentage-convert', 'skill:conversion', 1),

  Q('20% เขียนเป็นเศษส่วนอย่างต่ำได้ว่า?',
    '20% written as a fraction in its simplest form is?',
    [['2/5','2/5'],['1/5','1/5'],['1/2','1/2'],['2/10','2/10']],
    1, 'subtopic:percentage-convert', 'skill:conversion', 2),

  Q('1/5 เท่ากับกี่เปอร์เซ็นต์?',
    '1/5 equals what percentage?',
    [['15%','15%'],['5%','5%'],['25%','25%'],['20%','20%']],
    3, 'subtopic:percentage-convert', 'skill:conversion', 2),

  Q('0.75 เท่ากับกี่เปอร์เซ็นต์?',
    '0.75 equals what percentage?',
    [['7.5%','7.5%'],['750%','750%'],['0.75%','0.75%'],['75%','75%']],
    3, 'subtopic:percentage-convert', 'skill:conversion', 1),

  Q('40% เขียนเป็นทศนิยมได้ว่า?',
    '40% written as a decimal is?',
    [['4','4'],['40','40'],['0.04','0.04'],['0.4','0.4']],
    3, 'subtopic:percentage-convert', 'skill:conversion', 1),

  Q('2/5 เท่ากับกี่เปอร์เซ็นต์?',
    '2/5 equals what percentage?',
    [['25%','25%'],['40%','40%'],['45%','45%'],['20%','20%']],
    1, 'subtopic:percentage-convert', 'skill:conversion', 2),

  Q('0.3 เท่ากับกี่เปอร์เซ็นต์?',
    '0.3 equals what percentage?',
    [['0.3%','0.3%'],['3%','3%'],['300%','300%'],['30%','30%']],
    3, 'subtopic:percentage-convert', 'skill:conversion', 1),

  Q('60% เขียนเป็นเศษส่วนอย่างต่ำได้ว่า?',
    '60% written as a fraction in its simplest form is?',
    [['6/10','6/10'],['3/5','3/5'],['5/3','5/3'],['60/10','60/10']],
    1, 'subtopic:percentage-convert', 'skill:conversion', 2),

  Q('80% เขียนเป็นทศนิยมได้ว่า?',
    '80% written as a decimal is?',
    [['0.08','0.08'],['8','8'],['80','80'],['0.8','0.8']],
    3, 'subtopic:percentage-convert', 'skill:conversion', 1),

  Q('1/10 เท่ากับกี่เปอร์เซ็นต์?',
    '1/10 equals what percentage?',
    [['1%','1%'],['100%','100%'],['110%','110%'],['10%','10%']],
    3, 'subtopic:percentage-convert', 'skill:conversion', 1),

  Q('10% เขียนเป็นทศนิยมได้ว่า?',
    '10% written as a decimal is?',
    [['10','10'],['1','1'],['0.01','0.01'],['0.1','0.1']],
    3, 'subtopic:percentage-convert', 'skill:conversion', 1),

  Q('0.4 เท่ากับกี่เปอร์เซ็นต์?',
    '0.4 equals what percentage?',
    [['4%','4%'],['0.4%','0.4%'],['400%','400%'],['40%','40%']],
    3, 'subtopic:percentage-convert', 'skill:conversion', 1),

  // ─── subtopic:percentage-of-amount (20 ข้อ) ──────────────────────────────
  Q('50% ของ 100 คือเท่าไร?',
    'What is 50% of 100?',
    [['150','150'],['50','50'],['5','5'],['500','500']],
    1, 'subtopic:percentage-of-amount', 'skill:arithmetic', 1),

  Q('25% ของ 80 คือเท่าไร?',
    'What is 25% of 80?',
    [['40','40'],['10','10'],['20','20'],['25','25']],
    2, 'subtopic:percentage-of-amount', 'skill:arithmetic', 2),

  Q('10% ของ 200 คือเท่าไร?',
    'What is 10% of 200?',
    [['20','20'],['200','200'],['2','2'],['2,000','2,000']],
    0, 'subtopic:percentage-of-amount', 'skill:arithmetic', 1),

  Q('50% ของ 60 คือเท่าไร?',
    'What is 50% of 60?',
    [['30','30'],['3','3'],['300','300'],['60','60']],
    0, 'subtopic:percentage-of-amount', 'skill:arithmetic', 1),

  Q('100% ของ 45 คือเท่าไร?',
    'What is 100% of 45?',
    [['4.5','4.5'],['450','450'],['100','100'],['45','45']],
    3, 'subtopic:percentage-of-amount', 'skill:arithmetic', 1),

  Q('20% ของ 50 คือเท่าไร?',
    'What is 20% of 50?',
    [['1','1'],['100','100'],['10','10'],['0.1','0.1']],
    2, 'subtopic:percentage-of-amount', 'skill:arithmetic', 2),

  Q('75% ของ 40 คือเท่าไร?',
    'What is 75% of 40?',
    [['3','3'],['300','300'],['75','75'],['30','30']],
    3, 'subtopic:percentage-of-amount', 'skill:arithmetic', 2),

  Q('10% ของ 150 คือเท่าไร?',
    'What is 10% of 150?',
    [['1.5','1.5'],['150','150'],['15','15'],['1,500','1,500']],
    2, 'subtopic:percentage-of-amount', 'skill:arithmetic', 1),

  Q('25% ของ 120 คือเท่าไร?',
    'What is 25% of 120?',
    [['3','3'],['12','12'],['25','25'],['30','30']],
    3, 'subtopic:percentage-of-amount', 'skill:arithmetic', 2),

  Q('50% ของ 90 คือเท่าไร?',
    'What is 50% of 90?',
    [['9','9'],['90','90'],['45','45'],['4.5','4.5']],
    2, 'subtopic:percentage-of-amount', 'skill:arithmetic', 1),

  Q('30% ของ 100 คือเท่าไร?',
    'What is 30% of 100?',
    [['3','3'],['0.3','0.3'],['30','30'],['300','300']],
    2, 'subtopic:percentage-of-amount', 'skill:arithmetic', 1),

  Q('80% ของ 50 คือเท่าไร?',
    'What is 80% of 50?',
    [['40','40'],['4','4'],['400','400'],['80','80']],
    0, 'subtopic:percentage-of-amount', 'skill:arithmetic', 2),

  Q('40% ของ 200 คือเท่าไร?',
    'What is 40% of 200?',
    [['8','8'],['800','800'],['80','80'],['40','40']],
    2, 'subtopic:percentage-of-amount', 'skill:arithmetic', 2),

  Q('5% ของ 100 คือเท่าไร?',
    'What is 5% of 100?',
    [['50','50'],['500','500'],['0.5','0.5'],['5','5']],
    3, 'subtopic:percentage-of-amount', 'skill:arithmetic', 1),

  Q('60% ของ 80 คือเท่าไร?',
    'What is 60% of 80?',
    [['4.8','4.8'],['48','48'],['480','480'],['60','60']],
    1, 'subtopic:percentage-of-amount', 'skill:arithmetic', 2),

  Q('25% ของ 200 คือเท่าไร?',
    'What is 25% of 200?',
    [['5','5'],['500','500'],['50','50'],['25','25']],
    2, 'subtopic:percentage-of-amount', 'skill:arithmetic', 2),

  Q('20% ของ 150 คือเท่าไร?',
    'What is 20% of 150?',
    [['3','3'],['300','300'],['30','30'],['20','20']],
    2, 'subtopic:percentage-of-amount', 'skill:arithmetic', 2),

  Q('10% ของ 75 คือเท่าไร?',
    'What is 10% of 75?',
    [['75','75'],['0.75','0.75'],['750','750'],['7.5','7.5']],
    3, 'subtopic:percentage-of-amount', 'skill:arithmetic', 2),

  Q('50% ของ 240 คือเท่าไร?',
    'What is 50% of 240?',
    [['12','12'],['1,200','1,200'],['120','120'],['24','24']],
    2, 'subtopic:percentage-of-amount', 'skill:arithmetic', 1),

  Q('70% ของ 300 คือเท่าไร?',
    'What is 70% of 300?',
    [['21','21'],['2,100','2,100'],['210','210'],['700','700']],
    2, 'subtopic:percentage-of-amount', 'skill:arithmetic', 2),

  // ─── subtopic:percentage-word-problem (20 ข้อ) ───────────────────────────
  Q('ราคาเสื้อ 200 บาท ลด 20% ลดราคาไปเท่าไร?',
    'A shirt costs 200 baht with a 20% discount. How much is the discount?',
    [['20 บาท','20 baht'],['40 บาท','40 baht'],['4 บาท','4 baht'],['400 บาท','400 baht']],
    1, 'subtopic:percentage-word-problem', 'skill:word-problem', 1),

  Q('ราคาเสื้อ 200 บาท ลด 20% ต้องจ่ายเงินเท่าไร?',
    'A shirt costs 200 baht with a 20% discount. How much must be paid?',
    [['180 บาท','180 baht'],['160 บาท','160 baht'],['140 บาท','140 baht'],['240 บาท','240 baht']],
    1, 'subtopic:percentage-word-problem', 'skill:multi-step', 2),

  Q('นักเรียน 40 คน สอบผ่าน 75% มีนักเรียนสอบผ่านกี่คน?',
    '75% of 40 students pass an exam. How many students pass?',
    [['10','10'],['25','25'],['30','30'],['35','35']],
    2, 'subtopic:percentage-word-problem', 'skill:word-problem', 2),

  Q('สินค้าราคา 500 บาท บวกภาษี 10% ต้องจ่ายเงินทั้งหมดเท่าไร?',
    'An item costs 500 baht with 10% tax added. What is the total to pay?',
    [['510 บาท','510 baht'],['550 บาท','550 baht'],['600 บาท','600 baht'],['450 บาท','450 baht']],
    1, 'subtopic:percentage-word-problem', 'skill:multi-step', 2),

  Q('มีส้ม 80 ผล เน่าไป 25% เหลือส้มที่ดีกี่ผล?',
    'There are 80 oranges and 25% go rotten. How many good oranges remain?',
    [['20','20'],['25','25'],['40','40'],['60','60']],
    3, 'subtopic:percentage-word-problem', 'skill:multi-step', 2),

  Q('เงินเดือน 10,000 บาท ออมเงิน 20% ออมเงินเดือนละเท่าไร?',
    'A monthly salary is 10,000 baht. 20% is saved. How much is saved per month?',
    [['200 บาท','200 baht'],['2,000 บาท','2,000 baht'],['20,000 บาท','20,000 baht'],['20 บาท','20 baht']],
    1, 'subtopic:percentage-word-problem', 'skill:word-problem', 1),

  Q('นักเรียน 50 คน สวมแว่นตา 10% มีนักเรียนสวมแว่นกี่คน?',
    '10% of 50 students wear glasses. How many students wear glasses?',
    [['10','10'],['5','5'],['50','50'],['1','1']],
    1, 'subtopic:percentage-word-problem', 'skill:word-problem', 1),

  Q('ได้คะแนนสอบ 80 คะแนนจาก 100 คะแนนเต็ม คิดเป็นกี่เปอร์เซ็นต์?',
    'A student scores 80 out of 100. What is the percentage score?',
    [['20%','20%'],['80%','80%'],['8%','8%'],['800%','800%']],
    1, 'subtopic:percentage-word-problem', 'skill:word-problem', 1),

  Q('ราคาของ 1,000 บาท ลด 30% ต้องจ่ายเงินเท่าไร?',
    'An item costs 1,000 baht with a 30% discount. How much must be paid?',
    [['300 บาท','300 baht'],['700 บาท','700 baht'],['1,300 บาท','1,300 baht'],['30 บาท','30 baht']],
    1, 'subtopic:percentage-word-problem', 'skill:multi-step', 2),

  Q('ถังน้ำบรรจุได้ 200 ลิตร มีน้ำอยู่ 60% มีน้ำกี่ลิตร?',
    'A tank holds 200 litres. It is 60% full. How many litres of water are in it?',
    [['60','60'],['12','12'],['120','120'],['1,200','1,200']],
    2, 'subtopic:percentage-word-problem', 'skill:word-problem', 2),

  Q('ต้นไม้สูง 80 เซนติเมตร เติบโตขึ้นอีก 50% เติบโตขึ้นกี่เซนติเมตร?',
    'A tree is 80 cm tall and grows by 50%. How many cm does it grow?',
    [['50','50'],['40','40'],['4','4'],['400','400']],
    1, 'subtopic:percentage-word-problem', 'skill:word-problem', 2),

  Q('นมกล่อง 100 กล่อง ขายไปแล้ว 45% เหลือกี่กล่อง?',
    '45% of 100 milk boxes are sold. How many are left?',
    [['45','45'],['55','55'],['155','155'],['65','65']],
    1, 'subtopic:percentage-word-problem', 'skill:multi-step', 2),

  Q('ราคา 250 บาท ราคาเพิ่มขึ้น 20% ราคาใหม่เท่าไร?',
    'An item costs 250 baht and the price increases by 20%. What is the new price?',
    [['270 บาท','270 baht'],['300 บาท','300 baht'],['350 บาท','350 baht'],['200 บาท','200 baht']],
    1, 'subtopic:percentage-word-problem', 'skill:multi-step', 2),

  Q('นักเรียน 60 คน ไม่มาเรียน 5% ไม่มาเรียนกี่คน?',
    '5% of 60 students are absent. How many are absent?',
    [['5','5'],['6','6'],['3','3'],['12','12']],
    2, 'subtopic:percentage-word-problem', 'skill:word-problem', 2),

  Q('มีหนังสือ 120 เล่ม อ่านไปแล้ว 25% อ่านไปแล้วกี่เล่ม?',
    '25% of 120 books have been read. How many books have been read?',
    [['25','25'],['30','30'],['12','12'],['40','40']],
    1, 'subtopic:percentage-word-problem', 'skill:word-problem', 2),

  Q('ราคา 400 บาท ลด 25% ต้องจ่ายเงินเท่าไร?',
    'An item costs 400 baht with a 25% discount. How much must be paid?',
    [['100 บาท','100 baht'],['350 บาท','350 baht'],['300 บาท','300 baht'],['375 บาท','375 baht']],
    2, 'subtopic:percentage-word-problem', 'skill:multi-step', 3),

  Q('มีลูกบอล 200 ลูก เป็นสีแดง 40% ที่เหลือเป็นสีน้ำเงิน มีสีน้ำเงินกี่ลูก?',
    '40% of 200 balls are red. The rest are blue. How many are blue?',
    [['40','40'],['80','80'],['100','100'],['120','120']],
    3, 'subtopic:percentage-word-problem', 'skill:multi-step', 3),

  Q('ได้รับเงิน 500 บาท ใช้ไป 60% เหลือเงินเท่าไร?',
    'Received 500 baht and spent 60%. How much is left?',
    [['300 บาท','300 baht'],['200 บาท','200 baht'],['250 บาท','250 baht'],['60 บาท','60 baht']],
    1, 'subtopic:percentage-word-problem', 'skill:multi-step', 2),

  Q('ขนมราคา 80 บาท ลดราคา 10% ราคาใหม่เท่าไร?',
    'A snack costs 80 baht with a 10% discount. What is the new price?',
    [['8 บาท','8 baht'],['72 บาท','72 baht'],['70 บาท','70 baht'],['78 บาท','78 baht']],
    1, 'subtopic:percentage-word-problem', 'skill:multi-step', 2),

  Q('มีผลไม้ 150 ผล เน่าไป 20% ผลไม้ที่ใช้งานได้มีกี่ผล?',
    'There are 150 fruits and 20% go bad. How many good fruits remain?',
    [['30','30'],['120','120'],['100','100'],['130','130']],
    1, 'subtopic:percentage-word-problem', 'skill:multi-step', 2),

];

async function main() {
  let count = 0;
  for (const q of questions) {
    await prisma.question.create({ data: q });
    count++;
  }
  console.log(`✅ สร้างข้อสอบ ${count} ข้อ (topic:percentage, p5)`);

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
