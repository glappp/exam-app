/**
 * gamification.js — utility functions สำหรับระบบ Gamification
 *
 * Grade calculation, League assignment, Mission seeding, XP/Level
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const TERM_START_MONTH = 5   // พฤษภาคม (1-indexed)
const TERM_START_DAY   = 16  // วันที่ 16 พ.ค. = เริ่มปีการศึกษาใหม่

const GRADE_ORDER = ['p1','p2','p3','p4','p5','p6']
const GRADE_CAP   = 'p6'  // ขยายถึง m3 ทีหลัง

// XP per activity
const XP = {
  QUICK_QUIZ_CORRECT:    5,
  DAILY_MISSION_BASE:    10,   // × speed bonus
  WEEKLY_PERFECT:        200,  // 10/10
  WEEKLY_PASS:           100,  // 8-9/10
  WEEKLY_RESIT:          50,   // ซ่อมผ่าน
  SUBTOPIC_PASS:         30,   // ถาวร
  TOPIC_PASS:            80,   // ถาวร
}

// Level thresholds (tiered) — XP ที่ต้องการเพื่อขึ้นจาก LV N → N+1
function xpForLevel(level) {
  if (level <= 5)  return 300
  if (level <= 10) return 600
  if (level <= 15) return 1000
  return 1500  // LV16-20
}

// XP สะสมที่ต้องการถึง LV N (จาก LV1)
function totalXpForLevel(targetLevel) {
  let total = 0
  for (let lv = 1; lv < targetLevel; lv++) {
    total += xpForLevel(lv)
  }
  return total
}

// Parent Points per activity
const PARENT_PTS = {
  LOGIN:              2,
  QUICK_QUIZ_CORRECT: 1,   // per ข้อ
  DAILY_CORRECT:      3,   // per ข้อ
  DAILY_PERFECT:      10,  // bonus ถ้าถูกหมด 5/5
  SUBTOPIC_PASS:      5,
  TOPIC_PASS:         15,
  WEEKLY_PASS:        50,
  STREAK_7:           20,
}

// Ticket sources
const TICKET = {
  DAILY_COMPLETE:   1,   // ทำ daily mission ครบวัน
  WEEKLY_PASS:      2,   // weekly challenge ผ่าน
  STREAK_7:         1,   // streak 7 วันติด
  XP_OVERFLOW_RATE: 100, // LV20: ทุก 100 XP = 1 ticket
}

// ─── Grade Calculation ────────────────────────────────────────────────────────

/**
 * คำนวณปีการศึกษาปัจจุบัน (พ.ศ.)
 * ก่อน 16 พ.ค. = ปีการศึกษาก่อนหน้า
 */
function getCurrentAcademicYear(date = new Date()) {
  const month = date.getMonth() + 1  // 1-indexed
  const day   = date.getDate()
  const thYear = date.getFullYear() + 543

  const isNewTerm = (month > TERM_START_MONTH) ||
    (month === TERM_START_MONTH && day >= TERM_START_DAY)

  return isNewTerm ? thYear : thYear - 1
}

/**
 * คำนวณชั้นปัจจุบันของนักเรียน
 * @param {string|null} enrollmentGrade  — "p1"|"p2"|...|"p6"
 * @param {string|null} enrollmentYear  — ปีการศึกษา เช่น "2567"
 * @param {Date} [date]
 * @returns {"p1"|"p2"|"p3"|"p4"|"p5"|"p6"}
 */
function getCurrentGrade(enrollmentGrade, enrollmentYear, date = new Date()) {
  if (!enrollmentGrade || !enrollmentYear) return GRADE_CAP

  const startIdx    = GRADE_ORDER.indexOf(enrollmentGrade)
  if (startIdx === -1) return GRADE_CAP

  const currentAcYear  = getCurrentAcademicYear(date)
  const yearsElapsed   = currentAcYear - parseInt(enrollmentYear, 10)
  const calcIdx        = Math.min(startIdx + yearsElapsed, GRADE_ORDER.indexOf(GRADE_CAP))
  const clampedIdx     = Math.max(0, calcIdx)

  return GRADE_ORDER[clampedIdx]
}

/**
 * คืน array of grades ที่ควรใช้ใน Daily Mission
 * ช่วงปิดเทอม (ก่อน 16 พ.ค.): รวม grade ปีก่อนด้วย
 * @returns {string[]} เช่น ["p4","p5"] หรือ ["p5","p6"]
 */
function getQuestionGrades(enrollmentGrade, enrollmentYear, date = new Date()) {
  const current  = getCurrentGrade(enrollmentGrade, enrollmentYear, date)
  const currIdx  = GRADE_ORDER.indexOf(current)

  // ช่วงปิดเทอม: เดือน มี.ค.–พ.ค. ก่อนวันเปิดเทอม → รวม grade เก่าด้วย
  const month = date.getMonth() + 1
  const day   = date.getDate()
  const isBreak = (month === 3 || month === 4) ||
    (month === TERM_START_MONTH && day < TERM_START_DAY)

  const grades = []
  for (let i = 0; i <= currIdx; i++) {
    grades.push(GRADE_ORDER[i])
  }

  // ถ้าปิดเทอม ไม่ต้องเพิ่มอะไร เพราะ grades มีทั้งหมดแล้ว (p4 ถึง current)
  // ไม่ต้องแยก logic พิเศษ

  return grades
}

// ─── League Assignment ────────────────────────────────────────────────────────

/**
 * คืน league ที่บังคับสำหรับ grade นั้น
 * เด็กเล็ก (p1-p3) เลือกได้เอง ระบบจะไม่ lock
 * @returns {"A"|"B"|"C"}
 */
function getDefaultLeague(grade) {
  if (['p1','p2'].includes(grade))        return 'A'
  if (['p3','p4'].includes(grade))        return 'B'
  return 'C'  // p5, p6, หรือ default
}

/**
 * ตรวจสอบว่า grade นี้ถูก lock league ไหม
 * p1-p3 เลือกได้เอง (ไม่ lock)
 * p4-p6 lock อยู่ใน league ของตัวเอง
 */
function isLeagueLocked(grade) {
  return ['p4','p5','p6'].includes(grade)
}

// ─── Daily Mission Seed ───────────────────────────────────────────────────────

/**
 * สร้าง seeded random number จากวันที่ (deterministic)
 * ทุกคนที่ query วันเดียวกันได้ sequence เดียวกัน
 */
function seededRandom(seed) {
  // Simple LCG (Linear Congruential Generator)
  let s = seed
  return function() {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

/**
 * สร้าง seed จากวันที่ (ICT, UTC+7)
 * @param {Date} [date]
 * @returns {number}
 */
function getDailySeed(date = new Date()) {
  const ict = new Date(date.getTime() + 7 * 60 * 60 * 1000)
  const dateStr = ict.toISOString().slice(0, 10)  // "2026-04-30"
  let hash = 0
  for (const ch of dateStr) {
    hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff
  }
  return hash >>> 0
}

/**
 * สร้าง seed จาก ISO week (YYYY-WNN)
 */
function getWeekSeed(weekKey) {
  let hash = 0
  for (const ch of weekKey) {
    hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff
  }
  return hash >>> 0
}

/**
 * คืน ISO week key ของวันที่ที่กำหนด เช่น "2026-W18"
 */
function getWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

/**
 * สุ่ม N items จาก array โดยใช้ seeded random
 */
function seededSample(arr, n, rng) {
  const copy = [...arr]
  const result = []
  for (let i = 0; i < Math.min(n, copy.length); i++) {
    const idx = Math.floor(rng() * (copy.length - i))
    result.push(copy[i + idx])
    const temp = copy[i]; copy[i] = copy[i + idx]; copy[i + idx] = temp
  }
  return result
}

// ─── XP / Level ───────────────────────────────────────────────────────────────

/**
 * คำนวณ level จาก totalXp (activityXp + permanentXp)
 * Max level = 20
 */
function calcLevel(totalXp) {
  let level = 1
  let xpUsed = 0
  while (level < 20) {
    const needed = xpForLevel(level)
    if (xpUsed + needed > totalXp) break
    xpUsed += needed
    level++
  }
  return level
}

/**
 * คำนวณ speed bonus สำหรับ Daily Mission
 * @param {number} timeTakenSec — เวลาที่ใช้ตอบ (วินาที)
 * @returns {number} multiplier (1.0 – 2.0)
 */
function speedBonus(timeTakenSec) {
  return Math.max(1, 2 - timeTakenSec / 60)
}

/**
 * คำนวณ XP ที่ได้จาก Daily Mission 1 ข้อ
 */
function dailyMissionXp(timeTakenSec) {
  return Math.round(XP.DAILY_MISSION_BASE * speedBonus(timeTakenSec))
}

// ─── ICT Date String ──────────────────────────────────────────────────────────

/**
 * คืนวันที่ปัจจุบันในรูป "YYYY-MM-DD" (ICT, UTC+7)
 */
function todayICT(date = new Date()) {
  const ict = new Date(date.getTime() + 7 * 60 * 60 * 1000)
  return ict.toISOString().slice(0, 10)
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  XP,
  PARENT_PTS,
  TICKET,
  GRADE_ORDER,
  GRADE_CAP,
  xpForLevel,
  totalXpForLevel,
  calcLevel,
  speedBonus,
  dailyMissionXp,
  getCurrentAcademicYear,
  getCurrentGrade,
  getQuestionGrades,
  getDefaultLeague,
  isLeagueLocked,
  seededRandom,
  getDailySeed,
  getWeekSeed,
  getWeekKey,
  seededSample,
  todayICT,
}
