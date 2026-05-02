-- CreateTable
CREATE TABLE IF NOT EXISTS "InviteCode" (
    "id"        SERIAL NOT NULL,
    "code"      TEXT NOT NULL,
    "maxUses"   INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "note"      TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "InviteCode_code_key" ON "InviteCode"("code");
