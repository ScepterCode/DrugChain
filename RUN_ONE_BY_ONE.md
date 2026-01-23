# Run These SQL Statements ONE AT A TIME

The timeout is happening because running all ALTER TABLE statements together locks the table too long. Run each statement separately in Supabase SQL Editor.

## Instructions

1. Go to Supabase SQL Editor
2. Copy ONE statement at a time
3. Click Run
4. Wait for success
5. Move to next statement

---

## Statement 1 of 7
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);
```
**Wait for success, then continue...**

---

## Statement 2 of 7
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token_expires TIMESTAMP;
```
**Wait for success, then continue...**

---

## Statement 3 of 7
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
```
**Wait for success, then continue...**

---

## Statement 4 of 7
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token_expires TIMESTAMP;
```
**Wait for success, then continue...**

---

## Statement 5 of 7
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;
```
**Wait for success, then continue...**

---

## Statement 6 of 7
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
```
**Wait for success, then continue...**

---

## Statement 7 of 7
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;
```
**Wait for success, then continue...**

---

## Verify All Columns Were Added

After running all 7 statements, run this to verify:

```sql
SELECT column_name, data_type 
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

You should see **7 rows** returned.

---

## If Still Timing Out

If even individual statements timeout, your table is very large. Try this alternative approach:

### Option A: Use Supabase Dashboard Settings
1. Go to Supabase Dashboard → Settings → Database
2. Look for "Statement Timeout" setting
3. Temporarily increase it to 60 seconds
4. Run the statements again
5. Reset it back after

### Option B: Connect Directly (Bypasses Timeout)
Use the direct database connection (not pooler):

```powershell
# Get your direct connection string from Supabase Dashboard → Settings → Database
# Look for "Connection string" (not "Connection pooling")
# It should look like: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# Then run:
$env:PGPASSWORD = "your_password"
psql -h db.[PROJECT].supabase.co -p 5432 -U postgres -d postgres

# Then paste each ALTER TABLE statement one by one
```

### Option C: Temporary Workaround (Make Columns Optional)

If you can't add the columns right now, we can temporarily make the backend work without them. Let me know if you want this option.
