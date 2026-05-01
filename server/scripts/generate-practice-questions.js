/**
 * generate-practice-questions.js
 * Generate practice questions for a specific subtopic using Claude API
 *
 * Usage:
 *   node scripts/generate-practice-questions.js <subtopicKey> [grade] [count]
 *
 * Examples:
 *   node scripts/generate-practice-questions.js subtopic:fractions-add-like p6 20
 *   node scripts/generate-practice-questions.js subtopic:whole-numbers-multiply p5 10
 *
 * Arguments:
 *   subtopicKey  - key from AttributeDictionary (e.g. "subtopic:fractions-add-like")
 *   grade        - p4 | p5 | p6  (default: p6)
 *   count        - number of questions to generate (default: 20)
 *
 * Model: claude-haiku-4-5 (เปลี่ยนเป็น claude-opus-4-7 ถ้าต้องการคุณภาพสูงสุด)
 */

require('dotenv').config({ override: true });
const { PrismaClient } = require('@prisma/client');
const Anthropic = require('@anthropic-ai/sdk').default;
const fs = require('fs');

// ─── Config ───────────────────────────────────────────────────────────────────

// โหลด DATABASE_URL จาก main project ถ้า env ว่าง (local dev worktree)
if (!process.env.DATABASE_URL) {
  try {
    const mainEnv = fs.readFileSync(
      require('path').join(__dirname, '../../server/.env'), 'utf8'
    );
    const match = mainEnv.match(/DATABASE_URL=(.+)/);
    if (match) process.env.DATABASE_URL = match[1].trim();
  } catch {
    // ไม่มีไฟล์ .env ใน main project — ข้าม
  }
}

const prisma = new PrismaClient();
// หมายเหตุ: ใช้ claude-haiku-4-5 เพื่อประหยัดค่าใช้จ่าย
// เปลี่ยนเป็น "claude-opus-4-7" ถ้าต้องการคุณภาพสูงสุด
const MODEL = 'claude-haiku-4-5';

// ─── Grade label ──────────────────────────────────────────────────────────────

const GRADE_LABEL = {
  p4: 'ประถมศึกษาปีที่ 4 (ป.4)',
  p5: 'ประถมศึกษาปีที่ 5 (ป.5)',
  p6: 'ประถมศึกษาปีที่ 6 (ป.6)',
};

// ─── System prompt (จะถูก cache) ──────────────────────────────────────────────

const SYSTEM_PROMPT = `คุณเป็นผู้เชี่ยวชาญด้านการออกข้อสอบคณิตศาสตร์ระดับประถมศึกษา
หน้าที่ของคุณคือสร้างโจทย์ปรนัย (multiple choice) ที่มีคุณภาพสูง เหมาะกับระดับชั้นที่กำหนด

กฎการสร้างโจทย์:
1. ใช้ภาษาไทยที่ชัดเจน เข้าใจง่าย เหมาะกับนักเรียน
2. ตัวเลือก a, b, c, d ต้องสมเหตุสมผล — ตัวผิดควรเป็น "กับดัก" ที่น่าเชื่อถือ
3. แต่ละโจทย์ต้องเป็นอิสระจากกัน ไม่อ้างอิงถึงโจทย์อื่น
4. ความยาก difficulty:1 = ตรงไปตรงมา, difficulty:2 = ต้องคิดหลายขั้นตอน
5. ห้ามมีรูปภาพ — โจทย์ต้องเข้าใจได้จากข้อความอย่างเดียว
6. ห้ามซ้ำกัน — แต่ละโจทย์ต้องใช้ตัวเลขหรือสถานการณ์ที่ต่างกัน

รูปแบบ JSON ที่ต้องตอบ (array เท่านั้น ไม่มีข้อความอื่น):
[
  {
    "textTh": "โจทย์ภาษาไทย",
    "choices": [
      {"label": "a", "textTh": "ตัวเลือก ก"},
      {"label": "b", "textTh": "ตัวเลือก ข"},
      {"label": "c", "textTh": "ตัวเลือก ค"},
      {"label": "d", "textTh": "ตัวเลือก ง"}
    ],
    "answer": "a",
    "difficulty": 1,
    "explanation": "เหตุผลสั้น ๆ ว่าทำไมถึงตอบแบบนี้"
  }
]`;

// ─── Generate questions via Claude API ────────────────────────────────────────

async function generateQuestions({ subtopicKey, subtopicTh, topicKeys, grade, count }) {
  const client = new Anthropic();
  const gradeLabel = GRADE_LABEL[grade] || grade;
  const diff1Count = Math.ceil(count * 0.6); // 60% ง่าย
  const diff2Count = count - diff1Count;      // 40% กลาง

  const userPrompt = `สร้างโจทย์คณิตศาสตร์สำหรับ${gradeLabel}
หัวข้อย่อย: ${subtopicTh} (${subtopicKey})

จำนวนที่ต้องการ:
- difficulty 1 (ง่าย): ${diff1Count} ข้อ
- difficulty 2 (กลาง/หลายขั้นตอน): ${diff2Count} ข้อ

รวมทั้งหมด ${count} ข้อ
ตอบเป็น JSON array เท่านั้น ไม่มีข้อความอื่นนำหน้าหรือตามหลัง`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' }, // cache system prompt
      },
    ],
    messages: [{ role: 'user', content: userPrompt }],
  });

  const raw = response.content.find(b => b.type === 'text')?.text ?? '';
  console.log(`  tokens: input=${response.usage.input_tokens} output=${response.usage.output_tokens} cache_read=${response.usage.cache_read_input_tokens ?? 0}`);

  // Parse JSON — ตัด markdown code block ออกถ้ามี
  const jsonText = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  return JSON.parse(jsonText);
}

// ─── Save to DB ───────────────────────────────────────────────────────────────

async function saveQuestions({ questions, subtopicKey, topicKeys, grade }) {
  const source = `practice-gen-${grade}-${subtopicKey.replace('subtopic:', '')}`;

  const records = questions.map(q => ({
    textTh: q.textTh,
    textEn: '',
    type: 'mc',
    choices: q.choices.map(c => ({ textTh: c.textTh, textEn: '' })),
    answer: q.answer,
    attributes: {
      examGrade: grade,
      topic: topicKeys,
      subtopic: [subtopicKey],
      difficulty: q.difficulty,
    },
    source,
    aiGenerated: true,
    needsReview: true,
    parentQuestionId: null,
    ownerOrg: 'schoolpl',
    createdBy: 'ai-generator',
    updatedBy: 'ai-generator',
  }));

  const result = await prisma.question.createMany({ data: records });
  return result.count;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const [, , subtopicArg, gradeArg = 'p6', countArg = '20'] = process.argv;

  if (!subtopicArg) {
    console.error('Usage: node scripts/generate-practice-questions.js <subtopicKey> [grade] [count]');
    console.error('Example: node scripts/generate-practice-questions.js subtopic:fractions-add-like p6 20');
    process.exit(1);
  }

  const subtopicKey = subtopicArg.startsWith('subtopic:') ? subtopicArg : `subtopic:${subtopicArg}`;
  const grade = gradeArg;
  const count = parseInt(countArg, 10);

  // โหลดข้อมูล subtopic จาก DB
  const subtopicEntry = await prisma.attributeDictionary.findUnique({
    where: { key: subtopicKey },
  });
  if (!subtopicEntry) {
    console.error(`ไม่พบ subtopic: ${subtopicKey}`);
    process.exit(1);
  }

  // หา topic ที่เกี่ยวข้อง (ดูจากเนื้อหา subtopic key)
  // ใช้ mapping แบบง่าย จาก key prefix
  const topicMap = {
    'fractions': ['topic:fractions'],
    'decimals': ['topic:decimals'],
    'whole-numbers': ['topic:whole-numbers'],
    'bodmas': ['topic:whole-numbers'],
    'percentage': ['topic:percentage'],
    'ratio': ['topic:ratio'],
    'geometry': ['topic:geometry'],
    'area': ['topic:geometry', 'topic:area-volume'],
    'volume': ['topic:area-volume'],
    'measurement': ['topic:measurement'],
    'statistics': ['topic:statistics'],
  };

  const slug = subtopicKey.replace('subtopic:', '');
  const topicKeys = Object.entries(topicMap).find(([prefix]) => slug.startsWith(prefix))?.[1]
    ?? ['topic:whole-numbers'];

  console.log(`\n📚 Generate โจทย์ฝึกหัด`);
  console.log(`   subtopic : ${subtopicKey} (${subtopicEntry.th})`);
  console.log(`   topic    : ${topicKeys.join(', ')}`);
  console.log(`   grade    : ${grade}`);
  console.log(`   count    : ${count}`);
  console.log(`   model    : ${MODEL}`);
  console.log('');

  // ตรวจว่ามีโจทย์ใน source นี้อยู่แล้วหรือเปล่า
  const source = `practice-gen-${grade}-${slug}`;
  const existing = await prisma.question.count({ where: { source } });
  if (existing > 0) {
    console.log(`⚠️  มีโจทย์ใน source "${source}" อยู่แล้ว ${existing} ข้อ`);
    const proceed = process.argv[5] === '--force';
    if (!proceed) {
      console.log('   ใช้ --force เพื่อเพิ่มต่อ หรือข้ามได้');
      await prisma.$disconnect();
      return;
    }
  }

  try {
    console.log('🤖 กำลัง generate...');
    const questions = await generateQuestions({
      subtopicKey,
      subtopicTh: subtopicEntry.th,
      topicKeys,
      grade,
      count,
    });

    console.log(`✅ Claude สร้างได้ ${questions.length} ข้อ`);

    // แสดงตัวอย่าง 2 ข้อแรก
    questions.slice(0, 2).forEach((q, i) => {
      console.log(`\n  ตัวอย่างข้อ ${i + 1}: [difficulty:${q.difficulty}]`);
      console.log(`  Q: ${q.textTh}`);
      q.choices.forEach(c => console.log(`     ${c.label}) ${c.textTh}`));
      console.log(`  A: ${q.answer} — ${q.explanation ?? ''}`);
    });

    console.log(`\n💾 กำลังบันทึกลง DB...`);
    const saved = await saveQuestions({ questions, subtopicKey, topicKeys, grade });
    console.log(`✅ บันทึกแล้ว ${saved} ข้อ (source: ${source})\n`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('JSON')) {
      console.error('   Claude อาจตอบ format ไม่ถูก ลองรันใหม่');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
