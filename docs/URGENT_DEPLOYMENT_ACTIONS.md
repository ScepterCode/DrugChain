# 🚨 URGENT: Required Deployment Actions

## Current Issues

Based on the errors you're seeing:

```
❌ CORS errors on /api/v1/categories/industries
❌ CORS errors on /api/v1/analytics/manufacturer/dashboard  
❌ 405 Method Not Allowed on /api/v1/products (GET)
❌ Connection failures (ERR_FAILED, ERR_CONNECTION_CLOSED)
```

## Root Cause

**The backend on Render is running OLD CODE** that doesn't have:
- Latest CORS configuration
- Latest route definitions
- Latest bug fixes

## Required Actions (In Order)

### Action #1: Redeploy Backend on Render (CRITICAL)

1. **Go to Render Dashboard**
   - URL: https://dashboard.render.com
   - Find: `drugchain-backend` service

2. **Trigger Manual Deploy**
   - Click: "Manual Deploy" button
   - Select: "Deploy latest commit"
   - Wait: 5-10 minutes for deployment

3. **Verify Deployment**
   - Check logs for: "Application startup complete"
   - Check logs for: "CORS Origins configured"

---

### Action #2: Run Database Migrations (CRITICAL)

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Select your project
   - Click: SQL Editor

2. **Run Complete Migration Script**
   - Open file: `fix_retailer_enum.sql` in this repository
   - Copy entire contents
   - Paste into SQL Editor
   - Click: "Run"

3. **Verify Success**
   - Should see: "✅ ALL MIGRATIONS COMPLETE!"
   - Should see: RETAILER in enum values
   - Should see: New columns added

**Quick SQL (copy-paste):**
```sql
BEGIN;

-- Add RETAILER to enums
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

-- Add missing columns
ALTER TABLE manufacturers 
ADD COLUMN IF NOT EXISTS regulatory_license_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS regulatory_body VARCHAR(100),
ADD COLUMN IF NOT EXISTS primary_certification_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS primary_certification_expiry DATE;

-- Migrate data
UPDATE manufacturers 
SET regulatory_license_number = nafdac_license_number,
    regulatory_body = 'NAFDAC'
WHERE nafdac_license_number IS NOT NULL
  AND regulatory_license_number IS NULL;

COMMIT;
```

---

### Action #3: Set Vercel Environment Variable (IMPORTANT)

1. **Go to Vercel Dashboard**
   - URL: https://vercel.com/dashboard
   - Find: `pack-guard` project

2. **Add Environment Variable**
   - Settings → Environment Variables
   - Click: "Add New"
   - Key: `VITE_API_URL`
   - Value: `https://drugchain-backend.onrender.com/api/v1`
   - Environments: All three (Production, Preview, Development)

3. **Redeploy Frontend**
   - Go to: Deployments tab
   - Click: "..." on latest deployment
   - Click: "Redeploy"

---

## Why These Actions Are Needed

### Backend Redeploy
- Latest code has proper CORS configuration
- Latest code has all route methods (GET, POST, etc.)
- Latest code has bug fixes
- **Without this, nothing else will work**

### Database Migration
- Adds RETAILER enum value (for registration)
- Adds regulatory columns (for manufacturer data)
- **Without this, registration will fail**

### Vercel Env Var
- Ensures frontend calls correct API URLs
- Prevents 405 errors from wrong paths
- **Without this, API calls will fail**

---

## Expected Results After Actions

### After Backend Redeploy:
```
✅ CORS headers present on all endpoints
✅ GET /api/v1/products works
✅ GET /api/v1/categories/industries works
✅ GET /api/v1/analytics/manufacturer/dashboard works
✅ No more ERR_FAILED or ERR_CONNECTION_CLOSED
```

### After Database Migration:
```
✅ Can register as RETAILER
✅ Can create manufacturers with regulatory data
✅ No more enum errors
✅ No more column not found errors
```

### After Vercel Env Var:
```
✅ Frontend calls correct URLs with /api/v1/
✅ No more 405 errors
✅ All API calls work
```

---

## Verification Steps

### 1. Test Backend Health
```bash
curl https://drugchain-backend.onrender.com/health
```
Should return: `{"status":"healthy","service":"packguard-api"}`

### 2. Test CORS
```bash
curl -X OPTIONS \
  -H "Origin: https://pack-guard.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  https://drugchain-backend.onrender.com/api/v1/products \
  -v
```
Should return: `200 OK` with CORS headers

### 3. Test Products Endpoint
```bash
curl https://drugchain-backend.onrender.com/api/v1/products/public
```
Should return: JSON array of products (or empty array)

### 4. Test Frontend
1. Go to: https://pack-guard.vercel.app/portal/products/new
2. Open browser console (F12)
3. Should see: No CORS errors
4. Should see: No 405 errors
5. Should be able to: Create products

---

## Timeline

| Action | Time | Priority |
|--------|------|----------|
| Redeploy backend | 10 min | 🔴 CRITICAL |
| Run database migration | 3 min | 🔴 CRITICAL |
| Set Vercel env var | 5 min | 🟡 IMPORTANT |
| **Total** | **18 min** | - |

---

## Current Status

| Component | Status | Action Needed |
|-----------|--------|---------------|
| Backend Code | ✅ Correct | Redeploy on Render |
| Database Schema | ❌ Missing columns | Run SQL migration |
| Frontend Code | ✅ Correct | Set Vercel env var |
| Backend Deployment | ❌ Old code | Manual redeploy |
| Database Migration | ❌ Not run | Run SQL script |
| Vercel Env Var | ❌ Not set | Add in dashboard |

---

## Priority Order

1. **FIRST**: Redeploy backend on Render (fixes CORS and 405 errors)
2. **SECOND**: Run database migration (fixes registration)
3. **THIRD**: Set Vercel env var (fixes API paths)

**Do these in order - each one depends on the previous!**

---

## If Issues Persist

### Backend Still Has CORS Errors
- Check Render logs for errors
- Verify latest commit is deployed
- Check CORS_ORIGINS environment variable in Render

### Database Migration Fails
- Check Supabase connection
- Verify admin permissions
- Run each section separately

### Frontend Still Has 405 Errors
- Verify Vercel env var is set
- Hard refresh browser (Ctrl+Shift+R)
- Check Network tab for actual URLs being called

---

## Summary

**You need to:**
1. ✅ Redeploy backend on Render (10 min)
2. ✅ Run SQL migration in Supabase (3 min)
3. ✅ Set Vercel environment variable (5 min)

**Total time: 18 minutes to fix everything!**

The code is correct - it just needs to be deployed and configured properly.
