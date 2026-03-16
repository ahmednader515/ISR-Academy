-- بيانات الباحث عند التسجيل — تشغيل مرة واحدة من Neon SQL Editor
-- Run if you need the researcher sign-up profile fields

CREATE TABLE IF NOT EXISTS "ResearcherProfile" (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  name_ar               TEXT,
  name_en               TEXT,
  nationality           TEXT,
  date_of_birth         DATE,
  national_id           TEXT,
  academic_degree       TEXT,
  whatsapp_phone        TEXT,
  other_phone           TEXT,
  professional_degree   TEXT,
  department            TEXT,
  research_title        TEXT,
  specialization        TEXT,
  thesis_supervisor     TEXT,
  current_job_title     TEXT,
  employer              TEXT,
  form_signed_at        DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "ResearcherProfile_user_id_idx" ON "ResearcherProfile"(user_id);
