/*
  Warnings:

  - Added the required column `questionIds` to the `ExamResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userAnswers` to the `ExamResult` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ExamResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentProfileId" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "examSetCode" TEXT,
    "topicTagsJson" JSONB NOT NULL,
    "questionIds" JSONB NOT NULL,
    "userAnswers" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "weakAttributes" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExamResult_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ExamResult" ("createdAt", "durationSec", "id", "mode", "score", "studentProfileId", "topicTagsJson", "total", "weakAttributes") SELECT "createdAt", "durationSec", "id", "mode", "score", "studentProfileId", "topicTagsJson", "total", "weakAttributes" FROM "ExamResult";
DROP TABLE "ExamResult";
ALTER TABLE "new_ExamResult" RENAME TO "ExamResult";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
