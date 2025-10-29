-- Add missing columns to user_races table to match user_planned_races functionality
-- This allows users to update status, distance_type, and notes for their created races

ALTER TABLE user_races
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS distance_type TEXT CHECK (distance_type IN ('sprint', 'olympic', 'half', 'ironman', 'custom'));

-- Add index for efficient querying by distance_type
CREATE INDEX IF NOT EXISTS idx_user_races_distance_type
  ON user_races(distance_type);

-- Add index for efficient querying by status
CREATE INDEX IF NOT EXISTS idx_user_races_status
  ON user_races(user_id, status);

-- Comment the new columns
COMMENT ON COLUMN user_races.notes IS 'Personal notes about race goals, preparation, etc.';
COMMENT ON COLUMN user_races.distance_type IS 'The specific distance type for this race (can override the default)';

-- Update the updated_at timestamp when any of these fields change
CREATE OR REPLACE FUNCTION update_user_races_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_user_races_updated_at ON user_races;

CREATE TRIGGER update_user_races_updated_at
  BEFORE UPDATE ON user_races
  FOR EACH ROW
  EXECUTE FUNCTION update_user_races_updated_at();