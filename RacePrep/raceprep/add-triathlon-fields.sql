-- Add triathlon-specific fields to external_races table
-- This migration adds fields that are commonly used for triathlon race data

-- Add triathlon-specific columns to external_races table
ALTER TABLE external_races
ADD COLUMN IF NOT EXISTS swim_type VARCHAR CHECK (swim_type IN ('pool', 'open_water', 'river', 'lake', 'ocean')),
ADD COLUMN IF NOT EXISTS swim_distance_meters INTEGER,
ADD COLUMN IF NOT EXISTS bike_distance_meters INTEGER,
ADD COLUMN IF NOT EXISTS bike_elevation_gain INTEGER, -- meters of elevation gain
ADD COLUMN IF NOT EXISTS run_distance_meters INTEGER,
ADD COLUMN IF NOT EXISTS wetsuit_legal BOOLEAN,
ADD COLUMN IF NOT EXISTS transition_area TEXT, -- description of transition setup
ADD COLUMN IF NOT EXISTS course_description TEXT,
ADD COLUMN IF NOT EXISTS difficulty_score INTEGER CHECK (difficulty_score >= 1 AND difficulty_score <= 10),
ADD COLUMN IF NOT EXISTS wave_start BOOLEAN DEFAULT false, -- rolling vs wave start
ADD COLUMN IF NOT EXISTS qualifying_race BOOLEAN DEFAULT false, -- for Ironman/big races
ADD COLUMN IF NOT EXISTS age_group_categories JSONB, -- age group divisions
ADD COLUMN IF NOT EXISTS awards_info TEXT,
ADD COLUMN IF NOT EXISTS course_records JSONB, -- {male: "8:45:23", female: "9:12:45"}
ADD COLUMN IF NOT EXISTS weather_conditions TEXT, -- typical weather for race date
ADD COLUMN IF NOT EXISTS water_temperature_avg INTEGER, -- Celsius
ADD COLUMN IF NOT EXISTS draft_legal BOOLEAN DEFAULT false; -- drafting allowed on bike

-- Add indexes for commonly queried triathlon fields
CREATE INDEX IF NOT EXISTS idx_external_races_swim_type ON external_races(swim_type);
CREATE INDEX IF NOT EXISTS idx_external_races_difficulty_score ON external_races(difficulty_score);
CREATE INDEX IF NOT EXISTS idx_external_races_wetsuit_legal ON external_races(wetsuit_legal);
CREATE INDEX IF NOT EXISTS idx_external_races_qualifying_race ON external_races(qualifying_race);

-- Update the features JSONB field description in a comment
COMMENT ON COLUMN external_races.features IS 'Additional race features as JSON: {packet_pickup: {...}, expo: {...}, merchandise: {...}, etc.}';
COMMENT ON COLUMN external_races.swim_type IS 'Type of swim: pool, open_water, river, lake, ocean';
COMMENT ON COLUMN external_races.bike_elevation_gain IS 'Total elevation gain on bike course in meters';
COMMENT ON COLUMN external_races.difficulty_score IS 'Race difficulty rating from 1 (beginner) to 10 (expert)';
COMMENT ON COLUMN external_races.course_records IS 'Course records as JSON: {male: "8:45:23", female: "9:12:45"}';
COMMENT ON COLUMN external_races.age_group_categories IS 'Age group divisions as JSON array: ["18-24", "25-29", "30-34", ...]';

-- Verify the new columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'external_races'
AND column_name IN (
  'swim_type', 'bike_elevation_gain', 'wetsuit_legal', 'difficulty_score',
  'swim_distance_meters', 'bike_distance_meters', 'run_distance_meters',
  'transition_area', 'course_description', 'wave_start', 'qualifying_race',
  'age_group_categories', 'awards_info', 'course_records', 'weather_conditions',
  'water_temperature_avg', 'draft_legal'
)
ORDER BY column_name;