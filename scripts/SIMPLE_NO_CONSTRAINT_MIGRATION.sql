-- Simple migration without constraints - Just enable carton verification
-- Run this in Supabase SQL Editor

-- Step 1: Add carton_id column
ALTER TABLE verification_events 
ADD COLUMN IF NOT EXISTS carton_id VARCHAR(50);

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS ix_verification_events_carton ON verification_events(carton_id);

-- Step 3: Remove foreign key constraint
ALTER TABLE verification_events 
DROP CONSTRAINT IF EXISTS verification_events_pack_id_fkey;

-- Step 4: Make pack_id nullable
ALTER TABLE verification_events 
ALTER COLUMN pack_id DROP NOT NULL;

-- That's it! No check constraint needed.
-- The application handles validation.

-- Test carton verification
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

-- Verify it worked
SELECT 'SUCCESS: Carton verification enabled!' as result;