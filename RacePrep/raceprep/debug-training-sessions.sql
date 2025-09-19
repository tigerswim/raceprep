-- Debug training_sessions table structure
-- Run this in Supabase SQL Editor to understand the table structure

-- Check all columns and constraints
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'training_sessions' 
ORDER BY ordinal_position;

-- Check all constraints on the table
SELECT 
    constraint_name, 
    constraint_type, 
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'training_sessions';

-- Test a simple insert to see what works
INSERT INTO training_sessions (
    user_id, 
    type, 
    date, 
    distance, 
    moving_time, 
    name,
    strava_activity_id
) VALUES (
    '1d23cc16-c3e2-4cb9-9501-0973abdfa2ea',
    'run',
    '2024-01-15',
    5000,
    1800,
    'Test Run',
    '123456789'
) ON CONFLICT (strava_activity_id) 
DO UPDATE SET 
    distance = EXCLUDED.distance,
    moving_time = EXCLUDED.moving_time
RETURNING *;