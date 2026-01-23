-- ============================================
-- AUTH SECURITY MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Add email verification columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token_expires TIMESTAMP;

-- Step 2: Add password reset columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;

-- Step 3: Add account lockout columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;

-- Step 4: Verify columns were added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN (
    'email_verification_token',
    'email_verification_token_expires',
    'password_reset_token',
    'password_reset_token_expires',
    'password_changed_at',
    'failed_login_attempts',
    'account_locked_until'
)
ORDER BY column_name;

-- You should see 7 rows returned if successful
