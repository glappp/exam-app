// feedback-widget.js — ปุ่มลอยมุมขวาล่าง + popup ส่ง feedback
(function () {
  const CSS = `
    #fb-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 8000;
      background: #2563eb; color: #fff; border: none; border-radius: 99px;
      padding: 10px 18px; font-size: 13px; font-weight: 700;
      cursor: pointer; box-shadow: 0 4px 14px rgba(37,99,235,.35);
      display: flex; align-items: center; gap: 6px;
      font-family: inherit; transition: background .15s, transform .15s;
    }
    #fb-btn:hover { background: #1d4ed8; transform: translateY(-2px); }

    #fb-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,.45); z-index: 8500;
      align-items: center; justify-content: center;
    }
    #fb-overlay.open { display: flex; }

    #fb-box {
      background: #fff; border-radius: 16px; padding: 28px 24px;
      width: 90%; max-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,.2);
      animation: fb-in .2s ease;
    }
    @keyframes fb-in {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    #fb-box h3 {
      margin: 0 0 4px; font-size: 16px; color: #111;
    }
    #fb-box p {
      margin: 0 0 16px; font-size: 13px; color: #6b7280;
    }
    .fb-label {
      display: block; font-size: 12px; font-weight: 700;
      color: #374151; margin-bottom: 5px;
    }
    .fb-input {
      width: 100%; box-sizing: border-box;
      border: 1.5px solid #e5e7eb; border-radius: 8px;
      padding: 9px 12px; font-size: 14px; font-family: inherit;
      margin-bottom: 14px; outline: none; transition: border-color .15s;
    }
    .fb-input:focus { border-color: #2563eb; }
    textarea.fb-input { resize: vertical; min-height: 90px; }
    #fb-send {
      width: 100%; padding: 11px; background: #2563eb; color: #fff;
      border: none; border-radius: 8px; font-size: 14px; font-weight: 700;
      cursor: pointer; font-family: inherit; transition: background .15s;
    }
    #fb-send:hover:not(:disabled) { background: #1d4ed8; }
    #fb-send:disabled { background: #93c5fd; cursor: default; }
    #fb-cancel {
      width: 100%; padding: 9px; background: none; color: #6b7280;
      border: none; font-size: 13px; cursor: pointer; margin-top: 8px;
      font-family: inherit;
    }
    #fb-cancel:hover { color: #374151; }
    #fb-success {
      display: none; text-align: center; padding: 12px 0 4px;
      font-size: 15px; color: #16a34a; font-weight: 700;
    }
  `;

  // inject CSS
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  // inject HTML
  document.body.insertAdjacentHTML('beforeend', `
    <button id="fb-btn">💬 แนะนำ / แจ้งปัญหา</button>

    <div id="fb-overlay">
      <div id="fb-box">
        <h3>💬 ความคิดเห็น</h3>
        <p>แนะนำฟีเจอร์ แจ้งปัญหา หรือให้คะแนนเนื้อหา</p>
        <label class="fb-label" for="fb-name">ชื่อ (ไม่บังคับ)</label>
        <input class="fb-input" id="fb-name" type="text" placeholder="ชื่อของคุณ">
        <label class="fb-label" for="fb-msg">ข้อความ *</label>
        <textarea class="fb-input" id="fb-msg" placeholder="เขียนความคิดเห็นที่นี่..."></textarea>
        <div id="fb-success">✅ ขอบคุณสำหรับความคิดเห็น!</div>
        <button id="fb-send">ส่ง</button>
        <button id="fb-cancel">ยกเลิก</button>
      </div>
    </div>
  `);

  const overlay  = document.getElementById('fb-overlay');
  const btn      = document.getElementById('fb-btn');
  const sendBtn  = document.getElementById('fb-send');
  const cancelBtn= document.getElementById('fb-cancel');
  const success  = document.getElementById('fb-success');

  btn.addEventListener('click', () => {
    overlay.classList.add('open');
    document.getElementById('fb-msg').focus();
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeWidget();
  });

  cancelBtn.addEventListener('click', closeWidget);

  sendBtn.addEventListener('click', async () => {
    const msg = document.getElementById('fb-msg').value.trim();
    if (!msg) { document.getElementById('fb-msg').focus(); return; }

    sendBtn.disabled = true;
    sendBtn.textContent = 'กำลังส่ง...';

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name:    document.getElementById('fb-name').value.trim() || null,
          message: msg,
          page:    location.pathname,
        })
      });
      success.style.display = 'block';
      sendBtn.style.display = 'none';
      cancelBtn.textContent = 'ปิด';
    } catch {
      sendBtn.disabled = false;
      sendBtn.textContent = 'ส่ง';
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  });

  function closeWidget() {
    overlay.classList.remove('open');
    // reset
    setTimeout(() => {
      document.getElementById('fb-name').value = '';
      document.getElementById('fb-msg').value  = '';
      success.style.display = 'none';
      sendBtn.style.display = 'block';
      sendBtn.disabled      = false;
      sendBtn.textContent   = 'ส่ง';
      cancelBtn.textContent = 'ยกเลิก';
    }, 300);
  }
})();
