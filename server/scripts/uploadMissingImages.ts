// scripts/uploadMissingImages.ts
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { uploadToR2 } from "../services/r2Client";
import dotenv from "dotenv";
dotenv.config({ path: "./server/.env" }); // 👈 ระบุ path ให้ชัดเจน


const prisma = new PrismaClient();
const imageDir = path.join(__dirname, "../public/images/questions");


async function run() {
  const files = fs.readdirSync(imageDir).filter(f => f.endsWith(".png"));
  console.log(`📁 พบไฟล์ ${files.length} ไฟล์ใน local`);

  for (const filename of files) {
    const code = filename.replace(".png", "");
    const question = await prisma.question.findUnique({ where: { code } });

    if (!question) {
      console.warn(`❌ ไม่พบ question ใน DB สำหรับ code: ${code}`);
      continue;
    }

    if (question.image) {
      console.log(`✅ ข้าม ${code} (มี image แล้ว)`);
      continue;
    }

    const localPath = path.join(imageDir, filename);
    try {
      const imageUrl = await uploadToR2(localPath, filename);
      await prisma.question.update({
        where: { code },
        data: { image: imageUrl, updatedBy: "admin" }
      });
      console.log(`🆗 อัปโหลด + อัปเดตสำเร็จ: ${code}`);
    } catch (err) {
      console.error(`❌ ERROR อัปโหลด ${code}:`, err);
    }
  }

  console.log("🎉 เสร็จสิ้น");
  await prisma.$disconnect();
}

run();
