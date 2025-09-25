-- Add user distance preferences to user_planned_races table
-- This allows users to specify which distance they're competing in for multi-distance races
-- and override the default distances with custom ones

ALTER TABLE user_planned_races
ADD COLUMN IF NOT EXISTS distance_type TEXT CHECK (distance_type IN ('sprint', 'olympic', 'half', 'ironman', 'custom')),
ADD COLUMN IF NOT EXISTS user_swim_distance NUMERIC(10,3), -- User's custom swim distance in meters/yards
ADD COLUMN IF NOT EXISTS user_bike_distance NUMERIC(10,3), -- User's custom bike distance in km/miles
ADD COLUMN IF NOT EXISTS user_run_distance NUMERIC(10,3),  -- User's custom run distance in km/miles
ADD COLUMN IF NOT EXISTS notes TEXT; -- Personal notes about the race

-- Update the updated_at timestamp when any of these fields change
CREATE OR REPLACE FUNCTION update_user_planned_races_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_user_planned_races_updated_at ON user_planned_races;

CREATE TRIGGER update_user_planned_races_updated_at
  BEFORE UPDATE ON user_planned_races
  FOR EACH ROW
  EXECUTE FUNCTION update_user_planned_races_updated_at();

-- Add index for efficient querying by distance_type
CREATE INDEX IF NOT EXISTS idx_user_planned_races_distance_type
  ON user_planned_races(distance_type);

-- Add index for efficient querying by user_id and status
CREATE INDEX IF NOT EXISTS idx_user_planned_races_user_status
  ON user_planned_races(user_id, status);

-- Comment the table and new columns
COMMENT ON COLUMN user_planned_races.distance_type IS 'The specific distance the user is competing in for this race';
COMMENT ON COLUMN user_planned_races.user_swim_distance IS 'User-specified swim distance (overrides race default)';
COMMENT ON COLUMN user_planned_races.user_bike_distance IS 'User-specified bike distance (overrides race default)';
COMMENT ON COLUMN user_planned_races.user_run_distance IS 'User-specified run distance (overrides race default)';
COMMENT ON COLUMN user_planned_races.notes IS 'Personal notes about race goals, preparation, etc.';