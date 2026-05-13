/**
 * lv-up.js — LV-up milestone modal
 * ใช้ร่วมกันระหว่างหน้า result ต่างๆ
 *
 * Usage: ใส่ <script src="/lv-up.js"></script> แล้วเรียก
 *   showLvUpIfMilestone(characterLevel)
 * โดย characterLevel = { level, prevLevel, xpGain, totalXp }
 */

(function () {

  // ── Title ตาม level range ───────────────────────────────────────
  function getTitleInfo(level) {
    if (level >= 30) return { title: 'ตำนาน',             icon: '👑', color: '#f59e0b', bg: 'linear-gradient(135deg,#78350f,#92400e)' };
    if (level >= 25) return { title: 'พาลาดิน',           icon: '✨', color: '#a78bfa', bg: 'linear-gradient(135deg,#1e1b4b,#312e81)' };
    if (level >= 20) return { title: 'อัศวิน',            icon: '🏇', color: '#60a5fa', bg: 'linear-gradient(135deg,#1e3a5f,#1e40af)' };
    if (level >= 15) return { title: 'นักรบระดับสูง',     icon: '🗡️', color: '#34d399', bg: 'linear-gradient(135deg,#064e3b,#065f46)' };
    if (level >= 10) return { title: 'นักรบระดับกลาง',   icon: '🛡️', color: '#6ee7b7', bg: 'linear-gradient(135deg,#134e4a,#0f766e)' };
    if (level >= 5)  return { title: 'นักรบฝึกหัด',       icon: '⚔️', color: '#fbbf24', bg: 'linear-gradient(135deg,#1c1917,#44403c)' };
    return null;
  }

  // ── Inject CSS (ครั้งเดียว) ─────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('lvup-styles')) return;
    const s = document.createElement('style');
    s.id = 'lvup-styles';
    s.textContent = `
      #lvup-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,.72);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999; padding: 16px;
        animation: lvup-fadein .25s ease both;
      }
      @keyframes lvup-fadein { from { opacity:0 } to { opacity:1 } }

      #lvup-box {
        max-width: 380px; width: 100%;
        border-radius: 24px;
        padding: 36px 28px 28px;
        text-align: center;
        position: relative;
        overflow: hidden;
        animation: lvup-popin .5s cubic-bezier(.34,1.56,.64,1) both;
      }
      @keyframes lvup-popin {
        0%   { transform: scale(.5) translateY(40px); opacity: 0; }
        60%  { transform: scale(1.06) translateY(-4px); opacity: 1; }
        100% { transform: scale(1) translateY(0); }
      }

      #lvup-particles {
        position: absolute; inset: 0; pointer-events: none; overflow: hidden;
      }
      .lvup-particle {
        position: absolute; border-radius: 50%;
        animation: lvup-float 1.8s ease-out both;
      }
      @keyframes lvup-float {
        0%   { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(-120px) scale(0); opacity: 0; }
      }

      #lvup-icon { font-size: 64px; line-height: 1; margin-bottom: 8px; display: block; }
      #lvup-badge {
        font-size: 11px; font-weight: 800; letter-spacing: 1.5px;
        text-transform: uppercase; opacity: .75; margin-bottom: 6px;
      }
      #lvup-level {
        font-size: 42px; font-weight: 900; line-height: 1; margin-bottom: 4px;
      }
      #lvup-title {
        font-size: 22px; font-weight: 800; margin-bottom: 18px;
      }
      #lvup-xp {
        font-size: 13px; opacity: .65; margin-bottom: 24px;
      }
      #lvup-close {
        width: 100%; padding: 13px;
        border: none; border-radius: 12px;
        font-size: 15px; font-weight: 700;
        cursor: pointer;
        background: rgba(255,255,255,.18);
        color: #fff;
        transition: background .15s;
      }
      #lvup-close:hover { background: rgba(255,255,255,.28); }
    `;
    document.head.appendChild(s);
  }

  // ── Particle burst ──────────────────────────────────────────────
  function spawnParticles(container, color) {
    const colors = [color, '#fff', '#fbbf24', '#a78bfa'];
    for (let i = 0; i < 18; i++) {
      const el = document.createElement('div');
      el.className = 'lvup-particle';
      const size = 6 + Math.random() * 10;
      el.style.cssText = [
        `width:${size}px`, `height:${size}px`,
        `background:${colors[i % colors.length]}`,
        `left:${10 + Math.random() * 80}%`,
        `top:${20 + Math.random() * 60}%`,
        `animation-delay:${Math.random() * .6}s`,
        `animation-duration:${1.2 + Math.random() * 1}s`,
      ].join(';');
      container.appendChild(el);
    }
  }

  // ── Main: show modal ────────────────────────────────────────────
  window.showLvUpIfMilestone = function (cl) {
    if (!cl) return;
    const { level, prevLevel } = cl;
    if (!level || level % 5 !== 0) return;           // ไม่ใช่ milestone
    if (prevLevel != null && level <= prevLevel) return;  // ไม่ได้ level up

    const info = getTitleInfo(level);
    if (!info) return;

    injectStyles();

    const overlay = document.createElement('div');
    overlay.id = 'lvup-overlay';
    overlay.innerHTML = `
      <div id="lvup-box" style="background:${info.bg};color:#fff">
        <div id="lvup-particles"></div>
        <span id="lvup-icon">${info.icon}</span>
        <div id="lvup-badge" style="color:${info.color}">LEVEL UP!</div>
        <div id="lvup-level" style="color:${info.color}">LV ${level}</div>
        <div id="lvup-title">${info.title}</div>
        <div id="lvup-xp">XP สะสม: ${(cl.totalXp || 0).toLocaleString()}</div>
        <button id="lvup-close">ยอดเยี่ยม! ✨</button>
      </div>`;

    document.body.appendChild(overlay);
    spawnParticles(overlay.querySelector('#lvup-particles'), info.color);
    overlay.querySelector('#lvup-close').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  };

})();
