-- Migration: Add status field to user_races table
-- Created: 2024-09-24
-- Purpose: Allow users to track their participation status for custom races

-- Add status column to user_races table
ALTER TABLE user_races ADD COLUMN status TEXT DEFAULT 'interested' CHECK (status IN ('interested', 'registered', 'completed'));

-- Add index for performance
CREATE INDEX idx_user_races_status ON user_races(status);

-- Add comment for documentation
COMMENT ON COLUMN user_races.status IS 'User participation status: interested, registered, or completed';