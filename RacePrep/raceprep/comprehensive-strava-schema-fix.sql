-- Comprehensive Database Schema Fix for Strava Integration
-- Run this in Supabase SQL Editor to add all missing columns for enhanced Strava sync
-- Based on the fields used in strava-callback.tsx

-- First ensure the basic table structure exists
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  strava_activity_id VARCHAR UNIQUE,
  type VARCHAR CHECK (type IN ('swim', 'bike', 'run')),
  date DATE NOT NULL,
  distance NUMERIC, -- meters
  moving_time INTEGER, -- seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Ensure strava_activity_id is unique (safe to run multiple times)
DO $$
BEGIN
  BEGIN
    ALTER TABLE training_sessions
    ADD CONSTRAINT unique_strava_activity_id UNIQUE (strava_activity_id);
  EXCEPTION
    WHEN duplicate_object THEN
      -- Constraint already exists, skip
      NULL;
  END;
END
$$;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(date);
CREATE INDEX IF NOT EXISTS idx_training_sessions_type ON training_sessions(type);
CREATE INDEX IF NOT EXISTS idx_training_sessions_strava_id ON training_sessions(strava_activity_id);

-- Ensure RLS is enabled
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- Ensure RLS policies exist (safe to run multiple times)
DO $$
BEGIN
  -- Check if policies exist before creating them
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'training_sessions' AND policyname = 'Users can view own training sessions') THEN
    EXECUTE 'CREATE POLICY "Users can view own training sessions" ON training_sessions FOR SELECT USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'training_sessions' AND policyname = 'Users can insert own training sessions') THEN
    EXECUTE 'CREATE POLICY "Users can insert own training sessions" ON training_sessions FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'training_sessions' AND policyname = 'Users can update own training sessions') THEN
    EXECUTE 'CREATE POLICY "Users can update own training sessions" ON training_sessions FOR UPDATE USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'training_sessions' AND policyname = 'Users can delete own training sessions') THEN
    EXECUTE 'CREATE POLICY "Users can delete own training sessions" ON training_sessions FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END
$$;

-- Add updated_at trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_training_sessions_updated_at') THEN
    EXECUTE 'CREATE TRIGGER update_training_sessions_updated_at BEFORE UPDATE ON training_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
  END IF;
END
$$;

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
SELECT 'Comprehensive Strava schema fix applied successfully!' AS status;