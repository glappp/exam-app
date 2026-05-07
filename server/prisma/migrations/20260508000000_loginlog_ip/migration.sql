-- Add ip column to LoginLog for admin login history
ALTER TABLE "LoginLog" ADD COLUMN IF NOT EXISTS "ip" TEXT;
