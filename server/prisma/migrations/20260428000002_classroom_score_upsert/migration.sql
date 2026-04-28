-- Add classroom and updatedAt to ClassroomScoreUpload (IF NOT EXISTS safe)
ALTER TABLE "ClassroomScoreUpload" ADD COLUMN IF NOT EXISTS "classroom" TEXT;
ALTER TABLE "ClassroomScoreUpload" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
