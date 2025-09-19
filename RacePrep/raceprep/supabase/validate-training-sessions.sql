-- Validation script for training_sessions table
-- Run this in Supabase SQL Editor to verify the training sessions schema

-- 1. Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'training_sessions'
) AS table_exists;

-- 2. Check table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'training_sessions'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check constraints
SELECT
    tc.constraint_name,
    tc.constraint_type,
    ccu.column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
LEFT JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'training_sessions'
    AND tc.table_schema = 'public';

-- 4. Check indexes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'training_sessions'
    AND schemaname = 'public';

-- 5. Check RLS status
SELECT
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'training_sessions'
    AND schemaname = 'public';

-- 6. Check RLS policies
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'training_sessions'
    AND schemaname = 'public';

-- 7. Check triggers
SELECT
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'training_sessions'
    AND event_object_schema = 'public';

-- 8. Test insert/upsert functionality (replace with actual user ID)
-- INSERT INTO training_sessions (
--     user_id,
--     type,
--     date,
--     distance,
--     moving_time,
--     name,
--     strava_activity_id
-- ) VALUES (
--     'YOUR_USER_ID_HERE',  -- Replace with actual user ID
--     'run',
--     CURRENT_DATE,
--     5000,
--     1800,
--     'Test Validation Run',
--     'test_123'
-- ) ON CONFLICT (strava_activity_id)
-- DO UPDATE SET
--     distance = EXCLUDED.distance,
--     moving_time = EXCLUDED.moving_time,
--     updated_at = NOW()
-- RETURNING *;

-- 9. Count training sessions by type (if data exists)
SELECT
    type,
    COUNT(*) as session_count,
    AVG(distance) as avg_distance,
    AVG(moving_time) as avg_time
FROM training_sessions
GROUP BY type
ORDER BY type;

-- 10. Check recent training sessions (if data exists)
SELECT
    id,
    type,
    date,
    name,
    distance,
    moving_time,
    created_at
FROM training_sessions
ORDER BY created_at DESC
LIMIT 5;

-- Success message
SELECT 'Training sessions validation completed!' AS status;