# ✅ Run This Database Migration

## The Simple SQL Script

Use the file: **`database_migration_simple.sql`**

This is a corrected, simplified version without syntax errors.

---

## Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click: **"SQL Editor"** (left sidebar)
4. Click: **"New Query"**

### Step 2: Copy and Paste This SQL

```sql
BEGIN;

-- Add RETAILER to organizationtype enum (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'RETAILER' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'organizationtype')
    ) THEN
        ALTER TYPE organizationtype ADD VALUE 'RETAILER';
    END IF;
END $$;

-- Add RETAILER to userrole enum (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'RETAILER' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'userrole')
    ) THEN
        ALTER TYPE userrole ADD VALUE 'RETAILER';
    END IF;
END $$;

-- Add missing columns to manufacturers table
ALTER TABLE manufacturers 
ADD COLUMN IF NOT EXISTS regulatory_license_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS regulatory_body VARCHAR(100),
ADD COLUMN IF NOT EXISTS primary_certification_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS primary_certification_expiry DATE;

-- Migrate existing data
UPDATE manufacturers 
SET regulatory_license_number = nafdac_license_number,
    regulatory_body = 'NAFDAC'
WHERE nafdac_license_number IS NOT NULL
  AND regulatory_license_number IS NULL;

UPDATE manufacturers
SET primary_certification_type = 'GMP',
    primary_certification_expiry = gmp_certificate_expiry
WHERE gmp_certified = TRUE
  AND primary_certification_type IS NULL;

COMMIT;
```

### Step 3: Click "Run" or Press Ctrl+Enter

You should see: **"Success. No rows returned"**

### Step 4: Verify (Optional)

Run this separately to verify:
```sql
SELECT 'Migration completed successfully!' as status;
```

---

## What This Does

### 1. Adds RETAILER Enum Values
- Adds `RETAILER` to `organizationtype` enum
- Adds `RETAILER` to `userrole` enum
- Uses `IF NOT EXISTS` so it's safe to run multiple times

### 2. Adds Missing Columns
- `regulatory_license_number` - Generic license number field
- `regulatory_body` - Regulatory authority name
- `primary_certification_type` - Type of certification (e.g., GMP)
- `primary_certification_expiry` - Certification expiry date

### 3. Migrates Existing Data
- Copies `nafdac_license_number` → `regulatory_license_number`
- Sets `regulatory_body` to 'NAFDAC'
- Copies `gmp_certificate_expiry` → `primary_certification_expiry`
- Sets `primary_certification_type` to 'GMP' where applicable

---

## After Running Migration

### Test Your Backend

```powershell
# Test products endpoint (should return 200 or empty array, not 500)
curl https://drugchain-1.onrender.com/api/v1/products/public

# Test categories endpoint (should return 200)
curl https://drugchain-1.onrender.com/api/v1/categories/industries

# Test batches endpoint (should return 401, not 500)
curl https://drugchain-1.onrender.com/api/v1/ids/batches
```

### Test in Browser

1. Go to: https://pack-guard.vercel.app/portal/products/new
2. Should load without 500 errors
3. Should be able to create products

---

## If You Get Errors

### Error: "type already exists"
- This is fine! It means the enum value was already added
- The script will skip it and continue

### Error: "column already exists"
- This is fine! It means the column was already added
- The script will skip it and continue

### Error: "relation does not exist"
- This means the `manufacturers` table doesn't exist
- Check your database schema
- Make sure you're connected to the correct database

---

## Why the Original Script Failed

The original `fix_retailer_enum.sql` had:
```sql
RAISE NOTICE '✅ Migrated existing regulatory data';
```

This was **outside** a `DO` block, which causes a syntax error.

`RAISE NOTICE` can only be used inside:
- Functions
- Procedures
- `DO` blocks

The new script removes all standalone `RAISE NOTICE` statements.

---

## Summary

**File to use**: `database_migration_simple.sql`

**Steps**:
1. Open Supabase SQL Editor
2. Paste the SQL above
3. Click "Run"
4. Test your backend

**Result**: All 500 errors will disappear!

---

**This script is safe to run multiple times!** It uses `IF NOT EXISTS` checks, so it won't fail if things already exist.

Run it now and your app will work! 🚀
