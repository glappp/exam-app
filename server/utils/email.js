// server/utils/email.js
// ตั้งค่าใน .env:
//   GMAIL_USER=yourschool@gmail.com
//   GMAIL_PASS=xxxx xxxx xxxx xxxx  (Gmail App Password — 16 ตัว)
//   APP_URL=https://schoolpl.com

const nodemailer = require('nodemailer');

function createTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
}

async function sendPasswordReset(toEmail, resetUrl) {
  const transporter = createTransport();
  await transporter.sendMail({
    from: `"SchoolPL" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'รีเซ็ตรหัสผ่าน SchoolPL',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1e3a8a">รีเซ็ตรหัสผ่าน SchoolPL</h2>
        <p>กดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ ลิงก์นี้ใช้ได้ภายใน <strong>1 ชั่วโมง</strong></p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 28px;
                  background:#2563eb;color:#fff;text-decoration:none;
                  border-radius:8px;font-weight:700">
          ตั้งรหัสผ่านใหม่
        </a>
        <p style="color:#6b7280;font-size:13px">
          ถ้าไม่ได้ขอรีเซ็ต ไม่ต้องทำอะไร — รหัสผ่านเดิมยังใช้งานได้ปกติ
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
        <p style="color:#9ca3af;font-size:12px">SchoolPL — ระบบฝึกสอบออนไลน์</p>
      </div>
    `,
  });
}

module.exports = { sendPasswordReset };
