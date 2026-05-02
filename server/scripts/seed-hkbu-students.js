// seed-hkbu-students.js
// อ่าน CSV ผลการเรียน → สร้าง User + StudentProfile สำหรับนักเรียน ร.ร.ฮั่วเคี้ยวบุรีรัมย์
// รัน: node server/scripts/seed-hkbu-students.js [--dry-run]
// dry-run = แสดงผลโดยไม่บันทึกจริง

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const CSV_PATH = path.join(__dirname, '../../../../../../cowork/ตารางผลการเรียนรวม_ปี68.csv');
const SCHOOL = 'ฮั่วเคี้ยวบุรีรัมย์';
const DISTRICT = 'เมืองบุรีรัมย์';
const PROVINCE = 'บุรีรัมย์';
const ACADEMIC_YEAR = '2568';
const SALT_ROUNDS = 10;
const DRY_RUN = process.argv.includes('--dry-run');
const CSV_OUT = path.join(__dirname, '../../../cowork/hkbu-initial-passwords.csv');

const GRADE_MAP = { p1: 'ป.1', p2: 'ป.2', p3: 'ป.3', p4: 'ป.4', p5: 'ป.5', p6: 'ป.6' };
const NAME_PREFIXES = ['เด็กหญิง', 'เด็กชาย', 'นางสาว', 'นาย', 'นาง'];

function stripPrefix(name) {
  for (const p of NAME_PREFIXES) {
    if (name.startsWith(p)) return name.slice(p.length).trim();
  }
  return name.trim();
}

function cleanCode(raw) {
  // "8428.0" → "8428"
  return raw.trim().replace(/\.0+$/, '');
}

function parseCSV() {
  const str = fs.readFileSync(CSV_PATH, 'utf8').replace(/^﻿/, '');
  const lines = str.split('\n');
  const students = new Map();
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 6) continue;
    const rawCode = cols[0].trim();
    const rawName = cols[1].trim();
    const surname  = cols[2].trim();
    const grade    = cols[3].trim();
    const room     = cols[4].trim();
    const roomType = cols[5].trim();
    if (!rawName) continue;
    const key = rawName + '|' + surname;
    if (!students.has(key)) {
      students.set(key, {
        code: rawCode ? cleanCode(rawCode) : '',
        firstName: stripPrefix(rawName),
        lastName: surname,
        grade: GRADE_MAP[grade] || grade,
        classroom: room,
        roomType,
      });
    }
  }
  return [...students.values()];
}

async function main() {
  const all = parseCSV();
  const withCode = all.filter(s => s.code);
  const noCode   = all.filter(s => !s.code);

  console.log(`\n📋 นักเรียนทั้งหมด: ${all.length} คน`);
  console.log(`✅ มีรหัส (จะสร้าง): ${withCode.length} คน`);
  console.log(`⏭️  ไม่มีรหัส (ข้าม): ${noCode.length} คน`);
  if (DRY_RUN) console.log('\n🔍 DRY RUN — ไม่บันทึกจริง\n');

  // แสดงรายชื่อไม่มีรหัส
  if (noCode.length) {
    console.log('\nนักเรียนที่ยังไม่มีรหัส:');
    noCode.forEach(s => console.log(`  ${s.grade} ${s.classroom} | ${s.firstName} ${s.lastName} (${s.roomType})`));
  }

  if (DRY_RUN) {
    console.log('\nตัวอย่าง 5 คนแรกที่จะสร้าง:');
    withCode.slice(0, 5).forEach(s =>
      console.log(`  username=${s.code} | ${s.firstName} ${s.lastName} | ${s.grade} ห้อง ${s.classroom}`)
    );
    return;
  }

  // สร้าง users จริง
  let created = 0, skipped = 0, errors = 0;
  const csvLines = ['ชั้น,ห้อง,ชื่อ,นามสกุล,username,pin_เริ่มต้น'];

  for (const s of withCode) {
    try {
      const exists = await prisma.user.findUnique({ where: { username: s.code } });
      if (exists) { skipped++; continue; }

      const pin = String(Math.floor(1000 + Math.random() * 9000));
      const hashed = await bcrypt.hash(pin, SALT_ROUNDS);
      await prisma.user.create({
        data: {
          username: s.code,
          password: hashed,
          firstName: s.firstName,
          lastName: s.lastName,
          email: '',
          role: 'student',
          mustChangePassword: true,
          studentProfiles: {
            create: {
              academicYear: ACADEMIC_YEAR,
              school: SCHOOL,
              district: DISTRICT,
              province: PROVINCE,
              grade: s.grade,
              classroom: s.classroom,
            }
          }
        }
      });
      csvLines.push(`${s.grade},${s.classroom},${s.firstName},${s.lastName},${s.code},${pin}`);
      created++;
      if (created % 50 === 0) console.log(`  สร้างแล้ว ${created}/${withCode.length}...`);
    } catch (err) {
      errors++;
      console.error(`  ❌ ${s.code} ${s.firstName} ${s.lastName}: ${err.message}`);
    }
  }

  // export CSV รหัสเริ่มต้น
  if (csvLines.length > 1) {
    fs.writeFileSync(CSV_OUT, '﻿' + csvLines.join('\n'), 'utf8');
    console.log(`\n📄 บันทึก PIN ไปที่: ${CSV_OUT}`);
  }

  console.log(`\n✅ สร้างสำเร็จ: ${created} คน`);
  console.log(`⏭️  ซ้ำ (ข้าม): ${skipped} คน`);
  if (errors) console.log(`❌ error: ${errors} คน`);
  console.log(`\n🔑 password เริ่มต้น = PIN 4 หลักสุ่ม (บังคับเปลี่ยนหลัง login ครั้งแรก)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
