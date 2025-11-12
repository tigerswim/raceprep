-- Create strava_activities table to store cached Strava activity data
-- This enables intelligent matching between Strava workouts and training plan workouts

CREATE TABLE IF NOT EXISTS public.strava_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strava_activity_id BIGINT NOT NULL,

  -- Activity metadata
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  sport_type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT,

  -- Distance and duration
  distance_meters NUMERIC,
  moving_time_seconds INTEGER,
  elapsed_time_seconds INTEGER,

  -- Elevation
  total_elevation_gain_meters NUMERIC,

  -- Speed metrics
  average_speed_mps NUMERIC,
  max_speed_mps NUMERIC,

  -- Heart rate metrics
  average_heartrate NUMERIC,
  max_heartrate NUMERIC,

  -- Power metrics (cycling)
  average_watts NUMERIC,
  max_watts NUMERIC,
  weighted_average_watts NUMERIC,

  -- Cadence metrics
  average_cadence NUMERIC,

  -- Temperature
  average_temp_celsius NUMERIC,

  -- Achievement counts
  achievement_count INTEGER DEFAULT 0,
  kudos_count INTEGER DEFAULT 0,

  -- Location data
  start_latlng NUMERIC[],
  end_latlng NUMERIC[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure we don't duplicate activities
  UNIQUE(user_id, strava_activity_id)
);

-- Create indexes for efficient querying
CREATE INDEX idx_strava_activities_user_id ON public.strava_activities(user_id);
CREATE INDEX idx_strava_activities_start_date ON public.strava_activities(start_date);
CREATE INDEX idx_strava_activities_user_date ON public.strava_activities(user_id, start_date DESC);

-- Enable Row Level Security
ALTER TABLE public.strava_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own Strava activities
CREATE POLICY "Users can view their own strava activities"
  ON public.strava_activities
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own Strava activities
CREATE POLICY "Users can insert their own strava activities"
  ON public.strava_activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own Strava activities
CREATE POLICY "Users can update their own strava activities"
  ON public.strava_activities
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own Strava activities
CREATE POLICY "Users can delete their own strava activities"
  ON public.strava_activities
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_strava_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_strava_activities_updated_at
  BEFORE UPDATE ON public.strava_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_strava_activities_updated_at();

-- Add comment to table
COMMENT ON TABLE public.strava_activities IS 'Cached Strava activity data for intelligent workout matching with training plans';
