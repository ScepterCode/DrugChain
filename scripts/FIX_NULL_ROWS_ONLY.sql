-- Fix NULL rows that are causing constraint violations
-- Run this FIRST in Supabase SQL Editor

-- Step 1: Check how many problematic rows exist
SELECT 
    'Problematic rows count:' as info,
    COUNT(*) as rows_with_both_null
FROM verification_events 
WHERE pack_id IS NULL AND carton_id IS NULL;

-- Step 2: Show sample of problematic rows
SELECT 
    'Sample problematic rows:' as info,
    event_id,
    pack_id,
    carton_id,
    verified_by_phone,
    verification_result,
    created_at
FROM verification_events 
WHERE pack_id IS NULL AND carton_id IS NULL
ORDER BY created_at DESC
LIMIT 5;

-- Step 3: Fix the problematic rows
-- Set pack_id to a unique identifier for rows that have both NULL
UPDATE verification_events 
SET pack_id = 'LEGACY-' || SUBSTRING(event_id::text, 1, 8)
WHERE pack_id IS NULL AND carton_id IS NULL;

-- Step 4: Verify the fix
SELECT 
    'After fix (should be 0):' as info,
    COUNT(*) as remaining_problematic_rows
FROM verification_events 
WHERE pack_id IS NULL AND carton_id IS NULL;

-- Step 5: Show final data distribution
SELECT 
    'Final data distribution:' as info,
    COUNT(*) as total_rows,
    COUNT(pack_id) as rows_with_pack_id,
    COUNT(carton_id) as rows_with_carton_id,
    SUM(CASE WHEN pack_id IS NOT NULL AND carton_id IS NULL THEN 1 ELSE 0 END) as pack_only,
    SUM(CASE WHEN pack_id IS NULL AND carton_id IS NOT NULL THEN 1 ELSE 0 END) as carton_only,
    SUM(CASE WHEN pack_id IS NOT NULL AND carton_id IS NOT NULL THEN 1 ELSE 0 END) as both_present,
    SUM(CASE WHEN pack_id IS NULL AND carton_id IS NULL THEN 1 ELSE 0 END) as both_null
FROM verification_events;

-- Now you can safely run the constraint addition from FINAL_CARTON_MIGRATION.sql