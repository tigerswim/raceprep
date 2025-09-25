-- Enhanced Dashboard Features Migration
-- Date: 2025-09-22
-- Description: Add database features to support enhanced dashboard widgets and analytics

-- Add new fields to user_goals for better progress tracking
ALTER TABLE user_goals ADD COLUMN IF NOT EXISTS progress_percentage NUMERIC DEFAULT 0;
ALTER TABLE user_goals ADD COLUMN IF NOT EXISTS last_progress_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE user_goals ADD COLUMN IF NOT EXISTS urgency_level VARCHAR DEFAULT 'low' CHECK (urgency_level IN ('low', 'medium', 'high'));

-- Add new fields to user_planned_races for race preparation status
ALTER TABLE user_planned_races ADD COLUMN IF NOT EXISTS preparation_status VARCHAR DEFAULT 'planning' CHECK (preparation_status IN ('planning', 'good', 'moderate', 'critical', 'excellent'));
ALTER TABLE user_planned_races ADD COLUMN IF NOT EXISTS weeks_until_race INTEGER;
ALTER TABLE user_planned_races ADD COLUMN IF NOT EXISTS days_until_race INTEGER;

-- Create function to calculate race preparation status
CREATE OR REPLACE FUNCTION calculate_race_preparation_status()
RETURNS TRIGGER AS $$
DECLARE
  days_until INTEGER;
  weeks_until INTEGER;
  ideal_prep_weeks INTEGER;
  prep_status VARCHAR;
BEGIN
  -- Calculate days until race
  IF NEW.external_race_id IS NOT NULL THEN
    SELECT EXTRACT(DAY FROM (er.date - CURRENT_DATE))
    INTO days_until
    FROM external_races er
    WHERE er.id = NEW.external_race_id;

    weeks_until := CEIL(days_until / 7.0);

    -- Set ideal preparation weeks based on distance type
    SELECT CASE er.distance_type
      WHEN 'sprint' THEN 8
      WHEN 'olympic' THEN 12
      WHEN '70.3' THEN 20
      WHEN 'ironman' THEN 30
      ELSE 12
    END
    INTO ideal_prep_weeks
    FROM external_races er
    WHERE er.id = NEW.external_race_id;

    -- Calculate preparation status
    IF weeks_until >= ideal_prep_weeks THEN
      prep_status := 'excellent';
    ELSIF weeks_until >= ideal_prep_weeks * 0.75 THEN
      prep_status := 'good';
    ELSIF weeks_until >= ideal_prep_weeks * 0.5 THEN
      prep_status := 'moderate';
    ELSE
      prep_status := 'critical';
    END IF;

    NEW.days_until_race := days_until;
    NEW.weeks_until_race := weeks_until;
    NEW.preparation_status := prep_status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update race preparation status
DROP TRIGGER IF EXISTS update_race_preparation_status ON user_planned_races;
CREATE TRIGGER update_race_preparation_status
  BEFORE INSERT OR UPDATE ON user_planned_races
  FOR EACH ROW
  EXECUTE FUNCTION calculate_race_preparation_status();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_goals_progress ON user_goals(user_id, achieved, progress_percentage);
CREATE INDEX IF NOT EXISTS idx_user_goals_urgency ON user_goals(user_id, urgency_level);
CREATE INDEX IF NOT EXISTS idx_user_planned_races_prep_status ON user_planned_races(user_id, preparation_status);
CREATE INDEX IF NOT EXISTS idx_user_planned_races_days_until ON user_planned_races(user_id, days_until_race);

-- Enhanced training_sessions indexes for analytics
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_type_date ON training_sessions(user_id, type, date DESC);
CREATE INDEX IF NOT EXISTS idx_training_sessions_hr_zones ON training_sessions(user_id, average_heartrate) WHERE average_heartrate IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_training_sessions_power ON training_sessions(user_id, average_watts) WHERE average_watts IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_training_sessions_suffer_score ON training_sessions(user_id, suffer_score) WHERE suffer_score IS NOT NULL;

-- Create function to increment article view counts (referenced in supabase.ts)
CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE training_articles
  SET view_count = view_count + 1,
      updated_at = NOW()
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add materialized view for training statistics (optional performance optimization)
CREATE MATERIALIZED VIEW IF NOT EXISTS user_training_stats AS
SELECT
  user_id,
  DATE_TRUNC('week', date) as week_start,
  type,
  COUNT(*) as sessions,
  SUM(distance) as total_distance,
  SUM(moving_time) as total_time,
  SUM(total_elevation_gain) as total_elevation,
  AVG(average_heartrate) as avg_heartrate,
  AVG(average_watts) as avg_watts,
  SUM(suffer_score) as total_tss
FROM training_sessions
WHERE date >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY user_id, DATE_TRUNC('week', date), type;

-- Create unique index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_training_stats_unique
ON user_training_stats(user_id, week_start, type);

-- Create function to refresh training stats
CREATE OR REPLACE FUNCTION refresh_training_stats()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_training_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add new fields to external_races for better search and filtering
ALTER TABLE external_races ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE external_races ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;
ALTER TABLE external_races ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_external_race_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.location, '') || ' ' ||
    COALESCE(NEW.city, '') || ' ' ||
    COALESCE(NEW.state, '') || ' ' ||
    COALESCE(NEW.description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector updates
DROP TRIGGER IF EXISTS update_external_race_search_vector_trigger ON external_races;
CREATE TRIGGER update_external_race_search_vector_trigger
  BEFORE INSERT OR UPDATE ON external_races
  FOR EACH ROW
  EXECUTE FUNCTION update_external_race_search_vector();

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS idx_external_races_search ON external_races USING gin(search_vector);

-- Update existing records with search vectors
UPDATE external_races SET search_vector = to_tsvector('english',
  COALESCE(name, '') || ' ' ||
  COALESCE(location, '') || ' ' ||
  COALESCE(city, '') || ' ' ||
  COALESCE(state, '') || ' ' ||
  COALESCE(description, '')
) WHERE search_vector IS NULL;

-- Add performance monitoring fields to user_settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS max_heart_rate INTEGER DEFAULT 190;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS lactate_threshold_hr INTEGER;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS functional_threshold_power INTEGER; -- FTP for cycling
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS training_zones JSONB DEFAULT '{
  "hr_zones": {
    "zone1": {"min": 0, "max": 68},
    "zone2": {"min": 68, "max": 83},
    "zone3": {"min": 83, "max": 94},
    "zone4": {"min": 94, "max": 105},
    "zone5": {"min": 105, "max": 115}
  },
  "power_zones": {
    "zone1": {"min": 0, "max": 55},
    "zone2": {"min": 56, "max": 75},
    "zone3": {"min": 76, "max": 90},
    "zone4": {"min": 91, "max": 105},
    "zone5": {"min": 106, "max": 120}
  }
}';

-- Create dashboard metrics cache table (optional for persistent caching)
CREATE TABLE IF NOT EXISTS dashboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cache_key VARCHAR NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, cache_key)
);

-- Enable RLS on dashboard_cache
ALTER TABLE dashboard_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for dashboard cache
CREATE POLICY "Users can access own cache" ON dashboard_cache
FOR ALL USING (auth.uid() = user_id);

-- Create index for cache lookups
CREATE INDEX IF NOT EXISTS idx_dashboard_cache_lookup ON dashboard_cache(user_id, cache_key);
CREATE INDEX IF NOT EXISTS idx_dashboard_cache_expiry ON dashboard_cache(expires_at);

-- Create function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_dashboard_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM dashboard_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for cache upsert
CREATE OR REPLACE FUNCTION upsert_dashboard_cache(
  p_user_id UUID,
  p_cache_key VARCHAR,
  p_data JSONB,
  p_ttl_seconds INTEGER DEFAULT 300
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO dashboard_cache (user_id, cache_key, data, expires_at)
  VALUES (p_user_id, p_cache_key, p_data, NOW() + (p_ttl_seconds * INTERVAL '1 second'))
  ON CONFLICT (user_id, cache_key)
  DO UPDATE SET
    data = EXCLUDED.data,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for enhanced features
CREATE POLICY "Users can view training stats" ON user_training_stats
FOR SELECT USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE dashboard_cache IS 'Persistent cache for dashboard data with TTL support';
COMMENT ON FUNCTION calculate_race_preparation_status() IS 'Automatically calculates race preparation status based on time until race and distance type';
COMMENT ON FUNCTION refresh_training_stats() IS 'Refreshes the materialized view for training statistics';
COMMENT ON FUNCTION cleanup_expired_dashboard_cache() IS 'Removes expired cache entries';

-- Create a scheduled job to refresh training stats (if pg_cron is available)
-- This would typically be set up by the database administrator
-- SELECT cron.schedule('refresh-training-stats', '0 4 * * *', 'SELECT refresh_training_stats();');

-- Success message
SELECT 'Enhanced dashboard features migration completed successfully!' AS status,
       'Added: race preparation status, goal progress tracking, training analytics indexes, search functionality' AS details;