-- Fix the 20 rows that have both pack_id AND carton_id as NULL
-- Run this in Supabase SQL Editor

-- Step 1: Show the 20 problematic rows before fixing
SELECT 
    'The 20 problematic rows:' as info,
    event_id,
    pack_id,
    carton_id,
    verified_by_phone,
    verification_result,
    created_at
FROM verification_events 
WHERE pack_id IS NULL AND carton_id IS NULL
ORDER BY created_at DESC;

-- Step 2: Fix these 20 rows by giving them a pack_id
-- Using a shorter, cleaner format: UNKNOWN-{first 8 chars of event_id}
UPDATE verification_events 
SET pack_id = 'UNKNOWN-' || SUBSTRING(event_id::text, 1, 8)
WHERE pack_id IS NULL AND carton_id IS NULL;

-- Step 3: Verify the fix worked (should return 0)
SELECT 
    'Remaining problematic rows (should be 0):' as info,
    COUNT(*) as both_null_count
FROM verification_events 
WHERE pack_id IS NULL AND carton_id IS NULL;

-- Step 4: Show updated data distribution
SELECT 
    'Updated data distribution:' as info,
    COUNT(*) as total_rows,
    COUNT(pack_id) as rows_with_pack_id,
    COUNT(carton_id) as rows_with_carton_id,
    SUM(CASE WHEN pack_id IS NOT NULL AND carton_id IS NULL THEN 1 ELSE 0 END) as pack_only,
    SUM(CASE WHEN pack_id IS NULL AND carton_id IS NOT NULL THEN 1 ELSE 0 END) as carton_only,
    SUM(CASE WHEN pack_id IS NOT NULL AND carton_id IS NOT NULL THEN 1 ELSE 0 END) as both_present,
    SUM(CASE WHEN pack_id IS NULL AND carton_id IS NULL THEN 1 ELSE 0 END) as both_null_should_be_zero
FROM verification_events;

-- Step 5: Show sample of the fixed rows
SELECT 
    'Sample of fixed rows:' as info,
    event_id,
    pack_id,
    carton_id,
    verification_result,
    created_at
FROM verification_events 
WHERE pack_id LIKE 'UNKNOWN-%'
ORDER BY created_at DESC
LIMIT 5;

-- Now you can safely run the constraint addition!