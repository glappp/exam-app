-- สร้าง SaturdayQuizTemplate (แม่แบบรายสัปดาห์)
CREATE TABLE "SaturdayQuizTemplate" (
    "id"            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weekKey"       TEXT NOT NULL,
    "slot"          INTEGER NOT NULL,
    "familyKey"     TEXT NOT NULL,
    "isCompetitive" BOOLEAN NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX "SaturdayQuizTemplate_weekKey_slot_key" ON "SaturdayQuizTemplate"("weekKey", "slot");
CREATE INDEX "SaturdayQuizTemplate_weekKey_idx" ON "SaturdayQuizTemplate"("weekKey");

-- ล้างข้อมูลเก่า SaturdayQuizPool (format เปลี่ยน — ต้องล้างก่อนเพิ่ม NOT NULL column)
DELETE FROM "SaturdayQuizPool";

-- สร้าง SaturdayQuizPool ใหม่ด้วย userId + slot (per-student)
DROP INDEX "SaturdayQuizPool_weekKey_questionId_key";
DROP INDEX "SaturdayQuizPool_weekKey_idx";

CREATE TABLE "SaturdayQuizPool_new" (
    "id"         INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weekKey"    TEXT NOT NULL,
    "userId"     INTEGER NOT NULL,
    "slot"       INTEGER NOT NULL,
    "questionId" TEXT NOT NULL,
    CONSTRAINT "SaturdayQuizPool_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "SaturdayQuizPool_weekKey_userId_slot_key" ON "SaturdayQuizPool_new"("weekKey", "userId", "slot");
CREATE INDEX "SaturdayQuizPool_weekKey_userId_idx" ON "SaturdayQuizPool_new"("weekKey", "userId");

DROP TABLE "SaturdayQuizPool";
ALTER TABLE "SaturdayQuizPool_new" RENAME TO "SaturdayQuizPool";
