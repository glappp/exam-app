-- Add firstLoginAt to User
ALTER TABLE "User" ADD COLUMN "firstLoginAt" TIMESTAMP(3);

-- Make ClassroomScoreUpload.academicYear, term, grade nullable
ALTER TABLE "ClassroomScoreUpload" ALTER COLUMN "academicYear" DROP NOT NULL;
ALTER TABLE "ClassroomScoreUpload" ALTER COLUMN "term" DROP NOT NULL;
ALTER TABLE "ClassroomScoreUpload" ALTER COLUMN "grade" DROP NOT NULL;
