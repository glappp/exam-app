-- CreateTable
CREATE TABLE "ExamSetMetadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examType" TEXT NOT NULL,
    "year" TEXT,
    "grade" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "timeLimitSec" INTEGER NOT NULL,
    "isOfficial" BOOLEAN NOT NULL
);
