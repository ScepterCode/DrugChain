-- COMPLETE Carton Migration - Handles all constraint issues
-- Run this in Supabase SQL Editor step by step

-- Step 1: Add carton_id column if it doesn't exist
ALTER TABLE verification_events 
ADD COLUMN IF NOT EXISTS carton_id VARCHAR(50);

-- Step 2: Create index for carton_id
CREATE INDEX IF NOT EXISTS ix_verification_events_carton ON verification_events(carton_id);

-- Step 3: Find and analyze problematic rows
SELECT 
    'Analysis of NULL rows:' as info,
    COUNT(*) as total_rows,
    SUM(CASE WHEN pack_id IS NULL AND carton_id IS NULL THEN 1 ELSE 0 END) as both_null_count,
    SUM(CASE WHEN pack_id IS NOT NULL THEN 1 ELSE 0 END) as has_pack_id_count
FROM verification_events;

-- Step 4: Show sample of problematic rows
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

-- Step 5: Fix problematic rows by setting a default pack_id
-- This ensures no row has both pack_id AND carton_id as NULL
UPDATE verification_events 
SET pack_id = 'UNKNOWN-' || SUBSTRING(event_id::text, 1, 8)
WHERE pack_id IS NULL AND carton_id IS NULL;

-- Step 6: Verify the fix worked
SELECT 
    'After fix - should be 0:' as info,
    COUNT(*) as remaining_problematic_rows
FROM verification_events 
WHERE pack_id IS NULL AND carton_id IS NULL;

-- Step 7: Remove foreign key constraint if it exists
ALTER TABLE verification_events 
DROP CONSTRAINT IF EXISTS verification_events_pack_id_fkey;

-- Step 8: Make pack_id nullable (now safe)
ALTER TABLE verification_events 
ALTER COLUMN pack_id DROP NOT NULL;

-- Step 9: Add check constraint (should work now)
ALTER TABLE verification_events 
ADD CONSTRAINT check_pack_or_carton 
CHECK (pack_id IS NOT NULL OR carton_id IS NOT NULL);

-- Step 10: Test carton verification insertion
INSERT INTO verification_events (
    event_id, 
    carton_id, 
    verified_by_phone, 
    verification_result, 
    created_at
) VALUES (
    gen_random_uuid(), 
    'CT-20260121-829O4Q-0001', 
    '+1234567890', 
    'GENUINE', 
    NOW()
);

-- Step 11: Verify test insertion worked
SELECT 
    'Test carton verification:' as info,
    event_id, 
    pack_id, 
    carton_id, 
    verification_result,
    created_at
FROM verification_events 
WHERE carton_id = 'CT-20260121-829O4Q-0001'
ORDER BY created_at DESC
LIMIT 1;

-- Step 12: Final verification of data integrity
SELECT 
    'Final data integrity check:' as info,
    COUNT(*) as total_rows,
    COUNT(pack_id) as rows_with_pack_id,
    COUNT(carton_id) as rows_with_carton_id,
    SUM(CASE WHEN pack_id IS NOT NULL AND carton_id IS NULL THEN 1 ELSE 0 END) as pack_only,
    SUM(CASE WHEN pack_id IS NULL AND carton_id IS NOT NULL THEN 1 ELSE 0 END) as carton_only,
    SUM(CASE WHEN pack_id IS NOT NULL AND carton_id IS NOT NULL THEN 1 ELSE 0 END) as both_present,
    SUM(CASE WHEN pack_id IS NULL AND carton_id IS NULL THEN 1 ELSE 0 END) as both_null_should_be_zero
FROM verification_events;

-- Step 13: Verify constraints exist
SELECT 
    'Constraints check:' as info,
    conname, 
    contype
FROM pg_constraint 
WHERE conrelid = 'verification_events'::regclass 
AND conname = 'check_pack_or_carton';

-- Migration complete! Both pack and carton verifications should now work.