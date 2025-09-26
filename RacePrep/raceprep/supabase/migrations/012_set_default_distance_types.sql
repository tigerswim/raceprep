-- Set default distance_type for existing user_races that have NULL values
-- This ensures all existing races have a valid distance_type

-- Update any user_races with NULL distance_type to default 'custom'
UPDATE user_races
SET distance_type = 'custom'
WHERE distance_type IS NULL;

-- Make distance_type NOT NULL to prevent future issues
ALTER TABLE user_races
ALTER COLUMN distance_type SET NOT NULL;

-- Add a default value for future inserts
ALTER TABLE user_races
ALTER COLUMN distance_type SET DEFAULT 'custom';

COMMENT ON COLUMN user_races.distance_type IS 'The specific distance type for this race (required, defaults to custom)';