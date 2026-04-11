// seed-questions-area-volume-p6.js
// topic:area-volume, grade p6, 5 subtopics × 20 ข้อ = 100 ข้อ
// subtopic: area-triangle, area-parallelogram, area-trapezoid, area-combined, volume-cuboid
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = { examGrade: 'p6', topic: ['topic:area-volume'] };
const Q = (textTh, textEn, choices, answer, subtopic, skill, difficulty, trap = []) => ({
  textTh, textEn,
  choices: choices.map(c => ({ textTh: c[0], textEn: c[1] })),
  answer,
  attributes: { ...BASE, subtopic: [subtopic], skill: [skill], trap, difficulty },
  ownerOrg: 'system', createdBy: 'seed', updatedBy: 'seed',
  aiGenerated: false, needsReview: false,
});

const questions = [

  // ─── subtopic:area-triangle (20 ข้อ) ─────────────────────────────────────
  Q('สูตรคำนวณพื้นที่สามเหลี่ยมคือข้อใด?',
    'Which formula gives the area of a triangle?',
    [['ฐาน × สูง','base × height'],['(ฐาน + สูง) ÷ 2','(base + height) ÷ 2'],['(ฐาน × สูง) ÷ 2','(base × height) ÷ 2'],['ฐาน × สูง × 2','base × height × 2']],
    2, 'subtopic:area-triangle', 'skill:formula', 1),

  Q('สามเหลี่ยมฐาน 6 ซม. สูง 4 ซม. มีพื้นที่เท่าไร?',
    'A triangle has base 6 cm and height 4 cm. What is the area?',
    [['10 ซม.²','10 cm²'],['12 ซม.²','12 cm²'],['24 ซม.²','24 cm²'],['48 ซม.²','48 cm²']],
    1, 'subtopic:area-triangle', 'skill:formula', 1),

  Q('สามเหลี่ยมฐาน 8 ซม. สูง 5 ซม. มีพื้นที่เท่าไร?',
    'A triangle has base 8 cm and height 5 cm. What is the area?',
    [['13 ซม.²','13 cm²'],['20 ซม.²','20 cm²'],['40 ซม.²','40 cm²'],['80 ซม.²','80 cm²']],
    1, 'subtopic:area-triangle', 'skill:formula', 1),

  Q('สามเหลี่ยมฐาน 10 ซม. สูง 6 ซม. มีพื้นที่เท่าไร?',
    'A triangle has base 10 cm and height 6 cm. What is the area?',
    [['16 ซม.²','16 cm²'],['30 ซม.²','30 cm²'],['60 ซม.²','60 cm²'],['120 ซม.²','120 cm²']],
    1, 'subtopic:area-triangle', 'skill:formula', 1),

  Q('สามเหลี่ยมฐาน 12 ซม. สูง 7 ซม. มีพื้นที่เท่าไร?',
    'A triangle has base 12 cm and height 7 cm. What is the area?',
    [['19 ซม.²','19 cm²'],['38 ซม.²','38 cm²'],['42 ซม.²','42 cm²'],['84 ซม.²','84 cm²']],
    2, 'subtopic:area-triangle', 'skill:formula', 1),

  Q('สามเหลี่ยมฐาน 9 ซม. สูง 8 ซม. มีพื้นที่เท่าไร?',
    'A triangle has base 9 cm and height 8 cm. What is the area?',
    [['17 ซม.²','17 cm²'],['36 ซม.²','36 cm²'],['72 ซม.²','72 cm²'],['144 ซม.²','144 cm²']],
    1, 'subtopic:area-triangle', 'skill:formula', 1),

  Q('สามเหลี่ยมฐาน 14 ซม. สูง 5 ซม. มีพื้นที่เท่าไร?',
    'A triangle has base 14 cm and height 5 cm. What is the area?',
    [['19 ซม.²','19 cm²'],['35 ซม.²','35 cm²'],['70 ซม.²','70 cm²'],['140 ซม.²','140 cm²']],
    1, 'subtopic:area-triangle', 'skill:formula', 1),

  Q('สามเหลี่ยมฐาน 7 ซม. สูง 6 ซม. มีพื้นที่เท่าไร?',
    'A triangle has base 7 cm and height 6 cm. What is the area?',
    [['13 ซม.²','13 cm²'],['21 ซม.²','21 cm²'],['42 ซม.²','42 cm²'],['84 ซม.²','84 cm²']],
    1, 'subtopic:area-triangle', 'skill:formula', 1),

  Q('สามเหลี่ยมฐาน 4 ซม. สูง 9 ซม. มีพื้นที่เท่าไร?',
    'A triangle has base 4 cm and height 9 cm. What is the area?',
    [['13 ซม.²','13 cm²'],['18 ซม.²','18 cm²'],['36 ซม.²','36 cm²'],['72 ซม.²','72 cm²']],
    1, 'subtopic:area-triangle', 'skill:formula', 1),

  Q('สามเหลี่ยมมุมฉากขาสองด้านยาว 6 ซม. และ 8 ซม. มีพื้นที่เท่าไร?',
    'A right triangle has legs of 6 cm and 8 cm. What is the area?',
    [['14 ซม.²','14 cm²'],['24 ซม.²','24 cm²'],['48 ซม.²','48 cm²'],['96 ซม.²','96 cm²']],
    1, 'subtopic:area-triangle', 'skill:formula', 2),

  Q('สามเหลี่ยมพื้นที่ 24 ซม.² สูง 6 ซม. ฐานยาวเท่าไร?',
    'A triangle has area 24 cm² and height 6 cm. What is the base?',
    [['4 ซม.','4 cm'],['6 ซม.','6 cm'],['8 ซม.','8 cm'],['12 ซม.','12 cm']],
    2, 'subtopic:area-triangle', 'skill:formula', 2),

  Q('สามเหลี่ยมพื้นที่ 30 ซม.² ฐาน 10 ซม. สูงเท่าไร?',
    'A triangle has area 30 cm² and base 10 cm. What is the height?',
    [['3 ซม.','3 cm'],['6 ซม.','6 cm'],['10 ซม.','10 cm'],['15 ซม.','15 cm']],
    1, 'subtopic:area-triangle', 'skill:formula', 2),

  Q('สามเหลี่ยมฐาน 16 ซม. สูง 5 ซม. มีพื้นที่เท่าไร?',
    'A triangle has base 16 cm and height 5 cm. What is the area?',
    [['21 ซม.²','21 cm²'],['40 ซม.²','40 cm²'],['80 ซม.²','80 cm²'],['160 ซม.²','160 cm²']],
    1, 'subtopic:area-triangle', 'skill:formula', 1),

  Q('สามเหลี่ยมฐาน 20 ซม. สูง 9 ซม. มีพื้นที่เท่าไร?',
    'A triangle has base 20 cm and height 9 cm. What is the area?',
    [['29 ซม.²','29 cm²'],['58 ซม.²','58 cm²'],['90 ซม.²','90 cm²'],['180 ซม.²','180 cm²']],
    2, 'subtopic:area-triangle', 'skill:formula', 2),

  Q('สามเหลี่ยมฐาน 11 ซม. สูง 6 ซม. มีพื้นที่เท่าไร?',
    'A triangle has base 11 cm and height 6 cm. What is the area?',
    [['17 ซม.²','17 cm²'],['33 ซม.²','33 cm²'],['66 ซม.²','66 cm²'],['132 ซม.²','132 cm²']],
    1, 'subtopic:area-triangle', 'skill:formula', 1),

  Q('สามเหลี่ยมพื้นที่ 40 ซม.² สูง 8 ซม. ฐานยาวเท่าไร?',
    'A triangle has area 40 cm² and height 8 cm. What is the base?',
    [['5 ซม.','5 cm'],['8 ซม.','8 cm'],['10 ซม.','10 cm'],['20 ซม.','20 cm']],
    2, 'subtopic:area-triangle', 'skill:formula', 2),

  Q('สามเหลี่ยมสองรูปที่มีฐานและสูงเท่ากัน มีพื้นที่รูปละ 15 ซม.² พื้นที่รวมกันเท่าไร?',
    'Two identical triangles each have area 15 cm². What is their combined area?',
    [['15 ซม.²','15 cm²'],['22.5 ซม.²','22.5 cm²'],['30 ซม.²','30 cm²'],['60 ซม.²','60 cm²']],
    2, 'subtopic:area-triangle', 'skill:arithmetic', 1),

  Q('สามเหลี่ยมฐาน 15 ซม. สูง 4 ซม. มีพื้นที่เท่าไร?',
    'A triangle has base 15 cm and height 4 cm. What is the area?',
    [['19 ซม.²','19 cm²'],['30 ซม.²','30 cm²'],['60 ซม.²','60 cm²'],['120 ซม.²','120 cm²']],
    1, 'subtopic:area-triangle', 'skill:formula', 1),

  Q('สวนสามเหลี่ยมฐาน 8 เมตร สูง 10 เมตร มีพื้นที่เท่าไร?',
    'A triangular garden has base 8 m and height 10 m. What is the area?',
    [['18 ตร.ม.','18 m²'],['40 ตร.ม.','40 m²'],['80 ตร.ม.','80 m²'],['160 ตร.ม.','160 m²']],
    1, 'subtopic:area-triangle', 'skill:word-problem', 1),

  Q('ป้ายสามเหลี่ยมฐาน 60 ซม. สูง 40 ซม. มีพื้นที่เท่าไร?',
    'A triangular sign has base 60 cm and height 40 cm. What is the area?',
    [['100 ซม.²','100 cm²'],['1,200 ซม.²','1,200 cm²'],['2,400 ซม.²','2,400 cm²'],['4,800 ซม.²','4,800 cm²']],
    1, 'subtopic:area-triangle', 'skill:word-problem', 2),

  // ─── subtopic:area-parallelogram (20 ข้อ) ────────────────────────────────
  Q('สูตรคำนวณพื้นที่สี่เหลี่ยมด้านขนานคือข้อใด?',
    'Which formula gives the area of a parallelogram?',
    [['(ฐาน + สูง) ÷ 2','(base + height) ÷ 2'],['ฐาน × ด้านเอียง','base × slant side'],['ฐาน × สูง','base × height'],['2 × (ฐาน + สูง)','2 × (base + height)']],
    2, 'subtopic:area-parallelogram', 'skill:formula', 1),

  Q('สี่เหลี่ยมด้านขนานฐาน 8 ซม. สูง 5 ซม. มีพื้นที่เท่าไร?',
    'A parallelogram has base 8 cm and height 5 cm. What is the area?',
    [['13 ซม.²','13 cm²'],['26 ซม.²','26 cm²'],['40 ซม.²','40 cm²'],['80 ซม.²','80 cm²']],
    2, 'subtopic:area-parallelogram', 'skill:formula', 1),

  Q('สี่เหลี่ยมด้านขนานฐาน 12 ซม. สูง 7 ซม. มีพื้นที่เท่าไร?',
    'A parallelogram has base 12 cm and height 7 cm. What is the area?',
    [['19 ซม.²','19 cm²'],['38 ซม.²','38 cm²'],['84 ซม.²','84 cm²'],['168 ซม.²','168 cm²']],
    2, 'subtopic:area-parallelogram', 'skill:formula', 1),

  Q('สี่เหลี่ยมด้านขนานฐาน 9 ซม. สูง 6 ซม. มีพื้นที่เท่าไร?',
    'A parallelogram has base 9 cm and height 6 cm. What is the area?',
    [['15 ซม.²','15 cm²'],['30 ซม.²','30 cm²'],['54 ซม.²','54 cm²'],['108 ซม.²','108 cm²']],
    2, 'subtopic:area-parallelogram', 'skill:formula', 1),

  Q('สี่เหลี่ยมด้านขนานฐาน 15 ซม. สูง 4 ซม. มีพื้นที่เท่าไร?',
    'A parallelogram has base 15 cm and height 4 cm. What is the area?',
    [['19 ซม.²','19 cm²'],['38 ซม.²','38 cm²'],['60 ซม.²','60 cm²'],['120 ซม.²','120 cm²']],
    2, 'subtopic:area-parallelogram', 'skill:formula', 1),

  Q('สี่เหลี่ยมด้านขนานฐาน 6 ซม. สูง 11 ซม. มีพื้นที่เท่าไร?',
    'A parallelogram has base 6 cm and height 11 cm. What is the area?',
    [['17 ซม.²','17 cm²'],['34 ซม.²','34 cm²'],['66 ซม.²','66 cm²'],['132 ซม.²','132 cm²']],
    2, 'subtopic:area-parallelogram', 'skill:formula', 1),

  Q('สี่เหลี่ยมด้านขนานพื้นที่ 48 ซม.² ฐาน 8 ซม. สูงเท่าไร?',
    'A parallelogram has area 48 cm² and base 8 cm. What is the height?',
    [['4 ซม.','4 cm'],['6 ซม.','6 cm'],['8 ซม.','8 cm'],['40 ซม.','40 cm']],
    1, 'subtopic:area-parallelogram', 'skill:formula', 2),

  Q('สี่เหลี่ยมด้านขนานพื้นที่ 60 ซม.² สูง 5 ซม. ฐานยาวเท่าไร?',
    'A parallelogram has area 60 cm² and height 5 cm. What is the base?',
    [['10 ซม.','10 cm'],['12 ซม.','12 cm'],['15 ซม.','15 cm'],['55 ซม.','55 cm']],
    1, 'subtopic:area-parallelogram', 'skill:formula', 2),

  Q('สี่เหลี่ยมด้านขนานฐาน 13 ซม. สูง 4 ซม. มีพื้นที่เท่าไร?',
    'A parallelogram has base 13 cm and height 4 cm. What is the area?',
    [['17 ซม.²','17 cm²'],['34 ซม.²','34 cm²'],['52 ซม.²','52 cm²'],['104 ซม.²','104 cm²']],
    2, 'subtopic:area-parallelogram', 'skill:formula', 1),

  Q('สี่เหลี่ยมด้านขนานฐาน 7 ซม. สูง 8 ซม. มีพื้นที่เท่าไร?',
    'A parallelogram has base 7 cm and height 8 cm. What is the area?',
    [['15 ซม.²','15 cm²'],['30 ซม.²','30 cm²'],['56 ซม.²','56 cm²'],['112 ซม.²','112 cm²']],
    2, 'subtopic:area-parallelogram', 'skill:formula', 1),

  Q('สี่เหลี่ยมด้านขนานฐาน 20 ซม. สูง 6 ซม. มีพื้นที่เท่าไร?',
    'A parallelogram has base 20 cm and height 6 cm. What is the area?',
    [['26 ซม.²','26 cm²'],['52 ซม.²','52 cm²'],['120 ซม.²','120 cm²'],['240 ซม.²','240 cm²']],
    2, 'subtopic:area-parallelogram', 'skill:formula', 1),

  Q('สี่เหลี่ยมด้านขนานพื้นที่ 72 ซม.² ฐาน 9 ซม. สูงเท่าไร?',
    'A parallelogram has area 72 cm² and base 9 cm. What is the height?',
    [['6 ซม.','6 cm'],['8 ซม.','8 cm'],['9 ซม.','9 cm'],['63 ซม.','63 cm']],
    1, 'subtopic:area-parallelogram', 'skill:formula', 2),

  Q('สี่เหลี่ยมด้านขนานฐาน 11 ซม. สูง 5 ซม. มีพื้นที่เท่าไร?',
    'A parallelogram has base 11 cm and height 5 cm. What is the area?',
    [['16 ซม.²','16 cm²'],['32 ซม.²','32 cm²'],['55 ซม.²','55 cm²'],['110 ซม.²','110 cm²']],
    2, 'subtopic:area-parallelogram', 'skill:formula', 1),

  Q('สี่เหลี่ยมด้านขนานฐาน 14 ซม. สูง 7 ซม. มีพื้นที่เท่าไร?',
    'A parallelogram has base 14 cm and height 7 cm. What is the area?',
    [['21 ซม.²','21 cm²'],['49 ซม.²','49 cm²'],['98 ซม.²','98 cm²'],['196 ซม.²','196 cm²']],
    2, 'subtopic:area-parallelogram', 'skill:formula', 2),

  Q('สี่เหลี่ยมด้านขนานฐาน 8 ซม. ด้านเอียง 10 ซม. สูงตั้งฉาก 6 ซม. พื้นที่ควรคำนวณอย่างไร?',
    'A parallelogram: base 8 cm, slant side 10 cm, perpendicular height 6 cm. How should area be calculated?',
    [['8 × 10 = 80 ซม.²','8 × 10 = 80 cm²'],['8 × 6 = 48 ซม.²','8 × 6 = 48 cm²'],['10 × 6 = 60 ซม.²','10 × 6 = 60 cm²'],['(8+10) × 6 ÷ 2 = 54 ซม.²','(8+10) × 6 ÷ 2 = 54 cm²']],
    1, 'subtopic:area-parallelogram', 'skill:formula', 3,['trap:wrong-unit']),

  Q('สี่เหลี่ยมด้านขนานฐาน 25 ซม. สูง 3 ซม. มีพื้นที่เท่าไร?',
    'A parallelogram has base 25 cm and height 3 cm. What is the area?',
    [['28 ซม.²','28 cm²'],['56 ซม.²','56 cm²'],['75 ซม.²','75 cm²'],['150 ซม.²','150 cm²']],
    2, 'subtopic:area-parallelogram', 'skill:formula', 1),

  Q('สี่เหลี่ยมด้านขนานพื้นที่ 90 ซม.² สูง 6 ซม. ฐานยาวเท่าไร?',
    'A parallelogram has area 90 cm² and height 6 cm. What is the base?',
    [['10 ซม.','10 cm'],['15 ซม.','15 cm'],['18 ซม.','18 cm'],['84 ซม.','84 cm']],
    1, 'subtopic:area-parallelogram', 'skill:formula', 2),

  Q('สี่เหลี่ยมจัตุรัสเป็นสี่เหลี่ยมด้านขนานชนิดพิเศษหรือไม่?',
    'Is a square a special type of parallelogram?',
    [['ไม่ใช่ เพราะมุมต้องไม่ฉาก','No, because angles must not be right angles'],['ใช่ เพราะมีด้านขนานกันสองคู่','Yes, because it has two pairs of parallel sides'],['ไม่ใช่ เพราะด้านต้องไม่เท่ากัน','No, because sides must not be equal'],['ใช่ เพราะมีเส้นทแยงเท่ากัน','Yes, because it has equal diagonals']],
    1, 'subtopic:area-parallelogram', 'skill:proof', 2),

  Q('สนามรูปสี่เหลี่ยมด้านขนานฐาน 30 เมตร สูง 20 เมตร มีพื้นที่เท่าไร?',
    'A parallelogram-shaped field has base 30 m and height 20 m. What is the area?',
    [['50 ตร.ม.','50 m²'],['100 ตร.ม.','100 m²'],['600 ตร.ม.','600 m²'],['1,200 ตร.ม.','1,200 m²']],
    2, 'subtopic:area-parallelogram', 'skill:word-problem', 1),

  Q('สี่เหลี่ยมด้านขนานและสี่เหลี่ยมมุมฉากที่มีฐานและสูงเท่ากัน มีพื้นที่เท่ากันหรือไม่?',
    'Do a parallelogram and a rectangle with the same base and height have the same area?',
    [['ไม่ เพราะรูปร่างต่างกัน','No, because the shapes differ'],['ใช่ เพราะใช้สูตรเดียวกัน','Yes, because they use the same formula'],['ไม่ เพราะสี่เหลี่ยมมุมฉากใหญ่กว่าเสมอ','No, the rectangle is always bigger'],['ใช่ เพราะเส้นทแยงเท่ากัน','Yes, because diagonals are equal']],
    1, 'subtopic:area-parallelogram', 'skill:proof', 2),

  // ─── subtopic:area-trapezoid (20 ข้อ) ────────────────────────────────────
  Q('สูตรคำนวณพื้นที่สี่เหลี่ยมคางหมูคือข้อใด?',
    'Which formula gives the area of a trapezoid?',
    [['ฐาน × สูง','base × height'],['(ด้านขนาน 1 + ด้านขนาน 2) × สูง ÷ 2','(parallel side 1 + parallel side 2) × height ÷ 2'],['(ด้านขนาน 1 × ด้านขนาน 2) ÷ 2','(parallel side 1 × parallel side 2) ÷ 2'],['ฐาน × สูง ÷ 2','base × height ÷ 2']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 1),

  Q('สี่เหลี่ยมคางหมูด้านขนาน 4 ซม. และ 8 ซม. สูง 5 ซม. มีพื้นที่เท่าไร?',
    'A trapezoid has parallel sides 4 cm and 8 cm, and height 5 cm. What is the area?',
    [['20 ซม.²','20 cm²'],['30 ซม.²','30 cm²'],['40 ซม.²','40 cm²'],['60 ซม.²','60 cm²']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 1),

  Q('สี่เหลี่ยมคางหมูด้านขนาน 6 ซม. และ 10 ซม. สูง 4 ซม. มีพื้นที่เท่าไร?',
    'A trapezoid has parallel sides 6 cm and 10 cm, and height 4 cm. What is the area?',
    [['16 ซม.²','16 cm²'],['32 ซม.²','32 cm²'],['64 ซม.²','64 cm²'],['160 ซม.²','160 cm²']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 1),

  Q('สี่เหลี่ยมคางหมูด้านขนาน 5 ซม. และ 9 ซม. สูง 6 ซม. มีพื้นที่เท่าไร?',
    'A trapezoid has parallel sides 5 cm and 9 cm, and height 6 cm. What is the area?',
    [['28 ซม.²','28 cm²'],['42 ซม.²','42 cm²'],['84 ซม.²','84 cm²'],['270 ซม.²','270 cm²']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 2),

  Q('สี่เหลี่ยมคางหมูด้านขนาน 8 ซม. และ 12 ซม. สูง 5 ซม. มีพื้นที่เท่าไร?',
    'A trapezoid has parallel sides 8 cm and 12 cm, and height 5 cm. What is the area?',
    [['25 ซม.²','25 cm²'],['50 ซม.²','50 cm²'],['100 ซม.²','100 cm²'],['480 ซม.²','480 cm²']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 2),

  Q('สี่เหลี่ยมคางหมูด้านขนาน 7 ซม. และ 13 ซม. สูง 4 ซม. มีพื้นที่เท่าไร?',
    'A trapezoid has parallel sides 7 cm and 13 cm, and height 4 cm. What is the area?',
    [['20 ซม.²','20 cm²'],['40 ซม.²','40 cm²'],['80 ซม.²','80 cm²'],['160 ซม.²','160 cm²']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 2),

  Q('สี่เหลี่ยมคางหมูด้านขนาน 5 ซม. และ 11 ซม. สูง 8 ซม. มีพื้นที่เท่าไร?',
    'A trapezoid has parallel sides 5 cm and 11 cm, and height 8 cm. What is the area?',
    [['32 ซม.²','32 cm²'],['64 ซม.²','64 cm²'],['128 ซม.²','128 cm²'],['256 ซม.²','256 cm²']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 2),

  Q('สี่เหลี่ยมคางหมูด้านขนาน 4 ซม. และ 6 ซม. สูง 5 ซม. มีพื้นที่เท่าไร?',
    'A trapezoid has parallel sides 4 cm and 6 cm, and height 5 cm. What is the area?',
    [['15 ซม.²','15 cm²'],['25 ซม.²','25 cm²'],['50 ซม.²','50 cm²'],['120 ซม.²','120 cm²']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 1),

  Q('สี่เหลี่ยมคางหมูด้านขนาน 9 ซม. และ 15 ซม. สูง 6 ซม. มีพื้นที่เท่าไร?',
    'A trapezoid has parallel sides 9 cm and 15 cm, and height 6 cm. What is the area?',
    [['36 ซม.²','36 cm²'],['72 ซม.²','72 cm²'],['144 ซม.²','144 cm²'],['810 ซม.²','810 cm²']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 2),

  Q('สี่เหลี่ยมคางหมูด้านขนาน 6 ซม. และ 14 ซม. สูง 7 ซม. มีพื้นที่เท่าไร?',
    'A trapezoid has parallel sides 6 cm and 14 cm, and height 7 cm. What is the area?',
    [['35 ซม.²','35 cm²'],['70 ซม.²','70 cm²'],['140 ซม.²','140 cm²'],['588 ซม.²','588 cm²']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 2),

  Q('สี่เหลี่ยมคางหมูพื้นที่ 36 ซม.² ด้านขนาน 6 ซม. และ 12 ซม. สูงเท่าไร?',
    'A trapezoid has area 36 cm² and parallel sides 6 cm and 12 cm. What is the height?',
    [['2 ซม.','2 cm'],['4 ซม.','4 cm'],['6 ซม.','6 cm'],['18 ซม.','18 cm']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 3),

  Q('สี่เหลี่ยมคางหมูด้านขนาน 10 ซม. และ 16 ซม. สูง 6 ซม. มีพื้นที่เท่าไร?',
    'A trapezoid has parallel sides 10 cm and 16 cm, and height 6 cm. What is the area?',
    [['39 ซม.²','39 cm²'],['78 ซม.²','78 cm²'],['156 ซม.²','156 cm²'],['960 ซม.²','960 cm²']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 2),

  Q('สี่เหลี่ยมคางหมูด้านขนาน 3 ซม. และ 9 ซม. สูง 4 ซม. มีพื้นที่เท่าไร?',
    'A trapezoid has parallel sides 3 cm and 9 cm, and height 4 cm. What is the area?',
    [['12 ซม.²','12 cm²'],['24 ซม.²','24 cm²'],['48 ซม.²','48 cm²'],['108 ซม.²','108 cm²']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 1),

  Q('สี่เหลี่ยมคางหมูด้านขนาน 8 ซม. และ 12 ซม. สูง 9 ซม. มีพื้นที่เท่าไร?',
    'A trapezoid has parallel sides 8 cm and 12 cm, and height 9 cm. What is the area?',
    [['45 ซม.²','45 cm²'],['90 ซม.²','90 cm²'],['180 ซม.²','180 cm²'],['864 ซม.²','864 cm²']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 2),

  Q('สี่เหลี่ยมคางหมูพื้นที่ 48 ซม.² ด้านขนาน 6 ซม. และ 10 ซม. สูงเท่าไร?',
    'A trapezoid has area 48 cm² and parallel sides 6 cm and 10 cm. What is the height?',
    [['4 ซม.','4 cm'],['6 ซม.','6 cm'],['8 ซม.','8 cm'],['12 ซม.','12 cm']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 3),

  Q('สี่เหลี่ยมคางหมูด้านขนาน 7 ซม. และ 11 ซม. สูง 5 ซม. มีพื้นที่เท่าไร?',
    'A trapezoid has parallel sides 7 cm and 11 cm, and height 5 cm. What is the area?',
    [['22.5 ซม.²','22.5 cm²'],['45 ซม.²','45 cm²'],['90 ซม.²','90 cm²'],['385 ซม.²','385 cm²']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 2),

  Q('สี่เหลี่ยมคางหมูด้านขนาน 4 ซม. และ 10 ซม. สูง 8 ซม. มีพื้นที่เท่าไร?',
    'A trapezoid has parallel sides 4 cm and 10 cm, and height 8 cm. What is the area?',
    [['28 ซม.²','28 cm²'],['56 ซม.²','56 cm²'],['112 ซม.²','112 cm²'],['320 ซม.²','320 cm²']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 2),

  Q('แปลงที่ดินรูปสี่เหลี่ยมคางหมูด้านขนาน 20 เมตร และ 30 เมตร สูง 15 เมตร มีพื้นที่เท่าไร?',
    'A trapezoidal plot has parallel sides 20 m and 30 m, and height 15 m. What is the area?',
    [['225 ตร.ม.','225 m²'],['375 ตร.ม.','375 m²'],['750 ตร.ม.','750 m²'],['9,000 ตร.ม.','9,000 m²']],
    1, 'subtopic:area-trapezoid', 'skill:word-problem', 2),

  Q('สี่เหลี่ยมคางหมูด้านขนาน 12 ซม. และ 18 ซม. สูง 10 ซม. มีพื้นที่เท่าไร?',
    'A trapezoid has parallel sides 12 cm and 18 cm, and height 10 cm. What is the area?',
    [['75 ซม.²','75 cm²'],['150 ซม.²','150 cm²'],['300 ซม.²','300 cm²'],['2,160 ซม.²','2,160 cm²']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 2),

  Q('สี่เหลี่ยมคางหมูด้านขนาน 15 ซม. และ 25 ซม. สูง 8 ซม. มีพื้นที่เท่าไร?',
    'A trapezoid has parallel sides 15 cm and 25 cm, and height 8 cm. What is the area?',
    [['80 ซม.²','80 cm²'],['160 ซม.²','160 cm²'],['320 ซม.²','320 cm²'],['3,000 ซม.²','3,000 cm²']],
    1, 'subtopic:area-trapezoid', 'skill:formula', 2),

  // ─── subtopic:area-combined (20 ข้อ) ─────────────────────────────────────
  Q('รูปประกอบด้วยสี่เหลี่ยมมุมฉาก 6×4 ซม. และสามเหลี่ยมฐาน 6 ซม. สูง 3 ซม. พื้นที่รวมคือ?',
    'A shape has a 6×4 cm rectangle and a triangle with base 6 cm and height 3 cm. Total area?',
    [['24 ซม.²','24 cm²'],['33 ซม.²','33 cm²'],['42 ซม.²','42 cm²'],['48 ซม.²','48 cm²']],
    1, 'subtopic:area-combined', 'skill:multi-step', 2),

  Q('รูป L: สี่เหลี่ยม 8×6 ซม. ลบสี่เหลี่ยม 3×2 ซม. พื้นที่คือ?',
    'An L-shape: 8×6 cm rectangle minus 3×2 cm rectangle. What is the area?',
    [['36 ซม.²','36 cm²'],['42 ซม.²','42 cm²'],['48 ซม.²','48 cm²'],['54 ซม.²','54 cm²']],
    1, 'subtopic:area-combined', 'skill:multi-step', 2),

  Q('รูปประกอบสี่เหลี่ยม 10×4 ซม. และสี่เหลี่ยม 5×3 ซม. พื้นที่รวมคือ?',
    'A shape combines a 10×4 cm and a 5×3 cm rectangle. Total area?',
    [['22 ซม.²','22 cm²'],['40 ซม.²','40 cm²'],['55 ซม.²','55 cm²'],['70 ซม.²','70 cm²']],
    2, 'subtopic:area-combined', 'skill:multi-step', 2),

  Q('รูปบ้าน: สี่เหลี่ยม 8×6 ซม. (ตัวบ้าน) และสามเหลี่ยมฐาน 8 ซม. สูง 4 ซม. (หลังคา) พื้นที่รวม?',
    'A house shape: 8×6 cm rectangle (walls) and triangle base 8 cm height 4 cm (roof). Total area?',
    [['48 ซม.²','48 cm²'],['56 ซม.²','56 cm²'],['64 ซม.²','64 cm²'],['80 ซม.²','80 cm²']],
    1, 'subtopic:area-combined', 'skill:multi-step', 2),

  Q('รูป L: สี่เหลี่ยม 10×8 ซม. ลบสี่เหลี่ยม 4×3 ซม. พื้นที่คือ?',
    'An L-shape: 10×8 cm rectangle minus 4×3 cm rectangle. What is the area?',
    [['54 ซม.²','54 cm²'],['68 ซม.²','68 cm²'],['80 ซม.²','80 cm²'],['92 ซม.²','92 cm²']],
    1, 'subtopic:area-combined', 'skill:multi-step', 2),

  Q('รูปประกอบ: สี่เหลี่ยม 6×6 ซม. และสามเหลี่ยมฐาน 6 ซม. สูง 4 ซม. พื้นที่รวม?',
    'A shape: 6×6 cm square and triangle base 6 cm height 4 cm. Total area?',
    [['36 ซม.²','36 cm²'],['48 ซม.²','48 cm²'],['60 ซม.²','60 cm²'],['72 ซม.²','72 cm²']],
    1, 'subtopic:area-combined', 'skill:multi-step', 2),

  Q('รูป L: สี่เหลี่ยม 9×7 ซม. ลบสี่เหลี่ยม 3×4 ซม. พื้นที่คือ?',
    'An L-shape: 9×7 cm rectangle minus 3×4 cm rectangle. What is the area?',
    [['39 ซม.²','39 cm²'],['51 ซม.²','51 cm²'],['63 ซม.²','63 cm²'],['75 ซม.²','75 cm²']],
    1, 'subtopic:area-combined', 'skill:multi-step', 2),

  Q('สี่เหลี่ยม 10×6 ซม. มีสามเหลี่ยมฐาน 4 ซม. สูง 3 ซม. ถูกตัดออก พื้นที่ที่เหลือ?',
    'A 10×6 cm rectangle has a triangle (base 4 cm, height 3 cm) cut out. Remaining area?',
    [['48 ซม.²','48 cm²'],['54 ซม.²','54 cm²'],['60 ซม.²','60 cm²'],['66 ซม.²','66 cm²']],
    1, 'subtopic:area-combined', 'skill:multi-step', 3),

  Q('รูปสองสี่เหลี่ยมประกอบกัน: 5×3 ซม. และ 7×4 ซม. พื้นที่รวม?',
    'Two rectangles joined together: 5×3 cm and 7×4 cm. Total area?',
    [['34 ซม.²','34 cm²'],['43 ซม.²','43 cm²'],['55 ซม.²','55 cm²'],['60 ซม.²','60 cm²']],
    1, 'subtopic:area-combined', 'skill:multi-step', 1),

  Q('สี่เหลี่ยม 8×5 ซม. มีสี่เหลี่ยม 2×3 ซม. ถูกตัดออกจากมุม พื้นที่ที่เหลือ?',
    'An 8×5 cm rectangle has a 2×3 cm rectangle cut from a corner. Remaining area?',
    [['28 ซม.²','28 cm²'],['34 ซม.²','34 cm²'],['40 ซม.²','40 cm²'],['46 ซม.²','46 cm²']],
    1, 'subtopic:area-combined', 'skill:multi-step', 2),

  Q('แปลงดอกไม้สี่เหลี่ยม 12×10 เมตร มีบ่อน้ำสี่เหลี่ยม 3×4 เมตร พื้นที่ดินรอบบ่อ?',
    'A 12×10 m garden has a 3×4 m pond. What is the garden area excluding the pond?',
    [['96 ตร.ม.','96 m²'],['108 ตร.ม.','108 m²'],['120 ตร.ม.','120 m²'],['132 ตร.ม.','132 m²']],
    1, 'subtopic:area-combined', 'skill:multi-step', 2),

  Q('รูปสามเหลี่ยมสองรูปประกอบกัน: รูปแรกฐาน 6 สูง 4 ซม. รูปที่สองฐาน 8 สูง 5 ซม. พื้นที่รวม?',
    'Two triangles: first base 6 cm height 4 cm; second base 8 cm height 5 cm. Total area?',
    [['23 ซม.²','23 cm²'],['32 ซม.²','32 cm²'],['64 ซม.²','64 cm²'],['92 ซม.²','92 cm²']],
    1, 'subtopic:area-combined', 'skill:multi-step', 2),

  Q('สี่เหลี่ยมผืนผ้า 15×10 ซม. แบ่งด้วยเส้นทแยงเป็นสามเหลี่ยมสองรูป แต่ละรูปมีพื้นที่เท่าไร?',
    'A 15×10 cm rectangle is divided by a diagonal into two triangles. Area of each triangle?',
    [['25 ซม.²','25 cm²'],['50 ซม.²','50 cm²'],['75 ซม.²','75 cm²'],['150 ซม.²','150 cm²']],
    2, 'subtopic:area-combined', 'skill:multi-step', 2),

  Q('สี่เหลี่ยม 14×8 ซม. มีสามเหลี่ยมฐาน 6 ซม. สูง 4 ซม. ถูกตัดออก พื้นที่ที่เหลือ?',
    'A 14×8 cm rectangle has a triangle (base 6 cm, height 4 cm) cut out. Remaining area?',
    [['88 ซม.²','88 cm²'],['100 ซม.²','100 cm²'],['112 ซม.²','112 cm²'],['124 ซม.²','124 cm²']],
    1, 'subtopic:area-combined', 'skill:multi-step', 3),

  Q('สนามสี่เหลี่ยม 20×15 เมตร มีที่จอดรถสี่เหลี่ยม 8×5 เมตร พื้นที่สนามที่เหลือ?',
    'A 20×15 m field has a 8×5 m parking area. What is the remaining field area?',
    [['220 ตร.ม.','220 m²'],['260 ตร.ม.','260 m²'],['300 ตร.ม.','300 m²'],['340 ตร.ม.','340 m²']],
    1, 'subtopic:area-combined', 'skill:multi-step', 2),

  Q('รูปประกอบสี่เหลี่ยม 10×6 ซม. และสี่เหลี่ยม 5×4 ซม. ต่อกัน พื้นที่รวม?',
    'A shape: 10×6 cm and 5×4 cm rectangles joined. Total area?',
    [['60 ซม.²','60 cm²'],['80 ซม.²','80 cm²'],['100 ซม.²','100 cm²'],['120 ซม.²','120 cm²']],
    1, 'subtopic:area-combined', 'skill:multi-step', 1),

  Q('รูป L: สี่เหลี่ยม 10×10 ซม. ลบสี่เหลี่ยม 6×6 ซม. พื้นที่คือ?',
    'An L-shape: 10×10 cm square minus 6×6 cm square. What is the area?',
    [['28 ซม.²','28 cm²'],['44 ซม.²','44 cm²'],['64 ซม.²','64 cm²'],['100 ซม.²','100 cm²']],
    2, 'subtopic:area-combined', 'skill:multi-step', 2),

  Q('สี่เหลี่ยม 20×12 ซม. มีรู (holes) สี่เหลี่ยม 5×4 ซม. สี่รู พื้นที่ที่เหลือ?',
    'A 20×12 cm rectangle has four 5×4 cm holes cut out. Remaining area?',
    [['80 ซม.²','80 cm²'],['160 ซม.²','160 cm²'],['200 ซม.²','200 cm²'],['240 ซม.²','240 cm²']],
    1, 'subtopic:area-combined', 'skill:multi-step', 3),

  Q('รูปประกอบ: สี่เหลี่ยมด้านขนานฐาน 10 ซม. สูง 6 ซม. และสี่เหลี่ยมมุมฉาก 4×6 ซม. พื้นที่รวม?',
    'A parallelogram (base 10 cm, height 6 cm) and rectangle (4×6 cm) joined. Total area?',
    [['64 ซม.²','64 cm²'],['84 ซม.²','84 cm²'],['104 ซม.²','104 cm²'],['124 ซม.²','124 cm²']],
    1, 'subtopic:area-combined', 'skill:multi-step', 3),

  Q('รูปสี่เหลี่ยมคางหมูฐาน 10 ซม. และ 14 ซม. สูง 6 ซม. อยู่บนสี่เหลี่ยมมุมฉาก 10×4 ซม. พื้นที่รวม?',
    'A trapezoid (parallel sides 10 cm and 14 cm, height 6 cm) sits on a 10×4 cm rectangle. Total area?',
    [['72 ซม.²','72 cm²'],['112 ซม.²','112 cm²'],['152 ซม.²','152 cm²'],['192 ซม.²','192 cm²']],
    1, 'subtopic:area-combined', 'skill:multi-step', 3),

  // ─── subtopic:volume-cuboid (20 ข้อ) ─────────────────────────────────────
  Q('สูตรคำนวณปริมาตรทรงสี่เหลี่ยมมุมฉาก (cuboid) คือข้อใด?',
    'Which formula gives the volume of a cuboid?',
    [['ยาว + กว้าง + สูง','length + width + height'],['ยาว × กว้าง','length × width'],['ยาว × กว้าง × สูง','length × width × height'],['2 × (ยาว × กว้าง + กว้าง × สูง + ยาว × สูง)','2 × (lw + wh + lh)']],
    2, 'subtopic:volume-cuboid', 'skill:formula', 1),

  Q('หน่วยของปริมาตรคือข้อใด?',
    'Which is the correct unit for volume?',
    [['ซม.','cm'],['ซม.²','cm²'],['ซม.³','cm³'],['ตร.ซม.','sq. cm']],
    2, 'subtopic:volume-cuboid', 'skill:arithmetic', 1),

  Q('กล่องยาว 5 ซม. กว้าง 4 ซม. สูง 3 ซม. มีปริมาตรเท่าไร?',
    'A box is 5 cm long, 4 cm wide, and 3 cm tall. What is the volume?',
    [['12 ซม.³','12 cm³'],['47 ซม.³','47 cm³'],['60 ซม.³','60 cm³'],['120 ซม.³','120 cm³']],
    2, 'subtopic:volume-cuboid', 'skill:formula', 1),

  Q('กล่องยาว 6 ซม. กว้าง 5 ซม. สูง 4 ซม. มีปริมาตรเท่าไร?',
    'A box is 6 cm long, 5 cm wide, and 4 cm tall. What is the volume?',
    [['15 ซม.³','15 cm³'],['60 ซม.³','60 cm³'],['120 ซม.³','120 cm³'],['240 ซม.³','240 cm³']],
    2, 'subtopic:volume-cuboid', 'skill:formula', 1),

  Q('กล่องยาว 8 ซม. กว้าง 6 ซม. สูง 5 ซม. มีปริมาตรเท่าไร?',
    'A box is 8 cm long, 6 cm wide, and 5 cm tall. What is the volume?',
    [['19 ซม.³','19 cm³'],['120 ซม.³','120 cm³'],['240 ซม.³','240 cm³'],['480 ซม.³','480 cm³']],
    2, 'subtopic:volume-cuboid', 'skill:formula', 2),

  Q('ลูกบาศก์ด้านยาว 4 ซม. มีปริมาตรเท่าไร?',
    'A cube has sides of 4 cm. What is the volume?',
    [['16 ซม.³','16 cm³'],['48 ซม.³','48 cm³'],['64 ซม.³','64 cm³'],['256 ซม.³','256 cm³']],
    2, 'subtopic:volume-cuboid', 'skill:formula', 2),

  Q('ลูกบาศก์ด้านยาว 5 ซม. มีปริมาตรเท่าไร?',
    'A cube has sides of 5 cm. What is the volume?',
    [['15 ซม.³','15 cm³'],['75 ซม.³','75 cm³'],['125 ซม.³','125 cm³'],['625 ซม.³','625 cm³']],
    2, 'subtopic:volume-cuboid', 'skill:formula', 2),

  Q('กล่องยาว 10 ซม. กว้าง 5 ซม. สูง 3 ซม. มีปริมาตรเท่าไร?',
    'A box is 10 cm long, 5 cm wide, and 3 cm tall. What is the volume?',
    [['18 ซม.³','18 cm³'],['50 ซม.³','50 cm³'],['150 ซม.³','150 cm³'],['300 ซม.³','300 cm³']],
    2, 'subtopic:volume-cuboid', 'skill:formula', 1),

  Q('กล่องยาว 9 ซม. กว้าง 4 ซม. สูง 2 ซม. มีปริมาตรเท่าไร?',
    'A box is 9 cm long, 4 cm wide, and 2 cm tall. What is the volume?',
    [['15 ซม.³','15 cm³'],['36 ซม.³','36 cm³'],['72 ซม.³','72 cm³'],['144 ซม.³','144 cm³']],
    2, 'subtopic:volume-cuboid', 'skill:formula', 1),

  Q('กล่องปริมาตร 120 ซม.³ ยาว 6 ซม. กว้าง 5 ซม. สูงเท่าไร?',
    'A box has volume 120 cm³, length 6 cm, and width 5 cm. What is the height?',
    [['2 ซม.','2 cm'],['4 ซม.','4 cm'],['6 ซม.','6 cm'],['10 ซม.','10 cm']],
    1, 'subtopic:volume-cuboid', 'skill:formula', 2),

  Q('กล่องปริมาตร 180 ซม.³ ยาว 6 ซม. สูง 5 ซม. กว้างเท่าไร?',
    'A box has volume 180 cm³, length 6 cm, and height 5 cm. What is the width?',
    [['4 ซม.','4 cm'],['5 ซม.','5 cm'],['6 ซม.','6 cm'],['10 ซม.','10 cm']],
    2, 'subtopic:volume-cuboid', 'skill:formula', 2),

  Q('กล่องยาว 7 ซม. กว้าง 5 ซม. สูง 6 ซม. มีปริมาตรเท่าไร?',
    'A box is 7 cm long, 5 cm wide, and 6 cm tall. What is the volume?',
    [['18 ซม.³','18 cm³'],['105 ซม.³','105 cm³'],['210 ซม.³','210 cm³'],['420 ซม.³','420 cm³']],
    2, 'subtopic:volume-cuboid', 'skill:formula', 2),

  Q('ลูกบาศก์ด้านยาว 3 ซม. มีปริมาตรเท่าไร?',
    'A cube has sides of 3 cm. What is the volume?',
    [['9 ซม.³','9 cm³'],['18 ซม.³','18 cm³'],['27 ซม.³','27 cm³'],['81 ซม.³','81 cm³']],
    2, 'subtopic:volume-cuboid', 'skill:formula', 2),

  Q('กล่องยาว 12 ซม. กว้าง 3 ซม. สูง 4 ซม. มีปริมาตรเท่าไร?',
    'A box is 12 cm long, 3 cm wide, and 4 cm tall. What is the volume?',
    [['19 ซม.³','19 cm³'],['72 ซม.³','72 cm³'],['144 ซม.³','144 cm³'],['288 ซม.³','288 cm³']],
    2, 'subtopic:volume-cuboid', 'skill:formula', 2),

  Q('กล่องยาว 4 ซม. กว้าง 4 ซม. สูง 10 ซม. มีปริมาตรเท่าไร?',
    'A box is 4 cm long, 4 cm wide, and 10 cm tall. What is the volume?',
    [['18 ซม.³','18 cm³'],['80 ซม.³','80 cm³'],['160 ซม.³','160 cm³'],['640 ซม.³','640 cm³']],
    2, 'subtopic:volume-cuboid', 'skill:formula', 2),

  Q('กล่องปริมาตร 200 ซม.³ ยาว 10 ซม. กว้าง 5 ซม. สูงเท่าไร?',
    'A box has volume 200 cm³, length 10 cm, and width 5 cm. What is the height?',
    [['2 ซม.','2 cm'],['4 ซม.','4 cm'],['5 ซม.','5 cm'],['10 ซม.','10 cm']],
    1, 'subtopic:volume-cuboid', 'skill:formula', 2),

  Q('กล่องยาว 11 ซม. กว้าง 4 ซม. สูง 5 ซม. มีปริมาตรเท่าไร?',
    'A box is 11 cm long, 4 cm wide, and 5 cm tall. What is the volume?',
    [['20 ซม.³','20 cm³'],['110 ซม.³','110 cm³'],['220 ซม.³','220 cm³'],['440 ซม.³','440 cm³']],
    2, 'subtopic:volume-cuboid', 'skill:formula', 2),

  Q('ลูกบาศก์ด้านยาว 6 ซม. มีปริมาตรเท่าไร?',
    'A cube has sides of 6 cm. What is the volume?',
    [['36 ซม.³','36 cm³'],['108 ซม.³','108 cm³'],['216 ซม.³','216 cm³'],['1,296 ซม.³','1,296 cm³']],
    2, 'subtopic:volume-cuboid', 'skill:formula', 2),

  Q('ถังน้ำสี่เหลี่ยมยาว 50 ซม. กว้าง 40 ซม. สูง 30 ซม. บรรจุน้ำได้กี่ลูกบาศก์เซนติเมตร?',
    'A rectangular tank is 50 cm long, 40 cm wide, and 30 cm tall. How many cm³ of water can it hold?',
    [['6,000 ซม.³','6,000 cm³'],['12,000 ซม.³','12,000 cm³'],['60,000 ซม.³','60,000 cm³'],['120,000 ซม.³','120,000 cm³']],
    2, 'subtopic:volume-cuboid', 'skill:word-problem', 2),

  Q('ห้องยาว 5 เมตร กว้าง 4 เมตร สูง 3 เมตร มีปริมาตรห้องเท่าไร?',
    'A room is 5 m long, 4 m wide, and 3 m tall. What is the volume of the room?',
    [['12 ลบ.ม.','12 m³'],['20 ลบ.ม.','20 m³'],['60 ลบ.ม.','60 m³'],['120 ลบ.ม.','120 m³']],
    2, 'subtopic:volume-cuboid', 'skill:word-problem', 1),

];

async function main() {
  let count = 0;
  for (const q of questions) {
    await prisma.question.create({ data: q });
    count++;
  }
  console.log(`✅ สร้างข้อสอบ ${count} ข้อ (topic:area-volume, p6)`);

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
