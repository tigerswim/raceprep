-- Enhance training_sessions table with additional Strava fields
-- Migration for enhanced Strava data capture

-- Add new columns for enhanced Strava data
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS name VARCHAR; -- Activity name from Strava
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS average_speed NUMERIC; -- m/s
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS total_elevation_gain NUMERIC; -- meters
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS average_heartrate NUMERIC; -- bpm
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS max_heartrate INTEGER; -- bpm
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS average_watts NUMERIC; -- watts (for cycling)
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS trainer BOOLEAN DEFAULT FALSE; -- indoor trainer
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS sport_type VARCHAR; -- VirtualRun, TrailRun, etc.
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS suffer_score INTEGER; -- Strava's training stress
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS elapsed_time INTEGER; -- total elapsed time in seconds
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS average_cadence NUMERIC; -- steps/min for running, rpm for cycling
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS start_latlng NUMERIC[]; -- [lat, lng] coordinates
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS kudos_count INTEGER DEFAULT 0; -- social engagement

-- Add indexes for the new fields we'll likely query
CREATE INDEX IF NOT EXISTS idx_training_sessions_name ON training_sessions(name);
CREATE INDEX IF NOT EXISTS idx_training_sessions_trainer ON training_sessions(trainer);
CREATE INDEX IF NOT EXISTS idx_training_sessions_sport_type ON training_sessions(sport_type);
CREATE INDEX IF NOT EXISTS idx_training_sessions_avg_heartrate ON training_sessions(average_heartrate);

-- Add comments for clarity
COMMENT ON COLUMN training_sessions.name IS 'Activity name/title from Strava';
COMMENT ON COLUMN training_sessions.average_speed IS 'Average speed in meters per second';
COMMENT ON COLUMN training_sessions.total_elevation_gain IS 'Total elevation gain in meters';
COMMENT ON COLUMN training_sessions.average_heartrate IS 'Average heart rate in beats per minute';
COMMENT ON COLUMN training_sessions.max_heartrate IS 'Maximum heart rate in beats per minute';
COMMENT ON COLUMN training_sessions.average_watts IS 'Average power in watts (cycling)';
COMMENT ON COLUMN training_sessions.trainer IS 'Whether activity was performed on indoor trainer';
COMMENT ON COLUMN training_sessions.sport_type IS 'Specific sport type (VirtualRun, TrailRun, etc.)';
COMMENT ON COLUMN training_sessions.suffer_score IS 'Strava suffer score (training stress indicator)';
COMMENT ON COLUMN training_sessions.elapsed_time IS 'Total elapsed time including rest stops';
COMMENT ON COLUMN training_sessions.average_cadence IS 'Average cadence (steps/min for running, rpm for cycling)';
COMMENT ON COLUMN training_sessions.start_latlng IS 'Start coordinates as [latitude, longitude] array';
COMMENT ON COLUMN training_sessions.kudos_count IS 'Number of kudos received on Strava';