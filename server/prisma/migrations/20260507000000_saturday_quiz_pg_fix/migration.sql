-- SaturdayQuizTemplate (ถ้าเคย apply ไปแล้วจาก migration ก่อน ข้ามได้)
CREATE TABLE IF NOT EXISTS "SaturdayQuizTemplate" (
    "id"            SERIAL NOT NULL,
    "weekKey"       TEXT NOT NULL,
    "slot"          INTEGER NOT NULL,
    "questionId"    TEXT NOT NULL,
    "isCompetitive" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SaturdayQuizTemplate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SaturdayQuizTemplate_weekKey_slot_questionId_key"
    ON "SaturdayQuizTemplate"("weekKey", "slot", "questionId");
CREATE INDEX IF NOT EXISTS "SaturdayQuizTemplate_weekKey_slot_idx"
    ON "SaturdayQuizTemplate"("weekKey", "slot");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'SaturdayQuizTemplate_questionId_fkey'
  ) THEN
    ALTER TABLE "SaturdayQuizTemplate"
      ADD CONSTRAINT "SaturdayQuizTemplate_questionId_fkey"
      FOREIGN KEY ("questionId") REFERENCES "Question" ("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- SaturdayQuizPool: เพิ่ม userId + slot (ถ้ายังไม่มี)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'SaturdayQuizPool' AND column_name = 'userId'
  ) THEN
    DELETE FROM "SaturdayQuizPool";
    DROP INDEX IF EXISTS "SaturdayQuizPool_weekKey_questionId_key";
    DROP INDEX IF EXISTS "SaturdayQuizPool_weekKey_idx";

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
  END IF;
END $$;
