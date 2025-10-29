-- Add user_settings table and update user_goals
-- Migration for Profile tab functionality

-- Add distance_type to user_goals table
ALTER TABLE user_goals ADD COLUMN IF NOT EXISTS distance_type VARCHAR CHECK (distance_type IN ('sprint', 'olympic', '70.3', 'ironman'));

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  distance_units VARCHAR DEFAULT 'imperial' CHECK (distance_units IN ('imperial', 'metric')),
  temperature_units VARCHAR DEFAULT 'fahrenheit' CHECK (temperature_units IN ('fahrenheit', 'celsius')),
  notifications_race_reminders BOOLEAN DEFAULT true,
  notifications_training_updates BOOLEAN DEFAULT true,
  notifications_performance_insights BOOLEAN DEFAULT true,
  notifications_community_updates BOOLEAN DEFAULT false,
  years_racing INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User settings RLS policies
CREATE POLICY "Users can view own settings" ON user_settings 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings 
FOR UPDATE USING (auth.uid() = user_id);