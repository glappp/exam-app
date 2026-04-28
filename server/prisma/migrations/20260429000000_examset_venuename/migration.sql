-- Add venueName to ExamSetMetadata
ALTER TABLE "ExamSetMetadata" ADD COLUMN IF NOT EXISTS "venueName" TEXT;

-- Backfill: ตัดชื่อวิชา + ชั้น + ปี + วงเล็บออกจาก label เหลือแค่ชื่อสนาม
-- ตัด ป.X / ม.X และทุกอย่างหลังจากนั้น
UPDATE "ExamSetMetadata"
SET "venueName" = TRIM(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      COALESCE("label", ''),
      '\s+(ป\.\d+|ม\.\d+)\b.*$', '', 'i'
    ),
    '(คณิตศาสตร์|วิทยาศาสตร์|ภาษาไทย|ภาษาอังกฤษ|สังคมศึกษา)', '', 'g'
  )
)
WHERE "venueName" IS NULL AND "label" IS NOT NULL AND "label" <> '';
