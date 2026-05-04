CREATE TABLE IF NOT EXISTS "AdaptiveWeakness" (
  "id"               SERIAL PRIMARY KEY,
  "studentProfileId" INTEGER NOT NULL,
  "tagType"          TEXT NOT NULL,
  "tagKey"           TEXT NOT NULL,
  "failCount"        INTEGER NOT NULL DEFAULT 1,
  "correctStreak"    INTEGER NOT NULL DEFAULT 0,
  "lastFailedAt"     TIMESTAMP(3) NOT NULL,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdaptiveWeakness_studentProfileId_fkey"
    FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "AdaptiveWeakness_studentProfileId_tagKey_key"
    UNIQUE ("studentProfileId", "tagKey")
);
