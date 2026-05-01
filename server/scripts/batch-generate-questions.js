/**
 * batch-generate-questions.js
 * Generate practice questions for all (or selected) subtopics
 *
 * Usage:
 *   node scripts/batch-generate-questions.js [options]
 *
 * Options:
 *   --grade p6        ชั้นที่จะ generate (default: p6)
 *   --count 20        จำนวนข้อต่อ subtopic (default: 20)
 *   --topic fractions generate เฉพาะ topic นี้ (prefix match)
 *   --dry-run         แสดงรายการแต่ไม่ generate จริง
 *   --force           generate ทับแม้มีอยู่แล้ว
 *   --delay 3000      หน่วง ms ระหว่าง subtopic (default: 2000)
 *
 * Examples:
 *   node scripts/batch-generate-questions.js --grade p6 --count 20
 *   node scripts/batch-generate-questions.js --grade p6 --topic fractions --count 10
 *   node scripts/batch-generate-questions.js --dry-run
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const path = require('path');

const prisma = new PrismaClient();

// ─── Parse args ───────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    grade: 'p6',
    count: 20,
    topic: null,
    dryRun: false,
    force: false,
    delay: 2000,
  };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--grade':  opts.grade = args[++i]; break;
      case '--count':  opts.count = parseInt(args[++i], 10); break;
      case '--topic':  opts.topic = args[++i]; break;
      case '--dry-run': opts.dryRun = true; break;
      case '--force':  opts.force = true; break;
      case '--delay':  opts.delay = parseInt(args[++i], 10); break;
    }
  }
  return opts;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  // โหลด subtopic ทั้งหมดจาก DB
  const where = { type: 'subtopic' };
  if (opts.topic) {
    where.key = { contains: opts.topic };
  }
  const subtopics = await prisma.attributeDictionary.findMany({
    where,
    orderBy: { key: 'asc' },
  });

  console.log(`\n🗂  Batch Generate Practice Questions`);
  console.log(`   grade    : ${opts.grade}`);
  console.log(`   count    : ${opts.count} ข้อ/subtopic`);
  console.log(`   filter   : ${opts.topic ?? '(ทั้งหมด)'}`);
  console.log(`   subtopics: ${subtopics.length} รายการ`);
  console.log(`   dry-run  : ${opts.dryRun}`);
  console.log(`   force    : ${opts.force}`);
  console.log('');

  if (opts.dryRun) {
    console.log('📋 รายการ subtopic ที่จะ generate:');
    subtopics.forEach((s, i) => {
      const source = `practice-gen-${opts.grade}-${s.key.replace('subtopic:', '')}`;
      console.log(`  ${String(i + 1).padStart(2)}. ${s.key.padEnd(45)} ${s.th}`);
    });
    console.log(`\nรวม ${subtopics.length} subtopics × ${opts.count} ข้อ = ${subtopics.length * opts.count} ข้อ`);
    await prisma.$disconnect();
    return;
  }

  // ตรวจสอบ subtopic ไหนมีอยู่แล้ว
  const existing = new Map();
  for (const s of subtopics) {
    const source = `practice-gen-${opts.grade}-${s.key.replace('subtopic:', '')}`;
    const count = await prisma.question.count({ where: { source } });
    if (count > 0) existing.set(s.key, count);
  }

  const toGenerate = subtopics.filter(s => opts.force || !existing.has(s.key));
  const skip = subtopics.filter(s => !opts.force && existing.has(s.key));

  if (skip.length > 0) {
    console.log(`⏭  ข้าม ${skip.length} subtopic (มีอยู่แล้ว):`);
    skip.forEach(s => console.log(`   - ${s.key} (${existing.get(s.key)} ข้อ)`));
    console.log('');
  }

  console.log(`▶  จะ generate ${toGenerate.length} subtopics\n`);
  if (toGenerate.length === 0) {
    console.log('ไม่มีอะไรต้อง generate ใช้ --force เพื่อ generate ทับ');
    await prisma.$disconnect();
    return;
  }

  const results = { ok: [], fail: [] };
  const generatorScript = path.join(__dirname, 'generate-practice-questions.js');

  for (let i = 0; i < toGenerate.length; i++) {
    const s = toGenerate[i];
    console.log(`[${i + 1}/${toGenerate.length}] ${s.key} — ${s.th}`);

    try {
      const forceFlag = opts.force ? ' --force' : '';
      const cmd = `node "${generatorScript}" "${s.key}" ${opts.grade} ${opts.count}${forceFlag}`;
      execSync(cmd, {
        stdio: 'inherit',
        env: { ...process.env },
        cwd: path.join(__dirname, '..'),
      });
      results.ok.push(s.key);
    } catch (err) {
      console.error(`  ❌ FAIL: ${s.key}`);
      results.fail.push(s.key);
    }

    // หน่วงเพื่อไม่ให้ rate limit
    if (i < toGenerate.length - 1) {
      process.stdout.write(`  ⏳ รอ ${opts.delay / 1000}s...\n`);
      await sleep(opts.delay);
    }
  }

  // Summary
  console.log('\n' + '─'.repeat(50));
  console.log(`✅ สำเร็จ : ${results.ok.length} subtopics`);
  if (results.fail.length > 0) {
    console.log(`❌ ล้มเหลว: ${results.fail.length} subtopics`);
    results.fail.forEach(k => console.log(`   - ${k}`));
  }
  console.log('─'.repeat(50) + '\n');

  await prisma.$disconnect();
}

main().catch(async err => {
  console.error('Fatal:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});
