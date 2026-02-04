-- Simple migration: Just add carton_id column and make pack_id nullable
-- Run this in Supabase SQL Editor first

-- Step 1: Add carton_id column
ALTER TABLE verification_events 
ADD COLUMN IF NOT EXISTS carton_id VARCHAR(50);

-- Step 2: Make pack_id nullable
ALTER TABLE verification_events 
ALTER COLUMN pack_id DROP NOT NULL;

-- Step 3: Create index for carton_id lookups
CREATE INDEX IF NOT EXISTS ix_verification_events_carton ON verification_events(carton_id);

-- Step 4: Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'verification_events' 
AND column_name IN ('pack_id', 'carton_id')
ORDER BY column_name;

-- Step 5: Check existing data
SELECT 
    COUNT(*) as total_rows,
    COUNT(pack_id) as rows_with_pack_id,
    COUNT(carton_id) as rows_with_carton_id,
    COUNT(*) - COUNT(pack_id) - COUNT(carton_id) as rows_with_neither
FROM verification_events;