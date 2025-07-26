const CDN = import.meta.env.VITE_CDN_URL;

let currentAnswer = -1;
let currentQuestion = null;
let currentLang = 'th';

// 🔒 ตรวจสอบว่า login แล้ว
async function checkLogin() {
  const res = await fetch("/api/me", { credentials: "include" });
  if (!res.ok) return redirectToLogin();
  const data = await res.json();
  document.getElementById("greeting").innerText = `👋 สวัสดี, ${data.firstName || "ผู้ใช้"}`;
}

function redirectToLogin() {
  alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
  window.location.href = "login.html";
}

checkLogin();

function normalizeImageKey(key) {
  return key?.replace(/^\/?uploads\/+/, '').replace(/^\/+/, '');
}

function getImageUrl(key) {
  const cleanKey = normalizeImageKey(key);
  return `${CDN}/${cleanKey}`;
}

function getText(q) {
  return currentLang === 'th' ? q.textTh || q.text : q.textEn || q.text;
}

function getChoiceText(c) {
  return currentLang === 'th' ? c.textTh || c.text : c.textEn || c.text;
}

function changeLang(lang) {
  currentLang = lang;
  if (typeof renderCurrentQuestion === "function") renderCurrentQuestion();
}

async function startExam() {
  const chapterText = document.getElementById('chapter').value;
  const topicTag = topicMap[chapterText]; // แมปชื่อไทย → tag อังกฤษ

  const questionArea = document.getElementById('question-area');
  const res = await fetch('/api/practice/all');
  const data = await res.json();
  const allQuestions = data.questions || [];

  const filtered = allQuestions.filter(q =>
    q.attributes?.topic?.includes(`topic:${topicTag}`)
  );

  if (filtered.length === 0) {
    questionArea.innerHTML = `<p style="color:red;">❌ ไม่พบโจทย์ในบท "${chapterText}"</p>`;
    return;
  }

  const q = filtered[Math.floor(Math.random() * filtered.length)];
  currentAnswer = q.answer;
  currentQuestion = q;

  renderCurrentQuestion();
}

function renderCurrentQuestion() {
  const q = currentQuestion;
  const questionArea = document.getElementById('question-area');

  const choicesHTML = q.choices.map((c, i) => {
    const img = c.image ? `<img src="${getImageUrl(c.image)}" style="max-height:40px;"><br>` : '';
    return `
      <button onclick="checkAnswer(${i})" style="margin:8px;">
        ${img}${getChoiceText(c)}
      </button>`;
  }).join(" ");

  const questionImg = q.image
    ? `<img src="${getImageUrl(q.image)}" style="max-width:100%; height:auto;"><br>`
    : '';

  questionArea.innerHTML = `
    <p><strong>โจทย์:</strong> ${getText(q)}</p>
    ${questionImg}
    <div>${choicesHTML}</div>
    <p id="result"></p>
  `;
}

function checkAnswer(choiceIndex) {
  const result = document.getElementById('result');
  const isCorrect = choiceIndex === currentAnswer;

  result.innerHTML = isCorrect
    ? "<span style='color:green;'>✔️ ตอบถูก!</span>"
    : "<span style='color:red;'>❌ ตอบผิด</span>";

  saveResult(currentQuestion, choiceIndex, isCorrect);
  nextStepAfterAnswer(isCorrect);
}

async function saveResult(question, selected, isCorrect) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const res = await fetch('/api/result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id || "unknown",
      questionId: question.id,
      selected,
      isCorrect
    })
  });

  if (!res.ok) {
    console.error("❌ บันทึกผลล้มเหลว");
  } else {
    console.log("✅ บันทึกผลสำเร็จ");
  }
}

async function showResults() {
  const res = await fetch('/api/result');
  const results = await res.json();

  const container = document.getElementById("results");
  if (results.length === 0) {
    container.innerHTML = "<p>ยังไม่มีผลการทำข้อสอบ</p>";
    return;
  }

  container.innerHTML = results.map(r => `
    <p>
      [${new Date(r.createdAt).toLocaleString()}]<br>
      <strong>${getText(r.question)}</strong><br>
      ตอบ: <strong>${r.selected}</strong> →
      ${r.correct ? '<span style="color:green;">✔️ ถูก</span>' : '<span style="color:red;">❌ ผิด</span>'}
    </p>
  `).join("");
}

async function analyzeWeakness() {
  const res = await fetch('/api/analysis');
  const data = await res.json();

  const output = data.map(item => {
    const chapterKey = item.chapter;
    const chapterName = getTopicLabel(chapterKey);
    const suggestion = item.accuracy < 70 ? '→ 🔁 ควรทำซ้ำ' :
                       item.accuracy < 85 ? '→ ⚠️ พอใช้ได้' :
                                            '→ ✅ ดีมาก';
    return `
      <p>
        บท <strong>${chapterName}</strong>: ทำถูก ${item.correct}/${item.total} ครั้ง
        (<strong>${item.accuracy}%</strong>) ${suggestion}
      </p>
    `;
  }).join("");

  document.getElementById("analysis").innerHTML = output;
}

function nextStepAfterAnswer(isCorrect) {
  if (!isCorrect) {
    showExplanation(currentQuestion);
    setTimeout(loadNextQuestion, 2000);
  } else {
    setTimeout(loadNextQuestion, 1000);
  }
}

function showExplanation(question) {
  const explanationBox = document.getElementById("explanation");
  if (!explanationBox) return;

  explanationBox.innerHTML = question.explanation
    ? `<p><strong>เฉลย:</strong> ${question.explanation}</p>`
    : "";
}

async function logout() {
  await fetch("/api/logout", {
    method: "POST",
    credentials: "include"
  });
  window.location.href = "login.html";
}

function loadNextQuestion() {
  startExam();
}
