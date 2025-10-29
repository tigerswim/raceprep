-- Fix distance_type constraint to allow '70.3' value
-- This addresses the constraint violation error when updating races

-- First, drop the existing constraint
ALTER TABLE user_planned_races
DROP CONSTRAINT IF EXISTS user_planned_races_distance_type_check;

-- Add the updated constraint that includes '70.3'
ALTER TABLE user_planned_races
ADD CONSTRAINT user_planned_races_distance_type_check
CHECK (distance_type IN ('sprint', 'olympic', 'half', 'ironman', '70.3', 'custom'));

-- Update any existing '70.3' values to 'half' if needed (for consistency)
-- But allow '70.3' going forward for compatibility with external APIs
UPDATE user_planned_races
SET distance_type = 'half'
WHERE distance_type = '70.3';

COMMENT ON CONSTRAINT user_planned_races_distance_type_check ON user_planned_races
IS 'Allows standard triathlon distances plus 70.3 for external API compatibility';