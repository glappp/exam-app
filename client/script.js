let currentLang = 'th';
let currentQuestion = null;
let currentAnswer = -1;

// Practice session state
let sessionStartTime = null;
let sessionQuestions = [];
let sessionAnswers = [];
let filteredQuestions = [];
let usedIndices = new Set();

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
      <strong>${String.fromCharCode(65 + i)}.</strong> ${getChoiceText(c)}
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
    : `<span class="badge badge-error">✘ ผิด — เฉลยคือ ข้อ ${String.fromCharCode(65 + currentAnswer)} (ข้อนี้จะกลับมาอีก)</span>`;

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

async function startExam() {
  document.getElementById('setup-panel').style.display = 'none';
  document.getElementById('results').innerHTML = '';
  document.getElementById('question-area').innerHTML =
    '<p style="text-align:center;padding:32px;color:var(--muted)">กำลังโหลดโจทย์...</p>';

  try {
    let allQuestions;

    if (isAdaptive) {
      const res = await fetch('/api/exam-set/adaptive', { credentials: 'include' });
      if (!res.ok) throw new Error('โหลดโจทย์ไม่สำเร็จ');
      const data = await res.json();
      allQuestions = data.questions || [];

      // แสดง banner ว่าเน้นหัวข้อไหน
      const desc = document.getElementById('adaptive-desc');
      if (data.weakTopicTags?.length > 0) {
        const labels = data.weakTopicTags.map(t => {
          const key = t.replace('topic:', '');
          return reverseTopicMap[key] || key;
        });
        desc.textContent = `เน้นจุดอ่อน: ${labels.join(', ')}`;
      } else {
        desc.textContent = 'ยังไม่มีประวัติสอบ — สุ่มโจทย์ทั่วไปให้';
      }
      document.getElementById('adaptive-banner').style.display = 'block';
    } else {
      const chapterText = document.getElementById('chapter').value;
      const topicTag = topicMap[chapterText];
      const res = await fetch('/questions/all', { credentials: 'include' });
      if (!res.ok) throw new Error('โหลดโจทย์ไม่สำเร็จ');
      const data = await res.json();
      allQuestions = data.questions || [];
      filteredQuestions = topicTag
        ? allQuestions.filter(q => q.attributes?.topic?.includes(`topic:${topicTag}`))
        : allQuestions;

      if (filteredQuestions.length === 0) {
        document.getElementById('question-area').innerHTML =
          `<div class="card"><p class="msg msg-error">ไม่พบโจทย์ในหัวข้อ "${chapterText}"</p></div>`;
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
  const available = filteredQuestions
    .map((_, i) => i)
    .filter(i => !usedIndices.has(i));

  let idx;
  if (available.length === 0) {
    // ทำครบทุกข้อแล้ว วนใหม่
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
  const answered = sessionQuestions.length;

  const choicesHTML = (q.choices || []).map((c, i) =>
    `<button class="choice-btn" id="choice-${i}" onclick="checkAnswer(${i})">
      ${c.image ? `<img src="/uploads/${c.image}" style="max-height:50px;margin-bottom:4px;display:block">` : ''}
      <strong>${String.fromCharCode(65 + i)}.</strong> ${getChoiceText(c)}
    </button>`
  ).join('');

  const endBtn = answered > 0
    ? `<button class="btn btn-ghost" style="margin-top:16px;width:100%" onclick="submitAndShowResults()">
        จบการฝึก (ทำแล้ว ${answered} ข้อ)
       </button>`
    : '';

  document.getElementById('question-area').innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span class="card-title" style="margin:0">ข้อที่ ${answered + 1}</span>
        ${answered > 0 ? `<span style="font-size:13px;color:var(--muted)">ทำไปแล้ว ${answered} ข้อ</span>` : ''}
      </div>
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
    : `<span class="badge badge-error">✘ ผิด — เฉลยคือ ข้อ ${String.fromCharCode(65 + currentAnswer)}</span>`;

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
    const res = await fetch('/api/submit-exam', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: isAdaptive ? 'adaptive' : 'practice',
        questions: sessionQuestions.map(q => q.id),
        answers: sessionAnswers,
        durationSec
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
  const { correctCount, total } = data;
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
        <td style="text-align:center">${String.fromCharCode(65 + sessionAnswers[i])}</td>
        <td style="text-align:center">${String.fromCharCode(65 + q.answer)}</td>
        <td style="text-align:center">
          <span class="badge ${correct ? 'badge-success' : 'badge-error'}">${correct ? 'ถูก' : 'ผิด'}</span>
        </td>
      </tr>
    `;
  }).join('');

  document.getElementById('question-area').innerHTML = '';
  document.getElementById('results').innerHTML = `
    <div class="card">
      <div class="card-title">ผลการฝึกหัด</div>
      <div style="text-align:center;padding:24px 0">
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
        <button class="btn btn-primary" onclick="resetPractice()">ฝึกต่อ</button>
        <a href="dashboard.html" class="btn btn-ghost">กลับหน้าหลัก</a>
      </div>
    </div>
  `;
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
