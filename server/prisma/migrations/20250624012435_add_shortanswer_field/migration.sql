/*
  Warnings:

  - You are about to drop the column `difficulty` on the `Question` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT,
    "textTh" TEXT NOT NULL,
    "textEn" TEXT NOT NULL,
    "image" TEXT,
    "choices" JSONB NOT NULL,
    "answer" INTEGER,
    "shortAnswer" JSONB,
    "attributes" JSONB NOT NULL,
    "source" TEXT,
    "derivedFrom" TEXT,
    "estimatedTimeSec" INTEGER,
    "ownerOrg" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Question" ("answer", "attributes", "choices", "createdAt", "createdBy", "derivedFrom", "estimatedTimeSec", "id", "image", "ownerOrg", "shortAnswer", "source", "textEn", "textTh", "updatedAt", "updatedBy") SELECT "answer", "attributes", "choices", "createdAt", "createdBy", "derivedFrom", "estimatedTimeSec", "id", "image", "ownerOrg", "shortAnswer", "source", "textEn", "textTh", "updatedAt", "updatedBy" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
CREATE UNIQUE INDEX "Question_code_key" ON "Question"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
