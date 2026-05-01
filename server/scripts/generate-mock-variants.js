/**
 * generate-mock-variants.js
 * สร้าง 4 variants ต่อโจทย์ Phase 1 (practice-gen-*) เพื่อใช้ใน Daily Mission
 *
 * Usage:
 *   node scripts/generate-mock-variants.js [options]
 *
 * Options:
 *   --grade p6         grade (default: p6)
 *   --subtopic key     เฉพาะ subtopic นี้ (ไม่ต้องมี prefix subtopic:)
 *   --batch 4          จำนวนโจทย์ต่อ 1 API call (default: 4)
 *   --variants 4       variants ต่อโจทย์ (default: 4)
 *   --delay 1500       ms ระหว่าง batch (default: 1500)
 *   --dry-run          แสดงจำนวนแต่ไม่ generate
 *   --force            generate ทับแม้มีอยู่แล้ว
 */

require('dotenv').config({ override: true });
const { PrismaClient } = require('@prisma/client');
const Anthropic = require('@anthropic-ai/sdk').default;
const fs = require('fs');
const path = require('path');

// โหลด DATABASE_URL จาก main project ถ้า env ว่าง (local dev worktree)
if (!process.env.DATABASE_URL) {
  try {
    const mainEnv = fs.readFileSync(
      path.join(__dirname, '../../server/.env'), 'utf8'
    );
    const match = mainEnv.match(/DATABASE_URL=(.+)/);
    if (match) process.env.DATABASE_URL = match[1].trim();
  } catch { /* skip */ }
}

const prisma = new PrismaClient();
const MODEL = 'claude-haiku-4-5';

// ─── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `คุณเป็นผู้เชี่ยวชาญด้านการสร้างโจทย์คณิตศาสตร์ระดับประถมศึกษา
หน้าที่: รับโจทย์ต้นฉบับ แล้วสร้าง variant ใหม่ที่ทดสอบ concept เดิม แต่ใช้ตัวเลข/สถานการณ์ต่างกัน

กฎ:
1. คง concept และ difficulty เหมือนต้นฉบับ
2. เปลี่ยนตัวเลข/ชื่อ/สถานการณ์ให้ต่างกัน ห้ามซ้ำกันระหว่าง variants และซ้ำกับต้นฉบับ
3. ตัวเลือก a,b,c,d ต้องสมเหตุสมผล ตัวผิดควรเป็นกับดักที่น่าเชื่อถือ
4. ห้ามมีรูปภาพ — โจทย์ต้องเข้าใจได้จากข้อความอย่างเดียว
5. ตอบ JSON เท่านั้น ไม่มีข้อความอื่น

รูปแบบ JSON ที่ตอบ (array เท่านั้น):
[
  {
    "parentId": "id ของโจทย์ต้นฉบับ",
    "variants": [
      {
        "textTh": "โจทย์ variant",
        "choices": [
          {"label": "a", "textTh": "ตัวเลือก ก"},
          {"label": "b", "textTh": "ตัวเลือก ข"},
          {"label": "c", "textTh": "ตัวเลือก ค"},
          {"label": "d", "textTh": "ตัวเลือก ง"}
        ],
        "answer": "a",
        "difficulty": 1,
        "explanation": "เหตุผลสั้น ๆ"
      }
    ]
  }
]`;

// ─── Parse args ────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    grade: 'p6',
    subtopic: null,
    batchSize: 4,
    variantsPerQ: 4,
    delay: 1500,
    dryRun: false,
    force: false,
  };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--grade':    opts.grade = args[++i]; break;
      case '--subtopic': opts.subtopic = args[++i]; break;
      case '--batch':    opts.batchSize = parseInt(args[++i], 10); break;
      case '--variants': opts.variantsPerQ = parseInt(args[++i], 10); break;
      case '--delay':    opts.delay = parseInt(args[++i], 10); break;
      case '--dry-run':  opts.dryRun = true; break;
      case '--force':    opts.force = true; break;
    }
  }
  return opts;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── Topic mapping ─────────────────────────────────────────────────────────────

const TOPIC_MAP = {
  'fractions':     ['topic:fractions'],
  'decimals':      ['topic:decimals'],
  'whole-numbers': ['topic:whole-numbers'],
  'bodmas':        ['topic:whole-numbers'],
  'percentage':    ['topic:percentage'],
  'ratio':         ['topic:ratio'],
  'geometry':      ['topic:geometry'],
  'area':          ['topic:geometry', 'topic:area-volume'],
  'volume':        ['topic:area-volume'],
  'measurement':   ['topic:measurement'],
  'statistics':    ['topic:statistics'],
};

// ─── Generate variants via Claude API ─────────────────────────────────────────

async function generateVariantsBatch(questions, variantsPerQ) {
  const client = new Anthropic();

  const inputData = questions.map(q => ({
    id: q.id,
    textTh: q.textTh,
    choices: Array.isArray(q.choices)
      ? q.choices.map((c, i) => ({ label: ['a','b','c','d'][i] ?? String(i), textTh: c.textTh }))
      : [],
    answer: q.answer,
    difficulty: q.attributes?.difficulty ?? 1,
  }));

  const userPrompt = `สร้าง ${variantsPerQ} variants สำหรับแต่ละโจทย์ต่อไปนี้ (${questions.length} โจทย์)
ตอบเป็น JSON array เท่านั้น ไม่มีข้อความอื่น:

${JSON.stringify(inputData, null, 2)}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userPrompt }],
  });

  const raw = response.content.find(b => b.type === 'text')?.text ?? '';
  const jsonText = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();

  process.stdout.write(
    ` [in=${response.usage.input_tokens} out=${response.usage.output_tokens}]`
  );

  return JSON.parse(jsonText);
}

// ─── Save to DB ────────────────────────────────────────────────────────────────

async function saveVariants(variantGroups, originalMap, subtopicKey, topicKeys, grade) {
  const slug = subtopicKey.replace('subtopic:', '');
  const source = `practice-mock-gen-${grade}-${slug}`;
  const records = [];

  for (const group of variantGroups) {
    const original = originalMap.get(group.parentId);
    if (!original) {
      process.stdout.write(` (unknown parentId ${group.parentId})`);
      continue;
    }
    for (const v of (group.variants ?? [])) {
      records.push({
        textTh: v.textTh,
        textEn: '',
        type: 'mc',
        choices: (v.choices ?? []).map(c => ({ textTh: c.textTh, textEn: '' })),
        answer: v.answer,
        attributes: {
          examGrade: grade,
          topic: topicKeys,
          subtopic: [subtopicKey],
          difficulty: v.difficulty ?? original.attributes?.difficulty ?? 1,
        },
        source,
        aiGenerated: true,
        needsReview: true,
        parentQuestionId: original.id,
        ownerOrg: 'schoolpl',
        createdBy: 'ai-generator',
        updatedBy: 'ai-generator',
      });
    }
  }

  if (records.length === 0) return 0;
  const result = await prisma.question.createMany({ data: records });
  return result.count;
}

// ─── Process one subtopic ──────────────────────────────────────────────────────

async function processSubtopic(subtopicKey, opts) {
  const slug = subtopicKey.replace('subtopic:', '');
  const topicKeys =
    Object.entries(TOPIC_MAP).find(([p]) => slug.startsWith(p))?.[1]
    ?? ['topic:whole-numbers'];

  const sourcePhase1 = `practice-gen-${opts.grade}-${slug}`;
  const sourceMock   = `practice-mock-gen-${opts.grade}-${slug}`;

  // โหลดโจทย์ Phase 1
  const originals = await prisma.question.findMany({ where: { source: sourcePhase1 } });
  if (originals.length === 0) {
    console.log(`  ⚠️  ไม่มีโจทย์ Phase 1 — ข้าม`);
    return -1;
  }

  // ตรวจว่า mock มีอยู่แล้ว
  if (!opts.force) {
    const existingCount = await prisma.question.count({ where: { source: sourceMock } });
    if (existingCount > 0) {
      console.log(`  ⏭  ข้าม — มี mock อยู่แล้ว ${existingCount} ข้อ`);
      return -1;
    }
  }

  const originalMap = new Map(originals.map(q => [q.id, q]));

  // แบ่ง batch
  const batches = [];
  for (let i = 0; i < originals.length; i += opts.batchSize) {
    batches.push(originals.slice(i, i + opts.batchSize));
  }

  let totalSaved = 0;
  const failed = [];

  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi];
    process.stdout.write(
      `  batch [${bi + 1}/${batches.length}] (${batch.length}q)...`
    );

    try {
      const variantGroups = await generateVariantsBatch(batch, opts.variantsPerQ);
      const saved = await saveVariants(variantGroups, originalMap, subtopicKey, topicKeys, opts.grade);
      totalSaved += saved;
      process.stdout.write(` ✓ saved=${saved}\n`);
    } catch (err) {
      process.stdout.write(` ❌ ${err.message.slice(0, 80)}\n`);
      failed.push(bi);
    }

    if (bi < batches.length - 1) await sleep(opts.delay);
  }

  if (failed.length > 0) {
    console.log(`  ⚠️  ${failed.length} batch(es) ล้มเหลว (index: ${failed.join(', ')})`);
  }

  return totalSaved;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  // โหลด subtopics
  const where = { type: 'subtopic' };
  if (opts.subtopic) {
    const key = opts.subtopic.startsWith('subtopic:')
      ? opts.subtopic
      : `subtopic:${opts.subtopic}`;
    where.key = key;
  }

  const subtopics = await prisma.attributeDictionary.findMany({
    where,
    orderBy: { key: 'asc' },
  });

  console.log(`\n🔀 Generate Mock Variants — Phase 2`);
  console.log(`   grade     : ${opts.grade}`);
  console.log(`   variants  : ${opts.variantsPerQ} per question`);
  console.log(`   batch     : ${opts.batchSize} questions/call`);
  console.log(`   subtopics : ${subtopics.length}`);
  console.log(`   model     : ${MODEL}`);
  console.log('');

  if (opts.dryRun) {
    let total = 0;
    for (const s of subtopics) {
      const slug = s.key.replace('subtopic:', '');
      const count = await prisma.question.count({
        where: { source: `practice-gen-${opts.grade}-${slug}` },
      });
      const batches = Math.ceil(count / opts.batchSize);
      console.log(
        `  ${s.key.padEnd(45)} ${String(count).padStart(3)}q` +
        ` → ${String(count * opts.variantsPerQ).padStart(4)} variants` +
        ` (${batches} calls)`
      );
      total += count;
    }
    const totalCalls = Math.ceil(total / opts.batchSize);
    console.log(`\nรวม ${total} โจทย์ → ~${total * opts.variantsPerQ} variants`);
    console.log(`   ~${totalCalls} API calls`);
    await prisma.$disconnect();
    return;
  }

  const results = { ok: 0, skip: 0, fail: [] };

  for (let i = 0; i < subtopics.length; i++) {
    const s = subtopics[i];
    console.log(`[${i + 1}/${subtopics.length}] ${s.key} — ${s.th}`);

    try {
      const saved = await processSubtopic(s.key, opts);
      if (saved === -1) {
        results.skip++;
      } else {
        results.ok++;
        console.log(`  ✅ ${saved} variants saved`);
      }
    } catch (err) {
      console.error(`  ❌ ERROR: ${err.message}`);
      results.fail.push(s.key);
    }

    // หน่วงเล็กน้อยระหว่าง subtopic
    if (i < subtopics.length - 1) await sleep(500);
  }

  console.log('\n' + '─'.repeat(55));
  console.log(`✅ สำเร็จ  : ${results.ok} subtopics`);
  console.log(`⏭  ข้าม   : ${results.skip} subtopics`);
  if (results.fail.length > 0) {
    console.log(`❌ ล้มเหลว : ${results.fail.length}`);
    results.fail.forEach(k => console.log(`   - ${k}`));
  }
  console.log('─'.repeat(55) + '\n');

  await prisma.$disconnect();
}

main().catch(async err => {
  console.error('Fatal:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});
