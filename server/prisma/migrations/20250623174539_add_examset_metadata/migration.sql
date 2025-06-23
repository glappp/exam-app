-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ExamSetMetadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examType" TEXT NOT NULL,
    "year" TEXT,
    "grade" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "timeLimitSec" INTEGER NOT NULL,
    "isOfficial" BOOLEAN NOT NULL,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_ExamSetMetadata" ("examType", "grade", "id", "isOfficial", "questionCount", "timeLimitSec", "year") SELECT "examType", "grade", "id", "isOfficial", "questionCount", "timeLimitSec", "year" FROM "ExamSetMetadata";
DROP TABLE "ExamSetMetadata";
ALTER TABLE "new_ExamSetMetadata" RENAME TO "ExamSetMetadata";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
