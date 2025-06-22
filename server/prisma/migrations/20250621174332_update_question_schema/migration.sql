/*
  Warnings:

  - You are about to drop the column `tags` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Question` table. All the data in the column will be lost.
  - Added the required column `attributes` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `textEn` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `textTh` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "textTh" TEXT NOT NULL,
    "textEn" TEXT NOT NULL,
    "image" TEXT,
    "choices" JSONB NOT NULL,
    "answer" INTEGER NOT NULL,
    "attributes" JSONB NOT NULL,
    "difficulty" TEXT,
    "source" TEXT,
    "derivedFrom" TEXT,
    "estimatedTimeSec" INTEGER,
    "ownerOrg" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Question" ("answer", "choices", "createdAt", "createdBy", "derivedFrom", "difficulty", "estimatedTimeSec", "id", "image", "ownerOrg", "source", "updatedAt", "updatedBy") SELECT "answer", "choices", "createdAt", "createdBy", "derivedFrom", "difficulty", "estimatedTimeSec", "id", "image", "ownerOrg", "source", "updatedAt", "updatedBy" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
