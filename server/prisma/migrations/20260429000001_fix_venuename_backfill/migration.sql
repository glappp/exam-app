-- Fix venueName backfill ด้วย POSIX regex ที่ถูกต้องสำหรับ PostgreSQL
-- (\s และ \d ใช้ไม่ได้ใน POSIX ERE — ต้องใช้ [[:space:]] และ [[:digit:]])
-- อัปเดตทุก row ที่มี label เพื่อ overwrite ค่าที่อาจ backfill ผิดจาก migration ก่อน

UPDATE "ExamSetMetadata"
SET "venueName" = TRIM(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      COALESCE("label", ''),
      '[[:space:]]+(ป\.[[:digit:]]+|ม\.[[:digit:]]+).*$', '', 'i'
    ),
    'คณิตศาสตร์|วิทยาศาสตร์|ภาษาไทย|ภาษาอังกฤษ|สังคมศึกษา', '', 'g'
  )
)
WHERE "label" IS NOT NULL AND "label" <> '';
