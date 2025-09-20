-- Fix training_sessions table to add missing Strava integration columns
-- Run this in Supabase SQL Editor

-- Add the missing strava_activity_id column
ALTER TABLE training_sessions 
ADD COLUMN IF NOT EXISTS strava_activity_id VARCHAR;

-- Make it unique to prevent duplicate Strava activities
ALTER TABLE training_sessions 
ADD CONSTRAINT unique_strava_activity_id UNIQUE (strava_activity_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_training_sessions_strava_id ON training_sessions(strava_activity_id);

-- Verify the column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'training_sessions' 
AND column_name = 'strava_activity_id';