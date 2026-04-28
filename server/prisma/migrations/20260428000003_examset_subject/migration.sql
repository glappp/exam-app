-- Add subject field to ExamSetMetadata (default "math")
ALTER TABLE "ExamSetMetadata" ADD COLUMN IF NOT EXISTS "subject" TEXT NOT NULL DEFAULT 'math';
