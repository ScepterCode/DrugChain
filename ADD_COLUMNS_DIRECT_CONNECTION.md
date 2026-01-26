# Add Columns Using Direct Database Connection

The Supabase SQL Editor is timing out because it uses the connection pooler. Use the direct database connection instead.

## Step 1: Get Your Direct Connection String

1. Go to **Supabase Dashboard** → **Settings** → **Database**
2. Scroll down to **Connection string**
3. Look for **"Connection string"** (NOT "Connection pooling")
4. It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
5. Copy this URL

## Step 2: Connect Using psql

Open PowerShell and run:

```powershell
# Set your password (from the connection string)
$env:PGPASSWORD = "vh1RGEOTKO0d5cKN"

# Connect to database (replace [PROJECT-REF] with your actual project reference)
# You can find this in your connection string
psql -h db.aykzdgvdzmjhwsbjazon.supabase.co -p 5432 -U postgres -d postgres
```

If you don't have `psql` installed, download it from: https://www.postgresql.org/download/windows/

## Step 3: Run Each ALTER TABLE Statement

Once connected, paste each statement one at a time:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);
```

Press Enter, wait for `ALTER TABLE` response, then next:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token_expires TIMESTAMP;
```

Continue for all 7 columns:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;
```

## Step 4: Verify

```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN (
    'email_verification_token',
    'password_reset_token',
    'failed_login_attempts',
    'account_locked_until'
);
```

You should see 7 rows.

## Step 5: Exit

```sql
\q
```

---

## Option 2: Use Supabase CLI (If Installed)

If you have Supabase CLI:

```bash
supabase db execute --db-url "postgresql://postgres:vh1RGEOTKO0d5cKN@db.aykzdgvdzmjhwsbjazon.supabase.co:5432/postgres" --file RUN_THIS_SQL_IN_SUPABASE.sql
```

---

## Option 3: Run During Low Traffic

If your app has low traffic periods (e.g., late night), try running the SQL in the SQL Editor during that time when there are fewer active connections.

---

## Option 4: Contact Supabase Support

Ask them to temporarily increase the statement timeout for your project:

1. Go to Supabase Dashboard → Support
2. Request: "Please increase statement_timeout to 60 seconds for ALTER TABLE operations"
3. They usually respond within a few hours

---

## Why This Happens

- **Pooler connection**: Has 5-10 second timeout to prevent blocking
- **Direct connection**: No timeout limit
- **ALTER TABLE**: Locks the table while adding columns
- **Large tables**: Take longer to alter

The direct connection is the most reliable solution.
