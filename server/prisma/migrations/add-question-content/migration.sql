-- Add content blocks field to Question
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "content" JSONB;
