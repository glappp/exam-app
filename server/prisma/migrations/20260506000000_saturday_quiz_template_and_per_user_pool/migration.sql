-- SaturdayQuizTemplate: บันทึก candidates ทุกตัวต่อ slot (1 root + ≤5 variants)
CREATE TABLE "SaturdayQuizTemplate" (
    "id"            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weekKey"       TEXT NOT NULL,
    "slot"          INTEGER NOT NULL,
    "questionId"    TEXT NOT NULL,
    "isCompetitive" BOOLEAN NOT NULL DEFAULT false,
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

-- SaturdayQuizPool: per-student (userId + slot ต่างจากเดิมที่เป็น shared pool)
DROP INDEX "SaturdayQuizPool_weekKey_questionId_key";
DROP INDEX "SaturdayQuizPool_weekKey_idx";

CREATE TABLE "SaturdayQuizPool_new" (
    "id"         INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weekKey"    TEXT NOT NULL,
    "userId"     INTEGER NOT NULL,
    "slot"       INTEGER NOT NULL,
    "questionId" TEXT NOT NULL,
    CONSTRAINT "SaturdayQuizPool_questionId_fkey"
        FOREIGN KEY ("questionId") REFERENCES "Question" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "SaturdayQuizPool_weekKey_userId_slot_key"
    ON "SaturdayQuizPool_new"("weekKey", "userId", "slot");
CREATE INDEX "SaturdayQuizPool_weekKey_userId_idx"
    ON "SaturdayQuizPool_new"("weekKey", "userId");

DROP TABLE "SaturdayQuizPool";
ALTER TABLE "SaturdayQuizPool_new" RENAME TO "SaturdayQuizPool";

-- SaturdayQuizAttempt (ถ้ายังไม่มี)
CREATE TABLE IF NOT EXISTS "SaturdayQuizAttempt" (
    "id"          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId"      INTEGER NOT NULL,
    "weekKey"     TEXT NOT NULL,
    "score"       INTEGER NOT NULL,
    "timeUsed"    INTEGER NOT NULL,
    "answers"     TEXT NOT NULL DEFAULT '{}',
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SaturdayQuizAttempt_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "SaturdayQuizAttempt_userId_weekKey_key"
    ON "SaturdayQuizAttempt"("userId", "weekKey");
CREATE INDEX IF NOT EXISTS "SaturdayQuizAttempt_weekKey_idx"
    ON "SaturdayQuizAttempt"("weekKey");
