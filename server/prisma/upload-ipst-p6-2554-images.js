// upload-ipst-p6-2554-images.js
// อัปโหลดรูปภาพโจทย์สสวท ป.6 2554 ขึ้น Cloudflare R2
// รัน: node server/prisma/upload-ipst-p6-2554-images.js

const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// R2 credentials
const R2_ACCOUNT_ID = '1cccae07ad7a6ad4131ff1180ec4da21';
const R2_ACCESS_KEY_ID = 'a484c5bebd1882240f866b20cd01e6f7';
const R2_SECRET_ACCESS_KEY = 'd944955e2615d525107f5796784124e9d1bb9fd03bc9bd3dee24ce381879253e';
const R2_BUCKET = 'schoolpl-assets';
const R2_FOLDER = 'p6-ipst-2554';

// โฟลเดอร์รูปภาพ
const PIC_DIR = 'C:\\Users\\patta\\Downloads\\โครงการพัฒนาอัจฉริยภาพทางวิทยาศาสตร์และคณิตศาสตร์ สสวท\\54\\pic';

// ไฟล์ที่ต้องอัปโหลด (เฉพาะรูป diagram ที่ใช้ในโจทย์)
const IMAGES = [
  '14.png', '16.png', '17.png', '18.png', '21.png',
  '23.png', '24.png', '25.png', '26.png', '27.png',
  '28.png', '29-1.png', '29-2.png', '39.png',
  '40-1.png', '40-2.png',
];

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function fileExists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadFile(filename) {
  const localPath = path.join(PIC_DIR, filename);
  const key = `${R2_FOLDER}/${filename}`;
  const ext = path.extname(filename).toLowerCase();
  const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';

  if (!fs.existsSync(localPath)) {
    console.log(`  ⚠️  ไม่พบไฟล์: ${filename}`);
    return false;
  }

  const exists = await fileExists(key);
  if (exists) {
    console.log(`  ⏭  มีอยู่แล้ว: ${key}`);
    return true;
  }

  const body = fs.readFileSync(localPath);
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));

  const size = (body.length / 1024).toFixed(1);
  console.log(`  ✅ อัปโหลด: ${key} (${size} KB)`);
  return true;
}

async function main() {
  console.log(`📤 เริ่มอัปโหลด ${IMAGES.length} รูปภาพขึ้น R2 bucket: ${R2_BUCKET}/${R2_FOLDER}/\n`);

  let ok = 0, skip = 0, fail = 0;
  for (const img of IMAGES) {
    try {
      const result = await uploadFile(img);
      if (result) ok++;
    } catch (err) {
      console.log(`  ❌ Error: ${img} — ${err.message}`);
      fail++;
    }
  }

  console.log(`\n📊 สรุป: อัปโหลดสำเร็จ ${ok} ไฟล์, ข้าม ${skip} ไฟล์, ล้มเหลว ${fail} ไฟล์`);
  console.log(`\n🌐 Public URL base: https://pub-de89f1f9d8f1420fa29166e7eadfab20.r2.dev/${R2_FOLDER}/`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
