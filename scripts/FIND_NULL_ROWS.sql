-- Find rows that violate the check constraint
-- Run this in Supabase SQL Editor to identify problematic data

-- Step 1: Find rows with both pack_id AND carton_id as NULL
SELECT 
    'Problematic rows (both NULL):' as info,
    event_id,
    pack_id,
    carton_id,
    verified_by_phone,
    verification_result,
    created_at
FROM verification_events 
WHERE pack_id IS NULL AND carton_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: Count total problematic rows
SELECT 
    'Total problematic rows:' as info,
    COUNT(*) as count_both_null
FROM verification_events 
WHERE pack_id IS NULL AND carton_id IS NULL;

-- Step 3: Show data distribution
SELECT 
    'Data distribution:' as info,
    COUNT(*) as total_rows,
    COUNT(pack_id) as rows_with_pack_id,
    COUNT(carton_id) as rows_with_carton_id,
    SUM(CASE WHEN pack_id IS NOT NULL AND carton_id IS NULL THEN 1 ELSE 0 END) as pack_only,
    SUM(CASE WHEN pack_id IS NULL AND carton_id IS NOT NULL THEN 1 ELSE 0 END) as carton_only,
    SUM(CASE WHEN pack_id IS NOT NULL AND carton_id IS NOT NULL THEN 1 ELSE 0 END) as both_present,
    SUM(CASE WHEN pack_id IS NULL AND carton_id IS NULL THEN 1 ELSE 0 END) as both_null
FROM verification_events;