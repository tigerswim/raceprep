-- Check the exact schema of training_sessions table
-- Run this in Supabase SQL Editor to see what columns actually exist

-- Get all columns and their details
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'training_sessions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check table constraints
SELECT 
    tc.constraint_name, 
    tc.constraint_type, 
    ccu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'training_sessions'
AND tc.table_schema = 'public';