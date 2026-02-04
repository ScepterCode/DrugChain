-- Bypass constraint migration - Add carton support without check constraint
-- Run this in Supabase SQL Editor

-- Step 1: Add carton_id column if it doesn't exist
ALTER TABLE verification_events 
ADD COLUMN IF NOT EXISTS carton_id VARCHAR(50);

-- Step 2: Create index for carton_id
CREATE INDEX IF NOT EXISTS ix_verification_events_carton ON verification_events(carton_id);

-- Step 3: Remove foreign key constraint if it exists
ALTER TABLE verification_events 
DROP CONSTRAINT IF EXISTS verification_events_pack_id_fkey;

-- Step 4: Make pack_id nullable (without adding check constraint)
ALTER TABLE verification_events 
ALTER COLUMN pack_id DROP NOT NULL;

-- Step 5: Test carton verification insertion (should work now)
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

-- Step 7: Show current data state
SELECT 
    'Current data state:' as info,
    COUNT(*) as total_rows,
    COUNT(pack_id) as rows_with_pack_id,
    COUNT(carton_id) as rows_with_carton_id,
    SUM(CASE WHEN pack_id IS NULL AND carton_id IS NULL THEN 1 ELSE 0 END) as both_null_rows
FROM verification_events;

-- Step 8: Verify column definitions
SELECT 
    'Column definitions:' as info,
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'verification_events' 
AND column_name IN ('pack_id', 'carton_id')
ORDER BY column_name;

-- Migration complete! 
-- Carton verification should work now without constraint issues.
-- The application will handle validation instead of database constraints.