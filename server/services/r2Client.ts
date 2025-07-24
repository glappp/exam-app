// server/utils/r2.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

export async function uploadToR2(localFilePath: string, key: string): Promise<string> {
  const fileContent = fs.readFileSync(localFilePath);
  const contentType = getMimeType(localFilePath);

  const params = {
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
  };

  await s3.send(new PutObjectCommand(params));
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
