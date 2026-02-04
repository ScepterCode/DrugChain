-- FINAL Carton Migration - Handles foreign key constraint issues
-- Run this in Supabase SQL Editor step by step

-- Step 1: Add carton_id column
ALTER TABLE verification_events 
ADD COLUMN IF NOT EXISTS carton_id VARCHAR(50);

-- Step 2: Create index for carton_id
CREATE INDEX IF NOT EXISTS ix_verification_events_carton ON verification_events(carton_id);

-- Step 3: Remove the foreign key constraint that's causing issues
ALTER TABLE verification_events 
DROP CONSTRAINT IF EXISTS verification_events_pack_id_fkey;

-- Step 4: Make pack_id nullable (now safe without FK constraint)
ALTER TABLE verification_events 
ALTER COLUMN pack_id DROP NOT NULL;

-- Step 5: Add check constraint to ensure either pack_id OR carton_id exists
ALTER TABLE verification_events 
ADD CONSTRAINT check_pack_or_carton 
CHECK (pack_id IS NOT NULL OR carton_id IS NOT NULL);

-- Step 6: Verify the changes
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'verification_events' 
AND column_name IN ('pack_id', 'carton_id')
ORDER BY column_name;

-- Step 7: Test carton verification insertion
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

-- Step 8: Verify test worked
SELECT 'Test carton verification:' as info, event_id, pack_id, carton_id, verification_result
FROM verification_events 
WHERE carton_id = 'CT-20260121-829O4Q-0001'
ORDER BY created_at DESC
LIMIT 1;

-- Step 9: Check final data state
SELECT 
    COUNT(*) as total_rows,
    COUNT(pack_id) as rows_with_pack_id,
    COUNT(carton_id) as rows_with_carton_id,
    SUM(CASE WHEN pack_id IS NULL AND carton_id IS NULL THEN 1 ELSE 0 END) as invalid_rows
FROM verification_events;

-- Migration complete! Carton verification should now work.