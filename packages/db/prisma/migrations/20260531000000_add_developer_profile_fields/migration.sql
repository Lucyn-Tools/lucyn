-- Add developer knowledge profile fields
ALTER TABLE "Developer" ADD COLUMN IF NOT EXISTS "knowledgeAreas" JSONB;
ALTER TABLE "Developer" ADD COLUMN IF NOT EXISTS "focusArea" TEXT;
ALTER TABLE "Developer" ADD COLUMN IF NOT EXISTS "lastProfiledAt" TIMESTAMP(3);
