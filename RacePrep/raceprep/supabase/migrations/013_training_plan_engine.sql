-- Migration: Training Plan Engine
-- Description: Creates tables for training plan templates, user training plans, workouts, and completion tracking
-- Version: 013

-- =====================================================
-- Table: training_plan_templates
-- Description: Stores reusable training plan templates
-- =====================================================
CREATE TABLE training_plan_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    distance_type VARCHAR(50) NOT NULL CHECK (distance_type IN (
'sprint'
, 
'olympic'
, 
'70.3'
, 
'ironman'
)),
    duration_weeks INTEGER NOT NULL CHECK (duration_weeks >= 8 AND duration_weeks <= 32),
    experience_level VARCHAR(50) NOT NULL CHECK (experience_level IN (
'beginner'
, 
'intermediate'
, 
'advanced'
)),
    weekly_hours_min INTEGER NOT NULL CHECK (weekly_hours_min > 0),
    weekly_hours_max INTEGER NOT NULL CHECK (weekly_hours_max >= weekly_hours_min),
    description TEXT,
    target_audience TEXT,
    key_features TEXT[],
    created_by VARCHAR(255) DEFAULT 
'system'
,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================

-- Table: user_training_plans

-- Description: User's active/historical training plans

-- =====================================================

CREATE TABLE user_training_plans (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    template_id UUID NOT NULL REFERENCES training_plan_templates(id) ON DELETE RESTRICT,

    planned_race_id UUID REFERENCES user_planned_races(id) ON DELETE SET NULL,

    plan_name VARCHAR(255) NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE NOT NULL,

    current_week INTEGER DEFAULT 1 CHECK (current_week >= 1),

    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),

    customizations JSONB DEFAULT '{}',

    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_date_range CHECK (end_date >= start_date),

    CONSTRAINT unique_user_race UNIQUE(user_id, planned_race_id)

);

-- =====================================================

-- Table: training_plan_workouts

-- Description: Individual workouts within plan templates

-- =====================================================

CREATE TABLE training_plan_workouts (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    template_id UUID NOT NULL REFERENCES training_plan_templates(id) ON DELETE CASCADE,

    week_number INTEGER NOT NULL CHECK (week_number >= 1),

    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),

    discipline VARCHAR(50) NOT NULL CHECK (discipline IN ('swim', 'bike', 'run', 'brick', 'strength', 'rest')),

    workout_type VARCHAR(100),

    duration_minutes INTEGER CHECK (duration_minutes > 0),

    distance_miles DECIMAL(5,2) CHECK (distance_miles > 0),

    intensity_description VARCHAR(255),

    structure JSONB,

    detailed_description TEXT,

    coaching_notes TEXT,

    goals TEXT[],

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);

-- =====================================================

-- Table: workout_completions

-- Description: Tracks user's workout completions and skips

-- =====================================================

CREATE TABLE workout_completions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_training_plan_id UUID NOT NULL REFERENCES user_training_plans(id) ON DELETE CASCADE,

    planned_workout_id UUID NOT NULL REFERENCES training_plan_workouts(id) ON DELETE RESTRICT,

    scheduled_date DATE NOT NULL,

    completed_date DATE,

    strava_activity_id BIGINT,

    actual_duration_minutes INTEGER CHECK (actual_duration_minutes > 0),

    actual_distance_miles DECIMAL(5,2) CHECK (actual_distance_miles > 0),

    perceived_effort INTEGER CHECK (perceived_effort >= 1 AND perceived_effort <= 10),

    notes TEXT,

    skipped BOOLEAN DEFAULT false,

    skip_reason VARCHAR(255),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_workout_completion UNIQUE(user_training_plan_id, planned_workout_id, scheduled_date)

);

-- =====================================================

-- Indexes for Performance

-- =====================================================



-- training_plan_templates indexes

CREATE INDEX idx_templates_distance_type ON training_plan_templates(distance_type);

CREATE INDEX idx_templates_experience_level ON training_plan_templates(experience_level);

CREATE INDEX idx_templates_active ON training_plan_templates(is_active);

CREATE INDEX idx_templates_slug ON training_plan_templates(slug);



-- user_training_plans indexes

CREATE INDEX idx_user_plans_user_id ON user_training_plans(user_id);

CREATE INDEX idx_user_plans_template_id ON user_training_plans(template_id);

CREATE INDEX idx_user_plans_planned_race_id ON user_training_plans(planned_race_id);

CREATE INDEX idx_user_plans_status ON user_training_plans(status);

CREATE INDEX idx_user_plans_date_range ON user_training_plans(start_date, end_date);

CREATE INDEX idx_user_plans_user_status ON user_training_plans(user_id, status);



-- training_plan_workouts indexes

CREATE INDEX idx_plan_workouts_template_id ON training_plan_workouts(template_id);

CREATE INDEX idx_plan_workouts_week_day ON training_plan_workouts(template_id, week_number, day_of_week);

CREATE INDEX idx_plan_workouts_discipline ON training_plan_workouts(discipline);



-- workout_completions indexes

CREATE INDEX idx_completions_user_plan_id ON workout_completions(user_training_plan_id);

CREATE INDEX idx_completions_planned_workout_id ON workout_completions(planned_workout_id);

CREATE INDEX idx_completions_scheduled_date ON workout_completions(scheduled_date);

CREATE INDEX idx_completions_completed_date ON workout_completions(completed_date);

CREATE INDEX idx_completions_strava_id ON workout_completions(strava_activity_id);

CREATE INDEX idx_completions_user_plan_date ON workout_completions(user_training_plan_id, scheduled_date);

-- =====================================================

-- Triggers for Updated_at Timestamps

-- =====================================================



CREATE TRIGGER update_training_plan_templates_updated_at

    BEFORE UPDATE ON training_plan_templates

    FOR EACH ROW

    EXECUTE FUNCTION update_updated_at_column();



CREATE TRIGGER update_user_training_plans_updated_at

    BEFORE UPDATE ON user_training_plans

    FOR EACH ROW

    EXECUTE FUNCTION update_updated_at_column();



CREATE TRIGGER update_workout_completions_updated_at

    BEFORE UPDATE ON workout_completions

    FOR EACH ROW

    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================

-- Row Level Security (RLS) Policies

-- =====================================================



-- Enable RLS on all tables

ALTER TABLE training_plan_templates ENABLE ROW LEVEL SECURITY;

ALTER TABLE user_training_plans ENABLE ROW LEVEL SECURITY;

ALTER TABLE training_plan_workouts ENABLE ROW LEVEL SECURITY;

ALTER TABLE workout_completions ENABLE ROW LEVEL SECURITY;



-- training_plan_templates: Public read access for active templates

CREATE POLICY "Templates are viewable by everyone"

    ON training_plan_templates

    FOR SELECT

    USING (is_active = true);



CREATE POLICY "Templates are insertable by authenticated users"

    ON training_plan_templates

    FOR INSERT

    TO authenticated

    WITH CHECK (true);



CREATE POLICY "Templates are updatable by authenticated users"

    ON training_plan_templates

    FOR UPDATE

    TO authenticated

    USING (true)

    WITH CHECK (true);

-- training_plan_workouts: Public read access for workouts in active templates

CREATE POLICY "Workouts are viewable by everyone"

    ON training_plan_workouts

    FOR SELECT

    USING (

        EXISTS (

            SELECT 1 FROM training_plan_templates

            WHERE id = training_plan_workouts.template_id

            AND is_active = true

        )

    );



CREATE POLICY "Workouts are insertable by authenticated users"

    ON training_plan_workouts

    FOR INSERT

    TO authenticated

    WITH CHECK (true);



CREATE POLICY "Workouts are updatable by authenticated users"

    ON training_plan_workouts

    FOR UPDATE

    TO authenticated

    USING (true)

    WITH CHECK (true);

-- user_training_plans: User can only access their own plans

CREATE POLICY "Users can view their own training plans"

    ON user_training_plans

    FOR SELECT

    TO authenticated

    USING (user_id = auth.uid());



CREATE POLICY "Users can insert their own training plans"

    ON user_training_plans

    FOR INSERT

    TO authenticated

    WITH CHECK (user_id = auth.uid());



CREATE POLICY "Users can update their own training plans"

    ON user_training_plans

    FOR UPDATE

    TO authenticated

    USING (user_id = auth.uid())

    WITH CHECK (user_id = auth.uid());



CREATE POLICY "Users can delete their own training plans"

    ON user_training_plans

    FOR DELETE

    TO authenticated

    USING (user_id = auth.uid());

-- workout_completions: User can only access completions for their own plans

CREATE POLICY "Users can view their own workout completions"

    ON workout_completions

    FOR SELECT

    TO authenticated

    USING (

        EXISTS (

            SELECT 1 FROM user_training_plans

            WHERE id = workout_completions.user_training_plan_id

            AND user_id = auth.uid()

        )

    );



CREATE POLICY "Users can insert their own workout completions"

    ON workout_completions

    FOR INSERT

    TO authenticated

    WITH CHECK (

        EXISTS (

            SELECT 1 FROM user_training_plans

            WHERE id = workout_completions.user_training_plan_id

            AND user_id = auth.uid()

        )

    );

CREATE POLICY "Users can update their own workout completions"

    ON workout_completions

    FOR UPDATE

    TO authenticated

    USING (

        EXISTS (

            SELECT 1 FROM user_training_plans

            WHERE id = workout_completions.user_training_plan_id

            AND user_id = auth.uid()

        )

    )

    WITH CHECK (

        EXISTS (

            SELECT 1 FROM user_training_plans

            WHERE id = workout_completions.user_training_plan_id

            AND user_id = auth.uid()

        )

    );



CREATE POLICY "Users can delete their own workout completions"

    ON workout_completions

    FOR DELETE

    TO authenticated

    USING (

        EXISTS (

            SELECT 1 FROM user_training_plans

            WHERE id = workout_completions.user_training_plan_id

            AND user_id = auth.uid()

        )

    );

-- =====================================================

-- Comments for Documentation

-- =====================================================



COMMENT ON TABLE training_plan_templates IS 'Reusable training plan templates for different race distances and experience levels';

COMMENT ON TABLE user_training_plans IS 'User-specific training plans based on templates, linked to planned races';

COMMENT ON TABLE training_plan_workouts IS 'Individual workout definitions within training plan templates';

COMMENT ON TABLE workout_completions IS 'Tracking of completed, skipped, or scheduled workouts for users';



COMMENT ON COLUMN training_plan_templates.distance_type IS 'Race distance: sprint, olympic, 70.3, or ironman';

COMMENT ON COLUMN training_plan_templates.experience_level IS 'Target experience level: beginner, intermediate, or advanced';

COMMENT ON COLUMN training_plan_templates.duration_weeks IS 'Length of training plan in weeks (8-32)';

COMMENT ON COLUMN training_plan_templates.key_features IS 'Array of key features or selling points of this plan';

COMMENT ON COLUMN user_training_plans.customizations IS 'JSON object storing user-specific modifications to the template';

COMMENT ON COLUMN user_training_plans.current_week IS 'Current week number in the training plan';

COMMENT ON COLUMN user_training_plans.status IS 'Plan status: active, paused, completed, or abandoned';



COMMENT ON COLUMN training_plan_workouts.week_number IS 'Week number within the training plan (1-based)';

COMMENT ON COLUMN training_plan_workouts.day_of_week IS 'Day of week (1=Monday, 7=Sunday)';

COMMENT ON COLUMN training_plan_workouts.discipline IS 'Workout discipline: swim, bike, run, brick, strength, or rest';

COMMENT ON COLUMN training_plan_workouts.structure IS 'JSON object with detailed workout structure (intervals, zones, etc.)';

COMMENT ON COLUMN training_plan_workouts.goals IS 'Array of workout goals or objectives';



COMMENT ON COLUMN workout_completions.perceived_effort IS 'User-reported effort level (1-10 scale)';

COMMENT ON COLUMN workout_completions.strava_activity_id IS 'Reference to synced Strava activity if applicable';

COMMENT ON COLUMN workout_completions.skipped IS 'Whether this workout was intentionally skipped';
