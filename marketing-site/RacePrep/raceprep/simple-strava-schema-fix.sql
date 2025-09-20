-- Simple Database Schema Fix for Strava Integration
-- Add only the missing columns (constraint already exists)

-- Add all missing columns for enhanced Strava integration
ALTER TABLE training_sessions
ADD COLUMN IF NOT EXISTS name VARCHAR; -- activity title from Strava

ALTER TABLE training_sessions
ADD COLUMN IF NOT EXISTS average_speed NUMERIC; -- m/s

ALTER TABLE training_sessions
ADD COLUMN IF NOT EXISTS total_elevation_gain NUMERIC; -- meters

ALTER TABLE training_sessions
ADD COLUMN IF NOT EXISTS average_heartrate INTEGER; -- bpm

ALTER TABLE training_sessions
ADD COLUMN IF NOT EXISTS max_heartrate INTEGER; -- bpm

ALTER TABLE training_sessions
ADD COLUMN IF NOT EXISTS average_watts NUMERIC; -- watts (cycling)

ALTER TABLE training_sessions
ADD COLUMN IF NOT EXISTS trainer BOOLEAN DEFAULT false; -- indoor trainer

ALTER TABLE training_sessions
ADD COLUMN IF NOT EXISTS sport_type VARCHAR; -- VirtualRun, TrailRun, etc.

ALTER TABLE training_sessions
ADD COLUMN IF NOT EXISTS suffer_score NUMERIC; -- Strava training stress

ALTER TABLE training_sessions
ADD COLUMN IF NOT EXISTS elapsed_time INTEGER; -- total elapsed time in seconds

ALTER TABLE training_sessions
ADD COLUMN IF NOT EXISTS average_cadence NUMERIC; -- steps/min or rpm

ALTER TABLE training_sessions
ADD COLUMN IF NOT EXISTS start_latlng JSONB; -- [lat, lng] coordinates

ALTER TABLE training_sessions
ADD COLUMN IF NOT EXISTS kudos_count INTEGER DEFAULT 0; -- social engagement

-- Verify all columns exist
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'training_sessions'
ORDER BY ordinal_position;

-- Success message
SELECT 'Strava schema columns added successfully!' AS status;