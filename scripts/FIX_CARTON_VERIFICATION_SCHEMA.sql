-- Fix Carton Verification Schema Issue
-- The pack_id field is too small (16 chars) for carton IDs
-- Add carton_id field and make pack_id nullable for carton verifications

-- Add carton_id column to verification_events table
ALTER TABLE verification_events 
ADD COLUMN IF NOT EXISTS carton_id VARCHAR(50);

-- Make pack_id nullable since carton verifications don't have pack_id
ALTER TABLE verification_events 
ALTER COLUMN pack_id DROP NOT NULL;

-- Create index for carton_id lookups
CREATE INDEX IF NOT EXISTS ix_verification_events_carton ON verification_events(carton_id);

-- Add check constraint to ensure either pack_id or carton_id is provided
ALTER TABLE verification_events 
ADD CONSTRAINT check_pack_or_carton 
CHECK (pack_id IS NOT NULL OR carton_id IS NOT NULL);

-- Update the comment
COMMENT ON TABLE verification_events IS 'Verification events for both packs and cartons';
COMMENT ON COLUMN verification_events.pack_id IS 'Pack ID for individual pack verifications (nullable for carton verifications)';
COMMENT ON COLUMN verification_events.carton_id IS 'Carton ID for carton verifications (nullable for pack verifications)';