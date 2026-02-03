# Supabase Migration Instructions

The database migration needs to be run directly in the Supabase SQL Editor due to statement timeout limits on the connection pooler.

## Step 1: Access Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

## Step 2: Run This SQL

Copy and paste the following SQL into the editor and click "Run":

```sql
-- Add email verification columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token_expires TIMESTAMP;

-- Add password reset columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;

-- Add account lockout columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;

-- Create audit_logs table (already exists, but included for completeness)
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Verify the migration
SELECT 
    column_name,
    data_type,
    is_nullable
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
```

## Step 3: Verify Results

After running the SQL, you should see a result table showing all 7 new columns:

- account_locked_until
- email_verification_token
- email_verification_token_expires
- failed_login_attempts
- password_changed_at
- password_reset_token
- password_reset_token_expires

## Step 4: Test Registration

Once the migration is complete, test the registration endpoint:

```powershell
.\scripts\test-registration-with-auth.ps1
```

Or manually:

```bash
curl -X POST https://drugchain-1.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "full_name": "Test User",
    "role": "MANUFACTURER",
    "organization_name": "Test Org",
    "organization_type": "MANUFACTURER"
  }'
```

## Troubleshooting

### If columns already exist
The `IF NOT EXISTS` clause will skip adding them. This is safe.

### If you get permission errors
Make sure you're logged in as the database owner or have ALTER TABLE permissions.

### If the query times out
Try running the ALTER TABLE statements one at a time instead of all at once.

## What's Already Done

✅ audit_logs table created
✅ audit_logs indexes created

## What Needs to Be Done

❌ Add 7 columns to users table (blocked by timeout on pooler connection)

## Alternative: Use Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push --db-url "postgresql://postgres.aykzdgvdzmjhwsbjazon:vh1RGEOTKO0d5cKN@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"
```

But the SQL Editor approach is simpler and more reliable.
