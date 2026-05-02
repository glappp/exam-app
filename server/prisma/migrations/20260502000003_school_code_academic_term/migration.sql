-- Add code field to School (school abbreviation for username prefix)
ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "code" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "School_code_key" ON "School"("code") WHERE "code" IS NOT NULL;

-- Update ฮั่วเคี้ยวบุรีรัมย์ code = 'hkbu'
UPDATE "School" SET "code" = 'hkbu' WHERE name LIKE '%ฮั่วเคี้ยว%' AND "code" IS NULL;

-- Add term field to AcademicRecord
ALTER TABLE "AcademicRecord" ADD COLUMN IF NOT EXISTS "term" TEXT NOT NULL DEFAULT '1';
