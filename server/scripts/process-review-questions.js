require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── subtopic → หลาย topic ─────────────────────────────────────────────────────
const SUB_TO_TOPICS = {
  // geometry
  'subtopic:angles':                    ['topic:geometry'],
  'subtopic:parallel-lines-angles':     ['topic:geometry'],
  'subtopic:triangles-similar':         ['topic:geometry', 'topic:ratio'],
  'subtopic:geometry-perimeter':        ['topic:geometry', 'topic:measurement'],
  'subtopic:circles-angles':            ['topic:geometry'],
  'subtopic:circles-circumference':     ['topic:geometry', 'topic:measurement'],
  'subtopic:circles-area':              ['topic:geometry', 'topic:area-volume'],
  'subtopic:circles-chords':            ['topic:geometry'],
  'subtopic:counting-shapes':           ['topic:geometry', 'topic:whole-numbers'],
  'subtopic:spatial-reasoning':         ['topic:geometry', 'topic:whole-numbers'],
  // area/volume
  'subtopic:geometry-area':             ['topic:geometry', 'topic:area-volume'],
  'subtopic:geometry-3d':               ['topic:geometry', 'topic:area-volume'],
  'subtopic:area-square':               ['topic:geometry', 'topic:area-volume'],
  'subtopic:area-circle':               ['topic:geometry', 'topic:area-volume'],
  // ratio/proportion
  'subtopic:ratio-proportion':          ['topic:ratio'],
  // fractions
  'subtopic:fractions':                 ['topic:fractions'],
  'subtopic:fraction-word-problem':     ['topic:fractions'],
  'subtopic:fraction-sharing':          ['topic:fractions'],
  'subtopic:fraction-ratio-scaling':    ['topic:fractions', 'topic:ratio'],
  'subtopic:fraction-algebra':          ['topic:fractions'],
  // percentage
  'subtopic:percentage':                ['topic:percentage'],
  'subtopic:percentage-comparison':     ['topic:percentage', 'topic:ratio'],
  // statistics
  'subtopic:statistics':                ['topic:statistics'],
  'subtopic:data-interpretation':       ['topic:statistics'],
  'subtopic:pie-chart':                 ['topic:statistics', 'topic:percentage'],
  // measurement
  'subtopic:clocks-time':               ['topic:measurement', 'topic:whole-numbers'],
  // order of operations
  'subtopic:order-of-operations-basic': ['topic:order-of-operations'],
  // whole-numbers
  'subtopic:lcm-gcd':                   ['topic:whole-numbers'],
  'subtopic:gcf':                       ['topic:whole-numbers'],
  'subtopic:combinatorics':             ['topic:whole-numbers'],
  'subtopic:number-properties':         ['topic:whole-numbers'],
  'subtopic:number-theory':             ['topic:whole-numbers'],
  'subtopic:patterns':                  ['topic:whole-numbers'],
  'subtopic:sequence-pattern':          ['topic:whole-numbers'],
  'subtopic:number-patterns':           ['topic:whole-numbers'],
  'subtopic:algebra':                   ['topic:whole-numbers'],
  'subtopic:algebraic-operations':      ['topic:whole-numbers'],
  'subtopic:numbers-operations':        ['topic:whole-numbers'],
  'subtopic:whole-numbers':             ['topic:whole-numbers'],
  'subtopic:divisibility':              ['topic:whole-numbers'],
  'subtopic:prime-factorization':       ['topic:whole-numbers'],
  'subtopic:numerical-computation':     ['topic:whole-numbers'],
  'subtopic:word-problem':              ['topic:whole-numbers'],
  'subtopic:math-olympiad-mixed':       ['topic:whole-numbers'],
  'subtopic:logic':                     ['topic:whole-numbers'],
  'subtopic:whole-number-algebra':      ['topic:whole-numbers'],
  'subtopic:combinatorics-counting':    ['topic:whole-numbers'],
  'subtopic:number-palindrome':         ['topic:whole-numbers'],
  'subtopic:pattern-arithmetic':        ['topic:whole-numbers'],
  'subtopic:ratio-word-problem':        ['topic:ratio', 'topic:whole-numbers'],
  'subtopic:profit-loss':               ['topic:ratio', 'topic:percentage'],
  'subtopic:ratio-profit':              ['topic:ratio', 'topic:percentage'],
  'subtopic:currency-exchange':         ['topic:ratio', 'topic:decimals'],
  'subtopic:time-scheduling':           ['topic:measurement', 'topic:whole-numbers'],
};

const SUBTH_TO_TOPICS = {
  'อัตราส่วนและร้อยละ':      ['topic:ratio', 'topic:percentage'],
  'พื้นที่ผิวและปริมาตร':    ['topic:area-volume', 'topic:geometry'],
  'จำนวนและการดำเนินการ':    ['topic:whole-numbers'],
  'การนับและความน่าจะเป็น':  ['topic:whole-numbers'],
  'พื้นที่':                  ['topic:area-volume', 'topic:geometry'],
  'สถิติและข้อมูล':           ['topic:statistics'],
};

const TEXT_TOPIC_KEYWORDS = [
  { kw: ['ร้อยละ', 'เปอร์เซ็นต์', '%'],                        topic: 'topic:percentage' },
  { kw: ['อัตราส่วน', 'สัดส่วน'],                               topic: 'topic:ratio' },
  { kw: ['เศษส่วน', '/'],                                        topic: 'topic:fractions' },
  { kw: ['ทศนิยม'],                                              topic: 'topic:decimals' },
  { kw: ['พื้นที่', 'ปริมาตร', 'พื้นผิว'],                      topic: 'topic:area-volume' },
  { kw: ['สามเหลี่ยม', 'วงกลม', 'สี่เหลี่ยม', 'มุม', 'เส้นตรง', 'รูปทรง'], topic: 'topic:geometry' },
  { kw: ['ค่าเฉลี่ย', 'แผนภูมิ', 'ฐานนิยม', 'มัธยฐาน', 'สถิติ'], topic: 'topic:statistics' },
  { kw: ['ชั่วโมง', 'นาที', 'วินาที', 'โซนเวลา', 'อัตราเร็ว'],  topic: 'topic:measurement' },
];

const PRIORITY = [
  'topic:fractions', 'topic:decimals', 'topic:percentage', 'topic:ratio',
  'topic:statistics', 'topic:measurement', 'topic:geometry', 'topic:area-volume',
  'topic:order-of-operations', 'topic:whole-numbers',
];

function extractYear(source) {
  const m = (source || '').match(/(\d{4})$/);
  return m ? m[1] : null;
}

function getTopics(attrs, text, isImageOnly) {
  const subs = Array.isArray(attrs.subtopic) ? attrs.subtopic : [];
  const subTh = attrs.subtopicTh || '';
  const topicSet = new Set();

  for (const s of subs) {
    const mapped = SUB_TO_TOPICS[s];
    if (mapped) { mapped.forEach(t => topicSet.add(t)); continue; }
    // fallback partial
    if (s.includes('geometry') || s.includes('angles') || s.includes('triangles') || s.includes('circles')) topicSet.add('topic:geometry');
    if (s.includes('area') || s.includes('volume')) topicSet.add('topic:area-volume');
    if (s.includes('ratio') || s.includes('proportion')) topicSet.add('topic:ratio');
    if (s.includes('percent')) topicSet.add('topic:percentage');
    if (s.includes('fraction')) topicSet.add('topic:fractions');
    if (s.includes('decimal')) topicSet.add('topic:decimals');
    if (s.includes('statistic') || s.includes('chart') || s.includes('data')) topicSet.add('topic:statistics');
    if (s.includes('measurement') || s.includes('clock') || s.includes('time')) topicSet.add('topic:measurement');
    if (s.includes('order-of-operations')) topicSet.add('topic:order-of-operations');
    if (topicSet.size === 0) topicSet.add('topic:whole-numbers');
  }

  if (topicSet.size === 0 && subTh) {
    for (const [th, topics] of Object.entries(SUBTH_TO_TOPICS)) {
      if (subTh.includes(th)) { topics.forEach(t => topicSet.add(t)); break; }
    }
  }
  if (topicSet.size === 0) topicSet.add('topic:whole-numbers');

  // keyword จาก text (เฉพาะข้อที่มีเนื้อหาจริง)
  if (!isImageOnly && text) {
    for (const { kw, topic } of TEXT_TOPIC_KEYWORDS) {
      if (kw.some(k => text.includes(k))) topicSet.add(topic);
    }
  }

  let topics = [...topicSet].sort((a, b) => PRIORITY.indexOf(a) - PRIORITY.indexOf(b));
  if (topics.length > 3) topics = topics.slice(0, 3);
  return topics;
}

function getSkills(attrs, hasImage, isImageOnly, text) {
  const subs = (Array.isArray(attrs.subtopic) ? attrs.subtopic : []).join(' ');
  const subTh = attrs.subtopicTh || '';
  const topics = getTopics(attrs, text, isImageOnly);
  const s = new Set(['skill:multi-step']);

  // visual-reasoning: ข้อที่เป็นรูปภาพ หรือมี geometry/area
  if (hasImage || isImageOnly || topics.includes('topic:geometry') ||
      subs.includes('angles') || subs.includes('circles') || subs.includes('triangles') ||
      subs.includes('counting-shapes') || subs.includes('spatial') || subs.includes('chords')) {
    s.add('skill:visual-reasoning');
  }
  // formula: geometry/area
  if (topics.includes('topic:area-volume') || topics.includes('topic:geometry') ||
      subs.includes('area') || subs.includes('circles') || subs.includes('triangles') ||
      subTh.includes('พื้นที่')) {
    s.add('skill:formula');
  }
  // word-problem: text-based หรือ ratio/percentage
  if (!isImageOnly && (text || '').length > 60) s.add('skill:word-problem');
  if (topics.includes('topic:ratio') || topics.includes('topic:percentage')) s.add('skill:word-problem');
  // pattern
  if (subs.includes('pattern') || subs.includes('sequence') || subs.includes('combinatorics')) {
    s.add('skill:pattern');
  }
  // arithmetic
  if (subs.includes('order-of-operations') || subs.includes('numerical-computation')) {
    s.add('skill:arithmetic');
  }
  // conversion/measurement
  if (subs.includes('clocks') || subs.includes('time-scheduling')) s.add('skill:conversion');

  return [...s];
}

function getTraps(attrs, text, isImageOnly) {
  const subs = (Array.isArray(attrs.subtopic) ? attrs.subtopic : []).join(' ');
  const topics = getTopics(attrs, text, isImageOnly);
  const t = new Set(['trap:partial-answer']);

  if (topics.includes('topic:area-volume') || topics.includes('topic:measurement') ||
      subs.includes('geometry-3d') || subs.includes('perimeter') || subs.includes('circumference')) {
    t.add('trap:wrong-unit');
  }
  if (topics.includes('topic:statistics') || subs.includes('pie-chart') ||
      (!isImageOnly && (text || '').length > 150)) {
    t.add('trap:misread');
  }
  if (topics.includes('topic:fractions') || subs.includes('fraction') || subs.includes('sequence-pattern')) {
    t.add('trap:rounding');
  }
  if (topics.includes('topic:order-of-operations')) t.add('trap:misorder');
  if (subs.includes('lcm-gcd') || subs.includes('gcf') || subs.includes('prime') ||
      subs.includes('divisibility') || subs.includes('number-theory')) {
    t.add('trap:sign-error');
  }

  return [...t];
}

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const qs = await prisma.question.findMany({
    where: { needsReview: true },
    select: { id: true, source: true, image: true, textTh: true, attributes: true }
  });

  console.log('Processing', qs.length, 'needsReview questions...');
  let updated = 0;

  for (const q of qs) {
    const a = q.attributes || {};
    const rawText = q.textTh || '';
    const isImageOnly = rawText === '*' || rawText === '**' || rawText.trim() === '';
    const text = isImageOnly ? '' : rawText;
    const hasImage = !!q.image;

    const topics = getTopics(a, text, isImageOnly);
    const skills = getSkills(a, hasImage, isImageOnly, text);
    const traps  = getTraps(a, text, isImageOnly);

    await prisma.question.update({
      where: { id: q.id },
      data: {
        needsReview: false,
        attributes: {
          ...a,
          year:    extractYear(q.source),
          subject: 'math',
          topic:   topics,
          skill:   skills,
          trap:    traps,
        }
      }
    });
    updated++;
  }

  console.log('Updated + cleared needsReview:', updated);

  // ── ตรวจสอบผล ──
  const remaining = await prisma.question.count({ where: { needsReview: true } });
  console.log('Remaining needsReview:', remaining);

  const total = await prisma.question.count();
  const allQ  = await prisma.question.findMany({ select: { attributes: true } });
  const topicC = {}, skillC = {}, trapC = {};
  allQ.forEach(q => {
    (q.attributes?.topic||[]).forEach(t => { topicC[t]=(topicC[t]||0)+1; });
    (q.attributes?.skill||[]).forEach(s => { skillC[s]=(skillC[s]||0)+1; });
    (q.attributes?.trap||[]).forEach(t  => { trapC[t] =(trapC[t]||0)+1; });
  });
  console.log('\n=== ALL', total, 'questions — Topic ===');
  Object.entries(topicC).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(' ',k,v));
  console.log('\n=== Skill ===');
  Object.entries(skillC).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(' ',k,v));
  console.log('\n=== Trap ===');
  Object.entries(trapC).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(' ',k,v));
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
