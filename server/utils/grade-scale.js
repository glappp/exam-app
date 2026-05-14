/**
 * grade-scale.js — คำนวณเกรดจากคะแนน โดยใช้ scale ของโรงเรียน
 */

const DEFAULT_RANGES = [
  { min: 80, grade: '4.00' },
  { min: 75, grade: '3.50' },
  { min: 70, grade: '3.00' },
  { min: 65, grade: '2.50' },
  { min: 60, grade: '2.00' },
  { min: 55, grade: '1.50' },
  { min: 50, grade: '1.00' },
  { min:  0, grade: '0.00' },
]

// VALID_GRADES: ค่าที่ถือว่าเป็นเกรดจริง (ไม่ใช่คะแนนที่ถูกใส่ผิดช่อง)
const VALID_GRADES = new Set(['4.00','3.50','3.00','2.50','2.00','1.50','1.00','0.00'])

/**
 * ดึง scale ของโรงเรียน (หรือ default ถ้าไม่มี)
 */
async function getScale(prisma, schoolName) {
  try {
    // หา schoolId จากชื่อโรงเรียน
    const school = schoolName
      ? await prisma.school.findFirst({ where: { name: schoolName }, select: { id: true } })
      : null

    if (school) {
      const row = await prisma.gradeScale.findUnique({ where: { schoolId: school.id } })
      if (row) return row.ranges
    }

    // fallback → global default
    const def = await prisma.gradeScale.findFirst({ where: { schoolId: null } })
    return def?.ranges || DEFAULT_RANGES
  } catch {
    return DEFAULT_RANGES
  }
}

/**
 * คำนวณเกรดจากคะแนนและ scale
 * @param {number|null} score
 * @param {Array}       ranges  — [{min, grade}] เรียงมากไปน้อย
 */
function calcGrade(score, ranges) {
  if (score == null || isNaN(score)) return null
  const sorted = [...ranges].sort((a, b) => b.min - a.min)
  for (const r of sorted) {
    if (score >= r.min) return r.grade
  }
  return '0.00'
}

/**
 * ได้เกรดจาก record — ใช้ gradeValue ที่มีอยู่ถ้า valid, ไม่งั้นคำนวณ
 */
function resolveGrade(gradeValue, totalScore, ranges) {
  if (gradeValue && VALID_GRADES.has(String(gradeValue))) return gradeValue
  return calcGrade(totalScore, ranges)
}

module.exports = { getScale, calcGrade, resolveGrade, DEFAULT_RANGES }
