/**
 * fill-skill-trap.js
 * Auto-fill skill[] และ trap[] ใน attributes ของ practice-gen / practice-mock-gen questions
 * จาก source name pattern เช่น "practice-gen-p6-fractions-word-problem"
 *
 * รัน: node server/scripts/fill-skill-trap.js [--dry-run]
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes('--dry-run');

// ────────────────────────────────────────────────────────────────────────────────
// Mapping: suffix pattern → { skill[], trap[] }
// key = ส่วนหลัง p4/p5/p6 ของ source name เช่น "fractions-word-problem"
// ────────────────────────────────────────────────────────────────────────────────
const SUFFIX_MAP = {
  // ── Whole Numbers ──
  'whole-numbers-add':        { skill: ['skill:arithmetic'],                          trap: ['trap:sign-error'] },
  'whole-numbers-subtract':   { skill: ['skill:arithmetic'],                          trap: ['trap:sign-error'] },
  'whole-numbers-multiply':   { skill: ['skill:arithmetic'],                          trap: ['trap:rounding'] },
  'whole-numbers-divide':     { skill: ['skill:arithmetic'],                          trap: ['trap:rounding', 'trap:wrong-unit'] },
  'whole-numbers-compare':    { skill: ['skill:number-sense'],                        trap: ['trap:misread'] },
  'whole-numbers-read-write': { skill: ['skill:number-sense'],                        trap: ['trap:misread'] },
  'whole-numbers-word-problem':{ skill: ['skill:word-problem', 'skill:multi-step'],   trap: ['trap:misread', 'trap:partial-answer'] },

  // ── BODMAS ──
  'bodmas-basic':             { skill: ['skill:arithmetic'],                          trap: ['trap:order-of-operations'] },
  'bodmas-brackets':          { skill: ['skill:arithmetic'],                          trap: ['trap:order-of-operations'] },
  'bodmas-mixed':             { skill: ['skill:arithmetic', 'skill:multi-step'],      trap: ['trap:order-of-operations'] },
  'bodmas-word-problem':      { skill: ['skill:word-problem', 'skill:multi-step'],    trap: ['trap:misread', 'trap:order-of-operations'] },

  // ── Fractions ──
  'fractions-add-like':       { skill: ['skill:arithmetic'],                          trap: ['trap:rounding'] },
  'fractions-add-unlike':     { skill: ['skill:arithmetic'],                          trap: ['trap:rounding', 'trap:fraction-invert'] },
  'fractions-subtract':       { skill: ['skill:arithmetic'],                          trap: ['trap:sign-error', 'trap:fraction-invert'] },
  'fractions-multiply':       { skill: ['skill:arithmetic'],                          trap: ['trap:fraction-invert'] },
  'fractions-divide':         { skill: ['skill:arithmetic'],                          trap: ['trap:fraction-invert'] },
  'fractions-compare':        { skill: ['skill:fraction-sense', 'skill:number-sense'],trap: ['trap:misread'] },
  'fractions-concept':        { skill: ['skill:fraction-sense'],                      trap: ['trap:misread'] },
  'fractions-mixed':          { skill: ['skill:arithmetic', 'skill:multi-step'],      trap: ['trap:fraction-invert', 'trap:partial-answer'] },
  'fractions-word-problem':   { skill: ['skill:word-problem', 'skill:multi-step'],    trap: ['trap:misread', 'trap:partial-answer'] },

  // ── Decimals ──
  'decimals-add':             { skill: ['skill:arithmetic'],                          trap: ['trap:rounding'] },
  'decimals-subtract':        { skill: ['skill:arithmetic'],                          trap: ['trap:sign-error', 'trap:rounding'] },
  'decimals-multiply':        { skill: ['skill:arithmetic'],                          trap: ['trap:rounding'] },
  'decimals-divide':          { skill: ['skill:arithmetic'],                          trap: ['trap:rounding', 'trap:wrong-unit'] },
  'decimals-compare':         { skill: ['skill:number-sense'],                        trap: ['trap:misread'] },
  'decimals-concept':         { skill: ['skill:number-sense'],                        trap: ['trap:misread'] },
  'decimals-convert':         { skill: ['skill:unit-conversion'],                     trap: ['trap:wrong-unit'] },
  'decimals-word-problem':    { skill: ['skill:word-problem', 'skill:multi-step'],    trap: ['trap:misread', 'trap:rounding'] },

  // ── Percentage ──
  'percentage-concept':       { skill: ['skill:number-sense'],                        trap: ['trap:misread'] },
  'percentage-convert':       { skill: ['skill:unit-conversion'],                     trap: ['trap:wrong-unit'] },
  'percentage-of-amount':     { skill: ['skill:arithmetic', 'skill:multi-step'],      trap: ['trap:rounding'] },
  'percentage-word-problem':  { skill: ['skill:word-problem', 'skill:multi-step'],    trap: ['trap:misread', 'trap:rounding'] },

  // ── Ratio ──
  'ratio-concept':            { skill: ['skill:number-sense'],                        trap: ['trap:misread'] },
  'ratio-simplify':           { skill: ['skill:arithmetic'],                          trap: ['trap:rounding'] },
  'ratio-proportion':         { skill: ['skill:multi-step'],                          trap: ['trap:misread'] },
  'ratio-word-problem':       { skill: ['skill:word-problem', 'skill:multi-step'],    trap: ['trap:misread'] },

  // ── Area / Volume ──
  'area-rectangle':           { skill: ['skill:formula'],                             trap: ['trap:wrong-unit', 'trap:wrong-formula'] },
  'area-triangle':            { skill: ['skill:formula'],                             trap: ['trap:wrong-unit', 'trap:wrong-formula'] },
  'area-parallelogram':       { skill: ['skill:formula'],                             trap: ['trap:wrong-unit', 'trap:wrong-formula'] },
  'area-trapezoid':           { skill: ['skill:formula'],                             trap: ['trap:wrong-unit', 'trap:wrong-formula'] },
  'area-circle':              { skill: ['skill:formula'],                             trap: ['trap:wrong-unit', 'trap:wrong-formula'] },
  'area-combined':            { skill: ['skill:formula', 'skill:multi-step'],         trap: ['trap:wrong-unit', 'trap:partial-answer'] },
  'area-word-problem':        { skill: ['skill:formula', 'skill:word-problem'],       trap: ['trap:wrong-unit', 'trap:misread'] },
  'volume-cuboid':            { skill: ['skill:formula'],                             trap: ['trap:wrong-unit', 'trap:wrong-formula'] },

  // ── Measurement ──
  'measurement-length':       { skill: ['skill:unit-conversion'],                     trap: ['trap:wrong-unit'] },
  'measurement-weight':       { skill: ['skill:unit-conversion'],                     trap: ['trap:wrong-unit'] },
  'measurement-liquid':       { skill: ['skill:unit-conversion'],                     trap: ['trap:wrong-unit'] },
  'measurement-time':         { skill: ['skill:unit-conversion'],                     trap: ['trap:wrong-unit'] },
  'measurement-convert':      { skill: ['skill:unit-conversion'],                     trap: ['trap:wrong-unit'] },
  'measurement-word-problem': { skill: ['skill:unit-conversion', 'skill:word-problem'], trap: ['trap:wrong-unit', 'trap:misread'] },

  // ── Geometry ──
  'geometry-angle':           { skill: ['skill:visual-spatial'],                      trap: ['trap:misread'] },
  'geometry-triangle':        { skill: ['skill:visual-spatial'],                      trap: ['trap:misread'] },
  'geometry-quadrilateral':   { skill: ['skill:visual-spatial'],                      trap: ['trap:misread'] },
  'geometry-circle':          { skill: ['skill:formula', 'skill:visual-spatial'],     trap: ['trap:wrong-formula'] },
  'geometry-shapes':          { skill: ['skill:visual-spatial'],                      trap: ['trap:misread'] },
  'geometry-coordinate':      { skill: ['skill:visual-spatial'],                      trap: ['trap:misread'] },
  'geometry-symmetry':        { skill: ['skill:visual-spatial', 'skill:pattern-recognition'], trap: ['trap:misread'] },

  // ── Statistics ──
  'statistics-bar-chart':     { skill: ['skill:reading-graph'],                       trap: ['trap:misread'] },
  'statistics-line-chart':    { skill: ['skill:reading-graph'],                       trap: ['trap:misread'] },
  'statistics-pie-chart':     { skill: ['skill:reading-graph'],                       trap: ['trap:misread'] },
  'statistics-read-chart':    { skill: ['skill:reading-graph'],                       trap: ['trap:misread'] },
  'statistics-read-table':    { skill: ['skill:reading-graph'],                       trap: ['trap:misread'] },
  'statistics-mean':          { skill: ['skill:arithmetic'],                          trap: ['trap:partial-answer'] },
  'statistics-word-problem':  { skill: ['skill:reading-graph', 'skill:word-problem'], trap: ['trap:misread', 'trap:partial-answer'] },
};

// ────────────────────────────────────────────────────────────────────────────────
// ดึง suffix จาก source name
// "practice-gen-p6-fractions-word-problem" → "fractions-word-problem"
// "practice-mock-gen-p5-bodmas-basic"      → "bodmas-basic"
// ────────────────────────────────────────────────────────────────────────────────
function getSuffix(source) {
  // ตัด prefix practice-[mock-]gen-pX-
  const m = source.match(/^practice-(?:mock-)?gen-p\d+-(.+)$/);
  return m ? m[1] : null;
}

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN mode — ไม่ได้ update จริง\n' : '🚀 UPDATE mode\n');

  // โหลดเฉพาะ practice-gen / practice-mock-gen ที่ยังไม่มี skill
  const questions = await prisma.question.findMany({
    where: {
      source: { startsWith: 'practice-' },
    },
    select: { id: true, source: true, attributes: true }
  });

  // จัดกลุ่มตาม source
  const bySuffix = {};
  const unmapped = new Set();

  for (const q of questions) {
    const suffix = getSuffix(q.source);
    if (!suffix) continue;
    const mapping = SUFFIX_MAP[suffix];
    if (!mapping) { unmapped.add(q.source); continue; }
    if (!bySuffix[suffix]) bySuffix[suffix] = { ids: [], mapping };
    bySuffix[suffix].ids.push(q.id);
  }

  // สรุปก่อน update
  console.log('=== สรุป mapping ===');
  let totalToUpdate = 0;
  for (const [suffix, { ids, mapping }] of Object.entries(bySuffix).sort()) {
    console.log(`  ${suffix.padEnd(35)} → ${ids.length} ข้อ | skill: ${mapping.skill.join(', ')} | trap: ${mapping.trap.join(', ')}`);
    totalToUpdate += ids.length;
  }
  console.log(`\nรวมจะ update: ${totalToUpdate} ข้อ`);

  if (unmapped.size) {
    console.log(`\n⚠️  source ที่ไม่มี mapping (${unmapped.size} sources):`)
    for (const s of [...unmapped].slice(0, 20)) console.log('  ', s);
    if (unmapped.size > 20) console.log(`  ...และอีก ${unmapped.size - 20} sources`);
  }

  if (DRY_RUN) { console.log('\n✅ Dry run สำเร็จ — ไม่มีการแก้ไข DB'); await prisma.$disconnect(); return; }

  // ── Update จริง ────────────────────────────────────────────────────────────
  console.log('\n🔄 กำลัง update...');
  let updated = 0;
  const BATCH = 500;

  for (const [suffix, { ids, mapping }] of Object.entries(bySuffix)) {
    // update ทีละ BATCH เพื่อไม่ให้ query ใหญ่เกิน
    for (let i = 0; i < ids.length; i += BATCH) {
      const batch = ids.slice(i, i + BATCH);
      // ต้อง update ทีละ record เพราะต้อง merge attributes (Json field)
      // ใช้ $transaction เพื่อประสิทธิภาพ
      await prisma.$transaction(
        batch.map(id => {
          // ดึง attributes เดิมจาก questions ที่โหลดมา
          const q = questions.find(x => x.id === id);
          const oldAttr = (q?.attributes || {});
          const newAttr = { ...oldAttr, skill: mapping.skill, trap: mapping.trap };
          return prisma.question.update({ where: { id }, data: { attributes: newAttr } });
        })
      );
      updated += batch.length;
      process.stdout.write(`\r  updated ${updated}/${totalToUpdate}...`);
    }
  }

  console.log(`\n\n✅ update สำเร็จ ${updated} ข้อ`);
  await prisma.$disconnect();
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
