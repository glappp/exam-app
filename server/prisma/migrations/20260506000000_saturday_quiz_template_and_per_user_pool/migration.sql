-- SaturdayQuizTemplate: บันทึก candidates ทุกตัวต่อ slot (1 root + ≤5 variants)
CREATE TABLE "SaturdayQuizTemplate" (
    "id"            SERIAL NOT NULL,
    "weekKey"       TEXT NOT NULL,
    "slot"          INTEGER NOT NULL,
    "questionId"    TEXT NOT NULL,
    "isCompetitive" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SaturdayQuizTemplate_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SaturdayQuizTemplate_questionId_fkey"
        FOREIGN KEY ("questionId") REFERENCES "Question" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "SaturdayQuizTemplate_weekKey_slot_questionId_key"
    ON "SaturdayQuizTemplate"("weekKey", "slot", "questionId");
CREATE INDEX "SaturdayQuizTemplate_weekKey_slot_idx"
    ON "SaturdayQuizTemplate"("weekKey", "slot");

-- ล้างข้อมูลเก่า SaturdayQuizPool (format เปลี่ยน — ต้องล้างก่อนเพิ่ม NOT NULL column)
DELETE FROM "SaturdayQuizPool";

-- SaturdayQuizPool: เพิ่ม userId + slot, ลบ sortOrder, เปลี่ยน index
DROP INDEX "SaturdayQuizPool_weekKey_questionId_key";
DROP INDEX "SaturdayQuizPool_weekKey_idx";
ALTER TABLE "SaturdayQuizPool" DROP CONSTRAINT IF EXISTS "SaturdayQuizPool_questionId_fkey";
ALTER TABLE "SaturdayQuizPool" DROP COLUMN IF EXISTS "sortOrder";

ALTER TABLE "SaturdayQuizPool" ADD COLUMN "userId" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SaturdayQuizPool" ADD COLUMN "slot"   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SaturdayQuizPool" ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "SaturdayQuizPool" ALTER COLUMN "slot"   DROP DEFAULT;

CREATE UNIQUE INDEX "SaturdayQuizPool_weekKey_userId_slot_key"
    ON "SaturdayQuizPool"("weekKey", "userId", "slot");
CREATE INDEX "SaturdayQuizPool_weekKey_userId_idx"
    ON "SaturdayQuizPool"("weekKey", "userId");

ALTER TABLE "SaturdayQuizPool" ADD CONSTRAINT "SaturdayQuizPool_questionId_fkey"
    FOREIGN KEY ("questionId") REFERENCES "Question" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
