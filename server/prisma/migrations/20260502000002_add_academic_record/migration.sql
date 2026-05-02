-- CreateTable AcademicRecord
CREATE TABLE IF NOT EXISTS "AcademicRecord" (
    "id"           SERIAL PRIMARY KEY,
    "firstName"    TEXT NOT NULL,
    "lastName"     TEXT NOT NULL,
    "school"       TEXT NOT NULL,
    "studentCode"  TEXT,
    "grade"        TEXT NOT NULL,
    "classroom"    TEXT NOT NULL,
    "roomType"     TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "subjectCode"  TEXT NOT NULL,
    "subjectName"  TEXT NOT NULL,
    "midScore"     DOUBLE PRECISION,
    "finalScore"   DOUBLE PRECISION,
    "totalScore"   DOUBLE PRECISION,
    "gradeValue"   TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AcademicRecord_firstName_lastName_school_idx"
    ON "AcademicRecord"("firstName", "lastName", "school");

CREATE INDEX IF NOT EXISTS "AcademicRecord_studentCode_school_idx"
    ON "AcademicRecord"("studentCode", "school");
