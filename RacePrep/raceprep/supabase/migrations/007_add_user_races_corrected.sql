-- Migration: Add user_races table for user-created races (CORRECTED VERSION)
-- Created: 2024-09-24
-- Purpose: Enable users to create and manage their own custom races

-- First, let's check if the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create user_races table
CREATE TABLE user_races (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  distance_type TEXT NOT NULL CHECK (distance_type IN ('sprint', 'olympic', 'half', 'ironman', 'custom')),
  swim_distance NUMERIC(10,3), -- in meters (e.g., 1500.000 for Olympic)
  bike_distance NUMERIC(10,3), -- in kilometers (e.g., 40.000 for Olympic)
  run_distance NUMERIC(10,3), -- in kilometers (e.g., 10.000 for Olympic)
  difficulty_score INTEGER CHECK (difficulty_score >= 1 AND difficulty_score <= 10),
  description TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_races_user_id ON user_races(user_id);
CREATE INDEX idx_user_races_date ON user_races(date);
CREATE INDEX idx_user_races_distance_type ON user_races(distance_type);
CREATE INDEX idx_user_races_location ON user_races(location);

-- Add updated_at trigger
CREATE TRIGGER update_user_races_updated_at
  BEFORE UPDATE ON user_races
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_races ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see/edit their own races
CREATE POLICY "Users can view own races" ON user_races
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own races" ON user_races
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own races" ON user_races
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own races" ON user_races
  FOR DELETE USING (auth.uid() = user_id);

-- Update race_results table to support linking to user_races
-- Add optional foreign key to user_races table
ALTER TABLE race_results ADD COLUMN user_race_id UUID REFERENCES user_races(id) ON DELETE CASCADE;

-- Create index for the new foreign key
CREATE INDEX idx_race_results_user_race_id ON race_results(user_race_id);

-- Update race_results constraint to allow either race_id or user_race_id
-- First check if the constraint exists and drop it safely
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints
             WHERE constraint_name = 'race_results_race_id_fkey'
             AND table_name = 'race_results') THEN
    ALTER TABLE race_results DROP CONSTRAINT race_results_race_id_fkey;
  END IF;
END $$;

-- Make race_id nullable
ALTER TABLE race_results ALTER COLUMN race_id DROP NOT NULL;

-- Add constraint to ensure either race_id or user_race_id is provided
ALTER TABLE race_results ADD CONSTRAINT race_results_race_reference_check
  CHECK ((race_id IS NOT NULL) OR (user_race_id IS NOT NULL));

-- For nutrition_plans and packing_lists, we'll check what columns actually exist
-- and only update if the tables exist

-- Check if nutrition_plans table exists and add user_race_id support
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nutrition_plans') THEN
    -- Add user_race_id column
    ALTER TABLE nutrition_plans ADD COLUMN user_race_id UUID REFERENCES user_races(id) ON DELETE CASCADE;
    CREATE INDEX idx_nutrition_plans_user_race_id ON nutrition_plans(user_race_id);

    -- Update constraints - be safe about which columns exist
    ALTER TABLE nutrition_plans DROP CONSTRAINT IF EXISTS nutrition_plans_check;

    -- Check if race_id column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'nutrition_plans' AND column_name = 'race_id') THEN
      ALTER TABLE nutrition_plans ADD CONSTRAINT nutrition_plans_race_reference_check
        CHECK ((race_id IS NOT NULL) OR (user_race_id IS NOT NULL));
    ELSE
      ALTER TABLE nutrition_plans ADD CONSTRAINT nutrition_plans_race_reference_check
        CHECK (user_race_id IS NOT NULL);
    END IF;
  END IF;
END $$;

-- Check if packing_lists table exists and add user_race_id support
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'packing_lists') THEN
    -- Add user_race_id column
    ALTER TABLE packing_lists ADD COLUMN user_race_id UUID REFERENCES user_races(id) ON DELETE CASCADE;
    CREATE INDEX idx_packing_lists_user_race_id ON packing_lists(user_race_id);

    -- Update constraints - be safe about which columns exist
    ALTER TABLE packing_lists DROP CONSTRAINT IF EXISTS packing_lists_check;

    -- Check if race_id column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'packing_lists' AND column_name = 'race_id') THEN
      ALTER TABLE packing_lists ADD CONSTRAINT packing_lists_race_reference_check
        CHECK ((race_id IS NOT NULL) OR (user_race_id IS NOT NULL));
    ELSE
      ALTER TABLE packing_lists ADD CONSTRAINT packing_lists_race_reference_check
        CHECK (user_race_id IS NOT NULL);
    END IF;
  END IF;
END $$;

-- Add sample data for testing (optional - can be removed for production)
-- This will only work if there are existing users in the database
DO $$
DECLARE
  sample_user_id UUID;
BEGIN
  -- Try to get a user ID from auth.users table
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;

  -- Only insert sample data if we found a user
  IF sample_user_id IS NOT NULL THEN
    INSERT INTO user_races (user_id, name, date, location, distance_type, swim_distance, bike_distance, run_distance, difficulty_score, description) VALUES
      (sample_user_id, 'My Local Sprint Triathlon', '2024-12-15', 'Local Lake Park', 'sprint', 750.000, 20.000, 5.000, 6, 'A beginner-friendly sprint triathlon at our local lake'),
      (sample_user_id, 'Custom Challenge Race', '2025-06-01', 'Mountain Resort', 'custom', 1000.000, 30.000, 8.000, 8, 'A custom distance race with challenging terrain');
  END IF;
END $$;

-- Add helpful comments
COMMENT ON TABLE user_races IS 'User-created custom races and events';
COMMENT ON COLUMN user_races.distance_type IS 'Standard triathlon distances or custom for user-defined distances';
COMMENT ON COLUMN user_races.swim_distance IS 'Swimming distance in meters';
COMMENT ON COLUMN user_races.bike_distance IS 'Cycling distance in kilometers';
COMMENT ON COLUMN user_races.run_distance IS 'Running distance in kilometers';
COMMENT ON COLUMN user_races.difficulty_score IS 'Subjective difficulty rating from 1 (easy) to 10 (extremely hard)';