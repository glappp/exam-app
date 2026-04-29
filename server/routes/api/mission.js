/**
 * mission.js — API routes สำหรับ Mission System
 * GET  /api/mission/status          — สถานะวันนี้ (3 missions)
 * GET  /api/mission/quick-quiz      — ดึงข้อ Quick Quiz
 * POST /api/mission/quick-quiz/submit
 * GET  /api/mission/daily           — ดึงข้อ Daily Mission (seeded by date)
 * POST /api/mission/daily/submit
 * GET  /api/mission/weekly          — ดึงข้อ Weekly Challenge (seeded by week)
 * POST /api/mission/weekly/submit
 */
const express = require('express')
const router  = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma  = new PrismaClient()

const {
  XP, PARENT_PTS, TICKET,
  getCurrentGrade, getQuestionGrades,
  getDailySeed, getWeekSeed, getWeekKey,
  seededRandom, seededSample, todayICT,
  calcLevel, speedBonus, dailyMissionXp,
} = require('../../utils/gamification')

const {
  awardXP, awardTicket, awardParentPoints, awardDailyLogin,
} = require('../../utils/xp-service')

const { grantBox } = require('./box')

// ── Auth helper ───────────────────────────────────────────────────────────────
function requireLogin(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' })
  next()
}

// ── Question formatter ────────────────────────────────────────────────────────
function fmtQuestion(q) {
  return {
    id:       q.id,
    type:     q.type || 'mc',
    textTh:   q.textTh,
    image:    q.image || null,
    content:  q.content || null,
    choices:  q.choices,
    // ไม่ส่ง answer ไปหน้าบ้าน
  }
}

// ── Mission playable filter ───────────────────────────────────────────────────
// กรองเฉพาะข้อที่แสดงในหน้า mission ได้ (มีตัวเลือก + มีโจทย์)
function isMissionPlayable(q) {
  const hasChoices = Array.isArray(q.choices) && q.choices.length > 0
  const hasText    = (q.textTh && q.textTh.trim().length > 0) ||
    (Array.isArray(q.content) && q.content.some(b => b.type === 'text' && b.value))
  return hasChoices && hasText
}

// ── GET /api/mission/status ───────────────────────────────────────────────────
router.get('/status', requireLogin, async (req, res) => {
  const userId = req.session.userId
  const today  = todayICT()
  const week   = getWeekKey()

  const [qqLog, dailyLog, weeklyLog, profile, wallet] = await Promise.all([
    prisma.quickQuizLog.findUnique({ where: { userId_date: { userId, date: today } } }),
    prisma.missionDailyLog.findUnique({ where: { userId_date: { userId, date: today } } }),
    prisma.weeklyChallengeResult.findUnique({ where: { userId_weekKey: { userId, weekKey: week } } }),
    prisma.studentProfile.findFirst({ where: { userId, status: 'active' } }),
    prisma.ticketWallet.findUnique({ where: { userId } }),
  ])

  // นับ subtopic ที่ผ่านแล้ว
  const subtopicCount = profile
    ? await prisma.subtopicPass.count({ where: { studentProfileId: profile.id } })
    : 0

  res.json({
    today, week,
    ticketBalance: wallet?.balance ?? 0,
    quickQuiz: {
      setsToday:  qqLog?.setsCount ?? 0,
      maxSets:    3,
      xpToday:    qqLog?.xpEarned ?? 0,
      unlocked:   subtopicCount >= 5,
      subtopicCount,
    },
    daily: {
      done:       !!dailyLog?.completedAt,
      correctCount: dailyLog?.correctCount ?? 0,
      xpEarned:   dailyLog?.xpEarned ?? 0,
      ticketEarned: dailyLog?.ticketEarned ?? 0,
    },
    weekly: {
      attempts:   weeklyLog?.attempts ?? 0,
      bestScore:  weeklyLog?.bestScore ?? 0,
      xpEarned:   weeklyLog?.xpEarned ?? 0,
      maxScore:   10,
    },
  })
})

// ── GET /api/mission/quick-quiz ───────────────────────────────────────────────
router.get('/quick-quiz', requireLogin, async (req, res) => {
  const userId = req.session.userId

  const profile = await prisma.studentProfile.findFirst({
    where: { userId, status: 'active' },
  })
  if (!profile) return res.status(400).json({ error: 'ไม่พบข้อมูลนักเรียน' })

  // ตรวจ unlock
  const subtopicCount = await prisma.subtopicPass.count({
    where: { studentProfileId: profile.id },
  })
  if (subtopicCount < 5) {
    return res.status(403).json({
      error: `ต้องผ่าน subtopic อย่างน้อย 5 หัวข้อก่อน (ตอนนี้ผ่าน ${subtopicCount} หัวข้อ)`,
    })
  }

  // ดึง subtopic keys ที่ผ่านแล้ว
  const passes = await prisma.subtopicPass.findMany({
    where: { studentProfileId: profile.id },
    select: { subtopicKey: true },
  })
  const subtopicKeys = passes.map(p => p.subtopicKey)

  // ดึงข้อสอบที่มี subtopic ตรงกัน
  const allQuestions = await prisma.question.findMany({
    select: { id: true, textTh: true, type: true, image: true, content: true, choices: true, answer: true, shortAnswer: true, attributes: true },
  })

  const matched = allQuestions.filter(q => {
    const qSubs = q.attributes?.subtopic || []
    return qSubs.some(s => subtopicKeys.includes(s)) && isMissionPlayable(q)
  })

  // fallback: ถ้า subtopic ไม่ตรงเลย ใช้ข้อที่ playable ทั้งหมด
  const pool = matched.length >= 5
    ? matched
    : allQuestions.filter(isMissionPlayable)

  if (pool.length < 5) {
    return res.status(400).json({ error: 'ข้อสอบไม่เพียงพอ กรุณาผ่าน subtopic เพิ่ม' })
  }

  // สุ่ม 5 ข้อ (random ทุกครั้ง)
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 5)

  // เช็ค XP set
  const today  = todayICT()
  const qqLog  = await prisma.quickQuizLog.findUnique({
    where: { userId_date: { userId, date: today } },
  })
  const setsUsed = qqLog?.setsCount ?? 0

  res.json({
    questions:   shuffled.map(fmtQuestion),
    setNumber:   setsUsed + 1,
    earnXp:      setsUsed < 3,  // false ถ้าทำเกิน 3 ชุดแล้ว
    answers:     shuffled.map(q => ({ id: q.id, answer: q.answer, shortAnswer: q.shortAnswer })),
    // หมายเหตุ: answers ส่งมาพร้อมกันเพราะ quick quiz เฉลยทันที
  })
})

// ── POST /api/mission/quick-quiz/submit ───────────────────────────────────────
router.post('/quick-quiz/submit', requireLogin, async (req, res) => {
  const userId = req.session.userId
  const { results } = req.body
  // results: [{ questionId, correct: boolean }]

  if (!Array.isArray(results)) return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' })

  const today   = todayICT()
  const correct = results.filter(r => r.correct).length
  const xpGain  = correct * XP.QUICK_QUIZ_CORRECT

  // อัปเดต QuickQuizLog
  const existing = await prisma.quickQuizLog.findUnique({
    where: { userId_date: { userId, date: today } },
  })
  const setsUsed = existing?.setsCount ?? 0
  const earnXp   = setsUsed < 3

  let xpEarned = 0
  if (earnXp) {
    xpEarned = xpGain
    await awardXP(prisma, userId, xpEarned, 'activity')
    await awardParentPoints(prisma, userId, correct * PARENT_PTS.QUICK_QUIZ_CORRECT,
      'auto_mission', `Quick Quiz ถูก ${correct} ข้อ`)
  }

  await prisma.quickQuizLog.upsert({
    where:  { userId_date: { userId, date: today } },
    create: { userId, date: today, setsCount: 1, xpEarned },
    update: { setsCount: { increment: 1 }, xpEarned: { increment: xpEarned } },
  })

  await awardDailyLogin(prisma, userId)

  const newLog = await prisma.quickQuizLog.findUnique({
    where: { userId_date: { userId, date: today } },
  })

  res.json({
    correct, xpEarned, earnXp,
    setsTotal: newLog.setsCount,
    message:   earnXp ? `+${xpEarned} XP` : 'ทำเกิน 3 ชุดแล้ว ไม่ได้ XP เพิ่ม',
  })
})

// ── GET /api/mission/daily ────────────────────────────────────────────────────
router.get('/daily', requireLogin, async (req, res) => {
  const userId = req.session.userId
  const today  = todayICT()

  // เช็คว่าทำวันนี้แล้วหรือยัง
  const existing = await prisma.missionDailyLog.findUnique({
    where: { userId_date: { userId, date: today } },
  })
  if (existing?.completedAt) {
    return res.status(400).json({ error: 'ทำ Daily Mission วันนี้แล้ว', done: true })
  }

  // ดึง grade ของ user
  const profile = await prisma.studentProfile.findFirst({
    where: { userId, status: 'active' },
    select: { enrollmentYear: true, enrollmentGrade: true },
  })
  const gradeRange = profile
    ? getQuestionGrades(profile.enrollmentGrade, profile.enrollmentYear)
    : ['p4','p5','p6']

  // ดึงข้อสอบทั้งหมด (seeded by date)
  const allQuestions = await prisma.question.findMany({
    select: { id: true, textTh: true, type: true, image: true, content: true, choices: true, answer: true, shortAnswer: true, attributes: true, derivedFrom: true },
  })

  // กรอง: ต้องมีตัวเลือก + มีโจทย์ (isMissionPlayable) + grade ตรง
  const pool = allQuestions.filter(q => {
    const g = q.attributes?.examGrade
    const gradeOk = !g || gradeRange.includes(g)
    return gradeOk && isMissionPlayable(q)
  })

  if (pool.length < 5) {
    // fallback: ถ้า grade filter ทำให้น้อยเกิน ให้ใช้ทั้งหมดที่ playable
    const fallbackPool = allQuestions.filter(isMissionPlayable)
    if (fallbackPool.length < 5) {
      return res.status(400).json({ error: 'ข้อสอบในระบบไม่เพียงพอ' })
    }
    const seed = getDailySeed()
    const rng  = seededRandom(seed)
    const selected = seededSample(fallbackPool, 5, rng)
    const questions = selected.map(fmtQuestion)
    const answerKey = selected.map(q => ({ id: q.id, answer: q.answer, shortAnswer: q.shortAnswer }))
    return res.json({ questions, answerKey })
  }

  // seeded random จากวันที่
  const seed = getDailySeed()
  const rng  = seededRandom(seed)
  const selected = seededSample(pool, 5, rng)

  // ซ่อน answer
  const questions = selected.map(fmtQuestion)
  const answerKey = selected.map(q => ({
    id: q.id, answer: q.answer, shortAnswer: q.shortAnswer,
  }))

  res.json({ questions, answerKey })
})

// ── POST /api/mission/daily/submit ────────────────────────────────────────────
router.post('/daily/submit', requireLogin, async (req, res) => {
  const userId = req.session.userId
  const today  = todayICT()

  // ป้องกันทำซ้ำ
  const existing = await prisma.missionDailyLog.findUnique({
    where: { userId_date: { userId, date: today } },
  })
  if (existing?.completedAt) {
    return res.status(400).json({ error: 'ทำ Daily Mission วันนี้แล้ว' })
  }

  const { answers, leaderboardToken } = req.body
  // answers: [{ questionId, selectedAnswer, timeSec }]
  if (!Array.isArray(answers) || answers.length !== 5) {
    return res.status(400).json({ error: 'ข้อมูลคำตอบไม่ถูกต้อง' })
  }

  // ดึงคำตอบจาก DB
  const qIds = answers.map(a => a.questionId)
  const questions = await prisma.question.findMany({
    where: { id: { in: qIds } },
    select: { id: true, answer: true, shortAnswer: true },
  })
  const qMap = Object.fromEntries(questions.map(q => [q.id, q]))

  // ตรวจคำตอบและคำนวณ XP
  let totalXp   = 0
  let correct   = 0
  const detail  = answers.map(a => {
    const q = qMap[a.questionId]
    if (!q) return { questionId: a.questionId, correct: false, xp: 0 }

    const isCorrect = checkAnswer(a.selectedAnswer, q)
    const xp = isCorrect ? dailyMissionXp(a.timeSec ?? 60) : 0
    if (isCorrect) { correct++; totalXp += xp }
    return { questionId: a.questionId, correct: isCorrect, xp, timeSec: a.timeSec }
  })

  // Parent points: +3 per correct, +10 bonus ถ้าครบ 5/5
  const parentPts = (correct * PARENT_PTS.DAILY_CORRECT) +
    (correct === 5 ? PARENT_PTS.DAILY_PERFECT : 0)

  // Award XP
  if (totalXp > 0) await awardXP(prisma, userId, totalXp, 'activity')
  if (parentPts > 0) await awardParentPoints(prisma, userId, parentPts,
    'auto_mission', `Daily Mission: ถูก ${correct}/5 ข้อ`)

  // Award ticket ถ้าทำครบ (ตอบทุกข้อ ไม่ต้องถูกหมด)
  const ticketEarned = TICKET.DAILY_COMPLETE
  await awardTicket(prisma, userId, ticketEarned, 'earn_mission', 'Daily Mission ครบ')

  // บันทึก log
  await prisma.missionDailyLog.upsert({
    where:  { userId_date: { userId, date: today } },
    create: { userId, date: today, correctCount: correct, xpEarned: totalXp, ticketEarned, completedAt: new Date() },
    update: { correctCount: correct, xpEarned: totalXp, ticketEarned, completedAt: new Date() },
  })

  // แจก Silver Box 1 ใบทุกครั้งที่ทำ Daily Mission ครบ
  await grantBox(userId, 'silver', 1)

  await awardDailyLogin(prisma, userId)

  // ── Leaderboard submit (optional) ────────────────────────────────────────
  let leaderboardRank = null
  if (leaderboardToken) {
    try {
      // import token store จาก leaderboard route ไม่ได้ตรงๆ → ใช้ HTTP call ภายใน
      // ส่ง score = XP ที่ได้ (max 100) × 10 เพื่อให้ตัวเลขสวย
      const leaderboardScore = totalXp * 10 + correct * 50  // เช่น 100 XP + 5/5 = 1250
      const submitRes = await fetch(`http://localhost:${process.env.PORT || 3001}/api/leaderboard/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': req.headers.cookie || '' },
        body: JSON.stringify({ token: leaderboardToken, score: leaderboardScore }),
      })
      const submitData = await submitRes.json()
      if (submitData.rank) leaderboardRank = submitData.rank
    } catch (_) {
      // ถ้า leaderboard submit ล้มเหลว ไม่กระทบ daily mission ปกติ
    }
  }

  res.json({
    correct, total: 5, xpEarned: totalXp, ticketEarned, parentPts, detail,
    leaderboardRank,
    silverBoxEarned: 1,
    message: `ถูก ${correct}/5 ข้อ | +${totalXp} XP | +${ticketEarned} Ticket | +1 🎁`,
  })
})

// ── GET /api/mission/weekly ───────────────────────────────────────────────────
router.get('/weekly', requireLogin, async (req, res) => {
  const userId  = req.session.userId
  const weekKey = getWeekKey()

  // ดึงสถานะ
  const existing = await prisma.weeklyChallengeResult.findUnique({
    where: { userId_weekKey: { userId, weekKey } },
  })

  // ดึงข้อสอบทั้งหมด
  const allQuestions = await prisma.question.findMany({
    select: { id: true, textTh: true, type: true, image: true, content: true, choices: true, answer: true, shortAnswer: true, attributes: true, source: true },
  })

  // แบ่ง competitive vs non-competitive
  const competitive = allQuestions.filter(q =>
    q.source && (q.source.startsWith('ipst') || q.source.startsWith('chulabhorn'))
  )
  const others = allQuestions.filter(q =>
    !q.source || (!q.source.startsWith('ipst') && !q.source.startsWith('chulabhorn'))
  )

  // seeded random จาก week
  const seed = getWeekSeed(weekKey)
  const rng  = seededRandom(seed)

  // 3 ข้อ competitive (เหมือนกันทุกคน) + 7 ข้อจาก pool รวม
  const compSelected   = seededSample(competitive, 3, rng)
  const pool7          = [...others, ...competitive.filter(q => !compSelected.includes(q))]
  const otherSelected  = seededSample(pool7, 7, rng)

  // ผสมและสลับลำดับ (seed เดิม ลำดับเดิมทุกคน)
  const selected = [...compSelected, ...otherSelected].sort(() => rng() - 0.5)

  const questions = selected.map(fmtQuestion)

  res.json({
    questions,
    weekKey,
    timeLimitSec: 20 * 60,  // 20 นาที
    attempts: existing?.attempts ?? 0,
    bestScore: existing?.bestScore ?? 0,
  })
})

// ── POST /api/mission/weekly/submit ──────────────────────────────────────────
router.post('/weekly/submit', requireLogin, async (req, res) => {
  const userId  = req.session.userId
  const weekKey = getWeekKey()
  const { answers } = req.body
  // answers: [{ questionId, selectedAnswer }]

  if (!Array.isArray(answers) || answers.length !== 10) {
    return res.status(400).json({ error: 'ต้องส่งคำตอบครบ 10 ข้อ' })
  }

  // ดึงคำตอบจาก DB
  const qIds     = answers.map(a => a.questionId)
  const questions = await prisma.question.findMany({
    where: { id: { in: qIds } },
    select: { id: true, answer: true, shortAnswer: true },
  })
  const qMap = Object.fromEntries(questions.map(q => [q.id, q]))

  let correct = 0
  const detail = answers.map(a => {
    const q = qMap[a.questionId]
    const isCorrect = q ? checkAnswer(a.selectedAnswer, q) : false
    if (isCorrect) correct++
    return { questionId: a.questionId, correct: isCorrect }
  })

  // ดูประวัติ
  const existing = await prisma.weeklyChallengeResult.findUnique({
    where: { userId_weekKey: { userId, weekKey } },
  })
  const attempts   = (existing?.attempts ?? 0) + 1
  const bestScore  = Math.max(existing?.bestScore ?? 0, correct)
  const prevXpEarned = existing?.xpEarned ?? 0

  // คำนวณ XP
  let xpEarned = 0
  if (prevXpEarned === 0) {
    // ครั้งแรก
    if (correct === 10)      xpEarned = XP.WEEKLY_PERFECT
    else if (correct >= 8)   xpEarned = XP.WEEKLY_PASS
    else                     xpEarned = 0
  } else {
    // ซ่อม — ถ้าผ่าน (>=8) ได้ WEEKLY_RESIT แต่ต้องไม่เกินที่เคยได้
    if (correct >= 8 && prevXpEarned < XP.WEEKLY_RESIT) {
      xpEarned = XP.WEEKLY_RESIT - prevXpEarned
    }
  }

  // Award
  if (xpEarned > 0) await awardXP(prisma, userId, xpEarned, 'activity')
  if (correct >= 8 && prevXpEarned === 0) {
    // ผ่านครั้งแรกของสัปดาห์ → ticket + parent points (Gold Box มาจาก leaderboard เท่านั้น)
    await awardTicket(prisma, userId, TICKET.WEEKLY_PASS, 'earn_mission', `Weekly Challenge ผ่าน สัปดาห์ ${weekKey}`)
    await awardParentPoints(prisma, userId, PARENT_PTS.WEEKLY_PASS, 'auto_weekly', `Weekly Challenge ผ่าน`)
  }

  // บันทึก
  await prisma.weeklyChallengeResult.upsert({
    where:  { userId_weekKey: { userId, weekKey } },
    create: { userId, weekKey, attempts: 1, bestScore: correct, xpEarned },
    update: { attempts: { increment: 1 }, bestScore, xpEarned: { increment: xpEarned } },
  })

  res.json({
    correct, total: 10, xpEarned, attempts, bestScore,
    passed: correct >= 8,
    detail,
    message: correct === 10 ? '🏆 Perfect! +200 XP' :
             correct >= 8   ? `✅ ผ่าน! +${xpEarned} XP` :
             `❌ ไม่ผ่าน (${correct}/10) — ต้องถูก 8 ข้อขึ้น`,
  })
})

// ── Helper: ตรวจคำตอบ ─────────────────────────────────────────────────────────
function checkAnswer(selected, question) {
  if (!selected) return false
  if (question.answer) {
    return String(selected).trim().toLowerCase() === String(question.answer).trim().toLowerCase()
  }
  if (Array.isArray(question.shortAnswer)) {
    const norm = String(selected).trim().toLowerCase()
    return question.shortAnswer.some(a => String(a).trim().toLowerCase() === norm)
  }
  return false
}

module.exports = router
