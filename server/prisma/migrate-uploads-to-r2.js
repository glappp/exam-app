/**
 * migrate-uploads-to-r2.js
 * อัปโหลดรูปทั้งหมดจาก server/uploads/ ขึ้น Cloudflare R2
 *
 * ใช้งาน:
 *   cd server
 *   node prisma/migrate-uploads-to-r2.js
 *
 * ต้องมี .env ที่ตั้งค่า R2_* ครบก่อน
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const fs   = require('fs');
const path = require('path');
const mime = require('mime-types');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

const {
  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME, R2_PUBLIC_URL
} = process.env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.error('❌ ยังไม่ได้ตั้ง R2 env vars ใน .env');
  process.exit(1);
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// รวบรวมไฟล์ทั้งหมดใน uploads/ (รวม subfolder)
function collectFiles(dir, base = '') {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(abs, rel));
    } else {
      files.push({ abs, rel });
    }
  }
  return files;
}

async function existsOnR2(key) {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log('ไม่พบโฟลเดอร์ uploads/ — ไม่มีอะไรต้อง migrate');
    return;
  }

  const files = collectFiles(UPLOADS_DIR);
  console.log(`📁 พบ ${files.length} ไฟล์ใน uploads/\n`);

  let uploaded = 0, skipped = 0, failed = 0;

  for (const { abs, rel } of files) {
    const key = `uploads/${rel}`;
    const contentType = mime.lookup(abs) || 'application/octet-stream';

    // ข้ามถ้ามีอยู่แล้วบน R2
    if (await existsOnR2(key)) {
      console.log(`  ⏭  skip  ${key}`);
      skipped++;
      continue;
    }

    try {
      await r2.send(new PutObjectCommand({
        Bucket:      R2_BUCKET_NAME,
        Key:         key,
        Body:        fs.readFileSync(abs),
        ContentType: contentType,
      }));
      console.log(`  ✅ upload ${key}`);
      uploaded++;
    } catch (e) {
      console.error(`  ❌ failed ${key}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n─────────────────────────────`);
  console.log(`✅ อัปโหลดสำเร็จ : ${uploaded}`);
  console.log(`⏭  ข้ามแล้ว     : ${skipped}`);
  console.log(`❌ ล้มเหลว      : ${failed}`);
  console.log(`\nPublic URL: ${R2_PUBLIC_URL}/uploads/<filename>`);
}

main().catch(e => { console.error(e); process.exit(1); });
