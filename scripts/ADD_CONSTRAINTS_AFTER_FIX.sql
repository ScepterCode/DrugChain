-- Add constraints after fixing the NULL rows
-- Run this AFTER running FIX_20_NULL_ROWS.sql

-- Step 1: Verify no problematic rows remain
SELECT 
    'Pre-constraint check (should be 0):' as info,
    COUNT(*) as both_null_count
FROM verification_events 
WHERE pack_id IS NULL AND carton_id IS NULL;

-- Step 2: Remove foreign key constraint if it exists
ALTER TABLE verification_events 
DROP CONSTRAINT IF EXISTS verification_events_pack_id_fkey;

-- Step 3: Make pack_id nullable (safe now)
ALTER TABLE verification_events 
ALTER COLUMN pack_id DROP NOT NULL;

-- Step 4: Add the check constraint (should work now)
ALTER TABLE verification_events 
ADD CONSTRAINT check_pack_or_carton 
CHECK (pack_id IS NOT NULL OR carton_id IS NOT NULL);

-- Step 5: Test carton verification insertion
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

-- Step 6: Verify test insertion worked
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

-- Step 7: Final data integrity check
SELECT 
    'Final integrity check:' as info,
    COUNT(*) as total_rows,
    COUNT(pack_id) as rows_with_pack_id,
    COUNT(carton_id) as rows_with_carton_id,
    SUM(CASE WHEN pack_id IS NULL AND carton_id IS NULL THEN 1 ELSE 0 END) as both_null_should_be_zero
FROM verification_events;

-- Step 8: Verify constraint was added
SELECT 
    'Constraint verification:' as info,
    conname, 
    contype
FROM pg_constraint 
WHERE conrelid = 'verification_events'::regclass 
AND conname = 'check_pack_or_carton';

-- Migration complete! Carton verification should now work.