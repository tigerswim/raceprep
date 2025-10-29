-- Comprehensive fix for training_sessions schema issues
-- Migration to ensure training_sessions table is properly configured
-- Date: 2025-09-17

-- Drop existing table if it exists to ensure clean state
-- WARNING: This will delete all training session data!
-- Comment out the next line if you want to preserve existing data
-- DROP TABLE IF EXISTS training_sessions CASCADE;

-- Create training_sessions table with complete schema
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strava_activity_id VARCHAR UNIQUE,
  type VARCHAR NOT NULL CHECK (type IN ('swim', 'bike', 'run')),
  date DATE NOT NULL,
  distance NUMERIC, -- meters
  moving_time INTEGER, -- seconds
  name VARCHAR, -- activity title from Strava
  average_speed NUMERIC, -- m/s
  total_elevation_gain NUMERIC, -- meters
  average_heartrate INTEGER, -- bpm
  max_heartrate INTEGER, -- bpm
  average_watts NUMERIC, -- watts (cycling)
  trainer BOOLEAN DEFAULT false, -- indoor trainer
  sport_type VARCHAR, -- VirtualRun, TrailRun, etc.
  suffer_score NUMERIC, -- Strava training stress
  elapsed_time INTEGER, -- total elapsed time in seconds
  average_cadence NUMERIC, -- steps/min or rpm
  start_latlng JSONB, -- [lat, lng] coordinates
  kudos_count INTEGER DEFAULT 0, -- social engagement
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(date);
CREATE INDEX IF NOT EXISTS idx_training_sessions_type ON training_sessions(type);
CREATE INDEX IF NOT EXISTS idx_training_sessions_strava_id ON training_sessions(strava_activity_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_date ON training_sessions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_type ON training_sessions(user_id, type);

-- Enable Row Level Security
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own training sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can insert own training sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can update own training sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can delete own training sessions" ON training_sessions;

-- Create RLS policies
CREATE POLICY "Users can view own training sessions" ON training_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training sessions" ON training_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training sessions" ON training_sessions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own training sessions" ON training_sessions
FOR DELETE USING (auth.uid() = user_id);

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at updates
DROP TRIGGER IF EXISTS update_training_sessions_updated_at ON training_sessions;
CREATE TRIGGER update_training_sessions_updated_at
  BEFORE UPDATE ON training_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE training_sessions IS 'Training session data imported from Strava and manual entries';
COMMENT ON COLUMN training_sessions.user_id IS 'References the user who owns this training session';
COMMENT ON COLUMN training_sessions.strava_activity_id IS 'Unique identifier from Strava API';
COMMENT ON COLUMN training_sessions.type IS 'Training type: swim, bike, or run';
COMMENT ON COLUMN training_sessions.date IS 'Date of the training session';
COMMENT ON COLUMN training_sessions.distance IS 'Distance in meters';
COMMENT ON COLUMN training_sessions.moving_time IS 'Active time in seconds (excluding rest/stops)';
COMMENT ON COLUMN training_sessions.name IS 'Activity name/title from Strava';
COMMENT ON COLUMN training_sessions.average_speed IS 'Average speed in meters per second';
COMMENT ON COLUMN training_sessions.total_elevation_gain IS 'Total elevation gain in meters';
COMMENT ON COLUMN training_sessions.average_heartrate IS 'Average heart rate in beats per minute';
COMMENT ON COLUMN training_sessions.max_heartrate IS 'Maximum heart rate in beats per minute';
COMMENT ON COLUMN training_sessions.average_watts IS 'Average power in watts (cycling)';
COMMENT ON COLUMN training_sessions.trainer IS 'Whether activity was performed on indoor trainer';
COMMENT ON COLUMN training_sessions.sport_type IS 'Specific sport type (VirtualRun, TrailRun, etc.)';
COMMENT ON COLUMN training_sessions.suffer_score IS 'Strava suffer score (training stress indicator)';
COMMENT ON COLUMN training_sessions.elapsed_time IS 'Total elapsed time including rest stops';
COMMENT ON COLUMN training_sessions.average_cadence IS 'Average cadence (steps/min for running, rpm for cycling)';
COMMENT ON COLUMN training_sessions.start_latlng IS 'Start coordinates as [latitude, longitude] array';
COMMENT ON COLUMN training_sessions.kudos_count IS 'Number of kudos received on Strava';

-- Verify the table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'training_sessions'
ORDER BY ordinal_position;

-- Success message
SELECT 'Training sessions schema migration completed successfully!' AS status;