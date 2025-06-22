let currentAnswer = -1;
let currentQuestion = null;
let currentLang = 'th'; // 🌐 รองรับหลายภาษา

// ตรวจสอบว่า login แล้ว
function checkLogin() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || !user.id) {
    alert("กรุณาเข้าสู่ระบบก่อนทำข้อสอบ");
    window.location.href = "login.html";
  }
}

checkLogin(); // เรียกทันทีเมื่อโหลด script

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
  const topicKey = document.getElementById('chapter').value;
  const chapterText = document.getElementById('chapter').value;
  const topicTag = topicMap[chapterText]; // แมปชื่อไทย → tag อังกฤษ

  const questionArea = document.getElementById('question-area');

  const res = await fetch('http://localhost:3001/questions/all');
  const data = await res.json();
  const allQuestions = data.questions || [];

  console.log("📦 allQuestions:", allQuestions);

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

  const choicesHTML = q.choices.map((c, i) =>
    `<button onclick="checkAnswer(${i})" style="margin: 8px;">
      ${c.image ? `<img src="/uploads/${c.image}" style="max-height:40px;"><br>` : ""}
      ${getChoiceText(c)}
    </button>`
  ).join(" ");

  questionArea.innerHTML = `
    <p><strong>โจทย์:</strong> ${getText(q)}</p>
    ${q.image ? `<img src="/uploads/${q.image}" style="max-width:100%; height:auto;"><br>` : ''}
    <div>${choicesHTML}</div>
    <p id="result"></p>
  `;
}

function getChoiceText(choice) {
  const lang = document.getElementById("language")?.value || "th";
  if (typeof choice === "string") return choice;
  return lang === "en" ? choice.textEn : choice.textTh;
}

function getText(q) {
  const lang = document.getElementById("language")?.value || "th";
  return lang === "en" ? q.textEn : q.textTh;
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

  const res = await fetch('http://localhost:3001/results', {
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
  const res = await fetch('http://localhost:3001/results');
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
  console.log("🧠 เริ่มวิเคราะห์จุดอ่อน...");
  const res = await fetch('http://localhost:3001/analysis');
  const data = await res.json();
  console.log("📊 ผลลัพธ์จาก /analysis:", data);

  const output = data.map(item => {
    const chapterKey = item.chapter;
    const chapterName = getTopicLabel(chapterKey); // ดึงชื่อบทภาษาไทยจาก reverseTopicMap
    const suggestion = item.accuracy < 70 ? '→ 🔁 ควรทำซ้ำ' :
                       item.accuracy < 85 ? '→ ⚠️ พอใช้ได้' :
                                            '→ ✅ ดีมาก';
    return `
      <p>
        บท <strong>${chapterName}</strong>:
        ทำถูก ${item.correct}/${item.total} ครั้ง
        (<strong>${item.accuracy}%</strong>) ${suggestion}
      </p>
    `;
  }).join("");

  document.getElementById("analysis").innerHTML = output;
}

function nextStepAfterAnswer(isCorrect) {
  if (!isCorrect) {
    showExplanation(currentQuestion); // ← สำหรับอนาคต
    setTimeout(() => {
      loadNextQuestion();
    }, 2000);
  } else {
    setTimeout(() => {
      loadNextQuestion();
    }, 1000);
  }
}

function showExplanation(question) {
  const explanationBox = document.getElementById("explanation");
  if (!explanationBox) return; // ป้องกันกรณีไม่มี element

  explanationBox.innerHTML = question.explanation
    ? `<p><strong>เฉลย:</strong> ${question.explanation}</p>`
    : "";
}


function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html"; // หรือชื่อไฟล์หน้า login ของคุณ
}

function loadNextQuestion() {
  startExam();  // หรือ logic อื่นที่สุ่มข้อใหม่
}

