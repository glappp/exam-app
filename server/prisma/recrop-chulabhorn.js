// recrop-chulabhorn.js — ตัดเฉพาะรูป (ไม่รวม header/text โจทย์)
// รันทีละข้อ รับ argument: node recrop-chulabhorn.js q04
// ถ้าไม่ระบุ → crop ทุกข้อ
const path = require('path');
const sharp = require('sharp');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SRC  = 'C:\\Users\\patta\\Downloads\\จุฬาภรณ์ ป6 2566 พร้อมเฉลย\\ลบลายน้ำ';
const DEST = path.join(__dirname, '..', 'uploads', 'chulabhorn-p6-2565');

// ─── crop map (diagram only, จาก original 1437×2048) ──────────────────────
const CROPS = [
  // ข้อ 4 — เส้นขนาน มุม A (diagram y=240..860)
  { key: 'q04', src: '2_0.jpg', region: { left: 50, top: 315, width: 1330, height: 545 } },
  // ข้อ 5 — pie chart (diagram y=1150..1940)
  { key: 'q05', src: '2_0.jpg', region: { left: 140, top: 1185, width: 950, height: 490 } },
  // ข้อ 6 — L-shape squares (diagram y=175..700)
  { key: 'q06', src: '3_0.jpg', region: { left: 100, top: 248, width: 510, height: 390 } },
  // ข้อ 7 — square ABCD shaded (diagram y=870..1880)
  { key: 'q07', src: '3_0.jpg', region: { left: 50, top: 870, width: 850, height: 1010 } },
  // ข้อ 14 — map route (diagram y=1010..1830)
  { key: 'q14', src: '6_0.jpg', region: { left: 50, top: 1010, width: 1330, height: 820 } },
  // ข้อ 15 — overlapping squares (diagram y=175..830)
  { key: 'q15', src: '7_0.jpg', region: { left: 130, top: 175, width: 1100, height: 655 } },
  // ข้อ 16 — area semicircle+triangle (diagram y=1050..1940)
  { key: 'q16', src: '7_0.jpg', region: { left: 50, top: 1050, width: 1100, height: 890 } },
  // ข้อ 17 — cubes + box (diagram y=175..760)
  { key: 'q17', src: '8_0.jpg', region: { left: 50, top: 175, width: 1330, height: 585 } },
  // ข้อ 18 — chevron pattern (diagram y=1000..1750)
  { key: 'q18', src: '8_0.jpg', region: { left: 50, top: 1000, width: 1330, height: 750 } },
  // ข้อ 20 — three buckets (diagram y=830..1480)
  { key: 'q20', src: '9_0.jpg', region: { left: 100, top: 830, width: 1100, height: 650 } },
  // ข้อ 21 — rubik's cubes (diagram y=175..750)
  { key: 'q21', src: '10_0.jpg', region: { left: 680, top: 175, width: 720, height: 575 } },
  // ข้อ 23 — 4×4 grid (diagram y=1290..1760)
  { key: 'q23', src: '11_0.jpg', region: { left: 280, top: 1290, width: 870, height: 470 } },
  // ข้อ 25 — bag of balls (diagram y=1070..1680)
  { key: 'q25', src: '12_0.jpg', region: { left: 50, top: 1070, width: 500, height: 610 } },
];

async function crop(entry) {
  const srcPath  = path.join(SRC, entry.src);
  const destPath = path.join(DEST, `${entry.key}.jpg`);
  await sharp(srcPath)
    .extract(entry.region)
    .jpeg({ quality: 90 })
    .toFile(destPath);
  console.log(`✂  ${entry.key}.jpg (${entry.region.width}×${entry.region.height})`);
}

async function main() {
  const target = process.argv[2]; // e.g. "q04"
  const list = target ? CROPS.filter(c => c.key === target) : CROPS;
  if (!list.length) { console.error('ไม่พบ key:', target); process.exit(1); }

  for (const entry of list) {
    await crop(entry);
  }
  console.log('✅ เสร็จ', list.length, 'รายการ');
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
