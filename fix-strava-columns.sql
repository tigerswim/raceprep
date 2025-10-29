-- Fix missing Strava columns in production users table
-- This ensures the Strava integration migration is properly applied

-- Add Strava integration columns to users table (safe with IF NOT EXISTS)
ALTER TABLE users ADD COLUMN IF NOT EXISTS strava_access_token VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS strava_refresh_token VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS strava_token_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS strava_user_id VARCHAR;

-- Verify the columns were added (for testing)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name LIKE 'strava_%'
ORDER BY column_name;