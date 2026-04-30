require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SUB_TO_TOPIC = {
  'subtopic:angles':                    'topic:geometry',
  'subtopic:parallel-lines-angles':     'topic:geometry',
  'subtopic:triangles-similar':         'topic:geometry',
  'subtopic:geometry-perimeter':        'topic:geometry',
  'subtopic:circles-angles':            'topic:geometry',
  'subtopic:circles-circumference':     'topic:geometry',
  'subtopic:counting-shapes':           'topic:geometry',
  'subtopic:geometry-area':             'topic:area-volume',
  'subtopic:geometry-3d':              'topic:area-volume',
  'subtopic:circles-area':             'topic:area-volume',
  'subtopic:area-square':              'topic:area-volume',
  'subtopic:ratio-proportion':         'topic:ratio',
  'subtopic:percentage':               'topic:percentage',
  'subtopic:fraction-word-problem':    'topic:fractions',
  'subtopic:statistics':               'topic:statistics',
  'subtopic:data-interpretation':      'topic:statistics',
  'subtopic:pie-chart':                'topic:statistics',
  'subtopic:clocks-time':              'topic:measurement',
  'subtopic:order-of-operations-basic': 'topic:order-of-operations',
  'subtopic:lcm-gcd':                  'topic:whole-numbers',
  'subtopic:gcf':                      'topic:whole-numbers',
  'subtopic:combinatorics':            'topic:whole-numbers',
  'subtopic:number-properties':        'topic:whole-numbers',
  'subtopic:number-theory':            'topic:whole-numbers',
  'subtopic:patterns':                 'topic:whole-numbers',
  'subtopic:sequence-pattern':         'topic:whole-numbers',
  'subtopic:number-patterns':          'topic:whole-numbers',
  'subtopic:algebra':                  'topic:whole-numbers',
  'subtopic:numbers-operations':       'topic:whole-numbers',
  'subtopic:whole-numbers':            'topic:whole-numbers',
  'subtopic:divisibility':             'topic:whole-numbers',
  'subtopic:prime-factorization':      'topic:whole-numbers',
  'subtopic:numerical-computation':    'topic:whole-numbers',
  'subtopic:word-problem':             'topic:whole-numbers',
  'subtopic:math-olympiad-mixed':      'topic:whole-numbers',
};

const SUBTH_TO_TOPIC = {
  'อัตราส่วนและร้อยละ':      'topic:ratio',
  'พื้นที่ผิวและปริมาตร':    'topic:area-volume',
  'จำนวนและการดำเนินการ':    'topic:whole-numbers',
  'การนับและความน่าจะเป็น':  'topic:whole-numbers',
  'พื้นที่':                  'topic:area-volume',
  'สถิติและข้อมูล':           'topic:statistics',
};

function extractYear(source) {
  const m = (source || '').match(/(\d{4})$/);
  return m ? m[1] : null;
}

function getValidTopic(attrs) {
  const subs = Array.isArray(attrs.subtopic) ? attrs.subtopic : [];
  const subTh = attrs.subtopicTh || '';

  for (const s of subs) {
    if (SUB_TO_TOPIC[s]) return SUB_TO_TOPIC[s];
    if (s.includes('geometry') || s.includes('angles') || s.includes('triangles')) return 'topic:geometry';
    if (s.includes('area') || s.includes('volume') || s.includes('3d')) return 'topic:area-volume';
    if (s.includes('ratio') || s.includes('proportion')) return 'topic:ratio';
    if (s.includes('percent')) return 'topic:percentage';
    if (s.includes('fraction')) return 'topic:fractions';
    if (s.includes('decimal')) return 'topic:decimals';
    if (s.includes('statistic') || s.includes('chart') || s.includes('data')) return 'topic:statistics';
    if (s.includes('measurement') || s.includes('clock')) return 'topic:measurement';
    if (s.includes('order-of-operations')) return 'topic:order-of-operations';
  }

  for (const [th, topic] of Object.entries(SUBTH_TO_TOPIC)) {
    if (subTh.includes(th)) return topic;
  }

  return 'topic:whole-numbers';
}

function getSkills(attrs, hasImage, textTh) {
  const subs = (Array.isArray(attrs.subtopic) ? attrs.subtopic : []).join(' ');
  const subTh = attrs.subtopicTh || '';
  const topic = getValidTopic(attrs);
  const text = textTh || '';

  const s = new Set(['skill:multi-step']);

  if (subs.includes('word-problem') || subs.includes('ratio') || subs.includes('percentage') ||
      subTh.includes('อัตราส่วน') || subTh.includes('ร้อยละ') || text.length > 80) {
    s.add('skill:word-problem');
  }

  if (subs.includes('pattern') || subs.includes('sequence') || subs.includes('combinatorics')) {
    s.add('skill:pattern');
  }

  if (topic === 'topic:area-volume' || topic === 'topic:geometry' ||
      subs.includes('area') || subs.includes('circles') || subs.includes('triangles') ||
      subTh.includes('พื้นที่')) {
    s.add('skill:formula');
  }

  if (hasImage || topic === 'topic:geometry' || subs.includes('angles') ||
      subs.includes('counting-shapes') || subs.includes('parallel') ||
      subs.includes('triangles') || subs.includes('circles-area') || subs.includes('area-square')) {
    s.add('skill:visual-reasoning');
  }

  if (subs.includes('clocks') || subs.includes('measurement') || subTh.includes('หน่วย')) {
    s.add('skill:conversion');
  }

  if (subs.includes('order-of-operations') || subs.includes('numerical-computation')) {
    s.add('skill:arithmetic');
  }

  return [...s];
}

function getTraps(attrs, textTh) {
  const subs = (Array.isArray(attrs.subtopic) ? attrs.subtopic : []).join(' ');
  const subTh = attrs.subtopicTh || '';
  const topic = getValidTopic(attrs);
  const text = textTh || '';

  const t = new Set(['trap:partial-answer']);

  if (topic === 'topic:area-volume' || topic === 'topic:measurement' ||
      subs.includes('geometry-3d') || subTh.includes('พื้นที่') || subTh.includes('ปริมาตร') ||
      subs.includes('clocks')) {
    t.add('trap:wrong-unit');
  }

  if (topic === 'topic:statistics' || subs.includes('pie-chart') ||
      subs.includes('data') || text.length > 150) {
    t.add('trap:misread');
  }

  if (topic === 'topic:fractions' || subs.includes('fraction') ||
      subs.includes('sequence-pattern')) {
    t.add('trap:rounding');
  }

  if (topic === 'topic:order-of-operations' || subs.includes('order-of-operations')) {
    t.add('trap:misorder');
  }

  if (subs.includes('lcm-gcd') || subs.includes('gcf') || subs.includes('prime') ||
      subs.includes('divisibility') || subs.includes('number-theory')) {
    t.add('trap:sign-error');
  }

  return [...t];
}

async function main() {
  const qs = await prisma.question.findMany({
    where: { needsReview: false },
    select: { id: true, source: true, image: true, textTh: true, attributes: true }
  });

  let updated = 0;
  for (const q of qs) {
    const a = q.attributes || {};
    const newAttr = {
      ...a,
      year:    extractYear(q.source),
      topic:   [getValidTopic(a)],
      skill:   getSkills(a, !!q.image, q.textTh),
      trap:    getTraps(a, q.textTh),
      subject: 'math',
    };

    await prisma.question.update({ where: { id: q.id }, data: { attributes: newAttr } });
    updated++;
    if (updated % 20 === 0) process.stdout.write('.');
  }

  console.log('\nUpdated:', updated);

  const result = await prisma.question.findMany({
    where: { needsReview: false }, select: { attributes: true }
  });
  const topicC = {}, skillC = {}, trapC = {};
  result.forEach(q => {
    const a = q.attributes || {};
    (a.topic||[]).forEach(t => { topicC[t] = (topicC[t]||0)+1; });
    (a.skill||[]).forEach(s => { skillC[s] = (skillC[s]||0)+1; });
    (a.trap||[]).forEach(t  => { trapC[t]  = (trapC[t]||0)+1; });
  });

  console.log('\n=== Topic ===');
  Object.entries(topicC).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(' ',k,v));
  console.log('\n=== Skill ===');
  Object.entries(skillC).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(' ',k,v));
  console.log('\n=== Trap ===');
  Object.entries(trapC).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(' ',k,v));
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
