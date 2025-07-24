// server/scripts/uploadImagesToR2.ts

import dotenv from "dotenv";
dotenv.config({ path: "./server/.env" });

import path from "path";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const localImageFolder = path.join(__dirname, "../public/images/questions");

async function main() {
  const files = fs.readdirSync(localImageFolder).filter(f => f.endsWith(".png"));
  console.log(`📁 พบไฟล์ ${files.length} ไฟล์ใน local`);

  for (const file of files) {
    const code = file.replace(".png", "");
    const question = await prisma.question.findUnique({ where: { code } });

    if (!question) {
      console.warn(`⚠️ ไม่พบ question code: ${code} ใน DB`);
      continue;
    }

    if (question.image) {
      console.log(`✅ ข้าม ${code} (มี image แล้ว)`);
      continue;
    }

    const folder = `questions/${code.split("-").slice(0, 4).join("-")}`;
    const key = `${folder}/${file}`;
    const filePath = path.join(localImageFolder, file);

    const fileBuffer = fs.readFileSync(filePath);

    try {
      await R2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: fileBuffer,
        ContentType: "image/png",
      }));

      await prisma.question.update({
        where: { code },
        data: { image: key },
      });

      console.log(`📤 อัปโหลดแล้ว: ${code} → ${key}`);
    } catch (err) {
      console.error(`❌ upload failed: ${code}`, err);
    }
  }

  console.log("🎉 เสร็จสิ้นการอัปโหลดภาพและ update Prisma");
}

main().finally(() => prisma.$disconnect());
