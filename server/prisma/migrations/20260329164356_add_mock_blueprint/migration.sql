-- CreateTable
CREATE TABLE "MockBlueprint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "timeLimitSec" INTEGER NOT NULL DEFAULT 3600,
    "totalQuestions" INTEGER NOT NULL DEFAULT 40,
    "avgPassScore" REAL NOT NULL,
    "topics" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT '{"easy":30,"medium":50,"hard":20}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
