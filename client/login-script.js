async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const status = document.getElementById("status");

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include"  // ✅ สำคัญมาก: ให้ cookie เดินทางไปกับ request
    });

    const data = await res.json();

    if (res.ok) {
      status.innerText = "✅ เข้าสู่ระบบสำเร็จ";
      setTimeout(() => {
        window.location.href = "practice.html";
      }, 1000);
    } else {
      status.innerText = "❌ " + (data.message || "เข้าสู่ระบบไม่สำเร็จ");
    }
  } catch (err) {
    status.innerText = "⚠️ เกิดข้อผิดพลาด: " + err.message;
  }
}


