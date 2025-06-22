function startExam() {
  const chapter = document.getElementById('chapter').value;
  const questionArea = document.getElementById('question-area');

  // จำลองโจทย์แบบง่าย ๆ
  const questions = {
    area: "จงหาพื้นที่ของรูปสี่เหลี่ยมผืนผ้าที่มีความยาว 8 ซม. และกว้าง 5 ซม.",
    equation: "ถ้า 2x + 3 = 11 แล้วค่า x คืออะไร?"
  };

  questionArea.innerHTML = `<p><strong>โจทย์:</strong> ${questions[chapter]}</p>`;
}
