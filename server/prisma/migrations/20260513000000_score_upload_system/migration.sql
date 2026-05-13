-- Migration: Score Upload System
-- สร้าง SchoolSubject (รายวิชาต่อห้อง) และ AcademicScore (คะแนนนักเรียน)

-- ── SchoolSubject ─────────────────────────────────────────────────────────────
CREATE TABLE "SchoolSubject" (
  "id"           SERIAL          NOT NULL,
  "schoolId"     INTEGER         NOT NULL,
  "academicYear" TEXT            NOT NULL,
  "grade"        TEXT            NOT NULL,
  "classroom"    TEXT            NOT NULL,
  "subjectCode"  TEXT            NOT NULL,
  "subjectName"  TEXT            NOT NULL,
  "sortOrder"    INTEGER         NOT NULL DEFAULT 0,
  CONSTRAINT "SchoolSubject_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SchoolSubject_schoolId_academicYear_grade_classroom_subjectCode_key"
  ON "SchoolSubject"("schoolId","academicYear","grade","classroom","subjectCode");

ALTER TABLE "SchoolSubject"
  ADD CONSTRAINT "SchoolSubject_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "School"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── AcademicScore ─────────────────────────────────────────────────────────────
CREATE TABLE "AcademicScore" (
  "id"               SERIAL           NOT NULL,
  "studentProfileId" INTEGER          NOT NULL,
  "schoolSubjectId"  INTEGER          NOT NULL,
  "term"             INTEGER          NOT NULL,  -- 1 | 2
  "midterm"          DOUBLE PRECISION,           -- % 0-100
  "final"            DOUBLE PRECISION,           -- % 0-100
  "total"            DOUBLE PRECISION,           -- % 0-100
  "updatedAt"        TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AcademicScore_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AcademicScore_studentProfileId_schoolSubjectId_term_key"
  ON "AcademicScore"("studentProfileId","schoolSubjectId","term");

ALTER TABLE "AcademicScore"
  ADD CONSTRAINT "AcademicScore_studentProfileId_fkey"
  FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AcademicScore"
  ADD CONSTRAINT "AcademicScore_schoolSubjectId_fkey"
  FOREIGN KEY ("schoolSubjectId") REFERENCES "SchoolSubject"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
