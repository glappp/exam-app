-- CreateTable
CREATE TABLE IF NOT EXISTS "Feedback" (
    "id"        SERIAL NOT NULL,
    "name"      TEXT,
    "message"   TEXT NOT NULL,
    "page"      TEXT,
    "userId"    INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
