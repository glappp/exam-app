// update-demo-students.js
// 1. อัปเดต StudentProfile ของ a1-a29 เป็นชั้น "ป.0" (ไม่ให้ปนกับข้อมูลจริง)
// 2. สร้าง AcademicRecord จำลองสำหรับ a23 (ชัยวงศ์ สุขัง) ป.1–ป.6 ปีละ 2 เทอม
//
// รัน: node scripts/update-demo-students.js [--dry-run]

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes('--dry-run');

const SCHOOL = 'ฮั่วเคี้ยวบุรีรัมย์';

// รายวิชา (จาก CSV จริงของโรงเรียน — ใช้ชุดเดียวกันทุกชั้น)
const SUBJECTS = [
  { code: 'ท',   name: 'ภาษาไทย' },
  { code: 'ค',   name: 'คณิตศาสตร์' },
  { code: 'คส',  name: 'คณิตศาสตร์เสริม' },
  { code: 'ว',   name: 'วิทยาศาสตร์' },
  { code: 'วส',  name: 'วิทยาศาสตร์เสริม' },
  { code: 'ส',   name: 'สังคมศึกษา' },
  { code: 'ปว',  name: 'ประวัติศาสตร์' },
  { code: 'อ',   name: 'ภาษาอังกฤษ' },
  { code: 'อส',  name: 'ภาษาอังกฤษเสริม' },
  { code: 'จ',   name: 'ภาษาจีนหลัก' },
  { code: 'จส',  name: 'ภาษาจีนเพื่อการสื่อสาร' },
  { code: 'ง',   name: 'การงานอาชีพ' },
  { code: 'ศ',   name: 'ศิลปะ' },
  { code: 'พ',   name: 'สุขศึกษาและพลศึกษา' },
  { code: 'คอม', name: 'คอมพิวเตอร์/วิทยาการคำนวณ' },
];

// ชั้นเรียน p1-p6 → ปีการศึกษา (ปัจจุบัน p6 = 2568)
const GRADE_YEARS = [
  { grade: 'p1', label: 'ป.1', year: '2563', classroom: '2', roomType: 'มาตรฐาน' },
  { grade: 'p2', label: 'ป.2', year: '2564', classroom: '2', roomType: 'มาตรฐาน' },
  { grade: 'p3', label: 'ป.3', year: '2565', classroom: '2', roomType: 'มาตรฐาน' },
  { grade: 'p4', label: 'ป.4', year: '2566', classroom: '2', roomType: 'มาตรฐาน' },
  { grade: 'p5', label: 'ป.5', year: '2567', classroom: '2', roomType: 'มาตรฐาน' },
  { grade: 'p6', label: 'ป.6', year: '2568', classroom: '2', roomType: 'มาตรฐาน' },
];

// ฟังก์ชันสุ่มคะแนนในช่วง [min, max] ทศนิยม 1 ตำแหน่ง
function randScore(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

// คำนวณเกรด
function toGrade(score) {
  if (score >= 80) return '4.00';
  if (score >= 75) return '3.50';
  if (score >= 70) return '3.00';
  if (score >= 65) return '2.50';
  if (score >= 60) return '2.00';
  if (score >= 55) return '1.50';
  if (score >= 50) return '1.00';
  return '0.00';
}

// a23 = demo test account (firstName='a23', lastName='')
const A23 = { firstName: 'a23', lastName: '' };

async function main() {
  if (DRY_RUN) console.log('🔍 DRY RUN\n');

  // ── 1. อัปเดต a1-a29 → ป.0 ─────────────────────────────────────────────────
  console.log('📝 อัปเดต grade ของ a1-a29 เป็น ป.0...');
  const usernames = Array.from({ length: 29 }, (_, i) => `a${i + 1}`);
  const demoUsers = await prisma.user.findMany({
    where: { username: { in: usernames } },
    include: { studentProfiles: true },
  });

  let updated = 0;
  for (const u of demoUsers) {
    for (const sp of u.studentProfiles) {
      if (sp.grade !== 'ป.0') {
        if (!DRY_RUN) {
          await prisma.studentProfile.update({ where: { id: sp.id }, data: { grade: 'ป.0' } });
        }
        console.log(`  ${u.username}: ${sp.grade} → ป.0`);
        updated++;
      }
    }
  }
  console.log(`  ✅ อัปเดต ${updated} profiles\n`);

  // ── 1b. แก้ชื่อโรงเรียนใน StudentProfile ของ a1-a29 ให้ตรงกับ AcademicRecord ──
  console.log('\n🏫 อัปเดต school name ของ a1-a29...');
  let schoolFixed = 0;
  for (const u of demoUsers) {
    for (const sp of u.studentProfiles) {
      if (sp.school && sp.school !== SCHOOL) {
        if (!DRY_RUN) {
          await prisma.studentProfile.update({ where: { id: sp.id }, data: { school: SCHOOL } });
        }
        console.log(`  ${u.username}: school "${sp.school}" → "${SCHOOL}"`);
        schoolFixed++;
      }
    }
  }
  console.log(`  ✅ แก้ไข ${schoolFixed} profiles\n`);

  // ── 2. Mock AcademicRecord ของ a1-a29 ทุกคน ──────────────────────────────
  console.log('📚 สร้าง AcademicRecord จำลองสำหรับ a1-a29...');

  // ลบของเก่าทั้งหมดของ demo users (firstName = 'a1'..'a29', lastName = '')
  if (!DRY_RUN) {
    const demoFirstNames = Array.from({ length: 29 }, (_, i) => `a${i + 1}`);
    const deleted = await prisma.academicRecord.deleteMany({
      where: { firstName: { in: demoFirstNames }, lastName: '' },
    });
    if (deleted.count > 0) console.log(`  ลบของเก่า ${deleted.count} แถว`);
  }

  const allRecords = [];
  for (let idx = 1; idx <= 29; idx++) {
    const firstName = `a${idx}`;
    // คะแนน base ต่างกันเล็กน้อยแต่ละคน (seed จาก idx)
    const bias = ((idx * 7) % 20) - 10; // -10 ถึง +10

    for (const g of GRADE_YEARS) {
      for (const term of ['1', '2']) {
        const termBonus = term === '2' ? 3 : 0;
        const gradeIdx  = GRADE_YEARS.indexOf(g);
        const baseMid   = 75 + bias - gradeIdx * 1.5 + termBonus;
        const baseFinal = 77 + bias - gradeIdx * 1.2 + termBonus;

        for (const sub of SUBJECTS) {
          const mid   = randScore(Math.max(50, baseMid   - 10), Math.min(99, baseMid   + 10));
          const final = randScore(Math.max(50, baseFinal - 10), Math.min(99, baseFinal + 10));
          const total = Math.round((mid + final) / 2 * 10) / 10;

          allRecords.push({
            firstName,
            lastName:     '',
            school:       SCHOOL,
            studentCode:  null,
            grade:        g.grade,
            classroom:    g.classroom,
            roomType:     g.roomType,
            academicYear: g.year,
            term,
            subjectCode:  sub.code,
            subjectName:  sub.name,
            midScore:     mid,
            finalScore:   final,
            totalScore:   total,
            gradeValue:   toGrade(total),
          });
        }
      }
    }
  }

  console.log(`  จะสร้าง ${allRecords.length} แถว (29 คน × 6 ชั้น × 2 เทอม × ${SUBJECTS.length} วิชา)`);

  if (!DRY_RUN) {
    const BATCH = 500;
    for (let i = 0; i < allRecords.length; i += BATCH) {
      await prisma.academicRecord.createMany({ data: allRecords.slice(i, i + BATCH) });
    }
    console.log('  ✅ บันทึกสำเร็จ');
  } else {
    console.log('  [DRY RUN] ตัวอย่าง 3 แถวแรก (a1):');
    allRecords.slice(0, 3).forEach(r =>
      console.log(`    ${r.firstName} ${r.grade} เทอม${r.term} ${r.subjectName}: mid=${r.midScore} total=${r.total} grade=${r.gradeValue}`)
    );
  }

  console.log('\n✅ เสร็จสิ้น');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
