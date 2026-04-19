// crop-chulabhorn-images.js
// ตัดรูปจากหน้าข้อสอบจุฬาภรณ์ ป.6 2565 แล้วผูกกับโจทย์ใน DB
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SRC  = 'C:\\Users\\patta\\Downloads\\จุฬาภรณ์ ป6 2566 พร้อมเฉลย\\ลบลายน้ำ';
const DEST = path.join(__dirname, '..', 'uploads', 'chulabhorn-p6-2565');

// ─── crop map ──────────────────────────────────────────────────────────────
// filename: ชื่อไฟล์ output (บันทึกที่ DEST)
// src: หน้าต้นฉบับ (ใน SRC)
// region: { left, top, width, height } ใน pixel ของรูปต้นฉบับ 1437×2048
// searchStr: ค้นหา question ใน DB ด้วย textTh.contains
// sharedWith: ถ้า != null → ใช้ไฟล์เดิมของ key นั้น (ไม่ crop ซ้ำ)
const CROPS = [
  {
    filename: 'q04.jpg',
    src: '2_0.jpg',
    region: { left: 30, top: 85, width: 1377, height: 790 },
    searchStr: 'เส้นตรง PQ ขนานกับ',
  },
  {
    filename: 'q05.jpg',
    src: '2_0.jpg',
    region: { left: 30, top: 885, width: 1377, height: 1050 },
    searchStr: 'แผนภูมิวงกลม แสดงการใช้น้ำ',
  },
  {
    filename: 'q06.jpg',
    src: '3_0.jpg',
    region: { left: 30, top: 85, width: 1377, height: 640 },
    searchStr: 'จากรูปที่กำหนดให้ มีรูปสี่เหลี่ยมจัตุรัสทั้งหมด',
  },
  {
    filename: 'q07.jpg',
    src: '3_0.jpg',
    region: { left: 30, top: 755, width: 1377, height: 1120 },
    searchStr: 'ABCD เป็นรูปสี่เหลี่ยมจัตุรัส พื้นที่รูปสี่เหลี่ยม ABCD',
  },
  {
    filename: 'q14.jpg',
    src: '6_0.jpg',
    region: { left: 30, top: 680, width: 1377, height: 1260 },
    searchStr: 'รถรับ-ส่งนักเรียน เดินทางจากจุดจอดรถ',
  },
  {
    filename: 'q15.jpg',
    src: '7_0.jpg',
    region: { left: 30, top: 85, width: 1377, height: 750 },
    searchStr: 'เมื่อนำกระดาษรูปสี่เหลี่ยมจัตุรัสที่เท่ากัน',
  },
  {
    filename: 'q16.jpg',
    src: '7_0.jpg',
    region: { left: 30, top: 850, width: 1377, height: 1110 },
    searchStr: 'กำหนดให้ด้าน AB ยาว 20 หน่วย',
  },
  {
    filename: 'q17.jpg',
    src: '8_0.jpg',
    region: { left: 30, top: 85, width: 1377, height: 740 },
    searchStr: 'ถ้านำลูกบาศก์ไม้ขนาด 1',
  },
  {
    filename: 'q18.jpg',
    src: '8_0.jpg',
    region: { left: 30, top: 840, width: 1377, height: 940 },
    searchStr: 'จากรูปที่กำหนดให้ พื้นที่ส่วนที่แรเงาเท่ากับ',
  },
  {
    filename: 'q20.jpg',
    src: '9_0.jpg',
    region: { left: 30, top: 745, width: 1377, height: 740 },
    searchStr: 'ถัง A, B และ C มีน้ำ 16',
  },
  // ข้อ 21 — 3 sub-questions ใช้รูปเดียวกัน
  {
    filename: 'q21.jpg',
    src: '10_0.jpg',
    region: { left: 30, top: 85, width: 1377, height: 920 },
    searchStr: 'จากการสำรวจนักเรียนระดับชั้นประถมศึกษาปีที่ 6',
  },
  {
    filename: 'q21.jpg', // shared
    src: null,           // ไม่ crop ซ้ำ
    searchStr: 'ข้อมูลเดียวกับข้อ 21.1)\n21.2 นักเรียนมีรูบิค',
  },
  {
    filename: 'q21.jpg', // shared
    src: null,
    searchStr: 'ข้อมูลเดียวกับข้อ 21.1)\n21.3 โรงเรียนแห่งนี้',
  },
  {
    filename: 'q23.jpg',
    src: '11_0.jpg',
    region: { left: 30, top: 680, width: 1377, height: 1110 },
    searchStr: 'ถ้าเติมสัญลักษณ์ ●, ▲, ◆, ■',
  },
  {
    filename: 'q25.jpg',
    src: '12_0.jpg',
    region: { left: 30, top: 920, width: 870, height: 680 },
    searchStr: 'ถุงใบหนึ่งบรรจุลูกบอลขนาดเดียวกัน',
  },
];

async function cropImage(entry) {
  if (!entry.src) return; // shared image — skip crop
  const srcPath  = path.join(SRC, entry.src);
  const destPath = path.join(DEST, entry.filename);
  if (fs.existsSync(destPath)) {
    console.log(`  ⏭  ${entry.filename} มีอยู่แล้ว`);
    return;
  }
  await sharp(srcPath)
    .extract(entry.region)
    .jpeg({ quality: 88 })
    .toFile(destPath);
  console.log(`  ✂  ${entry.filename} (${entry.region.width}×${entry.region.height})`);
}

async function updateDB(entry) {
  const imageUrl = `/uploads/chulabhorn-p6-2565/${entry.filename}`;
  const result = await prisma.question.updateMany({
    where: { textTh: { contains: entry.searchStr } },
    data: { image: imageUrl },
  });
  if (result.count > 0) {
    console.log(`  🔗  ${entry.filename} → ${result.count} question(s) [${entry.searchStr.slice(0,40)}]`);
  } else {
    console.warn(`  ⚠️  ไม่พบโจทย์: ${entry.searchStr.slice(0,50)}`);
  }
}

async function main() {
  console.log('📁 สร้างโฟลเดอร์:', DEST);
  fs.mkdirSync(DEST, { recursive: true });

  console.log('\n✂️  Crop images...');
  for (const entry of CROPS) {
    await cropImage(entry);
  }

  console.log('\n🗄️  อัปเดต DB...');
  for (const entry of CROPS) {
    await updateDB(entry);
  }

  console.log('\n✅ เสร็จสิ้น');
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
