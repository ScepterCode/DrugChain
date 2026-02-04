-- Diagnose pack_id length issue in verification_events table
-- Run this in Supabase SQL Editor to understand the problem

-- Step 1: Check current column definition
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'verification_events' 
AND column_name = 'pack_id';

-- Step 2: Find pack_id values that are too long
SELECT 
    pack_id,
    LENGTH(pack_id) as pack_id_length,
    event_id,
    created_at
FROM verification_events 
WHERE LENGTH(pack_id) > 16
ORDER BY LENGTH(pack_id) DESC
LIMIT 10;

-- Step 3: Check all pack_id lengths
SELECT 
    LENGTH(pack_id) as pack_id_length,
    COUNT(*) as count_of_records
FROM verification_events 
WHERE pack_id IS NOT NULL
GROUP BY LENGTH(pack_id)
ORDER BY pack_id_length DESC;

-- Step 4: Check if there are any NULL pack_id values
SELECT 
    COUNT(*) as total_rows,
    COUNT(pack_id) as rows_with_pack_id,
    COUNT(*) - COUNT(pack_id) as rows_with_null_pack_id
FROM verification_events;

-- Step 5: Sample of all pack_id values to understand the pattern
SELECT 
    pack_id,
    LENGTH(pack_id) as length,
    created_at
FROM verification_events 
WHERE pack_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;