-- Migration to add fields needed for n8n resume automation
-- This adds minimal fields required to store parsed resume data

-- Add new columns if they don't exist
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS skills JSONB,
  ADD COLUMN IF NOT EXISTS certifications JSONB,
  ADD COLUMN IF NOT EXISTS source VARCHAR(255);

-- Add comment
COMMENT ON COLUMN contacts.skills IS 'JSON array of skills from resume parsing';
COMMENT ON COLUMN contacts.certifications IS 'JSON array of certifications from resume parsing';
COMMENT ON COLUMN contacts.source IS 'Source of contact (e.g., "n8n automation", "manual entry")';
