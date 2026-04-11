let currentLang = 'th';
let currentQuestion = null;
let currentAnswer = -1;

const CHOICE_LABELS = ['ก', 'ข', 'ค', 'ง', 'จ'];
function choiceLabel(i) { return CHOICE_LABELS[i] ?? String(i + 1); }

// Practice session state
let sessionStartTime = null;
let sessionQuestions = [];
let sessionAnswers = [];
let filteredQuestions = [];
let usedIndices = new Set();

// Test mode state
let isTestMode = false;
let testType = null;      // 'subtopic' | 'topic'
let testGrade = '';
let testTopicKey = '';
let testSubtopicKey = '';
const TEST_TOTAL = 10;
const TEST_PASS  = 8;

// Adaptive mode
const isAdaptive = new URLSearchParams(location.search).get('mode') === 'adaptive';

if (isAdaptive) {
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('topbar-title').textContent = '🎯 โหมดปรับจุดอ่อน';
    document.getElementById('setup-title').textContent = 'ปรับจุดอ่อนของคุณ';
    document.getElementById('chapter-group').style.display = 'none';
    document.getElementById('start-btn').textContent = 'เริ่มฝึกจุดอ่อน';
    document.getElementById('adaptive-banner').style.display = 'block';
  });
}

// Targeted mode (fix session)
const isTargeted = new URLSearchParams(location.search).get('mode') === 'targeted';
const targetedTag = new URLSearchParams(location.search).get('topic') || '';
let targetedQueue = [];

if (isTargeted) {
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('topbar-title').textContent = '🔧 ซ่อมจุดอ่อน';
    document.getElementById('setup-panel').style.display = 'none';
    document.getElementById('targeted-banner').style.display = 'block';
    document.getElementById('targeted-tag-label').textContent = targetedTag.replace(/^[^:]+:/, '');
    startTargeted();
  });
}

async function startTargeted() {
  document.getElementById('question-area').innerHTML =
    '<p style="text-align:center;padding:32px;color:var(--muted)">กำลังโหลดโจทย์...</p>';
  try {
    const res = await fetch(`/api/exam-set/targeted?tag=${encodeURIComponent(targetedTag)}`, { credentials: 'include' });
    if (!res.ok) throw new Error('โหลดโจทย์ไม่สำเร็จ');
    const data = await res.json();
    targetedQueue = [...data.questions];
    loadTargetedQuestion();
  } catch (err) {
    document.getElementById('question-area').innerHTML =
      `<div class="card"><p class="msg msg-error">${err.message}</p></div>`;
  }
}

function loadTargetedQuestion() {
  if (targetedQueue.length === 0) {
    showTargetedComplete();
    return;
  }
  currentQuestion = targetedQueue[0];
  currentAnswer = currentQuestion.answer;
  renderTargetedQuestion();
}

function renderTargetedQuestion() {
  const q = currentQuestion;
  const done = 10 - targetedQueue.length;
  const choicesHTML = (q.choices || []).map((c, i) =>
    `<button class="choice-btn" id="choice-${i}" onclick="checkAnswerTargeted(${i})">
      <strong>${choiceLabel(i)}.</strong> ${getChoiceText(c)}
    </button>`
  ).join('');

  document.getElementById('question-area').innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span class="card-title" style="margin:0">ข้อที่ ${done + 1}</span>
        <span style="font-size:13px;color:var(--muted)">ถูกแล้ว ${done}/10</span>
      </div>
      <div style="background:#f0f0f0;border-radius:99px;height:6px;margin-bottom:16px">
        <div style="background:#16a34a;height:6px;border-radius:99px;width:${done / 10 * 100}%;transition:width .3s"></div>
      </div>
      <div style="font-size:15px;line-height:1.7;margin-bottom:14px">${getText(q)}</div>
      ${q.image ? `<img src="/uploads/${q.image}" style="max-width:100%;margin-bottom:14px;border-radius:8px">` : ''}
      <div class="choices">${choicesHTML}</div>
      <div id="answer-feedback" style="margin-top:12px"></div>
    </div>
  `;
}

function checkAnswerTargeted(choiceIndex) {
  const isCorrect = choiceIndex === currentAnswer;

  document.querySelectorAll('.choice-btn').forEach((btn, i) => {
    btn.disabled = true;
    btn.style.cursor = 'default';
    if (i === currentAnswer) { btn.style.background = '#dcfce7'; btn.style.borderColor = '#16a34a'; btn.style.color = '#15803d'; }
    if (i === choiceIndex && !isCorrect) { btn.style.background = '#fee2e2'; btn.style.borderColor = '#dc2626'; btn.style.color = '#b91c1c'; }
  });

  document.getElementById('answer-feedback').innerHTML = isCorrect
    ? `<span class="badge badge-success">✔ ถูกต้อง!</span>`
    : `<span class="badge badge-error">✘ ผิด — เฉลยคือ ข้อ ${choiceLabel(currentAnswer)} (ข้อนี้จะกลับมาอีก)</span>`;

  if (isCorrect) {
    targetedQueue.shift();
  } else {
    targetedQueue.push(targetedQueue.shift());
  }

  setTimeout(loadTargetedQuestion, 1800);
}

function showTargetedComplete() {
  const label = targetedTag.replace(/^[^:]+:/, '');
  document.getElementById('question-area').innerHTML = `
    <div class="card" style="text-align:center;padding:32px">
      <div style="font-size:48px;margin-bottom:12px">🎉</div>
      <div class="card-title">ซ่อมสำเร็จ!</div>
      <p style="color:var(--muted)">ตอบถูกครบ 10 ข้อสำหรับ <strong>${label}</strong> แล้ว</p>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:20px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="startTargeted()">ฝึกอีกครั้ง</button>
        <a href="dashboard.html" class="btn btn-ghost">หน้าหลัก</a>
      </div>
    </div>
  `;
}

function getText(q) {
  return currentLang === 'th' ? (q.textTh || q.text || '') : (q.textEn || q.text || '');
}

function getChoiceText(c) {
  return currentLang === 'th' ? (c.textTh || c.text || '') : (c.textEn || c.text || '');
}

function changeLang(lang) {
  currentLang = lang;
  if (currentQuestion) renderCurrentQuestion();
}

async function startExam(runMode = 'practice') {
  document.getElementById('setup-panel').style.display = 'none';
  document.getElementById('results').innerHTML = '';
  document.getElementById('question-area').innerHTML =
    '<p style="text-align:center;padding:32px;color:var(--muted)">กำลังโหลดโจทย์...</p>';

  // ตั้งค่า test mode
  isTestMode = (runMode === 'test');
  testType = null; testGrade = ''; testTopicKey = ''; testSubtopicKey = '';

  try {
    let allQuestions;

    if (isAdaptive) {
      const res = await fetch('/api/exam-set/adaptive', { credentials: 'include' });
      if (!res.ok) throw new Error('โหลดโจทย์ไม่สำเร็จ');
      const data = await res.json();
      allQuestions = data.questions || [];

      const desc = document.getElementById('adaptive-desc');
      if (data.weakTopicTags?.length > 0) {
        const labels = data.weakTopicTags.map(t => getTopicLabel(t));
        desc.textContent = `เน้นจุดอ่อน: ${labels.join(', ')}`;
      } else {
        desc.textContent = 'ยังไม่มีประวัติสอบ — สุ่มโจทย์ทั่วไปให้';
      }
      document.getElementById('adaptive-banner').style.display = 'block';
    } else {
      const grade       = document.getElementById('grade')?.value || '';
      const topicKey    = document.getElementById('chapter').value;
      const subtopicKey = document.getElementById('subtopic')?.value || '';

      if (!grade || !topicKey) {
        document.getElementById('question-area').innerHTML = '';
        document.getElementById('setup-panel').style.display = '';
        alert('กรุณาเลือกระดับชั้นและหัวข้อก่อน');
        return;
      }

      const res = await fetch('/questions/all', { credentials: 'include' });
      if (!res.ok) throw new Error('โหลดโจทย์ไม่สำเร็จ');
      const data = await res.json();
      allQuestions = data.questions || [];

      filteredQuestions = allQuestions.filter(q => {
        const g = q.attributes?.examGrade || '';
        const normalGrade = /^\d/.test(g) ? 'p' + g : g;
        if (normalGrade !== grade) return false;
        if (!(q.attributes?.topic || []).includes(topicKey)) return false;
        // โหมดสอบ topic ไม่กรอง subtopic (สุ่มจากทั้ง topic)
        if (subtopicKey && !isTestMode) {
          if (!(q.attributes?.subtopic || []).includes(subtopicKey)) return false;
        }
        if (subtopicKey && isTestMode && testType === null) {
          // ถ้าเลือก subtopic ไว้ = สอบ subtopic
        }
        return true;
      });

      if (isTestMode) {
        if (subtopicKey) {
          // สอบ subtopic — กรอง subtopic ด้วย
          filteredQuestions = filteredQuestions.filter(q =>
            (q.attributes?.subtopic || []).includes(subtopicKey)
          );
          testType = 'subtopic';
          testSubtopicKey = subtopicKey;
        } else {
          testType = 'topic';
        }
        testGrade    = grade;
        testTopicKey = topicKey;
      }

      if (filteredQuestions.length === 0) {
        const label = subtopicKey ? getSubtopicLabel(subtopicKey) : getTopicLabel(topicKey);
        document.getElementById('question-area').innerHTML =
          `<div class="card"><p class="msg msg-error">ไม่พบโจทย์ในหัวข้อ "${label}"</p></div>`;
        document.getElementById('setup-panel').style.display = '';
        return;
      }

      // โหมดสอบต้องมี >= 10 ข้อ
      if (isTestMode && filteredQuestions.length < TEST_TOTAL) {
        const label = testType === 'subtopic' ? getSubtopicLabel(subtopicKey) : getTopicLabel(topicKey);
        document.getElementById('question-area').innerHTML =
          `<div class="card"><p class="msg msg-error">โจทย์ในหัวข้อ "${label}" มีไม่ถึง ${TEST_TOTAL} ข้อ (มี ${filteredQuestions.length} ข้อ)</p></div>`;
        document.getElementById('setup-panel').style.display = '';
        return;
      }
    }

    if (isAdaptive) filteredQuestions = allQuestions;

    if (filteredQuestions.length === 0) {
      document.getElementById('question-area').innerHTML =
        `<div class="card"><p class="msg msg-error">ไม่พบโจทย์ในระบบ</p></div>`;
      document.getElementById('setup-panel').style.display = '';
      return;
    }

    // สุ่ม 10 ข้อสำหรับ test mode — สัดส่วน ง่าย 3 / กลาง 4 / ยาก 3
    if (isTestMode) {
      const targets = { 1: 3, 2: 4, 3: 3 };
      const byDiff  = { 1: [], 2: [], 3: [] };
      for (const q of filteredQuestions) {
        const d = q.attributes?.difficulty;
        if (d === 1 || d === 2 || d === 3) byDiff[d].push(q);
        else byDiff[2].push(q); // ไม่มี difficulty → จัดเป็นกลาง
      }
      for (const d of [1, 2, 3]) byDiff[d].sort(() => Math.random() - 0.5);

      const selected = new Map(); // id → question (ป้องกันซ้ำ)
      for (const d of [1, 2, 3]) {
        for (let i = 0; i < targets[d] && i < byDiff[d].length; i++) {
          const q = byDiff[d][i];
          selected.set(q.id, q);
        }
      }
      // เติมที่เหลือจากทั้งหมด (ถ้า block ไหนไม่พอ)
      if (selected.size < TEST_TOTAL) {
        const pool = filteredQuestions.filter(q => !selected.has(q.id)).sort(() => Math.random() - 0.5);
        for (const q of pool) {
          if (selected.size >= TEST_TOTAL) break;
          selected.set(q.id, q);
        }
      }
      filteredQuestions = [...selected.values()].sort(() => Math.random() - 0.5);
    }

    // Reset session
    sessionStartTime = Date.now();
    sessionQuestions = [];
    sessionAnswers = [];
    usedIndices = new Set();

    loadNextQuestion();
  } catch (err) {
    document.getElementById('question-area').innerHTML =
      `<div class="card"><p class="msg msg-error">เกิดข้อผิดพลาด: ${err.message}</p></div>`;
    document.getElementById('setup-panel').style.display = '';
  }
}

function loadNextQuestion() {
  // test mode: ครบ 10 ข้อ → submit อัตโนมัติ
  if (isTestMode && sessionQuestions.length >= TEST_TOTAL) {
    submitAndShowResults();
    return;
  }

  // test mode ใช้ index ตรงๆ (pre-shuffled)
  if (isTestMode) {
    const idx = sessionQuestions.length; // ยังไม่บันทึก = index ถัดไป
    // แต่ sessionQuestions บันทึกหลังตอบ ดังนั้น index = sessionAnswers.length
    const nextIdx = sessionAnswers.length;
    currentQuestion = filteredQuestions[nextIdx];
    currentAnswer = currentQuestion.answer;
    renderCurrentQuestion();
    return;
  }

  const available = filteredQuestions
    .map((_, i) => i)
    .filter(i => !usedIndices.has(i));

  let idx;
  if (available.length === 0) {
    usedIndices.clear();
    idx = Math.floor(Math.random() * filteredQuestions.length);
  } else {
    idx = available[Math.floor(Math.random() * available.length)];
  }

  currentQuestion = filteredQuestions[idx];
  currentAnswer = currentQuestion.answer;
  usedIndices.add(idx);

  renderCurrentQuestion();
}

function renderCurrentQuestion() {
  const q = currentQuestion;
  const answered = sessionAnswers.length;

  const choicesHTML = (q.choices || []).map((c, i) =>
    `<button class="choice-btn" id="choice-${i}" onclick="checkAnswer(${i})">
      ${c.image ? `<img src="/uploads/${c.image}" style="max-height:50px;margin-bottom:4px;display:block">` : ''}
      <strong>${choiceLabel(i)}.</strong> ${getChoiceText(c)}
    </button>`
  ).join('');

  // test mode: progress bar + ไม่มีปุ่มจบกลางคัน
  const progressHTML = isTestMode
    ? `<div style="background:#e5e7eb;border-radius:99px;height:5px;margin-bottom:16px">
         <div style="background:#3b82f6;height:5px;border-radius:99px;width:${answered / TEST_TOTAL * 100}%;transition:width .3s"></div>
       </div>`
    : '';

  const headerRight = isTestMode
    ? `<span style="font-size:13px;color:var(--muted)">${answered}/${TEST_TOTAL} ข้อ</span>`
    : answered > 0 ? `<span style="font-size:13px;color:var(--muted)">ทำไปแล้ว ${answered} ข้อ</span>` : '';

  const endBtn = !isTestMode && answered > 0
    ? `<button class="btn btn-ghost" style="margin-top:16px;width:100%" onclick="submitAndShowResults()">
        จบการฝึก (ทำแล้ว ${answered} ข้อ)
       </button>`
    : '';

  document.getElementById('question-area').innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span class="card-title" style="margin:0">ข้อที่ ${answered + 1}</span>
        ${headerRight}
      </div>
      ${progressHTML}
      <div style="font-size:15px;line-height:1.7;margin-bottom:14px">${getText(q)}</div>
      ${q.image ? `<img src="/uploads/${q.image}" style="max-width:100%;margin-bottom:14px;border-radius:8px">` : ''}
      <div class="choices">${choicesHTML}</div>
      <div id="answer-feedback" style="margin-top:12px"></div>
      ${endBtn}
    </div>
  `;
}

function checkAnswer(choiceIndex) {
  const isCorrect = choiceIndex === currentAnswer;

  // Disable all buttons + highlight
  document.querySelectorAll('.choice-btn').forEach((btn, i) => {
    btn.disabled = true;
    btn.style.cursor = 'default';
    if (i === currentAnswer) {
      btn.style.background = '#dcfce7';
      btn.style.borderColor = '#16a34a';
      btn.style.color = '#15803d';
    }
    if (i === choiceIndex && !isCorrect) {
      btn.style.background = '#fee2e2';
      btn.style.borderColor = '#dc2626';
      btn.style.color = '#b91c1c';
    }
  });

  document.getElementById('answer-feedback').innerHTML = isCorrect
    ? `<span class="badge badge-success">✔ ถูกต้อง!</span>`
    : `<span class="badge badge-error">✘ ผิด — เฉลยคือ ข้อ ${choiceLabel(currentAnswer)}</span>`;

  // Record
  sessionQuestions.push(currentQuestion);
  sessionAnswers.push(choiceIndex);

  // โหลดข้อถัดไปหลัง 1.8 วินาที
  setTimeout(loadNextQuestion, 1800);
}

async function submitAndShowResults() {
  if (sessionQuestions.length === 0) return;

  const durationSec = Math.round((Date.now() - sessionStartTime) / 1000);

  document.getElementById('question-area').innerHTML =
    '<p style="text-align:center;padding:32px;color:var(--muted)">กำลังบันทึกผล...</p>';

  try {
    let submitMode = isAdaptive ? 'adaptive' : 'practice';
    if (isTestMode) submitMode = testType === 'subtopic' ? 'subtopic_test' : 'topic_test';

    const res = await fetch('/api/submit-exam', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: submitMode,
        questions: sessionQuestions.map(q => q.id),
        answers: sessionAnswers,
        durationSec,
        ...(isTestMode ? { grade: testGrade, topicKey: testTopicKey, subtopicKey: testSubtopicKey } : {})
      })
    });
    if (!res.ok) throw new Error('บันทึกผลไม่สำเร็จ');
    const data = await res.json();
    showFinalResults(data, durationSec);
  } catch (err) {
    document.getElementById('question-area').innerHTML =
      `<div class="card"><p class="msg msg-error">${err.message} — กรุณาลองใหม่</p>
       <button class="btn btn-ghost" onclick="resetPractice()">กลับ</button></div>`;
  }
}

function showFinalResults(data, durationSec) {
  const { correctCount, total, passed } = data;
  const pct = total > 0 ? Math.round(correctCount / total * 100) : 0;
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;

  const scoreColor = pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';

  const rows = sessionQuestions.map((q, i) => {
    const correct = sessionAnswers[i] === q.answer;
    const text = getText(q);
    return `
      <tr>
        <td style="text-align:center">${i + 1}</td>
        <td>${text.length > 70 ? text.substring(0, 70) + '…' : text}</td>
        <td style="text-align:center">${choiceLabel(sessionAnswers[i])}</td>
        <td style="text-align:center">${choiceLabel(q.answer)}</td>
        <td style="text-align:center">
          <span class="badge ${correct ? 'badge-success' : 'badge-error'}">${correct ? 'ถูก' : 'ผิด'}</span>
        </td>
      </tr>
    `;
  }).join('');

  // test mode: pass/fail banner
  const testBanner = isTestMode ? (() => {
    const typeName = testType === 'subtopic'
      ? getSubtopicLabel(testSubtopicKey) || 'subtopic'
      : getTopicLabel(testTopicKey) || 'topic';
    if (passed) {
      return `<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:10px;padding:16px;text-align:center;margin-bottom:16px">
        <div style="font-size:36px">🎉</div>
        <div style="font-weight:700;color:#15803d;font-size:18px;margin-top:4px">ผ่าน!</div>
        <div style="color:#166534;font-size:14px;margin-top:4px">${typeName} — ${correctCount}/${total} ข้อ</div>
      </div>`;
    } else {
      return `<div style="background:#fef2f2;border:2px solid #dc2626;border-radius:10px;padding:16px;text-align:center;margin-bottom:16px">
        <div style="font-size:36px">😓</div>
        <div style="font-weight:700;color:#dc2626;font-size:18px;margin-top:4px">ยังไม่ผ่าน</div>
        <div style="color:#991b1b;font-size:14px;margin-top:4px">${typeName} — ได้ ${correctCount}/${total} (ต้องได้ ${TEST_PASS} ขึ้นไป)</div>
      </div>`;
    }
  })() : '';

  const cardTitle = isTestMode ? 'ผลการสอบ' : 'ผลการฝึกหัด';
  const retryBtn = isTestMode
    ? `<button class="btn btn-primary" onclick="resetPractice()">สอบอีกครั้ง</button>`
    : `<button class="btn btn-primary" onclick="resetPractice()">ฝึกต่อ</button>`;

  document.getElementById('question-area').innerHTML = '';
  document.getElementById('results').innerHTML = `
    <div class="card">
      <div class="card-title">${cardTitle}</div>
      ${testBanner}
      <div style="text-align:center;padding:${isTestMode ? '8px' : '24px'} 0 24px">
        <div style="font-size:56px;font-weight:800;color:${scoreColor};line-height:1">${correctCount}/${total}</div>
        <div style="font-size:22px;font-weight:600;color:${scoreColor};margin-top:6px">${pct}%</div>
        <div style="color:var(--muted);margin-top:8px;font-size:14px">
          เวลา: ${mins > 0 ? `${mins} นาที ` : ''}${secs} วินาที
        </div>
      </div>
      ${total > 0 ? `
      <table class="table" style="margin-top:8px">
        <thead>
          <tr><th>#</th><th>โจทย์</th><th>ตอบ</th><th>เฉลย</th><th>ผล</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>` : ''}
      <div style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap">
        ${retryBtn}
        <a href="dashboard.html" class="btn btn-ghost">กลับหน้าหลัก</a>
      </div>
    </div>
  `;

  // ถ้าผ่าน → reload overview เพื่ออัปเดตชิป
  if (isTestMode && passed && typeof loadOverview === 'function') {
    loadOverview();
  }
}

function resetPractice() {
  sessionStartTime = null;
  sessionQuestions = [];
  sessionAnswers = [];
  filteredQuestions = [];
  usedIndices = new Set();
  currentQuestion = null;

  document.getElementById('question-area').innerHTML = '';
  document.getElementById('results').innerHTML = '';
  document.getElementById('setup-panel').style.display = '';
}

function logout() {
  fetch('/api/logout', { method: 'POST', credentials: 'include' });
  location.href = 'login.html';
}
