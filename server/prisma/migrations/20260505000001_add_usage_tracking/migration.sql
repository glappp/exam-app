-- CreateTable: LoginLog
CREATE TABLE "LoginLog" (
    "id"       SERIAL NOT NULL,
    "userId"   INTEGER NOT NULL,
    "schoolId" INTEGER,
    "loginAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoginLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LoginLog_loginAt_idx" ON "LoginLog"("loginAt");
CREATE INDEX "LoginLog_userId_idx" ON "LoginLog"("userId");

-- CreateTable: DailyUsageStat
CREATE TABLE "DailyUsageStat" (
    "id"                SERIAL NOT NULL,
    "date"              TEXT NOT NULL,
    "schoolId"          INTEGER,
    "grade"             TEXT,
    "classroom"         TEXT,
    "activeUsers"       INTEGER NOT NULL DEFAULT 0,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyUsageStat_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DailyUsageStat_date_schoolId_grade_classroom_key"
    ON "DailyUsageStat"("date", "schoolId", "grade", "classroom");
CREATE INDEX "DailyUsageStat_date_schoolId_idx" ON "DailyUsageStat"("date", "schoolId");
