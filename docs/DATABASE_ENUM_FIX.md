# 🔴 DATABASE SCHEMA FIX - Multiple Issues

## Problems Identified ✅

### Issue #1: Missing RETAILER Enum Value
```
psycopg2.errors.InvalidTextRepresentation: invalid input value for enum organizationtype: "RETAILER"
```

### Issue #2: Missing Columns in manufacturers Table
```
column "regulatory_license_number" of relation "manufacturers" does not exist
column "regulatory_body" of relation "manufacturers" does not exist
column "primary_certification_type" of relation "manufacturers" does not exist
column "primary_certification_expiry" of relation "manufacturers" does not exist
```

**Root Cause:** Database migrations exist in code but haven't been run on production database.

---

## Current Status

### Code (Backend Models) ✅
```python
class OrganizationType(str, enum.Enum):
    MANUFACTURER = "MANUFACTURER"
    DISTRIBUTOR = "DISTRIBUTOR"
    RETAILER = "RETAILER"      # ✅ Exists in code
    REGULATOR = "REGULATOR"

class Manufacturer(Base):
    # Generic regulatory fields (industry-agnostic)
    regulatory_license_number = Column(String(100))  # ✅ In code
    regulatory_body = Column(String(100))            # ✅ In code
    primary_certification_type = Column(String(50))  # ✅ In code
    primary_certification_expiry = Column(Date())    # ✅ In code
```

### Database (PostgreSQL) ❌
```sql
-- Current enum values (missing RETAILER)
organizationtype: MANUFACTURER, DISTRIBUTOR, REGULATOR
userrole: MANUFACTURER, DISTRIBUTOR, REGULATOR, SYSTEM_ADMIN

-- Current manufacturers table (missing columns)
manufacturers:
  - manufacturer_id
  - manufacturer_code
  - nafdac_license_number
  - production_capacity
  - specialization
  - gmp_certified
  - gmp_certificate_expiry
  ❌ Missing: regulatory_license_number
  ❌ Missing: regulatory_body
  ❌ Missing: primary_certification_type
  ❌ Missing: primary_certification_expiry
```

---

## Solution: Run Database Migration

### Option 1: Run SQL Directly in Supabase (FASTEST - 2 minutes)

#### Step 1: Access Supabase SQL Editor
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click: "SQL Editor" (left sidebar)
4. Click: "New Query"

#### Step 2: Run This SQL
```sql
-- Add RETAILER to OrganizationType enum
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

-- Add RETAILER to UserRole enum
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

-- Verify the changes
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'organizationtype')
ORDER BY enumlabel;

SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'userrole')
ORDER BY enumlabel;
```

#### Step 3: Verify Results
You should see output like:
```
organizationtype values:
- DISTRIBUTOR
- MANUFACTURER
- REGULATOR
- RETAILER  ✅ (newly added)

userrole values:
- DISTRIBUTOR
- MANUFACTURER
- REGULATOR
- RETAILER  ✅ (newly added)
- SYSTEM_ADMIN
```

---

### Option 2: Run Alembic Migration on Render (5 minutes)

#### Step 1: Access Render Shell
1. Go to: https://dashboard.render.com
2. Find: `drugchain-backend` service
3. Click: "Shell" tab (top right)

#### Step 2: Run Migration
```bash
# Navigate to app directory
cd /opt/render/project/src

# Run the migration
alembic upgrade head

# Verify
python -c "from app.models.organization import OrganizationType; print(list(OrganizationType))"
```

---

### Option 3: Use Database Client (pgAdmin, DBeaver, etc.)

If you have a PostgreSQL client connected to your Supabase database:

```sql
-- Check current enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'organizationtype');

-- Add RETAILER if not exists
ALTER TYPE organizationtype ADD VALUE IF NOT EXISTS 'RETAILER';
ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'RETAILER';

-- Verify
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'organizationtype');
```

---

## Verification Steps

### 1. Check Database Directly
```sql
-- Should return RETAILER in the list
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'organizationtype')
ORDER BY enumlabel;
```

### 2. Test Registration
1. Go to: https://pack-guard.vercel.app/register
2. Fill in form with:
   - Organization Type: RETAILER
   - Other required fields
3. Submit
4. Should succeed without 500 error

### 3. Check Backend Logs
After running the fix, registration should show:
```
INFO: POST /api/v1/auth/register
Status: 201 Created
```

Instead of:
```
ERROR: invalid input value for enum organizationtype: "RETAILER"
Status: 500 Internal Server Error
```

---

## Why This Happened

### Timeline:
1. **Initial Schema**: Database created with PHARMACY instead of RETAILER
2. **Code Update**: Models updated to use RETAILER
3. **Migration Created**: `002_update_enums_retailer.py` created
4. **Migration Not Run**: Migration exists but wasn't applied to production database
5. **Mismatch**: Code expects RETAILER, database doesn't have it

### The Gap:
- ✅ Migration file exists in codebase
- ❌ Migration not run on production database
- ❌ Alembic migrations not part of deployment process

---

## Recommended: Add Migration to Deployment

To prevent this in the future, add migration step to Render deployment:

### Update `render.yaml`
```yaml
services:
  - type: web
    name: drugchain-backend
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
    # ^^^ Added: alembic upgrade head before starting server
```

Or create a separate migration job in Render dashboard.

---

## Quick Reference

### What to Run (Copy-Paste Ready):
```sql
ALTER TYPE organizationtype ADD VALUE IF NOT EXISTS 'RETAILER';
ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'RETAILER';
```

### Where to Run:
- **Fastest**: Supabase SQL Editor
- **Alternative**: Render Shell with `alembic upgrade head`
- **Alternative**: Any PostgreSQL client

### Expected Result:
- ✅ RETAILER added to both enums
- ✅ Registration works
- ✅ No more 500 errors

---

## After the Fix

### Test These Scenarios:
1. ✅ Register as RETAILER
2. ✅ Register as MANUFACTURER
3. ✅ Register as DISTRIBUTOR
4. ✅ Register as REGULATOR
5. ✅ Login with any role
6. ✅ Access role-specific dashboards

---

## Summary

| Issue | Status | Solution |
|-------|--------|----------|
| CORS errors | ✅ Fixed | Updated origins |
| 405 errors | ⚠️ Pending | Set Vercel env var |
| **500 enum error** | ⚠️ **Pending** | **Run SQL to add RETAILER** |

**Action Required:**
1. Run SQL in Supabase (2 minutes)
2. Set Vercel env var (5 minutes)
3. Test registration

**Total Time:** 7 minutes to full fix! 🎉

---

## Need Help?

If you encounter issues:
1. Check Supabase connection
2. Verify you have admin access
3. Check for typos in SQL
4. Share error message for debugging

**This is the final piece of the puzzle!**
