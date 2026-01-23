-- Add auth security columns to users table if they don't exist

-- Email verification fields
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='email_verification_token') THEN
        ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='email_verification_token_expires') THEN
        ALTER TABLE users ADD COLUMN email_verification_token_expires TIMESTAMP;
    END IF;
END $$;

-- Password reset fields
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='password_reset_token') THEN
        ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='password_reset_token_expires') THEN
        ALTER TABLE users ADD COLUMN password_reset_token_expires TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='password_changed_at') THEN
        ALTER TABLE users ADD COLUMN password_changed_at TIMESTAMP;
    END IF;
END $$;

-- Account lockout fields
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='failed_login_attempts') THEN
        ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0 NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='account_locked_until') THEN
        ALTER TABLE users ADD COLUMN account_locked_until TIMESTAMP;
    END IF;
END $$;

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    details JSONB,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Verify the changes
SELECT 
    'users' as table_name,
    column_name,
    data_type
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

SELECT 'audit_logs table exists: ' || EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'audit_logs'
) as status;
