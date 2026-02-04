-- Apply carton_id migration to verification_events table
-- Run this in Supabase SQL Editor

-- Step 1: Add carton_id column
ALTER TABLE verification_events 
ADD COLUMN IF NOT EXISTS carton_id VARCHAR(50);

-- Step 2: Make pack_id nullable (remove NOT NULL constraint)
ALTER TABLE verification_events 
ALTER COLUMN pack_id DROP NOT NULL;

-- Step 3: Create index for carton_id lookups
CREATE INDEX IF NOT EXISTS ix_verification_events_carton ON verification_events(carton_id);

-- Step 4: Check for problematic rows before adding constraint
SELECT COUNT(*) as problematic_rows 
FROM verification_events 
WHERE pack_id IS NULL AND carton_id IS NULL;

-- Step 5: Fix any problematic rows (if any exist)
-- Option A: Delete rows with both NULL (if they're invalid data)
-- DELETE FROM verification_events WHERE pack_id IS NULL AND carton_id IS NULL;

-- Option B: Set a default pack_id for existing NULL rows (safer approach)
UPDATE verification_events 
SET pack_id = 'UNKNOWN' 
WHERE pack_id IS NULL AND carton_id IS NULL;

-- Step 6: Now add the check constraint
ALTER TABLE verification_events 
ADD CONSTRAINT check_pack_or_carton 
CHECK (pack_id IS NOT NULL OR carton_id IS NOT NULL);

-- Step 7: Update table comments
COMMENT ON COLUMN verification_events.pack_id IS 'Pack ID for individual pack verifications (nullable for carton verifications)';
COMMENT ON COLUMN verification_events.carton_id IS 'Carton ID for carton verifications (nullable for pack verifications)';

-- Step 8: Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'verification_events' 
AND column_name IN ('pack_id', 'carton_id')
ORDER BY column_name;

-- Step 9: Check constraint exists
SELECT conname, contype, consrc 
FROM pg_constraint 
WHERE conrelid = 'verification_events'::regclass 
AND conname = 'check_pack_or_carton';