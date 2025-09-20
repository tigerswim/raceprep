-- RacePrep Database Schema
-- Based on raceprep_development_docs.2.md

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  age_group VARCHAR, -- e.g., "35-39"
  gender VARCHAR,
  experience_level VARCHAR CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  location VARCHAR,
  usat_id VARCHAR,
  premium_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  location VARCHAR NOT NULL,
  distance_type VARCHAR NOT NULL CHECK (distance_type IN ('sprint', 'olympic', '70.3', 'ironman')),
  swim_type VARCHAR CHECK (swim_type IN ('lake', 'ocean', 'river', 'pool')),
  bike_elevation_gain INTEGER, -- feet
  run_elevation_gain INTEGER, -- feet
  overall_elevation INTEGER, -- feet above sea level
  difficulty_score INTEGER CHECK (difficulty_score >= 1 AND difficulty_score <= 10),
  wetsuit_legal BOOLEAN DEFAULT true,
  description TEXT,
  features JSONB, -- array of features like ["hilly", "scenic", "urban"]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Races table
CREATE TABLE races (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  date DATE NOT NULL,
  location VARCHAR NOT NULL,
  distance_type VARCHAR NOT NULL CHECK (distance_type IN ('sprint', 'olympic', '70.3', 'ironman')),
  course_id UUID REFERENCES courses(id),
  timing_platform VARCHAR, -- chronotrack, runsignup, etc.
  external_race_id VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User race results
CREATE TABLE race_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  race_id UUID REFERENCES races(id) ON DELETE CASCADE,
  overall_time INTERVAL NOT NULL,
  swim_time INTERVAL,
  t1_time INTERVAL,
  bike_time INTERVAL,
  t2_time INTERVAL,
  run_time INTERVAL,
  overall_placement INTEGER,
  age_group_placement INTEGER,
  bib_number VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, race_id)
);

-- Course ratings and reviews
CREATE TABLE course_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating DECIMAL(2,1) CHECK (rating >= 1.0 AND rating <= 5.0),
  review_text TEXT,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- Weather data for races
CREATE TABLE race_weather (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  race_id UUID REFERENCES races(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  temperature_f INTEGER,
  humidity DECIMAL(3,1),
  wind_speed INTEGER,
  conditions VARCHAR,
  water_temperature_f INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition plans
CREATE TABLE nutrition_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  race_id UUID REFERENCES races(id) ON DELETE CASCADE, -- for completed races
  planned_race_id UUID REFERENCES user_planned_races(id) ON DELETE CASCADE, -- for planned races  
  pre_race_items JSONB, -- [{item: string, quantity: string, timing: string, notes: string}]
  bike_items JSONB,    -- [{item: string, quantity: string, timing: string, calories: number, notes: string}]
  run_items JSONB,     -- [{item: string, quantity: string, timing: string, calories: number, notes: string}]
  hydration_plan JSONB, -- [{drink: string, volume: string, timing: string, electrolytes: string}]
  total_carbs INTEGER,
  total_sodium INTEGER,  
  total_calories INTEGER,
  total_caffeine INTEGER,
  plan_name VARCHAR DEFAULT 'Race Day Nutrition',
  is_template BOOLEAN DEFAULT false, -- allows saving as reusable template
  template_name VARCHAR,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK ((race_id IS NOT NULL) OR (planned_race_id IS NOT NULL)) -- must link to either completed or planned race
);

-- User equipment preferences
CREATE TABLE user_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR NOT NULL CHECK (category IN ('swim', 'bike', 'run')),
  item_type VARCHAR NOT NULL, -- wetsuit, bike, shoes, etc.
  brand VARCHAR,
  model VARCHAR,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User goals
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_type VARCHAR NOT NULL CHECK (goal_type IN ('race_count', 'time_target', 'transition_time')),
  distance_type VARCHAR CHECK (distance_type IN ('sprint', 'olympic', '70.3', 'ironman')),
  target_value VARCHAR NOT NULL,
  current_value VARCHAR,
  target_date DATE,
  achieved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings/preferences
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  distance_units VARCHAR DEFAULT 'imperial' CHECK (distance_units IN ('imperial', 'metric')),
  temperature_units VARCHAR DEFAULT 'fahrenheit' CHECK (temperature_units IN ('fahrenheit', 'celsius')),
  notifications_race_reminders BOOLEAN DEFAULT true,
  notifications_training_updates BOOLEAN DEFAULT true,
  notifications_performance_insights BOOLEAN DEFAULT true,
  notifications_community_updates BOOLEAN DEFAULT false,
  years_racing INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packing lists
CREATE TABLE packing_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  race_id UUID REFERENCES races(id) ON DELETE CASCADE, -- for completed races
  planned_race_id UUID REFERENCES user_planned_races(id) ON DELETE CASCADE, -- for planned races
  category VARCHAR NOT NULL CHECK (category IN ('t1', 't2', 'race_morning', 'travel', 'general')),
  list_name VARCHAR DEFAULT 'Packing List',
  items JSONB NOT NULL, -- [{item: string, checked: boolean, priority: string, notes: string, category_override: string}]
  is_template BOOLEAN DEFAULT false, -- allows saving as reusable template
  template_name VARCHAR,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK ((race_id IS NOT NULL) OR (planned_race_id IS NOT NULL)) -- must link to either completed or planned race
);

-- Discover Tab Tables

-- External Races (from APIs)
CREATE TABLE external_races (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id VARCHAR UNIQUE NOT NULL,
  api_source VARCHAR NOT NULL, -- 'active', 'runsignup', 'ironman', etc.
  name VARCHAR NOT NULL,
  date DATE NOT NULL,
  location VARCHAR NOT NULL,
  city VARCHAR,
  state VARCHAR,
  country VARCHAR DEFAULT 'US',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  distance_type VARCHAR NOT NULL CHECK (distance_type IN ('sprint', 'olympic', '70.3', 'ironman', 'other')),
  difficulty VARCHAR CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  registration_url VARCHAR,
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  spots_available INTEGER,
  spots_total INTEGER,
  is_sold_out BOOLEAN DEFAULT false,
  description TEXT,
  features JSONB,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Events
CREATE TABLE training_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id VARCHAR,
  api_source VARCHAR, -- 'meetup', 'facebook', 'manual', etc.
  title VARCHAR NOT NULL,
  description TEXT,
  event_type VARCHAR NOT NULL CHECK (event_type IN ('clinic', 'workshop', 'group_training', 'race_simulation', 'other')),
  date DATE NOT NULL,
  time TIME,
  duration_minutes INTEGER,
  location VARCHAR NOT NULL,
  city VARCHAR,
  state VARCHAR,
  country VARCHAR DEFAULT 'US',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  organizer_name VARCHAR,
  organizer_contact VARCHAR,
  event_url VARCHAR,
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  spots_available INTEGER,
  skill_level VARCHAR CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'all')),
  disciplines JSONB, -- ['swim', 'bike', 'run', 'transition']
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gear Products
CREATE TABLE gear_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id VARCHAR,
  api_source VARCHAR NOT NULL, -- 'amazon', 'manual', 'manufacturer'
  name VARCHAR NOT NULL,
  brand VARCHAR,
  category VARCHAR NOT NULL CHECK (category IN ('wetsuit', 'bike', 'shoes', 'nutrition', 'accessories', 'apparel', 'electronics')),
  subcategory VARCHAR, -- 'tri_bike', 'road_bike', 'running_shoes', etc.
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  rating DECIMAL(3,2), -- 0.00 to 5.00
  review_count INTEGER,
  image_url VARCHAR,
  product_url VARCHAR,
  description TEXT,
  features JSONB,
  specifications JSONB,
  is_featured BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Tips/Articles
CREATE TABLE training_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id VARCHAR,
  rss_source VARCHAR, -- source RSS feed identifier
  title VARCHAR NOT NULL,
  content TEXT,
  excerpt TEXT,
  author VARCHAR,
  category VARCHAR NOT NULL CHECK (category IN ('technique', 'nutrition', 'training', 'gear', 'mental', 'recovery', 'race_prep')),
  disciplines JSONB, -- ['swim', 'bike', 'run', 'transition', 'general']
  skill_level VARCHAR CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'all')),
  reading_time_minutes INTEGER,
  article_url VARCHAR,
  image_url VARCHAR,
  published_at TIMESTAMP WITH TIME ZONE,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RSS Feed Sources
CREATE TABLE rss_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  url VARCHAR NOT NULL UNIQUE,
  category VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sync_frequency_hours INTEGER DEFAULT 24,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Planned/Saved Races
CREATE TABLE user_planned_races (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  external_race_id UUID REFERENCES external_races(id) ON DELETE CASCADE,
  status VARCHAR DEFAULT 'interested' CHECK (status IN ('interested', 'registered', 'training', 'completed', 'withdrawn')),
  registration_date DATE,
  goal_time INTERVAL,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5), -- 1=highest, 5=lowest
  notes TEXT,
  race_strategy TEXT,
  training_weeks_remaining INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, external_race_id)
);

-- User Location Preferences
CREATE TABLE user_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  city VARCHAR,
  state VARCHAR,
  country VARCHAR DEFAULT 'US',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  search_radius_miles INTEGER DEFAULT 50,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, is_primary) DEFERRABLE INITIALLY DEFERRED
);

-- API Integration Settings
CREATE TABLE api_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR NOT NULL UNIQUE,
  api_key VARCHAR,
  endpoint_url VARCHAR,
  rate_limit_per_hour INTEGER,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  error_count INTEGER DEFAULT 0,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_race_results_user_id ON race_results(user_id);
CREATE INDEX idx_race_results_race_id ON race_results(race_id);
CREATE INDEX idx_races_date ON races(date);
CREATE INDEX idx_courses_location ON courses(location);
CREATE INDEX idx_courses_distance_type ON courses(distance_type);
CREATE INDEX idx_nutrition_plans_user_id ON nutrition_plans(user_id);
CREATE INDEX idx_user_equipment_user_id ON user_equipment(user_id);
CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Discover tab indexes
CREATE INDEX idx_external_races_date ON external_races(date);
CREATE INDEX idx_external_races_location ON external_races(city, state);
CREATE INDEX idx_external_races_distance_type ON external_races(distance_type);
CREATE INDEX idx_external_races_api_source ON external_races(api_source);
CREATE INDEX idx_training_events_date ON training_events(date);
CREATE INDEX idx_training_events_location ON training_events(city, state);
CREATE INDEX idx_training_events_type ON training_events(event_type);
CREATE INDEX idx_gear_products_category ON gear_products(category);
CREATE INDEX idx_gear_products_rating ON gear_products(rating);
CREATE INDEX idx_gear_products_featured ON gear_products(is_featured);
CREATE INDEX idx_training_articles_category ON training_articles(category);
CREATE INDEX idx_training_articles_published ON training_articles(published_at);
CREATE INDEX idx_training_articles_featured ON training_articles(is_featured);
CREATE INDEX idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX idx_user_planned_races_user_id ON user_planned_races(user_id);
CREATE INDEX idx_user_planned_races_status ON user_planned_races(status);
CREATE INDEX idx_user_planned_races_external_race ON user_planned_races(external_race_id);
CREATE INDEX idx_nutrition_plans_planned_race ON nutrition_plans(planned_race_id);
CREATE INDEX idx_packing_lists_planned_race ON packing_lists(planned_race_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_races ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gear_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_planned_races ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_configurations ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at triggers for Discover tables
CREATE TRIGGER update_external_races_updated_at BEFORE UPDATE ON external_races 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_events_updated_at BEFORE UPDATE ON training_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gear_products_updated_at BEFORE UPDATE ON gear_products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_articles_updated_at BEFORE UPDATE ON training_articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_configurations_updated_at BEFORE UPDATE ON api_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at triggers for new tables
CREATE TRIGGER update_user_planned_races_updated_at BEFORE UPDATE ON user_planned_races 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nutrition_plans_updated_at BEFORE UPDATE ON nutrition_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packing_lists_updated_at BEFORE UPDATE ON packing_lists 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for Discover Tab Data (Public Read Access)

-- External races - publicly readable
CREATE POLICY "Public can view external races" ON external_races 
FOR SELECT USING (true);

-- Training events - publicly readable  
CREATE POLICY "Public can view training events" ON training_events 
FOR SELECT USING (true);

-- Gear products - publicly readable
CREATE POLICY "Public can view gear products" ON gear_products 
FOR SELECT USING (true);

-- Training articles - publicly readable
CREATE POLICY "Public can view training articles" ON training_articles 
FOR SELECT USING (true);

-- User locations - users can only see their own
CREATE POLICY "Users can view own locations" ON user_locations 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own locations" ON user_locations 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own locations" ON user_locations 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own locations" ON user_locations 
FOR DELETE USING (auth.uid() = user_id);

-- User planned races - users can only see their own
CREATE POLICY "Users can view own planned races" ON user_planned_races 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own planned races" ON user_planned_races 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own planned races" ON user_planned_races 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own planned races" ON user_planned_races 
FOR DELETE USING (auth.uid() = user_id);

-- Users - users can view and update their own profile
CREATE POLICY "Users can view own profile" ON users 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users 
FOR UPDATE USING (auth.uid() = id);

-- User goals - users can only see their own
CREATE POLICY "Users can view own goals" ON user_goals 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON user_goals 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON user_goals 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON user_goals 
FOR DELETE USING (auth.uid() = user_id);

-- User settings - users can only see their own
CREATE POLICY "Users can view own settings" ON user_settings 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings 
FOR UPDATE USING (auth.uid() = user_id);

-- User equipment - users can only see their own
CREATE POLICY "Users can view own equipment" ON user_equipment 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own equipment" ON user_equipment 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment" ON user_equipment 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment" ON user_equipment 
FOR DELETE USING (auth.uid() = user_id);

-- Race results - users can only see their own
CREATE POLICY "Users can view own race results" ON race_results 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own race results" ON race_results 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own race results" ON race_results 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own race results" ON race_results 
FOR DELETE USING (auth.uid() = user_id);

-- Course reviews - users can only see and manage their own
CREATE POLICY "Users can view own course reviews" ON course_reviews 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own course reviews" ON course_reviews 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own course reviews" ON course_reviews 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own course reviews" ON course_reviews 
FOR DELETE USING (auth.uid() = user_id);

-- Nutrition plans - users can only see their own
CREATE POLICY "Users can view own nutrition plans" ON nutrition_plans 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition plans" ON nutrition_plans 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition plans" ON nutrition_plans 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition plans" ON nutrition_plans 
FOR DELETE USING (auth.uid() = user_id);

-- Packing lists - users can only see their own
CREATE POLICY "Users can view own packing lists" ON packing_lists 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own packing lists" ON packing_lists 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own packing lists" ON packing_lists 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own packing lists" ON packing_lists 
FOR DELETE USING (auth.uid() = user_id);

-- RSS sources - publicly readable (admin manages)
CREATE POLICY "Public can view RSS sources" ON rss_sources 
FOR SELECT USING (true);

-- API configurations - admin only (no public access)
CREATE POLICY "Admin only API configurations" ON api_configurations 
FOR ALL USING (false);

-- Insert some sample RSS sources for training tips
INSERT INTO rss_sources (name, url, category) VALUES 
('TrainerRoad Blog', 'https://www.trainerroad.com/blog/feed/', 'training'),
('Triathlete Magazine', 'https://www.triathlete.com/feed/', 'general'),
('USA Triathlon', 'https://www.teamusa.org/usa-triathlon/news/rss', 'news'),
('220 Triathlon', 'https://www.220triathlon.com/feed', 'training'),
('Slowtwitch', 'https://www.slowtwitch.com/rss/news.xml', 'news');

-- Insert sample API configurations (without real keys)
INSERT INTO api_configurations (service_name, endpoint_url, rate_limit_per_hour, settings) VALUES 
('active_com', 'https://api.active.com/v2/', 1000, '{"version": "v2", "timeout": 30}'),
('runsignup', 'https://runsignup.com/Rest/', 500, '{"version": "1", "timeout": 30}'),
('amazon_paapi', 'https://webservices.amazon.com/paapi5/', 8640, '{"version": "5", "marketplace": "US"}'),
('meetup', 'https://api.meetup.com/', 200, '{"version": "3", "timeout": 30}');