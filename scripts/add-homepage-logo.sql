-- شغّله من لوحة Neon → SQL Editor (بعد وجود جدول HomepageSetting)
-- يضيف عمود شعار الموقع في الشريط العلوي

ALTER TABLE "HomepageSetting" ADD COLUMN IF NOT EXISTS logo_url TEXT;
