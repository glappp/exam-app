-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "image" TEXT,
    "choices" JSONB NOT NULL,
    "answer" INTEGER NOT NULL,
    "tags" JSONB NOT NULL,
    "difficulty" TEXT,
    "source" TEXT,
    "derivedFrom" TEXT,
    "ownerOrg" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
