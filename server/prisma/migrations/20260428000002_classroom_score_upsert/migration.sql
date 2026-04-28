-- Add classroom and updatedAt to ClassroomScoreUpload
ALTER TABLE "ClassroomScoreUpload" ADD COLUMN "classroom" TEXT;
ALTER TABLE "ClassroomScoreUpload" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Set defaults for existing rows
UPDATE "ClassroomScoreUpload" SET "classroom" = '' WHERE "classroom" IS NULL;
UPDATE "ClassroomScoreUpload" SET "academicYear" = '' WHERE "academicYear" IS NULL;
UPDATE "ClassroomScoreUpload" SET "term" = '' WHERE "term" IS NULL;
UPDATE "ClassroomScoreUpload" SET "examPeriod" = '' WHERE "examPeriod" IS NULL;
UPDATE "ClassroomScoreUpload" SET "grade" = '' WHERE "grade" IS NULL;

-- Unique constraint (allow duplicates on empty strings from old data — skip if conflicts)
CREATE UNIQUE INDEX IF NOT EXISTS "ClassroomScoreUpload_upload_period_unique"
  ON "ClassroomScoreUpload"("school", "grade", "classroom", "academicYear", "term", "examPeriod");
