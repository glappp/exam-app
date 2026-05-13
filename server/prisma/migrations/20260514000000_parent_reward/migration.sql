-- Migration: ParentReward — รายการรางวัลที่ผู้ปกครองกำหนดเอง

CREATE TABLE "ParentReward" (
  "id"        SERIAL          NOT NULL,
  "userId"    INTEGER         NOT NULL,
  "emoji"     TEXT            NOT NULL DEFAULT '🎁',
  "name"      TEXT            NOT NULL,
  "cost"      INTEGER         NOT NULL,
  "sortOrder" INTEGER         NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ParentReward_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ParentReward_userId_idx" ON "ParentReward"("userId");
