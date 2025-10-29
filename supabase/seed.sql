-- RacePrep Sample Seed Data
-- This file contains sample data for development and testing

-- Sample courses (Sprint and Olympic distance)
INSERT INTO courses (id, name, location, distance_type, swim_type, bike_elevation_gain, run_elevation_gain, overall_elevation, difficulty_score, wetsuit_legal, description, features) VALUES
  (uuid_generate_v4(), 'Atlanta International Triathlon', 'Atlanta, GA', 'olympic', 'lake', 850, 320, 1050, 6, true, 'A challenging Olympic distance race through downtown Atlanta with rolling hills on the bike course.', '["urban", "hilly", "scenic"]'),
  (uuid_generate_v4(), 'Peachtree City Sprint', 'Peachtree City, GA', 'sprint', 'lake', 285, 125, 820, 4, true, 'Perfect beginner-friendly sprint triathlon in beautiful Peachtree City.', '["beginner-friendly", "flat", "lake"]'),
  (uuid_generate_v4(), 'Callaway Gardens Triathlon', 'Pine Mountain, GA', 'olympic', 'lake', 1200, 450, 950, 7, true, 'Scenic and challenging Olympic distance race at Callaway Gardens resort.', '["scenic", "challenging", "resort"]'),
  (uuid_generate_v4(), 'Lake Lanier Sprint', 'Gainesville, GA', 'sprint', 'lake', 320, 180, 1180, 5, true, 'Popular sprint triathlon at beautiful Lake Lanier.', '["popular", "scenic", "moderate"]'),
  (uuid_generate_v4(), 'Stone Mountain Sprint', 'Stone Mountain, GA', 'sprint', 'lake', 420, 240, 825, 6, true, 'Challenging sprint with views of Stone Mountain.', '["challenging", "scenic", "historic"]');

-- Sample races for the current year
INSERT INTO races (id, name, date, location, distance_type, course_id) VALUES
  (uuid_generate_v4(), 'Atlanta International Triathlon 2024', '2024-09-15', 'Atlanta, GA', 'olympic', (SELECT id FROM courses WHERE name = 'Atlanta International Triathlon')),
  (uuid_generate_v4(), 'Peachtree City Sprint 2024', '2024-07-20', 'Peachtree City, GA', 'sprint', (SELECT id FROM courses WHERE name = 'Peachtree City Sprint')),
  (uuid_generate_v4(), 'Callaway Gardens Triathlon 2024', '2024-08-10', 'Pine Mountain, GA', 'olympic', (SELECT id FROM courses WHERE name = 'Callaway Gardens Triathlon')),
  (uuid_generate_v4(), 'Lake Lanier Sprint 2024', '2024-06-15', 'Gainesville, GA', 'sprint', (SELECT id FROM courses WHERE name = 'Lake Lanier Sprint')),
  (uuid_generate_v4(), 'Stone Mountain Sprint 2024', '2024-05-25', 'Stone Mountain, GA', 'sprint', (SELECT id FROM courses WHERE name = 'Stone Mountain Sprint'));

-- Sample weather data
INSERT INTO race_weather (race_id, date, temperature_f, humidity, wind_speed, conditions, water_temperature_f) VALUES
  ((SELECT id FROM races WHERE name = 'Peachtree City Sprint 2024'), '2024-07-20', 78, 65.5, 8, 'Partly Cloudy', 74),
  ((SELECT id FROM races WHERE name = 'Lake Lanier Sprint 2024'), '2024-06-15', 72, 58.2, 12, 'Clear', 68),
  ((SELECT id FROM races WHERE name = 'Stone Mountain Sprint 2024'), '2024-05-25', 75, 62.1, 6, 'Overcast', 70);

-- Sample course reviews (these would normally be created by users)
-- Note: These will need actual user IDs when users sign up
-- For now, we'll create them with placeholder UUIDs that can be updated later