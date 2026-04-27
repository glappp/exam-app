/**
 * storage.js — Abstraction layer สำหรับ file upload
 *
 * Local (dev):  เก็บใน server/uploads/  → เสิร์ฟที่ /uploads/:filename
 * Cloudflare R2 (prod): เก็บบน R2        → redirect /uploads/:filename ไป R2 public URL
 *
 * ตั้งค่า R2 ด้วย env vars:
 *   R2_ACCOUNT_ID        — Cloudflare Account ID
 *   R2_ACCESS_KEY_ID     — R2 API token (Access Key ID)
 *   R2_SECRET_ACCESS_KEY — R2 API token (Secret)
 *   R2_BUCKET_NAME       — ชื่อ bucket
 *   R2_PUBLIC_URL        — public URL ของ bucket เช่น https://pub-xxx.r2.dev
 */

const multer = require('multer');
const path   = require('path');

const useR2 = !!(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
);

let upload;

if (useR2) {
  let S3Client, multerS3;
  try {
    ({ S3Client } = require('@aws-sdk/client-s3'));
    multerS3 = require('multer-s3');
  } catch {
    console.error('❌ R2 env vars พบแล้ว แต่ไม่มี packages: npm install @aws-sdk/client-s3 multer-s3');
    process.exit(1);
  }

  const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId:     process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  upload = multer({
    storage: multerS3({
      s3:          r2,
      bucket:      process.env.R2_BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        if (req.overwriteImageKey) {
          cb(null, req.overwriteImageKey);  // ทับ key เดิมใน R2
        } else {
          const ext  = path.extname(file.originalname).toLowerCase();
          const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
          cb(null, `uploads/${name}`);
        }
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  });

  console.log('☁️  Storage: Cloudflare R2');
} else {
  upload = multer({
    dest:   'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 },
  });
  console.log('💾  Storage: local (uploads/)');
}

/**
 * รับ multer file object แล้วคืน filename ที่จะเก็บใน DB
 * - Local: file.filename (hash ที่ multer ตั้งให้)
 * - R2:    basename ของ key เช่น "uploads/abc.jpg" → "abc.jpg"
 */
function getFilename(file) {
  if (!file) return null;
  if (file.key) return path.basename(file.key); // R2
  return file.filename;                          // local
}

module.exports = { upload, getFilename, useR2 };
