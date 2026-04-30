require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── subtopic → หลาย topic (ที่ inherently ข้ามหัวข้อ) ───────────────────────
const SUB_TO_TOPICS = {
  // single-topic
  'subtopic:order-of-operations-basic': ['topic:order-of-operations'],
  'subtopic:sequence-pattern':          ['topic:whole-numbers'],
  'subtopic:number-patterns':           ['topic:whole-numbers'],
  'subtopic:patterns':                  ['topic:whole-numbers'],
  'subtopic:lcm-gcd':                   ['topic:whole-numbers'],
  'subtopic:gcf':                       ['topic:whole-numbers'],
  'subtopic:combinatorics':             ['topic:whole-numbers'],
  'subtopic:number-properties':         ['topic:whole-numbers'],
  'subtopic:number-theory':             ['topic:whole-numbers'],
  'subtopic:algebra':                   ['topic:whole-numbers'],
  'subtopic:numbers-operations':        ['topic:whole-numbers'],
  'subtopic:whole-numbers':             ['topic:whole-numbers'],
  'subtopic:divisibility':              ['topic:whole-numbers'],
  'subtopic:prime-factorization':       ['topic:whole-numbers'],
  'subtopic:numerical-computation':     ['topic:whole-numbers'],
  'subtopic:data-interpretation':       ['topic:statistics'],
  'subtopic:statistics':                ['topic:statistics'],
  'subtopic:percentage':                ['topic:percentage'],
  'subtopic:ratio-proportion':          ['topic:ratio'],
  'subtopic:clocks-time':               ['topic:measurement', 'topic:whole-numbers'],
  'subtopic:fraction-word-problem':     ['topic:fractions'],
  // multi-topic inherent
  'subtopic:angles':                    ['topic:geometry'],
  'subtopic:parallel-lines-angles':     ['topic:geometry'],
  'subtopic:triangles-similar':         ['topic:geometry', 'topic:ratio'],
  'subtopic:geometry-perimeter':        ['topic:geometry', 'topic:measurement'],
  'subtopic:circles-angles':            ['topic:geometry'],
  'subtopic:circles-circumference':     ['topic:geometry', 'topic:measurement'],
  'subtopic:circles-area':              ['topic:geometry', 'topic:area-volume'],
  'subtopic:counting-shapes':           ['topic:geometry', 'topic:whole-numbers'],
  'subtopic:geometry-area':             ['topic:geometry', 'topic:area-volume'],
  'subtopic:geometry-3d':               ['topic:geometry', 'topic:area-volume'],
  'subtopic:area-square':               ['topic:geometry', 'topic:area-volume'],
  'subtopic:pie-chart':                 ['topic:statistics', 'topic:percentage'],
  'subtopic:math-olympiad-mixed':       ['topic:whole-numbers'],
  // refined word-problem subtopics (จะ assign ใหม่ด้านล่าง)
  'subtopic:ratio-word-problem':        ['topic:ratio', 'topic:whole-numbers'],
  'subtopic:fraction-sharing':          ['topic:fractions'],
  'subtopic:percentage-comparison':     ['topic:percentage', 'topic:ratio'],
  'subtopic:profit-loss':               ['topic:ratio', 'topic:percentage'],
  'subtopic:combinatorics-counting':    ['topic:whole-numbers'],
  'subtopic:time-scheduling':           ['topic:measurement', 'topic:whole-numbers'],
  'subtopic:currency-exchange':         ['topic:ratio', 'topic:decimals'],
  'subtopic:whole-number-algebra':      ['topic:whole-numbers'],
  'subtopic:number-palindrome':         ['topic:whole-numbers'],
  'subtopic:pattern-arithmetic':        ['topic:whole-numbers'],
  'subtopic:fraction-ratio-scaling':    ['topic:fractions', 'topic:ratio'],
  'subtopic:ratio-profit':              ['topic:ratio', 'topic:percentage'],
  'subtopic:fraction-algebra':          ['topic:fractions'],
};

// ── subtopicTh (Thai) → topics ────────────────────────────────────────────────
const SUBTH_TO_TOPICS = {
  'อัตราส่วนและร้อยละ':      ['topic:ratio', 'topic:percentage'],
  'พื้นที่ผิวและปริมาตร':    ['topic:area-volume', 'topic:geometry'],
  'จำนวนและการดำเนินการ':    ['topic:whole-numbers'],
  'การนับและความน่าจะเป็น':  ['topic:whole-numbers'],
  'พื้นที่':                  ['topic:area-volume', 'topic:geometry'],
  'สถิติและข้อมูล':           ['topic:statistics'],
};

// ── keyword → topic เพิ่มเติมจากเนื้อหา ──────────────────────────────────────
// หมายเหตุ: ตั้งใจ conservative — เพิ่มเฉพาะที่ concept นั้น "จำเป็น" จริงๆ
const TEXT_TOPIC_KEYWORDS = [
  { kw: ['ร้อยละ', 'เปอร์เซ็นต์', '%'],                       topic: 'topic:percentage' },
  { kw: ['อัตราส่วน', 'สัดส่วน'],                              topic: 'topic:ratio' },
  { kw: ['เศษส่วน', '/'],                                       topic: 'topic:fractions' },
  { kw: ['ทศนิยม'],                                             topic: 'topic:decimals' },
  { kw: ['พื้นที่', 'ปริมาตร', 'พื้นผิว'],                     topic: 'topic:area-volume' },
  { kw: ['สามเหลี่ยม', 'วงกลม', 'สี่เหลี่ยม', 'มุม', 'เส้นตรง', 'รูปทรง'], topic: 'topic:geometry' },
  // สถิติ: ต้องมีคำเฉพาะ ไม่รวม "ตาราง" (ตารางเซนติเมตร = หน่วยพื้นที่ ไม่ใช่ข้อมูล)
  { kw: ['ค่าเฉลี่ย', 'แผนภูมิ', 'ฐานนิยม', 'มัธยฐาน', 'สถิติ'], topic: 'topic:statistics' },
  // measurement: เฉพาะโจทย์เวลา/อัตราเร็ว/แปลงหน่วยจริงๆ ไม่รวมหน่วยทั่วไป (เมตร/กรัม)
  { kw: ['ชั่วโมง', 'นาที', 'วินาที', 'โซนเวลา', 'อัตราเร็ว'], topic: 'topic:measurement' },
];

function getTopicsFromText(text) {
  const found = new Set();
  for (const { kw, topic } of TEXT_TOPIC_KEYWORDS) {
    if (kw.some(k => text.includes(k))) found.add(topic);
  }
  return [...found];
}

// ── refined subtopic สำหรับ "subtopic:word-problem" แต่ละข้อ ────────────────
// key = `${source}|${questionNo}`
const WORD_PROBLEM_REFINED = {
  'ipst-p6-2557|006': 'subtopic:ratio-word-problem',    // 5/3 เท่าของหญิง
  'ipst-p6-2554|008': 'subtopic:fraction-ratio-scaling',// สูตรขนมเค้ก
  'ipst-p6-2557|030': 'subtopic:combinatorics-counting', // ชุดเสื้อผ้า
  'ipst-p6-2557|026': 'subtopic:percentage-comparison',  // 60%, 75%
  'ipst-p6-2557|009': 'subtopic:profit-loss',            // ขายไอศกรีม
  'ipst-p6-2554|004': 'subtopic:ratio-profit',           // ลูกชิ้น 2 ร้าน
  'ipst-p6-2554|011': 'subtopic:fraction-algebra',       // วิตามินซี 3×
  'ipst-p6-2557|005': 'subtopic:whole-number-algebra',   // เลือกตั้ง
  'ipst-p6-2555|014': 'subtopic:whole-number-algebra',   // ค่าโดยสาร
  'ipst-p6-2555|018': 'subtopic:fraction-sharing',       // ลูกกอม เศษส่วน
  'ipst-p6-2557|007': 'subtopic:whole-number-algebra',   // ลูกปัดสร้อย
  'ipst-p6-2554|009': 'subtopic:time-scheduling',        // เปิดเพลง 2 ชั่วโมง
  'ipst-p6-2556|039': 'subtopic:whole-number-algebra',   // เงินทอนเหรียญ
  'ipst-p6-2556|012': 'subtopic:currency-exchange',      // แลกเงินวอน
  'ipst-p6-2556|017': 'subtopic:whole-number-algebra',   // เหรียญ 5 บ. 10 บ.
  'ipst-p6-2556|031': 'subtopic:percentage-comparison',  // 20% บ้านหมู่ 3
  'ipst-p6-2555|013': 'subtopic:ratio-word-problem',     // ส้มหญิง/ชาย
  'ipst-p6-2556|015': 'subtopic:pattern-arithmetic',     // ชาลี+ริสาหยอดกระปุก
  'ipst-p6-2557|008': 'subtopic:number-palindrome',      // พาลินโดรม
  'ipst-p6-2557|010': 'subtopic:whole-number-algebra',   // เหรียญ 1 บ. 5 บ. 10 บ.
  'ipst-p6-2556|010': 'subtopic:whole-number-algebra',   // เงิน 3 คน
};

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  const qs = await prisma.question.findMany({
    where: { needsReview: false },
    select: { id: true, source: true, textTh: true, attributes: true }
  });

  let updated = 0;
  for (const q of qs) {
    const a = q.attributes || {};
    const text = q.textTh || '';
    const subs = Array.isArray(a.subtopic) ? a.subtopic : [];
    const subTh = a.subtopicTh || '';
    const qKey = `${q.source}|${a.questionNo}`;

    // 1. refine subtopic ถ้าเป็น generic word-problem
    let newSubs = [...subs];
    if (subs.includes('subtopic:word-problem')) {
      const refined = WORD_PROBLEM_REFINED[qKey];
      if (refined) newSubs = [refined];
    }

    // 2. หา topics จาก subtopic mapping
    const topicSet = new Set();

    for (const s of newSubs) {
      const mapped = SUB_TO_TOPICS[s];
      if (mapped) mapped.forEach(t => topicSet.add(t));
      else {
        // partial match fallback
        if (s.includes('geometry') || s.includes('angles') || s.includes('triangles')) topicSet.add('topic:geometry');
        if (s.includes('area') || s.includes('volume')) topicSet.add('topic:area-volume');
        if (s.includes('ratio') || s.includes('proportion')) topicSet.add('topic:ratio');
        if (s.includes('percent')) topicSet.add('topic:percentage');
        if (s.includes('fraction')) topicSet.add('topic:fractions');
        if (s.includes('decimal')) topicSet.add('topic:decimals');
        if (s.includes('statistic') || s.includes('chart') || s.includes('data')) topicSet.add('topic:statistics');
        if (s.includes('measurement') || s.includes('clocks') || s.includes('time')) topicSet.add('topic:measurement');
        if (s.includes('order-of-operations')) topicSet.add('topic:order-of-operations');
        if (topicSet.size === 0) topicSet.add('topic:whole-numbers');
      }
    }

    // subtopicTh
    if (topicSet.size === 0 && subTh) {
      for (const [th, topics] of Object.entries(SUBTH_TO_TOPICS)) {
        if (subTh.includes(th)) { topics.forEach(t => topicSet.add(t)); break; }
      }
    }
    if (topicSet.size === 0) topicSet.add('topic:whole-numbers');

    // 3. เพิ่ม topics จาก keyword ในเนื้อหา (ถ้าไม่มีอยู่แล้ว)
    const fromText = getTopicsFromText(text);
    fromText.forEach(t => topicSet.add(t));

    // 4. limit: ไม่เกิน 3 topic (เอาที่เจาะจงที่สุดก่อน)
    const PRIORITY = [
      'topic:fractions','topic:decimals','topic:percentage','topic:ratio',
      'topic:statistics','topic:measurement','topic:geometry','topic:area-volume',
      'topic:order-of-operations','topic:whole-numbers',
    ];
    let topics = [...topicSet].sort((a, b) => PRIORITY.indexOf(a) - PRIORITY.indexOf(b));
    if (topics.length > 3) topics = topics.slice(0, 3);

    // 5. อัปเดต
    await prisma.question.update({
      where: { id: q.id },
      data: { attributes: { ...a, subtopic: newSubs, topic: topics } }
    });
    updated++;
    if (updated % 20 === 0) process.stdout.write('.');
  }
  console.log('\nUpdated:', updated);

  // ── สรุป ──
  const result = await prisma.question.findMany({
    where: { needsReview: false }, select: { attributes: true }
  });
  const topicC = {};
  result.forEach(q => {
    (q.attributes?.topic || []).forEach(t => { topicC[t] = (topicC[t]||0)+1; });
  });
  console.log('\n=== Topic (multi-assigned) ===');
  Object.entries(topicC).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(' ',k,':',v));

  // ตัวอย่างข้อที่มีหลาย topic
  const multi = result.filter(q => (q.attributes?.topic||[]).length > 1).length;
  console.log('\nQuestions with 2+ topics:', multi);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
