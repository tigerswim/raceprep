-- Add Strava integration to RacePrep
-- Migration for Training tab Strava sync functionality

-- Add Strava integration columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS strava_access_token VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS strava_refresh_token VARCHAR; 
ALTER TABLE users ADD COLUMN IF NOT EXISTS strava_token_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS strava_user_id VARCHAR;

-- Create training_sessions table for imported Strava activities
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(date);
CREATE INDEX IF NOT EXISTS idx_training_sessions_type ON training_sessions(type);
CREATE INDEX IF NOT EXISTS idx_training_sessions_strava_id ON training_sessions(strava_activity_id);

-- Enable RLS
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger for training_sessions
CREATE TRIGGER update_training_sessions_updated_at BEFORE UPDATE ON training_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for training_sessions
CREATE POLICY "Users can view own training sessions" ON training_sessions 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training sessions" ON training_sessions 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training sessions" ON training_sessions 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own training sessions" ON training_sessions 
FOR DELETE USING (auth.uid() = user_id);