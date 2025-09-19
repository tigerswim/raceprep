-- Fix missing tables in production database
-- This ensures all planned races and related tables exist

-- Create external_races table if it doesn't exist
CREATE TABLE IF NOT EXISTS external_races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR UNIQUE NOT NULL,
  api_source VARCHAR NOT NULL, -- 'active', 'runsignup', 'ironman', etc.
  name VARCHAR NOT NULL,
  date DATE NOT NULL,
  location VARCHAR NOT NULL,
  city VARCHAR,
  state VARCHAR,
  country VARCHAR DEFAULT 'US',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  distance_type VARCHAR NOT NULL CHECK (distance_type IN ('sprint', 'olympic', '70.3', 'ironman', 'other')),
  difficulty VARCHAR CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  registration_url VARCHAR,
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  spots_available INTEGER,
  spots_total INTEGER,
  is_sold_out BOOLEAN DEFAULT false,
  description TEXT,
  features JSONB,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_planned_races table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_planned_races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  external_race_id UUID REFERENCES external_races(id) ON DELETE CASCADE,
  status VARCHAR DEFAULT 'interested' CHECK (status IN ('interested', 'registered', 'training', 'completed', 'withdrawn')),
  registration_date DATE,
  goal_time INTERVAL,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5), -- 1=highest, 5=lowest
  notes TEXT,
  race_strategy TEXT,
  training_weeks_remaining INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, external_race_id)
);

-- Enable RLS on new tables
ALTER TABLE external_races ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_planned_races ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for external_races (publicly readable)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view external races') THEN
        CREATE POLICY "Public can view external races" ON external_races FOR SELECT USING (true);
    END IF;
END $$;

-- Add RLS policies for user_planned_races (users can only see their own)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own planned races') THEN
        CREATE POLICY "Users can view own planned races" ON user_planned_races FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own planned races') THEN
        CREATE POLICY "Users can insert own planned races" ON user_planned_races FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own planned races') THEN
        CREATE POLICY "Users can update own planned races" ON user_planned_races FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own planned races') THEN
        CREATE POLICY "Users can delete own planned races" ON user_planned_races FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_external_races_date ON external_races(date);
CREATE INDEX IF NOT EXISTS idx_external_races_location ON external_races(city, state);
CREATE INDEX IF NOT EXISTS idx_external_races_distance_type ON external_races(distance_type);
CREATE INDEX IF NOT EXISTS idx_user_planned_races_user_id ON user_planned_races(user_id);
CREATE INDEX IF NOT EXISTS idx_user_planned_races_status ON user_planned_races(status);
CREATE INDEX IF NOT EXISTS idx_user_planned_races_external_race ON user_planned_races(external_race_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_external_races_updated_at') THEN
        CREATE TRIGGER update_external_races_updated_at BEFORE UPDATE ON external_races
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_planned_races_updated_at') THEN
        CREATE TRIGGER update_user_planned_races_updated_at BEFORE UPDATE ON user_planned_races
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Verify tables were created
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('external_races', 'user_planned_races')
ORDER BY table_name;