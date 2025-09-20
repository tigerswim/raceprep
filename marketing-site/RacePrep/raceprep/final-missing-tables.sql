-- Only the truly missing tables for RacePrep Training Tab

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

-- Training Articles  
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