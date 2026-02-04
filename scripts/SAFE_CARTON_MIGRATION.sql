-- SAFE Carton Migration for verification_events table
-- Run this in Supabase SQL Editor step by step

-- Step 1: Check current pack_id lengths (diagnostic)
SELECT 
    'Pack ID Length Analysis' as analysis_type,
    MAX(LENGTH(pack_id)) as max_pack_id_length,
    MIN(LENGTH(pack_id)) as min_pack_id_length,
    AVG(LENGTH(pack_id))::numeric(5,2) as avg_pack_id_length,
    COUNT(*) as total_records
FROM verification_events 
WHERE pack_id IS NOT NULL;

-- Step 2: Add carton_id column (safe operation)
ALTER TABLE verification_events 
ADD COLUMN IF NOT EXISTS carton_id VARCHAR(50);

-- Step 3: Create index for carton_id lookups (safe operation)
CREATE INDEX IF NOT EXISTS ix_verification_events_carton ON verification_events(carton_id);

-- Step 4: Check for NULL pack_id values that need handling
SELECT 
    'NULL pack_id analysis' as info,
    COUNT(*) as total_rows,
    COUNT(pack_id) as rows_with_pack_id,
    COUNT(*) - COUNT(pack_id) as rows_with_null_pack_id
FROM verification_events;

-- Step 5: CRITICAL - Remove foreign key constraint temporarily
-- This allows us to make pack_id nullable without constraint violations
ALTER TABLE verification_events 
DROP CONSTRAINT IF EXISTS verification_events_pack_id_fkey;

-- Step 6: Now safely make pack_id nullable
ALTER TABLE verification_events 
ALTER COLUMN pack_id DROP NOT NULL;

-- Step 7: Add the check constraint (ensures either pack_id OR carton_id is present)
ALTER TABLE verification_events 
ADD CONSTRAINT check_pack_or_carton 
CHECK (pack_id IS NOT NULL OR carton_id IS NOT NULL);

-- Step 8: Re-add the foreign key constraint (but make it deferrable)
-- This allows NULL values but validates non-NULL values against packs table
ALTER TABLE verification_events 
ADD CONSTRAINT verification_events_pack_id_fkey 
FOREIGN KEY (pack_id) REFERENCES packs(pack_id) 
DEFERRABLE INITIALLY DEFERRED;

-- Step 9: Add helpful comments
COMMENT ON COLUMN verification_events.pack_id IS 'Pack ID for individual pack verifications (nullable for carton-only verifications)';
COMMENT ON COLUMN verification_events.carton_id IS 'Carton ID for carton verifications (nullable for pack-only verifications)';

-- Step 10: Verify the migration worked
SELECT 
    'Final column definitions:' as info,
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'verification_events' 
AND column_name IN ('pack_id', 'carton_id')
ORDER BY column_name;

-- Step 11: Verify constraints exist
SELECT 
    'Constraints verification:' as info,
    conname, 
    contype, 
    consrc 
FROM pg_constraint 
WHERE conrelid = 'verification_events'::regclass 
AND conname IN ('check_pack_or_carton', 'verification_events_pack_id_fkey');

-- Step 12: Test data integrity
SELECT 
    'Data integrity check:' as info,
    COUNT(*) as total_rows,
    COUNT(pack_id) as rows_with_pack_id,
    COUNT(carton_id) as rows_with_carton_id,
    SUM(CASE WHEN pack_id IS NOT NULL AND carton_id IS NOT NULL THEN 1 ELSE 0 END) as rows_with_both,
    SUM(CASE WHEN pack_id IS NULL AND carton_id IS NULL THEN 1 ELSE 0 END) as rows_with_neither
FROM verification_events;

-- Step 13: Test carton insertion (should work now)
-- This is just a test - you can remove this row after testing
INSERT INTO verification_events (event_id, carton_id, verified_by_phone, verification_result, created_at)
VALUES (gen_random_uuid(), 'TEST-CARTON-001', '+1234567890', 'GENUINE', NOW());

-- Step 14: Verify test insertion worked
SELECT 'Test carton verification:' as info, event_id, pack_id, carton_id, verification_result
FROM verification_events 
WHERE carton_id = 'TEST-CARTON-001';

-- Step 15: Clean up test data
DELETE FROM verification_events WHERE carton_id = 'TEST-CARTON-001';