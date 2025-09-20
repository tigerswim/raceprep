-- Fix Database Schema Issues for Strava Integration
-- Run this in Supabase SQL Editor to ensure all required columns exist

-- First, let's check what columns currently exist
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'training_sessions'
ORDER BY ordinal_position;

-- Ensure all required columns exist for Strava integration
-- Basic columns (should exist from migration 003)
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS strava_activity_id VARCHAR;
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS type VARCHAR CHECK (type IN ('swim', 'bike', 'run'));
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS date DATE NOT NULL;
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS distance NUMERIC;
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS moving_time INTEGER;

-- Enhanced columns (from migration 004)
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS name VARCHAR;
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS average_speed NUMERIC;
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS total_elevation_gain NUMERIC;
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS average_heartrate NUMERIC;
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS max_heartrate INTEGER;
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS average_watts NUMERIC;
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS trainer BOOLEAN DEFAULT FALSE;
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS sport_type VARCHAR;
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS suffer_score INTEGER;
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS elapsed_time INTEGER;
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS average_cadence NUMERIC;
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS start_latlng NUMERIC[];
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS kudos_count INTEGER DEFAULT 0;
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ensure proper constraints
ALTER TABLE training_sessions DROP CONSTRAINT IF EXISTS training_sessions_strava_activity_id_key;
ALTER TABLE training_sessions ADD CONSTRAINT training_sessions_strava_activity_id_unique UNIQUE (strava_activity_id);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(date);
CREATE INDEX IF NOT EXISTS idx_training_sessions_type ON training_sessions(type);
CREATE INDEX IF NOT EXISTS idx_training_sessions_strava_id ON training_sessions(strava_activity_id);

-- Ensure RLS is enabled and policies exist
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view own training sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can insert own training sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can update own training sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can delete own training sessions" ON training_sessions;

CREATE POLICY "Users can view own training sessions" ON training_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training sessions" ON training_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training sessions" ON training_sessions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own training sessions" ON training_sessions
FOR DELETE USING (auth.uid() = user_id);

-- Test that everything works with a sample query
SELECT COUNT(*) as total_sessions,
       COUNT(DISTINCT user_id) as unique_users,
       COUNT(DISTINCT type) as activity_types
FROM training_sessions;

-- Show recent activities for debugging
SELECT
    id,
    user_id,
    strava_activity_id,
    type,
    name,
    date,
    distance,
    moving_time,
    created_at
FROM training_sessions
ORDER BY created_at DESC
LIMIT 10;