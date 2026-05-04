-- CreateTable
CREATE TABLE "LeaderboardSeason" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardPeriod" (
    "id" SERIAL NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "weekKey" TEXT,
    "monthKey" TEXT,
    "label" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "settled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LeaderboardPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaturdayQuizPool" (
    "id" SERIAL NOT NULL,
    "weekKey" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "SaturdayQuizPool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaturdayQuizAttempt" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "weekKey" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "timeUsed" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaturdayQuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HallOfFame" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "periodId" INTEGER NOT NULL,
    "activity" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "totalTime" INTEGER,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HallOfFame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeaderboardPeriod_type_weekKey_idx" ON "LeaderboardPeriod"("type", "weekKey");

-- CreateIndex
CREATE INDEX "LeaderboardPeriod_type_monthKey_idx" ON "LeaderboardPeriod"("type", "monthKey");

-- CreateIndex
CREATE UNIQUE INDEX "SaturdayQuizPool_weekKey_questionId_key" ON "SaturdayQuizPool"("weekKey", "questionId");

-- CreateIndex
CREATE INDEX "SaturdayQuizPool_weekKey_idx" ON "SaturdayQuizPool"("weekKey");

-- CreateIndex
CREATE UNIQUE INDEX "SaturdayQuizAttempt_userId_weekKey_key" ON "SaturdayQuizAttempt"("userId", "weekKey");

-- CreateIndex
CREATE INDEX "SaturdayQuizAttempt_weekKey_idx" ON "SaturdayQuizAttempt"("weekKey");

-- CreateIndex
CREATE UNIQUE INDEX "HallOfFame_userId_periodId_activity_key" ON "HallOfFame"("userId", "periodId", "activity");

-- CreateIndex
CREATE INDEX "HallOfFame_periodId_activity_idx" ON "HallOfFame"("periodId", "activity");

-- AddForeignKey
ALTER TABLE "LeaderboardPeriod" ADD CONSTRAINT "LeaderboardPeriod_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "LeaderboardSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaturdayQuizPool" ADD CONSTRAINT "SaturdayQuizPool_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaturdayQuizAttempt" ADD CONSTRAINT "SaturdayQuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
