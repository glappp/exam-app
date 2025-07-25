import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function checkImageExists(key) {
  try {
    await s3.send(new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }));
    console.log(`✅ พบไฟล์ R2: ${key}`);
  } catch (err) {
    if (err.name === "NotFound") {
      console.log(`❌ ไม่พบไฟล์: ${key}`);
    } else {
      console.error("❌ เกิดข้อผิดพลาด:", err);
    }
  }
}

// 🔍 แก้ key ที่ต้องตรวจสอบตรงนี้:
const targetKey = "images/questions/p6-chula-2022-o-q004.png";
checkImageExists(targetKey);
