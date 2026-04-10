// seed-questions-whole-numbers-p4.js
// topic:whole-numbers, grade p4, 7 subtopics × 20 ข้อ = 140 ข้อ
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_ATTR = { examGrade: 'p4', topic: ['topic:whole-numbers'] };
const Q = (textTh, textEn, choices, answer, subtopic, skill, difficulty, trap = []) => ({
  textTh, textEn,
  choices: choices.map(c => ({ textTh: c[0], textEn: c[1] })),
  answer,
  attributes: { ...BASE_ATTR, subtopic: [subtopic], skill: [skill], trap, difficulty },
  ownerOrg: 'system', createdBy: 'seed', updatedBy: 'seed',
  aiGenerated: false, needsReview: false,
});

const questions = [

  // ─── subtopic:whole-numbers-read-write (20 ข้อ) ───────────────────────────
  Q('ตัวเลข 25,340 อ่านว่าอย่างไร?',
    'How do you read the number 25,340?',
    [['สองหมื่นห้าพันสามร้อยสี่สิบ','Twenty-five thousand three hundred forty'],
     ['สองหมื่นห้าพันสี่ร้อยสามสิบ','Twenty-five thousand four hundred thirty'],
     ['ห้าหมื่นสองพันสามร้อยสี่สิบ','Fifty-two thousand three hundred forty'],
     ['สองหมื่นห้าพันสามร้อยสิบสี่','Twenty-five thousand three hundred fourteen']],
    0, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 1),

  Q('"สี่หมื่นหกพันเจ็ดร้อยยี่สิบสาม" เขียนเป็นตัวเลขว่า?',
    'Write "forty-six thousand seven hundred twenty-three" in digits.',
    [['46,732','46,732'],['46,237','46,237'],['46,723','46,723'],['40,623','40,623']],
    2, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 1),

  Q('ตัวเลข 73,000 อ่านว่าอย่างไร?',
    'How do you read 73,000?',
    [['เจ็ดร้อยสามสิบ','Seven hundred thirty'],
     ['เจ็ดพันสามร้อย','Seven thousand three hundred'],
     ['เจ็ดหมื่นสาม','Seventy thousand three'],
     ['เจ็ดหมื่นสามพัน','Seventy-three thousand']],
    3, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 1),

  Q('ตัวเลขใดต่อไปนี้มีค่าเท่ากับ "แปดหมื่นเก้าพันสองร้อยสิบเจ็ด"?',
    'Which number equals "eighty-nine thousand two hundred seventeen"?',
    [['89,271','89,271'],['89,127','89,127'],['89,712','89,712'],['89,217','89,217']],
    3, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 1),

  Q('หลักหมื่นของ 64,892 คือเลขอะไร?',
    'What digit is in the ten-thousands place of 64,892?',
    [['6','6'],['4','4'],['8','8'],['9','9']],
    0, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 1),

  Q('หลักพันของ 37,506 คือเลขอะไร?',
    'What digit is in the thousands place of 37,506?',
    [['3','3'],['7','7'],['5','5'],['0','0']],
    1, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 1),

  Q('ตัวเลข 90,050 อ่านว่าอย่างไร?',
    'How do you read 90,050?',
    [['เก้าหมื่นห้าสิบ','Ninety thousand fifty'],
     ['เก้าหมื่นห้าร้อย','Ninety thousand five hundred'],
     ['เก้าหมื่นห้าพัน','Ninety-five thousand'],
     ['เก้าหมื่นห้าร้อยสิบ','Ninety thousand five hundred ten']],
    0, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 2),

  Q('"สามหมื่น" เขียนเป็นตัวเลขว่า?',
    'Write "thirty thousand" in digits.',
    [['3,000','3,000'],['300','300'],['30,000','30,000'],['300,000','300,000']],
    2, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 1),

  Q('ตัวเลข 15,008 อ่านว่าอย่างไร?',
    'How do you read 15,008?',
    [['หนึ่งหมื่นห้าพันแปด','Fifteen thousand eight'],
     ['หนึ่งหมื่นห้าร้อยแปด','Fifteen thousand five hundred eight'],
     ['หนึ่งหมื่นห้าพันแปดสิบ','Fifteen thousand eighty'],
     ['ห้าหมื่นหนึ่งพันแปด','Fifty-one thousand eight']],
    0, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 2),

  Q('ค่าประจำหลักของเลข 5 ในจำนวน 52,743 คือเท่าไร?',
    'What is the place value of the digit 5 in 52,743?',
    [['5','5'],['500','500'],['5,000','5,000'],['50,000','50,000']],
    3, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 2),

  Q('"สองหมื่นสี่พันห้าร้อย" เขียนเป็นตัวเลขว่า?',
    'Write "twenty-four thousand five hundred" in digits.',
    [['24,500','24,500'],['24,050','24,050'],['20,450','20,450'],['24,005','24,005']],
    0, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 1),

  Q('ตัวเลข 68,400 อ่านว่าอย่างไร?',
    'How do you read 68,400?',
    [['หกหมื่นแปดพันสี่ร้อย','Sixty-eight thousand four hundred'],
     ['หกหมื่นแปดร้อยสี่พัน','Sixty thousand eight hundred four thousand'],
     ['แปดหมื่นหกพันสี่ร้อย','Eighty-six thousand four hundred'],
     ['หกหมื่นสี่พันแปดร้อย','Sixty-four thousand eight hundred']],
    0, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 1),

  Q('จำนวนที่มีหลักหมื่น 4 หลักพัน 0 หลักร้อย 3 หลักสิบ 6 หลักหน่วย 1 คือ?',
    'What number has ten-thousands 4, thousands 0, hundreds 3, tens 6, units 1?',
    [['40,361','40,361'],['40,631','40,631'],['43,061','43,061'],['46,301','46,301']],
    0, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 2),

  Q('"เก้าหมื่นเก้าพันเก้าร้อยเก้าสิบเก้า" เขียนเป็นตัวเลขว่า?',
    'Write "ninety-nine thousand nine hundred ninety-nine" in digits.',
    [['90,999','90,999'],['99,099','99,099'],['99,909','99,909'],['99,999','99,999']],
    3, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 1),

  Q('ตัวเลข 10,010 อ่านว่าอย่างไร?',
    'How do you read 10,010?',
    [['หนึ่งหมื่นสิบ','Ten thousand ten'],
     ['หนึ่งหมื่นหนึ่งร้อยสิบ','Ten thousand one hundred ten'],
     ['หนึ่งหมื่นหนึ่งพันสิบ','Eleven thousand ten'],
     ['หนึ่งหมื่นหนึ่งพัน','Eleven thousand']],
    0, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 2, ['trap:misread']),

  Q('เลขโดดในหลักพันของ 85,392 คือ?',
    'What digit is in the thousands place of 85,392?',
    [['8','8'],['5','5'],['3','3'],['9','9']],
    1, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 1),

  Q('"หนึ่งแสน" เขียนเป็นตัวเลขว่า?',
    'Write "one hundred thousand" in digits.',
    [['10,000','10,000'],['100,000','100,000'],['1,000,000','1,000,000'],['1,000','1,000']],
    1, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 1),

  Q('จำนวน 77,007 มีเลข 7 กี่ตัว?',
    'How many times does the digit 7 appear in 77,007?',
    [['1 ตัว','One time'],['2 ตัว','Two times'],['3 ตัว','Three times'],['4 ตัว','Four times']],
    2, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 2),

  Q('เลข 43,285 มีค่าเท่ากับข้อใด?',
    'Which expression equals 43,285?',
    [['40,000 + 3,000 + 200 + 80 + 5','40,000 + 3,000 + 200 + 80 + 5'],
     ['40,000 + 3,000 + 200 + 8 + 5','40,000 + 3,000 + 200 + 8 + 5'],
     ['4,000 + 300 + 200 + 80 + 5','4,000 + 300 + 200 + 80 + 5'],
     ['40,000 + 300 + 200 + 80 + 5','40,000 + 300 + 200 + 80 + 5']],
    0, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 2),

  Q('จำนวนใดมีเลข 9 อยู่ในหลักร้อย?',
    'Which number has the digit 9 in the hundreds place?',
    [['9,432','9,432'],['49,235','49,235'],['23,912','23,912'],['91,045','91,045']],
    2, 'subtopic:whole-numbers-read-write', 'skill:arithmetic', 2),

  // ─── subtopic:whole-numbers-compare (20 ข้อ) ──────────────────────────────
  Q('จำนวนใดมากที่สุด?',
    'Which number is the greatest?',
    [['34,567','34,567'],['43,678','43,678'],['34,876','34,876'],['43,867','43,867']],
    3, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 1),

  Q('จำนวนใดน้อยที่สุด?',
    'Which number is the smallest?',
    [['52,340','52,340'],['52,034','52,034'],['52,304','52,304'],['52,430','52,430']],
    1, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 2),

  Q('ข้อใดเรียงจากน้อยไปมากถูกต้อง?',
    'Which list is arranged from smallest to greatest?',
    [['25,000 ; 25,100 ; 25,010','25,000 ; 25,100 ; 25,010'],
     ['25,000 ; 25,010 ; 25,100','25,000 ; 25,010 ; 25,100'],
     ['25,100 ; 25,010 ; 25,000','25,100 ; 25,010 ; 25,000'],
     ['25,010 ; 25,000 ; 25,100','25,010 ; 25,000 ; 25,100']],
    1, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 2),

  Q('65,432 ○ 65,342 ช่องว่างควรใส่เครื่องหมายใด?',
    '65,432 ○ 65,342 — which sign belongs in the circle?',
    [['<','<'],['>','>'],[' = ',' = '],['≤','≤']],
    1, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 1),

  Q('เรียงจำนวน 18,900 ; 19,800 ; 18,090 ; 19,008 จากมากไปน้อย ข้อใดถูกต้อง?',
    'Arrange 18,900 ; 19,800 ; 18,090 ; 19,008 from greatest to least.',
    [['19,800 ; 19,008 ; 18,900 ; 18,090','19,800 ; 19,008 ; 18,900 ; 18,090'],
     ['19,800 ; 18,900 ; 19,008 ; 18,090','19,800 ; 18,900 ; 19,008 ; 18,090'],
     ['18,090 ; 18,900 ; 19,008 ; 19,800','18,090 ; 18,900 ; 19,008 ; 19,800'],
     ['19,008 ; 19,800 ; 18,900 ; 18,090','19,008 ; 19,800 ; 18,900 ; 18,090']],
    0, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 2),

  Q('จำนวนใดมีค่ามากกว่า 47,586 อยู่ 270?',
    'Which number is 270 more than 47,586?',
    [['47,813','47,813'],['47,856','47,856'],['47,816','47,816'],['47,586','47,586']],
    1, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 2),

  Q('จำนวนใดอยู่ระหว่าง 30,000 และ 40,000?',
    'Which number is between 30,000 and 40,000?',
    [['29,999','29,999'],['40,001','40,001'],['35,500','35,500'],['40,000','40,000']],
    2, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 1),

  Q('ข้อใดถูกต้อง?',
    'Which statement is correct?',
    [['99,999 < 99,998','99,999 < 99,998'],
     ['100,000 > 99,999','100,000 > 99,999'],
     ['50,050 < 50,005','50,050 < 50,005'],
     ['72,000 > 72,100','72,000 > 72,100']],
    1, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 1),

  Q('จำนวนใดมีค่าน้อยกว่า 56,089?',
    'Which number is less than 56,089?',
    [['56,098','56,098'],['56,809','56,809'],['56,080','56,080'],['56,890','56,890']],
    2, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 2, ['trap:confusing-choice']),

  Q('ข้อใดเรียงจากมากไปน้อยถูกต้อง?',
    'Which list is arranged from greatest to least?',
    [['74,200 ; 74,020 ; 74,002','74,200 ; 74,020 ; 74,002'],
     ['74,002 ; 74,020 ; 74,200','74,002 ; 74,020 ; 74,200'],
     ['74,020 ; 74,200 ; 74,002','74,020 ; 74,200 ; 74,002'],
     ['74,200 ; 74,002 ; 74,020','74,200 ; 74,002 ; 74,020']],
    0, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 2),

  Q('จำนวนที่มากกว่า 85,000 แต่น้อยกว่า 86,000 คือ?',
    'Which number is greater than 85,000 but less than 86,000?',
    [['84,999','84,999'],['85,500','85,500'],['86,001','86,001'],['86,500','86,500']],
    1, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 1),

  Q('27,645 ○ 27,654 ควรใส่เครื่องหมายอะไร?',
    '27,645 ○ 27,654 — which sign belongs in the circle?',
    [['>','>'],[' = ',' = '],['<','<'],['≥','≥']],
    2, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 2, ['trap:confusing-choice']),

  Q('เรียง 43,210 ; 42,310 ; 43,120 ; 42,130 จากน้อยไปมาก ข้อใดถูกต้อง?',
    'Arrange 43,210 ; 42,310 ; 43,120 ; 42,130 from least to greatest.',
    [['42,130 ; 42,310 ; 43,120 ; 43,210','42,130 ; 42,310 ; 43,120 ; 43,210'],
     ['43,210 ; 43,120 ; 42,310 ; 42,130','43,210 ; 43,120 ; 42,310 ; 42,130'],
     ['42,130 ; 43,120 ; 42,310 ; 43,210','42,130 ; 43,120 ; 42,310 ; 43,210'],
     ['42,310 ; 42,130 ; 43,210 ; 43,120','42,310 ; 42,130 ; 43,210 ; 43,120']],
    0, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 2),

  Q('จำนวนใดมีค่ามากที่สุด?',
    'Which number has the greatest value?',
    [['56,789','56,789'],['65,789','65,789'],['56,987','56,987'],['65,897','65,897']],
    3, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 1),

  Q('จำนวนใดมีค่าน้อยกว่า 5 หมื่น?',
    'Which number is less than 50,000?',
    [['50,001','50,001'],['49,999','49,999'],['50,000','50,000'],['51,000','51,000']],
    1, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 1),

  Q('ถ้าเรียงจำนวน 33,033 ; 30,333 ; 33,303 ; 30,033 จากน้อยไปมาก จำนวนที่สองคืออะไร?',
    'When 33,033 ; 30,333 ; 33,303 ; 30,033 are arranged from least to greatest, what is the second number?',
    [['30,033','30,033'],['30,333','30,333'],['33,033','33,033'],['33,303','33,303']],
    1, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 3, ['trap:confusing-choice']),

  Q('ข้อใดถูกต้อง?',
    'Which statement is correct?',
    [['45,000 > 54,000','45,000 > 54,000'],
     ['40,000 = 4 × 10,000','40,000 = 4 × 10,000'],
     ['30,000 < 29,000','30,000 < 29,000'],
     ['80,000 > 90,000','80,000 > 90,000']],
    1, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 1),

  Q('จำนวนใดอยู่ระหว่าง 25,000 และ 26,000?',
    'Which number is between 25,000 and 26,000?',
    [['24,999','24,999'],['26,000','26,000'],['25,500','25,500'],['26,001','26,001']],
    2, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 1),

  Q('เมื่อเรียง 51,000 ; 15,000 ; 50,100 ; 15,100 จากน้อยไปมาก จำนวนที่สามคือ?',
    'Arrange 51,000 ; 15,000 ; 50,100 ; 15,100 from least to greatest. What is the third number?',
    [['50,100','50,100'],['51,000','51,000'],['15,000','15,000'],['15,100','15,100']],
    0, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 2),

  Q('เปรียบเทียบ 98,765 กับ 98,756 ข้อใดถูกต้อง?',
    'Compare 98,765 and 98,756. Which is correct?',
    [['98,765 = 98,756','98,765 = 98,756'],
     ['98,765 < 98,756','98,765 < 98,756'],
     ['98,765 > 98,756','98,765 > 98,756'],
     ['ไม่สามารถเปรียบเทียบได้','Cannot be compared']],
    2, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 2, ['trap:confusing-choice']),

  Q('จำนวนใดต่อไปนี้มีค่ามากกว่า 77,777?',
    'Which of the following numbers is greater than 77,777?',
    [['77,770','77,770'],['77,707','77,707'],['77,778','77,778'],['77,077','77,077']],
    2, 'subtopic:whole-numbers-compare', 'skill:arithmetic', 2, ['trap:confusing-choice']),

  // ─── subtopic:whole-numbers-add (20 ข้อ) ──────────────────────────────────
  Q('12,345 + 23,456 = ?',
    '12,345 + 23,456 = ?',
    [['35,700','35,700'],['35,801','35,801'],['35,810','35,810'],['35,000','35,000']],
    1, 'subtopic:whole-numbers-add', 'skill:arithmetic', 1),

  Q('45,678 + 32,100 = ?',
    '45,678 + 32,100 = ?',
    [['77,778','77,778'],['77,687','77,687'],['78,778','78,778'],['77,788','77,788']],
    0, 'subtopic:whole-numbers-add', 'skill:arithmetic', 2),

  Q('56,789 + 43,211 = ?',
    '56,789 + 43,211 = ?',
    [['99,999','99,999'],['100,000','100,000'],['100,001','100,001'],['99,000','99,000']],
    1, 'subtopic:whole-numbers-add', 'skill:arithmetic', 2),

  Q('28,456 + 13,729 = ?',
    '28,456 + 13,729 = ?',
    [['42,185','42,185'],['42,175','42,175'],['41,185','41,185'],['42,285','42,285']],
    0, 'subtopic:whole-numbers-add', 'skill:arithmetic', 2),

  Q('34,000 + 46,000 = ?',
    '34,000 + 46,000 = ?',
    [['70,000','70,000'],['80,000','80,000'],['90,000','90,000'],['85,000','85,000']],
    1, 'subtopic:whole-numbers-add', 'skill:arithmetic', 1),

  Q('17,890 + 5,678 = ?',
    '17,890 + 5,678 = ?',
    [['23,568','23,568'],['23,578','23,578'],['22,568','22,568'],['23,468','23,468']],
    0, 'subtopic:whole-numbers-add', 'skill:arithmetic', 2),

  Q('63,527 + 25,364 = ?',
    '63,527 + 25,364 = ?',
    [['88,891','88,891'],['88,981','88,981'],['89,891','89,891'],['88,801','88,801']],
    0, 'subtopic:whole-numbers-add', 'skill:arithmetic', 2),

  Q('49,999 + 1 = ?',
    '49,999 + 1 = ?',
    [['49,999','49,999'],['50,000','50,000'],['50,001','50,001'],['49,998','49,998']],
    1, 'subtopic:whole-numbers-add', 'skill:arithmetic', 1),

  Q('25,000 + 25,000 = ?',
    '25,000 + 25,000 = ?',
    [['45,000','45,000'],['40,000','40,000'],['55,000','55,000'],['50,000','50,000']],
    3, 'subtopic:whole-numbers-add', 'skill:arithmetic', 1),

  Q('38,415 + 41,295 = ?',
    '38,415 + 41,295 = ?',
    [['79,810','79,810'],['79,610','79,610'],['79,710','79,710'],['80,710','80,710']],
    2, 'subtopic:whole-numbers-add', 'skill:arithmetic', 2),

  Q('10,001 + 10,001 = ?',
    '10,001 + 10,001 = ?',
    [['20,001','20,001'],['20,002','20,002'],['20,010','20,010'],['20,100','20,100']],
    1, 'subtopic:whole-numbers-add', 'skill:arithmetic', 1),

  Q('ผลรวมของ 15,340 กับ 24,660 คือเท่าไร?',
    'What is the sum of 15,340 and 24,660?',
    [['39,000','39,000'],['40,000','40,000'],['41,000','41,000'],['39,900','39,900']],
    1, 'subtopic:whole-numbers-add', 'skill:arithmetic', 2),

  Q('7,654 + 8,932 = ?',
    '7,654 + 8,932 = ?',
    [['16,486','16,486'],['16,586','16,586'],['15,586','15,586'],['16,686','16,686']],
    1, 'subtopic:whole-numbers-add', 'skill:arithmetic', 2),

  Q('20,000 + 30,000 + 40,000 = ?',
    '20,000 + 30,000 + 40,000 = ?',
    [['80,000','80,000'],['90,000','90,000'],['70,000','70,000'],['100,000','100,000']],
    1, 'subtopic:whole-numbers-add', 'skill:arithmetic', 1),

  Q('52,318 + 27,489 = ?',
    '52,318 + 27,489 = ?',
    [['79,807','79,807'],['79,907','79,907'],['78,807','78,807'],['79,817','79,817']],
    0, 'subtopic:whole-numbers-add', 'skill:arithmetic', 2),

  Q('99,000 + 1,000 = ?',
    '99,000 + 1,000 = ?',
    [['99,001','99,001'],['99,100','99,100'],['100,000','100,000'],['99,010','99,010']],
    2, 'subtopic:whole-numbers-add', 'skill:arithmetic', 1),

  Q('46,231 + 35,189 = ?',
    '46,231 + 35,189 = ?',
    [['81,420','81,420'],['81,320','81,320'],['82,420','82,420'],['81,410','81,410']],
    0, 'subtopic:whole-numbers-add', 'skill:arithmetic', 2),

  Q('33,333 + 33,333 = ?',
    '33,333 + 33,333 = ?',
    [['66,666','66,666'],['66,636','66,636'],['63,666','63,666'],['66,663','66,663']],
    0, 'subtopic:whole-numbers-add', 'skill:arithmetic', 1),

  Q('จำนวนที่บวก 12,500 แล้วได้ 50,000 คือ?',
    'What number added to 12,500 gives 50,000?',
    [['37,500','37,500'],['37,000','37,000'],['38,500','38,500'],['38,000','38,000']],
    0, 'subtopic:whole-numbers-add', 'skill:arithmetic', 2),

  Q('65,432 + _____ = 70,000',
    '65,432 + _____ = 70,000',
    [['4,568','4,568'],['5,568','5,568'],['4,678','4,678'],['4,468','4,468']],
    0, 'subtopic:whole-numbers-add', 'skill:arithmetic', 3),

  // ─── subtopic:whole-numbers-subtract (20 ข้อ) ─────────────────────────────
  Q('75,432 - 32,210 = ?',
    '75,432 - 32,210 = ?',
    [['43,222','43,222'],['43,322','43,322'],['42,222','42,222'],['43,232','43,232']],
    0, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 1),

  Q('80,000 - 35,000 = ?',
    '80,000 - 35,000 = ?',
    [['45,000','45,000'],['55,000','55,000'],['44,000','44,000'],['40,000','40,000']],
    0, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 1),

  Q('56,789 - 23,456 = ?',
    '56,789 - 23,456 = ?',
    [['33,333','33,333'],['33,433','33,433'],['34,333','34,333'],['33,343','33,343']],
    0, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 1),

  Q('42,510 - 7,830 = ?',
    '42,510 - 7,830 = ?',
    [['34,780','34,780'],['34,680','34,680'],['34,580','34,580'],['35,680','35,680']],
    1, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 2),

  Q('100,000 - 1 = ?',
    '100,000 - 1 = ?',
    [['99,998','99,998'],['99,999','99,999'],['100,001','100,001'],['99,990','99,990']],
    1, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 1),

  Q('63,500 - 13,500 = ?',
    '63,500 - 13,500 = ?',
    [['50,000','50,000'],['40,000','40,000'],['51,000','51,000'],['49,000','49,000']],
    0, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 1),

  Q('99,999 - 9,999 = ?',
    '99,999 - 9,999 = ?',
    [['89,000','89,000'],['90,000','90,000'],['91,000','91,000'],['88,000','88,000']],
    1, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 2),

  Q('45,678 - 12,345 = ?',
    '45,678 - 12,345 = ?',
    [['33,333','33,333'],['33,343','33,343'],['34,333','34,333'],['33,433','33,433']],
    0, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 1),

  Q('70,030 - 5,015 = ?',
    '70,030 - 5,015 = ?',
    [['65,015','65,015'],['65,025','65,025'],['64,015','64,015'],['65,105','65,105']],
    0, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 2),

  Q('84,000 - 36,000 = ?',
    '84,000 - 36,000 = ?',
    [['58,000','58,000'],['47,000','47,000'],['48,000','48,000'],['57,000','57,000']],
    2, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 1),

  Q('50,000 - 27,654 = ?',
    '50,000 - 27,654 = ?',
    [['22,346','22,346'],['22,436','22,436'],['23,346','23,346'],['22,354','22,354']],
    0, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 3),

  Q('96,482 - 63,271 = ?',
    '96,482 - 63,271 = ?',
    [['33,211','33,211'],['33,121','33,121'],['34,211','34,211'],['33,212','33,212']],
    0, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 1),

  Q('47,000 - 8,000 = ?',
    '47,000 - 8,000 = ?',
    [['39,000','39,000'],['38,000','38,000'],['40,000','40,000'],['41,000','41,000']],
    0, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 1),

  Q('65,000 - 65,000 = ?',
    '65,000 - 65,000 = ?',
    [['1','1'],['100','100'],['1,000','1,000'],['0','0']],
    3, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 1),

  Q('88,888 - 44,444 = ?',
    '88,888 - 44,444 = ?',
    [['44,444','44,444'],['44,440','44,440'],['44,004','44,004'],['44,448','44,448']],
    0, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 1),

  Q('ผลต่างของ 73,500 กับ 29,750 คือ?',
    'What is the difference between 73,500 and 29,750?',
    [['43,750','43,750'],['43,850','43,850'],['44,750','44,750'],['43,650','43,650']],
    0, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 2),

  Q('ถ้าลบ 15,321 ออกจาก 35,678 จะได้เท่าไร?',
    'What is 35,678 minus 15,321?',
    [['20,357','20,357'],['20,457','20,457'],['21,357','21,357'],['20,347','20,347']],
    0, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 1),

  Q('40,500 - 19,800 = ?',
    '40,500 - 19,800 = ?',
    [['20,700','20,700'],['21,700','21,700'],['20,600','20,600'],['21,600','21,600']],
    0, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 2),

  Q('67,890 - _____ = 30,000',
    '67,890 - _____ = 30,000',
    [['37,890','37,890'],['37,980','37,980'],['38,890','38,890'],['37,800','37,800']],
    0, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 2),

  Q('ผลลบของ 90,000 ลบ 54,321 คือ?',
    'What is 90,000 minus 54,321?',
    [['35,679','35,679'],['35,769','35,769'],['36,679','36,679'],['35,689','35,689']],
    0, 'subtopic:whole-numbers-subtract', 'skill:arithmetic', 2),

  // ─── subtopic:whole-numbers-multiply (20 ข้อ) ─────────────────────────────
  Q('345 × 4 = ?',
    '345 × 4 = ?',
    [['1,380','1,380'],['1,280','1,280'],['1,480','1,480'],['1,360','1,360']],
    0, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 1),

  Q('27 × 13 = ?',
    '27 × 13 = ?',
    [['341','341'],['351','351'],['361','361'],['331','331']],
    1, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 2),

  Q('500 × 60 = ?',
    '500 × 60 = ?',
    [['3,000','3,000'],['30,000','30,000'],['300','300'],['300,000','300,000']],
    1, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 1),

  Q('432 × 5 = ?',
    '432 × 5 = ?',
    [['2,060','2,060'],['2,160','2,160'],['2,260','2,260'],['2,150','2,150']],
    1, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 2),

  Q('84 × 25 = ?',
    '84 × 25 = ?',
    [['2,000','2,000'],['2,100','2,100'],['2,200','2,200'],['1,900','1,900']],
    1, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 2),

  Q('1,000 × 7 = ?',
    '1,000 × 7 = ?',
    [['700','700'],['70','70'],['7,000','7,000'],['70,000','70,000']],
    2, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 1),

  Q('56 × 9 = ?',
    '56 × 9 = ?',
    [['494','494'],['514','514'],['504','504'],['524','524']],
    2, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 1),

  Q('125 × 8 = ?',
    '125 × 8 = ?',
    [['900','900'],['1,000','1,000'],['1,100','1,100'],['1,025','1,025']],
    1, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 2),

  Q('36 × 24 = ?',
    '36 × 24 = ?',
    [['844','844'],['884','884'],['864','864'],['854','854']],
    2, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 2),

  Q('200 × 45 = ?',
    '200 × 45 = ?',
    [['8,000','8,000'],['9,000','9,000'],['10,000','10,000'],['900','900']],
    1, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 2),

  Q('78 × 6 = ?',
    '78 × 6 = ?',
    [['458','458'],['478','478'],['448','448'],['468','468']],
    3, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 1),

  Q('350 × 20 = ?',
    '350 × 20 = ?',
    [['7,000','7,000'],['7,500','7,500'],['6,500','6,500'],['70,000','70,000']],
    0, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 1),

  Q('64 × 32 = ?',
    '64 × 32 = ?',
    [['2,048','2,048'],['2,148','2,148'],['1,948','1,948'],['2,068','2,068']],
    0, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 3),

  Q('999 × 9 = ?',
    '999 × 9 = ?',
    [['8,991','8,991'],['8,901','8,901'],['9,001','9,001'],['8,981','8,981']],
    0, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 2),

  Q('7 × 7 × 7 = ?',
    '7 × 7 × 7 = ?',
    [['343','343'],['441','441'],['333','333'],['363','363']],
    0, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 2),

  Q('480 × 5 = ?',
    '480 × 5 = ?',
    [['2,400','2,400'],['2,040','2,040'],['2,000','2,000'],['2,450','2,450']],
    0, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 1),

  Q('15 × 15 = ?',
    '15 × 15 = ?',
    [['215','215'],['205','205'],['225','225'],['235','235']],
    2, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 2),

  Q('ดอกไม้ถูกจัดใส่แจกัน แจกันละ 24 ดอก ถ้ามี 15 แจกัน จะมีดอกไม้ทั้งหมดกี่ดอก?',
    'Flowers are placed in vases, 24 flowers per vase. With 15 vases, how many flowers are there in total?',
    [['360','360'],['390','390'],['330','330'],['350','350']],
    0, 'subtopic:whole-numbers-multiply', 'skill:word-problem', 2),

  Q('3,000 × 8 = ?',
    '3,000 × 8 = ?',
    [['2,400','2,400'],['24,000','24,000'],['240,000','240,000'],['2,400,000','2,400,000']],
    1, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 1),

  Q('ผลคูณของ 45 กับ 20 คือ?',
    'What is the product of 45 and 20?',
    [['800','800'],['900','900'],['1,000','1,000'],['850','850']],
    1, 'subtopic:whole-numbers-multiply', 'skill:arithmetic', 1),

  // ─── subtopic:whole-numbers-divide (20 ข้อ) ───────────────────────────────
  Q('84 ÷ 4 = ?',
    '84 ÷ 4 = ?',
    [['21','21'],['22','22'],['20','20'],['23','23']],
    0, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 1),

  Q('360 ÷ 9 = ?',
    '360 ÷ 9 = ?',
    [['40','40'],['36','36'],['45','45'],['39','39']],
    0, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 1),

  Q('1,500 ÷ 5 = ?',
    '1,500 ÷ 5 = ?',
    [['300','300'],['350','350'],['250','250'],['500','500']],
    0, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 1),

  Q('672 ÷ 8 = ?',
    '672 ÷ 8 = ?',
    [['86','86'],['84','84'],['82','82'],['78','78']],
    1, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 2),

  Q('2,400 ÷ 6 = ?',
    '2,400 ÷ 6 = ?',
    [['400','400'],['300','300'],['450','450'],['500','500']],
    0, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 1),

  Q('91 ÷ 7 = ?',
    '91 ÷ 7 = ?',
    [['12','12'],['14','14'],['13','13'],['11','11']],
    2, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 2),

  Q('5,000 ÷ 5 = ?',
    '5,000 ÷ 5 = ?',
    [['500','500'],['1,000','1,000'],['100','100'],['5,000','5,000']],
    1, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 1),

  Q('144 ÷ 12 = ?',
    '144 ÷ 12 = ?',
    [['14','14'],['12','12'],['11','11'],['13','13']],
    1, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 2),

  Q('2,016 ÷ 7 = ?',
    '2,016 ÷ 7 = ?',
    [['288','288'],['278','278'],['298','298'],['268','268']],
    0, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 3),

  Q('800 ÷ 4 = ?',
    '800 ÷ 4 = ?',
    [['100','100'],['200','200'],['300','300'],['400','400']],
    1, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 1),

  Q('540 ÷ 9 = ?',
    '540 ÷ 9 = ?',
    [['60','60'],['54','54'],['70','70'],['55','55']],
    0, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 1),

  Q('3,600 ÷ 4 = ?',
    '3,600 ÷ 4 = ?',
    [['800','800'],['900','900'],['1,000','1,000'],['700','700']],
    1, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 1),

  Q('256 ÷ 8 = ?',
    '256 ÷ 8 = ?',
    [['34','34'],['30','30'],['32','32'],['28','28']],
    2, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 2),

  Q('4,200 ÷ 7 = ?',
    '4,200 ÷ 7 = ?',
    [['600','600'],['700','700'],['500','500'],['420','420']],
    0, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 1),

  Q('99 ÷ 9 = ?',
    '99 ÷ 9 = ?',
    [['9','9'],['11','11'],['10','10'],['12','12']],
    1, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 1),

  Q('1,200 ÷ 3 = ?',
    '1,200 ÷ 3 = ?',
    [['300','300'],['400','400'],['500','500'],['600','600']],
    1, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 1),

  Q('แบ่งดินสอ 156 แท่งออกเป็น 6 กลุ่มเท่าๆ กัน แต่ละกลุ่มจะได้กี่แท่ง?',
    'Divide 156 pencils into 6 equal groups. How many pencils per group?',
    [['26','26'],['24','24'],['28','28'],['22','22']],
    0, 'subtopic:whole-numbers-divide', 'skill:word-problem', 2),

  Q('810 ÷ 9 = ?',
    '810 ÷ 9 = ?',
    [['80','80'],['90','90'],['100','100'],['85','85']],
    1, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 1),

  Q('7,000 ÷ 7 = ?',
    '7,000 ÷ 7 = ?',
    [['100','100'],['1,000','1,000'],['10,000','10,000'],['700','700']],
    1, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 1),

  Q('ผลหารของ 4,500 หารด้วย 5 คือ?',
    'What is 4,500 divided by 5?',
    [['900','900'],['800','800'],['1,000','1,000'],['850','850']],
    0, 'subtopic:whole-numbers-divide', 'skill:arithmetic', 1),

  // ─── subtopic:whole-numbers-word-problem (20 ข้อ) ─────────────────────────
  Q('ร้านขายหนังสือมีหนังสือ 3,450 เล่ม ขายไป 1,230 เล่ม เหลือหนังสืออีกกี่เล่ม?',
    'A bookstore has 3,450 books. After selling 1,230, how many are left?',
    [['2,220','2,220'],['2,230','2,230'],['2,120','2,120'],['2,320','2,320']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:word-problem', 1),

  Q('โรงงานผลิตของเล่น 2,500 ชิ้นต่อวัน ใน 7 วัน จะผลิตได้กี่ชิ้น?',
    'A factory produces 2,500 toys per day. How many toys in 7 days?',
    [['17,500','17,500'],['17,000','17,000'],['18,000','18,000'],['15,000','15,000']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:word-problem', 1),

  Q('นักเรียน 240 คน แบ่งเป็น 8 ห้องเท่าๆ กัน แต่ละห้องมีนักเรียนกี่คน?',
    '240 students are divided equally into 8 classrooms. How many students per classroom?',
    [['30','30'],['28','28'],['32','32'],['25','25']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:word-problem', 1),

  Q('พ่อมีเงิน 15,000 บาท แม่มีเงิน 23,500 บาท รวมกันมีเงินทั้งหมดกี่บาท?',
    'Father has 15,000 baht and mother has 23,500 baht. How much do they have altogether?',
    [['38,500','38,500'],['38,000','38,000'],['37,500','37,500'],['39,500','39,500']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:word-problem', 1),

  Q('ห้างสรรพสินค้ามีลูกค้า 45,600 คนใน 6 วัน เฉลี่ยวันละกี่คน?',
    'A shopping mall had 45,600 customers over 6 days. What is the daily average?',
    [['7,600','7,600'],['7,000','7,000'],['8,000','8,000'],['7,500','7,500']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:word-problem', 2),

  Q('สวนสาธารณะมีต้นไม้ 12,450 ต้น ปลูกเพิ่มอีก 3,780 ต้น แต่ต้นไม้ตายไป 2,100 ต้น ตอนนี้มีต้นไม้กี่ต้น?',
    'A park has 12,450 trees. 3,780 more are planted, but 2,100 die. How many trees are there now?',
    [['14,130','14,130'],['14,030','14,030'],['14,230','14,230'],['14,150','14,150']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:multi-step', 2),

  Q('รถบัส 1 คันบรรจุผู้โดยสารได้ 45 คน ถ้ามีรถบัส 25 คัน จะบรรจุผู้โดยสารได้ทั้งหมดกี่คน?',
    'A bus holds 45 passengers. With 25 buses, how many passengers can be carried in total?',
    [['1,125','1,125'],['1,175','1,175'],['1,075','1,075'],['1,225','1,225']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:word-problem', 1),

  Q('มีนักเรียน 5,400 คน รถบัสบรรทุกได้ 150 คนต่อเที่ยว ต้องใช้รถบัสกี่เที่ยว?',
    '5,400 students need transport. Each bus trip carries 150 students. How many trips are needed?',
    [['36','36'],['40','40'],['30','30'],['45','45']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:word-problem', 2),

  Q('โรงงานผลิตขนมได้วันละ 8,750 กล่อง ใน 4 วัน ผลิตได้กี่กล่อง?',
    'A factory produces 8,750 boxes of snacks per day. How many boxes in 4 days?',
    [['35,000','35,000'],['34,000','34,000'],['36,000','36,000'],['38,000','38,000']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:word-problem', 1),

  Q('ห้องสมุดมีหนังสือ 25,600 เล่ม ยืมออกไป 8,350 เล่ม คืนมา 2,140 เล่ม ปัจจุบันมีหนังสือกี่เล่ม?',
    'A library has 25,600 books. 8,350 are borrowed and 2,140 are returned. How many books are there now?',
    [['19,390','19,390'],['19,490','19,490'],['19,290','19,290'],['19,380','19,380']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:multi-step', 2),

  Q('บ้านหลังหนึ่งมีพื้นที่ 180 ตารางเมตร กระเบื้อง 1 แผ่นครอบคลุม 4 ตารางเมตร ต้องใช้กระเบื้องกี่แผ่น?',
    'A house has 180 square meters. Each tile covers 4 square meters. How many tiles are needed?',
    [['45','45'],['40','40'],['50','50'],['36','36']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:word-problem', 2),

  Q('ซื้อสินค้าราคา 4,500 บาท จ่ายเงินไป 10,000 บาท จะได้รับเงินทอนกี่บาท?',
    'Items cost 4,500 baht. You pay 10,000 baht. How much change do you receive?',
    [['5,500','5,500'],['5,000','5,000'],['6,000','6,000'],['5,400','5,400']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:word-problem', 1),

  Q('ชั้นหนังสือมี 8 ชั้น แต่ละชั้นวางหนังสือได้ 35 เล่ม วางหนังสือทั้งหมดได้กี่เล่ม?',
    'A bookshelf has 8 levels, each holding 35 books. How many books fit in total?',
    [['280','280'],['240','240'],['270','270'],['300','300']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:word-problem', 1),

  Q('หมู่บ้านมีประชากร 14,350 คน ในจำนวนนี้เป็นเด็ก 5,720 คน ผู้ใหญ่มีกี่คน?',
    'A village has 14,350 people, of which 5,720 are children. How many are adults?',
    [['8,630','8,630'],['8,730','8,730'],['8,530','8,530'],['9,630','9,630']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:word-problem', 1),

  Q('ซื้อดินสอ 12 กล่อง กล่องละ 75 บาท จ่ายเงินทั้งหมดกี่บาท?',
    'Buy 12 boxes of pencils at 75 baht each. How much do you pay in total?',
    [['900','900'],['800','800'],['1,000','1,000'],['850','850']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:word-problem', 1),

  Q('มีส้ม 2,400 ลูก แบ่งใส่ตะกร้าตะกร้าละ 8 ลูก จะได้กี่ตะกร้า?',
    '2,400 oranges are divided into baskets of 8. How many baskets are needed?',
    [['300','300'],['240','240'],['400','400'],['280','280']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:word-problem', 1),

  Q('เงินเดือนของแม่คือ 18,500 บาท พ่อได้มากกว่าแม่ 7,250 บาท พ่อได้เงินเดือนเดือนละกี่บาท?',
    "Mother's salary is 18,500 baht. Father earns 7,250 baht more than mother. What is father's monthly salary?",
    [['25,750','25,750'],['25,250','25,250'],['26,250','26,250'],['25,500','25,500']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:word-problem', 1),

  Q('บริษัทมีพนักงาน 3 แผนก แผนกแรก 1,250 คน แผนกที่สอง 980 คน แผนกที่สาม 1,470 คน รวมทั้งหมดกี่คน?',
    'A company has 3 departments: 1,250, 980, and 1,470 employees. How many employees in total?',
    [['3,700','3,700'],['3,600','3,600'],['3,800','3,800'],['3,750','3,750']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:multi-step', 2),

  Q('ห้างขายเสื้อผ้าได้ 120 ตัวต่อวัน ถ้าขายเป็นเวลา 30 วัน จะขายได้กี่ตัว?',
    'A clothing store sells 120 items per day. How many items are sold in 30 days?',
    [['3,600','3,600'],['3,000','3,000'],['3,500','3,500'],['4,000','4,000']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:word-problem', 1),

  Q('มีของขวัญ 9,800 ชิ้น แบ่งให้เด็ก 4 โรงเรียนเท่าๆ กัน แต่ละโรงเรียนได้กี่ชิ้น?',
    '9,800 gifts are distributed equally to 4 schools. How many gifts does each school receive?',
    [['2,450','2,450'],['2,400','2,400'],['2,500','2,500'],['2,600','2,600']],
    0, 'subtopic:whole-numbers-word-problem', 'skill:word-problem', 1),

];

async function main() {
  let count = 0;
  for (const q of questions) {
    await prisma.question.create({ data: q });
    count++;
  }
  console.log(`✅ สร้างข้อสอบ ${count} ข้อ (topic:whole-numbers, p4)`);

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
