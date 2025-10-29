-- Fix RLS policy for external_races table
-- The table needs an INSERT policy since users need to create race entries when saving discovered races

-- Add INSERT policy for external_races (publicly writable for race discovery)
DO $$
BEGIN
    -- Check if INSERT policy already exists
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can insert external races' AND tablename = 'external_races') THEN
        CREATE POLICY "Public can insert external races" ON external_races FOR INSERT WITH CHECK (true);
        RAISE NOTICE 'Created INSERT policy for external_races';
    ELSE
        RAISE NOTICE 'INSERT policy for external_races already exists';
    END IF;
END $$;

-- Verify current policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'external_races'
ORDER BY policyname;