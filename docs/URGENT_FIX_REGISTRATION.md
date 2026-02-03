# 🔴 URGENT: Fix Registration Error

## The Problem

Registration is failing with:
```
column users.email_verification_token does not exist
```

This is because the backend code was deployed but the database columns haven't been added yet.

## The Solution (2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to **https://supabase.com/dashboard**
2. Click on your **PackGuard/DrugChain project**
3. In the left sidebar, click **"SQL Editor"**
4. Click **"New Query"** button (top right)

### Step 2: Copy and Paste This SQL

Open the file `RUN_THIS_SQL_IN_SUPABASE.sql` in this repository, or copy this:

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

-- Verify columns were added
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
```

### Step 3: Run the Query

1. Paste the SQL into the editor
2. Click **"Run"** button (or press Ctrl+Enter)
3. Wait 2-3 seconds

### Step 4: Verify Success

You should see a table with **7 rows** showing the new columns:

| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| account_locked_until | timestamp | YES | NULL |
| email_verification_token | character varying | YES | NULL |
| email_verification_token_expires | timestamp | YES | NULL |
| failed_login_attempts | integer | YES | 0 |
| password_changed_at | timestamp | YES | NULL |
| password_reset_token | character varying | YES | NULL |
| password_reset_token_expires | timestamp | YES | NULL |

### Step 5: Test Registration

Try registering again at:
- **Production**: https://pack-guard.vercel.app/register
- **Or run test script**: `.\scripts\test-registration-with-auth.ps1`

## Why This Happened

1. ✅ Backend code was deployed to Render (with new auth features)
2. ❌ Database migration wasn't run yet (columns don't exist)
3. 💥 Backend tries to use columns that don't exist → Error

## After Running the SQL

- ✅ Registration will work immediately
- ✅ Email verification tokens will be generated
- ✅ Password reset will work
- ✅ Account lockout after 5 failed logins will work
- ✅ All auth security features will be active

## Troubleshooting

### "Permission denied" error
- Make sure you're logged into the correct Supabase project
- You need to be the project owner or have database admin rights

### "Relation 'users' does not exist"
- Check you're connected to the correct database
- The table might be in a different schema

### Columns already exist
- The `IF NOT EXISTS` clause will skip them safely
- This is fine, just verify the 7 columns show up in the results

### Still getting errors after running SQL
1. Refresh your browser
2. Try registering again
3. Check Render logs for any other errors
4. Run the verification query again to confirm columns exist

## Alternative: Use psql Command Line

If you prefer command line:

```bash
# Set password
$env:PGPASSWORD = "vh1RGEOTKO0d5cKN"

# Connect and run
psql -h aws-1-eu-west-1.pooler.supabase.com -p 5432 -U postgres.aykzdgvdzmjhwsbjazon -d postgres -f RUN_THIS_SQL_IN_SUPABASE.sql
```

## Need Help?

If you're still having issues after running the SQL:
1. Take a screenshot of the Supabase SQL Editor results
2. Check the Render backend logs for errors
3. Try the test script to see detailed error messages

## Timeline

- **Before**: Registration fails with "column does not exist"
- **Run SQL**: 2 minutes
- **After**: Registration works with all security features

---

**Status**: 🔴 BLOCKING - Registration is broken until this is fixed
**Priority**: URGENT
**Time to fix**: 2 minutes
**Difficulty**: Easy (just copy/paste SQL)
