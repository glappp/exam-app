-- Session 1: Gamification Foundation
-- เพิ่ม enrollmentYear/Grade ใน StudentProfile
-- เพิ่ม fields ใน CharacterState (activityXp, permanentXp, streak)
-- สร้าง models ใหม่: MissionDailyLog, QuickQuizLog, WeeklyChallengeResult,
--   WeeklyLeaderboard, BoxLog, Reward, RewardClaim, ParentPointBalance, ParentPointLog

-- ── StudentProfile ────────────────────────────────────────────────────────────
ALTER TABLE "StudentProfile"
  ADD COLUMN IF NOT EXISTS "enrollmentYear"  TEXT,
  ADD COLUMN IF NOT EXISTS "enrollmentGrade" TEXT;

-- ── CharacterState ────────────────────────────────────────────────────────────
ALTER TABLE "CharacterState"
  ADD COLUMN IF NOT EXISTS "activityXp"     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "permanentXp"    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "currentStreak"  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "longestStreak"  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "lastActiveDate" TEXT;

-- ── MissionDailyLog ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "MissionDailyLog" (
  "id"           SERIAL NOT NULL,
  "userId"       INTEGER NOT NULL,
  "date"         TEXT NOT NULL,
  "correctCount" INTEGER NOT NULL DEFAULT 0,
  "xpEarned"     INTEGER NOT NULL DEFAULT 0,
  "ticketEarned" INTEGER NOT NULL DEFAULT 0,
  "completedAt"  TIMESTAMP(3),
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MissionDailyLog_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "MissionDailyLog_userId_date_key"
  ON "MissionDailyLog"("userId", "date");

-- ── QuickQuizLog ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "QuickQuizLog" (
  "id"        SERIAL NOT NULL,
  "userId"    INTEGER NOT NULL,
  "date"      TEXT NOT NULL,
  "setsCount" INTEGER NOT NULL DEFAULT 0,
  "xpEarned"  INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuickQuizLog_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "QuickQuizLog_userId_date_key"
  ON "QuickQuizLog"("userId", "date");

-- ── WeeklyChallengeResult ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "WeeklyChallengeResult" (
  "id"        SERIAL NOT NULL,
  "userId"    INTEGER NOT NULL,
  "weekKey"   TEXT NOT NULL,
  "attempts"  INTEGER NOT NULL DEFAULT 0,
  "bestScore" INTEGER NOT NULL DEFAULT 0,
  "xpEarned"  INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WeeklyChallengeResult_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "WeeklyChallengeResult_userId_weekKey_key"
  ON "WeeklyChallengeResult"("userId", "weekKey");

-- ── WeeklyLeaderboard ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "WeeklyLeaderboard" (
  "id"          SERIAL NOT NULL,
  "userId"      INTEGER NOT NULL,
  "weekKey"     TEXT NOT NULL,
  "league"      TEXT NOT NULL,
  "activity"    TEXT NOT NULL,
  "score"       INTEGER NOT NULL,
  "ticketsUsed" INTEGER NOT NULL DEFAULT 1,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WeeklyLeaderboard_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "WeeklyLeaderboard_weekKey_league_idx"
  ON "WeeklyLeaderboard"("weekKey", "league");

-- ── BoxLog ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "BoxLog" (
  "id"           SERIAL NOT NULL,
  "userId"       INTEGER NOT NULL,
  "boxType"      TEXT NOT NULL,
  "rewardType"   TEXT NOT NULL,
  "rewardAmount" INTEGER,
  "rewardId"     INTEGER,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BoxLog_pkey" PRIMARY KEY ("id")
);

-- ── Reward ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Reward" (
  "id"          SERIAL NOT NULL,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "type"        TEXT NOT NULL,
  "code"        TEXT,
  "quantity"    INTEGER NOT NULL DEFAULT 1,
  "claimedQty"  INTEGER NOT NULL DEFAULT 0,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "weekKey"     TEXT,
  "league"      TEXT,
  "rank"        INTEGER,
  "createdBy"   TEXT NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- ── RewardClaim ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "RewardClaim" (
  "id"        SERIAL NOT NULL,
  "userId"    INTEGER NOT NULL,
  "rewardId"  INTEGER NOT NULL,
  "claimRef"  TEXT NOT NULL,
  "status"    TEXT NOT NULL DEFAULT 'pending',
  "claimedAt" TIMESTAMP(3),
  "claimedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RewardClaim_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "RewardClaim_claimRef_key" UNIQUE ("claimRef"),
  CONSTRAINT "RewardClaim_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id")
);

-- ── ParentPointBalance ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ParentPointBalance" (
  "id"          SERIAL NOT NULL,
  "userId"      INTEGER NOT NULL,
  "balance"     INTEGER NOT NULL DEFAULT 0,
  "totalEarned" INTEGER NOT NULL DEFAULT 0,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ParentPointBalance_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ParentPointBalance_userId_key" UNIQUE ("userId")
);

-- ── ParentPointLog ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ParentPointLog" (
  "id"        SERIAL NOT NULL,
  "userId"    INTEGER NOT NULL,
  "amount"    INTEGER NOT NULL,
  "note"      TEXT,
  "source"    TEXT NOT NULL,
  "date"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ParentPointLog_pkey" PRIMARY KEY ("id")
);
