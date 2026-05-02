// seed-hkbu-2568.js
// นำเข้าข้อมูลนักเรียน ร.ร.ฮั่วเคี้ยวบุรีรัมย์ จาก CSV ผลการเรียนปี 2568
//
// สิ่งที่ script นี้ทำ:
//   1. อ่าน CSV → สร้าง AcademicRecord ทุกแถว (ทุกวิชา ทุกคน)
//   2. นักเรียนที่มีรหัส → สร้าง User (username=hkbu{code}) + StudentProfile
//   3. นักเรียนที่ไม่มีรหัส → สร้างแค่ AcademicRecord (รอรหัสทีหลัง)
//
// รัน: node scripts/seed-hkbu-2568.js [--dry-run] [--skip-records] [--users-only]
//   --dry-run      = แสดงผลโดยไม่บันทึก
//   --skip-records = ข้าม AcademicRecord (import user อย่างเดียว)
//   --users-only   = เหมือน --skip-records

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs   = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma    = new PrismaClient();
const CSV_PATH  = path.join(__dirname, '../../../../../../cowork/ตารางผลการเรียนรวม_ปี68.csv');
const CSV_OUT   = path.join(__dirname, '../../../../../../cowork/hkbu-initial-passwords.csv');

const SCHOOL        = 'ฮั่วเคี้ยวบุรีรัมย์';
const DISTRICT      = 'เมืองบุรีรัมย์';
const PROVINCE      = 'บุรีรัมย์';
const SCHOOL_PREFIX = 'hkbu';
const ACADEMIC_YEAR = '2568';
const SALT_ROUNDS   = 10;

const DRY_RUN      = process.argv.includes('--dry-run');
const SKIP_RECORDS = process.argv.includes('--skip-records') || process.argv.includes('--users-only');

const NAME_PREFIXES = ['เด็กหญิง', 'เด็กชาย', 'นางสาว', 'นาย', 'นาง'];

function stripPrefix(name) {
  for (const p of NAME_PREFIXES) {
    if (name.startsWith(p)) return name.slice(p.length).trim();
  }
  return name.trim();
}

function cleanCode(raw) {
  return raw.trim().replace(/\.0+$/, '');
}

function parseFloat2(val) {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function parseCSV() {
  const text = fs.readFileSync(CSV_PATH, 'utf8').replace(/^﻿/, '');
  const lines = text.split('\n');
  // headers: รหัสนักเรียน,ชื่อ,นามสกุล,ชั้น,ห้อง,ประเภทห้อง,รหัสวิชา,ชื่อวิชา,กลางภาค,ปลายภาค,รวม,เกรด,...

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 8) continue;
    const rawName = cols[1]?.trim();
    if (!rawName) continue;

    records.push({
      studentCode:  cols[0]?.trim() ? cleanCode(cols[0]) : null,
      firstName:    stripPrefix(rawName),
      lastName:     cols[2]?.trim() || '',
      grade:        cols[3]?.trim() || '',
      classroom:    cols[4]?.trim() || '',
      roomType:     cols[5]?.trim() || '',
      subjectCode:  cols[6]?.trim() || '',
      subjectName:  cols[7]?.trim() || '',
      midScore:     parseFloat2(cols[8]),
      finalScore:   parseFloat2(cols[9]),
      totalScore:   parseFloat2(cols[10]),
      gradeValue:   cols[11]?.trim() || null,
    });
  }
  return records;
}

async function main() {
  const records = parseCSV();
  console.log(`\n📋 CSV rows: ${records.length}`);

  // unique students (by firstName+lastName+grade)
  const studentMap = new Map();
  for (const r of records) {
    const k = `${r.firstName}|${r.lastName}|${r.grade}|${r.classroom}`;
    if (!studentMap.has(k)) studentMap.set(k, r);
  }
  const students     = [...studentMap.values()];
  const withCode     = students.filter(s => s.studentCode);
  const withoutCode  = students.filter(s => !s.studentCode);

  console.log(`👥 นักเรียนทั้งหมด: ${students.length} คน`);
  console.log(`✅ มีรหัส (จะสร้าง User): ${withCode.length} คน`);
  console.log(`⏳ ไม่มีรหัส (แค่ AcademicRecord): ${withoutCode.length} คน`);
  if (DRY_RUN) console.log('\n🔍 DRY RUN — ไม่บันทึกจริง');

  // ── 1. AcademicRecord ────────────────────────────────────────────────────────
  if (!SKIP_RECORDS) {
    console.log('\n📚 นำเข้า AcademicRecord...');
    if (!DRY_RUN) {
      // ลบของเก่าของโรงเรียนนี้+ปีนี้ก่อน (idempotent)
      const deleted = await prisma.academicRecord.deleteMany({
        where: { school: SCHOOL, academicYear: ACADEMIC_YEAR }
      });
      if (deleted.count > 0) console.log(`  ลบของเก่า ${deleted.count} แถว`);

      // insert เป็น batch 500
      const BATCH = 500;
      let inserted = 0;
      for (let i = 0; i < records.length; i += BATCH) {
        const batch = records.slice(i, i + BATCH).map(r => ({
          firstName:    r.firstName,
          lastName:     r.lastName,
          school:       SCHOOL,
          studentCode:  r.studentCode,
          grade:        r.grade,
          classroom:    r.classroom,
          roomType:     r.roomType,
          academicYear: ACADEMIC_YEAR,
          subjectCode:  r.subjectCode,
          subjectName:  r.subjectName,
          midScore:     r.midScore,
          finalScore:   r.finalScore,
          totalScore:   r.totalScore,
          gradeValue:   r.gradeValue,
        }));
        await prisma.academicRecord.createMany({ data: batch });
        inserted += batch.length;
        process.stdout.write(`\r  บันทึก ${inserted}/${records.length}...`);
      }
      console.log(`\n  ✅ AcademicRecord: ${records.length} แถว`);
    } else {
      console.log(`  [DRY RUN] จะ insert ${records.length} AcademicRecord`);
    }
  }

  // ── 2. User accounts (เฉพาะมีรหัส) ─────────────────────────────────────────
  console.log('\n👤 สร้าง User accounts...');

  let created = 0, skipped = 0, errors = 0;
  const csvLines = ['ชั้น,ห้อง,ชื่อ,นามสกุล,username,pin_เริ่มต้น'];

  // หา schoolId
  let schoolId = null;
  if (!DRY_RUN) {
    const schoolRec = await prisma.school.findFirst({ where: { name: { contains: 'ฮั่วเคี้ยว' } } });
    schoolId = schoolRec?.id || null;
    if (!schoolId) console.log('  ⚠️  ไม่พบโรงเรียนใน School table (ไม่ผูก schoolId)');
  }

  for (const s of withCode) {
    const username = `${SCHOOL_PREFIX}${s.studentCode}`;
    try {
      if (!DRY_RUN) {
        const exists = await prisma.user.findUnique({ where: { username } });
        if (exists) { skipped++; continue; }

        const pin    = String(Math.floor(1000 + Math.random() * 9000));
        const hashed = await bcrypt.hash(pin, SALT_ROUNDS);

        const gradeLabel = {
          p1:'ป.1', p2:'ป.2', p3:'ป.3',
          p4:'ป.4', p5:'ป.5', p6:'ป.6',
        }[s.grade] || s.grade;

        await prisma.user.create({
          data: {
            username,
            password: hashed,
            firstName: s.firstName,
            lastName:  s.lastName,
            email:     '',
            role:      'student',
            schoolId,
            mustChangePassword: true,
            studentProfiles: {
              create: {
                academicYear: ACADEMIC_YEAR,
                school:       SCHOOL,
                district:     DISTRICT,
                province:     PROVINCE,
                grade:        gradeLabel,
                classroom:    s.classroom,
                studentCode:  s.studentCode,
              }
            }
          }
        });
        csvLines.push(`${gradeLabel},${s.classroom},${s.firstName},${s.lastName},${username},${pin}`);
        created++;
        if (created % 50 === 0) process.stdout.write(`\r  สร้างแล้ว ${created}/${withCode.length}...`);
      } else {
        console.log(`  [DRY RUN] username=${username} | ${s.firstName} ${s.lastName} | ${s.grade} ห้อง ${s.classroom}`);
      }
    } catch (err) {
      errors++;
      console.error(`\n  ❌ ${username}: ${err.message}`);
    }
  }

  if (!DRY_RUN) {
    if (created > 0) console.log(`\r  ✅ สร้างสำเร็จ ${created} คน`);
    if (skipped > 0) console.log(`  ⏭️  ซ้ำ (ข้าม): ${skipped} คน`);
    if (errors  > 0) console.log(`  ❌ error: ${errors} คน`);

    // export PIN CSV
    if (csvLines.length > 1) {
      fs.writeFileSync(CSV_OUT, '﻿' + csvLines.join('\n'), 'utf8');
      console.log(`\n📄 PIN เริ่มต้นบันทึกที่: ${CSV_OUT}`);
    }
  }

  console.log('\n🔑 password เริ่มต้น = PIN 4 หลักสุ่ม (บังคับเปลี่ยนหลัง login ครั้งแรก)');
  console.log('✅ เสร็จสิ้น\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
