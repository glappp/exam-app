const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const Anthropic = require('@anthropic-ai/sdk');

const prisma = new PrismaClient();

function requireTeacher(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  if (!['admin', 'teacher'].includes(req.session.role)) return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
  next();
}

// POST /api/ai/generate
// Body: { topic, grade, difficulty, count, styleNote }
// Returns: { questions: [...] }  (not saved to DB yet)
router.post('/generate', requireTeacher, async (req, res) => {
  const { topic, grade, difficulty, count = 5, styleNote = '' } = req.body;
  if (!topic || !grade) return res.status(400).json({ error: 'ต้องระบุ topic และ grade' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY' });

  const diffLabel = { 1: 'ง่าย', 2: 'กลาง', 3: 'ยาก' }[difficulty] || 'กลาง';
  const gradeLabel = grade; // e.g. p6, m1

  const prompt = `สร้างข้อสอบคณิตศาสตร์ภาษาไทยสำหรับนักเรียน${gradeLabel} จำนวน ${count} ข้อ
หัวข้อ: ${topic}
ระดับความยาก: ${diffLabel} (${difficulty}/3)
${styleNote ? `หมายเหตุเพิ่มเติม: ${styleNote}` : ''}

กฎ:
- ข้อสอบแบบ 4 ตัวเลือก (A B C D)
- มีเพียง 1 คำตอบที่ถูกต้อง
- ตัวเลือกผิดต้องสมเหตุสมผล ไม่ชัดเจนเกินไป
- โจทย์ต้องชัดเจนและครบถ้วน
- ใช้ภาษาไทยที่เหมาะกับวัย

ตอบในรูปแบบ JSON array เท่านั้น (ไม่มีข้อความอื่นนำหน้าหรือตามหลัง):
[
  {
    "textTh": "โจทย์ภาษาไทย",
    "textEn": "Question in English",
    "choices": [
      {"textTh": "ตัวเลือก A", "textEn": "Choice A"},
      {"textTh": "ตัวเลือก B", "textEn": "Choice B"},
      {"textTh": "ตัวเลือก C", "textEn": "Choice C"},
      {"textTh": "ตัวเลือก D", "textEn": "Choice D"}
    ],
    "answer": 0,
    "explanation": "อธิบายเหตุผลคำตอบที่ถูก",
    "attributes": {
      "topic": ["${topic}"],
      "skill": ["skill:arithmetic"],
      "trap": [],
      "difficulty": ${difficulty || 2},
      "examGrade": "${grade}"
    }
  }
]`;

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const raw = message.content[0].text.trim();
    // Extract JSON array from response
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.status(500).json({ error: 'AI ตอบในรูปแบบที่ไม่ถูกต้อง', raw: raw.substring(0, 200) });

    const questions = JSON.parse(jsonMatch[0]);
    res.json({ questions, usage: message.usage });
  } catch (err) {
    console.error('❌ ai/generate:', err);
    if (err.status === 401) return res.status(503).json({ error: 'ANTHROPIC_API_KEY ไม่ถูกต้อง' });
    res.status(500).json({ error: 'สร้างข้อสอบล้มเหลว: ' + err.message });
  }
});

// POST /api/ai/save
// Body: { questions: [...], grade, source }
// Saves approved questions to DB
router.post('/save', requireTeacher, async (req, res) => {
  const { questions, grade, source = 'AI Generated' } = req.body;
  if (!Array.isArray(questions) || !questions.length) {
    return res.status(400).json({ error: 'ไม่มีข้อสอบให้บันทึก' });
  }

  const username = req.session.username || 'teacher';
  const year = String(new Date().getFullYear());

  try {
    const created = [];
    for (const q of questions) {
      const record = await prisma.question.create({
        data: {
          textTh: q.textTh || '',
          textEn: q.textEn || '',
          choices: q.choices || [],
          answer: q.answer ?? null,
          attributes: q.attributes || {},
          source: source,
          ownerOrg: 'me',
          createdBy: `ai:${username}`,
          updatedBy: username,
        }
      });
      created.push(record.id);
    }
    res.json({ success: true, count: created.length, ids: created });
  } catch (err) {
    console.error('❌ ai/save:', err);
    res.status(500).json({ error: 'บันทึกล้มเหลว: ' + err.message });
  }
});

module.exports = router;
