-- Create HomeworkSubmission table and related columns (run once in Neon SQL Editor)
-- Run this if you see: relation "HomeworkSubmission" does not exist

-- 1) Course: allow homework
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS accepts_homework BOOLEAN NOT NULL DEFAULT false;

-- 2) Lesson: allow homework per lesson
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS accepts_homework BOOLEAN NOT NULL DEFAULT false;

-- 3) Homework submissions table
CREATE TABLE IF NOT EXISTS "HomeworkSubmission" (
  id             TEXT PRIMARY KEY,
  course_id      TEXT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE,
  user_id        TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  lesson_id      TEXT REFERENCES "Lesson"(id) ON DELETE CASCADE,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('link', 'pdf', 'image')),
  link_url       TEXT,
  file_url       TEXT,
  file_name      TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- If table was created by an older script without lesson_id, add it:
ALTER TABLE "HomeworkSubmission" ADD COLUMN IF NOT EXISTS lesson_id TEXT REFERENCES "Lesson"(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "HomeworkSubmission_course_id_idx" ON "HomeworkSubmission"(course_id);
CREATE INDEX IF NOT EXISTS "HomeworkSubmission_user_id_idx" ON "HomeworkSubmission"(user_id);
CREATE INDEX IF NOT EXISTS "HomeworkSubmission_lesson_id_idx" ON "HomeworkSubmission"(lesson_id);
CREATE INDEX IF NOT EXISTS "HomeworkSubmission_created_at_idx" ON "HomeworkSubmission"(created_at);
