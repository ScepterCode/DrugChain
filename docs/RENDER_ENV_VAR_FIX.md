# 🔴 CRITICAL: Render Environment Variable Issue

## Root Cause Found!

The deployment logs show:
```
CORS Origins configured: ['http://localhost:5173', 'http://localhost:3000', 
'https://drug-chain.vercel.app', 'https://*.vercel.app']
```

This wildcard `'https://*.vercel.app'` is coming from **Render's environment variables**, NOT from the code!

## The Problem

Render has an environment variable set:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://drug-chain.vercel.app,https://*.vercel.app
```

This overrides the code's default values, and the wildcard doesn't work in FastAPI.

## The Fix

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com
2. Find: `drugchain-backend` service
3. Click on the service name

### Step 2: Update Environment Variable
1. Go to: "Environment" tab (left sidebar)
2. Find: `CORS_ORIGINS` variable
3. Click: "Edit" button
4. **Replace with**:
   ```
   https://pack-guard.vercel.app,https://drug-chain.vercel.app,http://localhost:3000,http://localhost:5173,http://localhost:5174,http://127.0.0.1:3000
   ```
5. Click: "Save Changes"

### Step 3: Redeploy
After saving the environment variable:
1. Render will automatically trigger a redeploy
2. OR click "Manual Deploy" → "Deploy latest commit"
3. Wait 5-10 minutes

## What to Change

### ❌ OLD (Current in Render):
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://drug-chain.vercel.app,https://*.vercel.app
```

### ✅ NEW (What it should be):
```
CORS_ORIGINS=https://pack-guard.vercel.app,https://drug-chain.vercel.app,http://localhost:3000,http://localhost:5173,http://localhost:5174,http://127.0.0.1:3000
```

**Key changes:**
- ✅ Added `https://pack-guard.vercel.app`
- ❌ Removed `https://*.vercel.app` (wildcard doesn't work)
- ✅ All explicit domains

## After the Fix

The logs should show:
```
INFO:app.main:CORS Origins configured: ['https://pack-guard.vercel.app', 
'https://drug-chain.vercel.app', 'http://localhost:3000', ...]
```

And OPTIONS requests should return:
```
INFO: 10.x.x.x:0 - "OPTIONS /auth/register HTTP/1.1" 200 OK
```

Instead of the current 400 Bad Request.

## Why This Happened

1. Environment variables in Render override code defaults
2. Someone set `CORS_ORIGINS` with a wildcard pattern
3. FastAPI doesn't support wildcards in CORS origins
4. This causes 400 errors on OPTIONS requests
5. Browser blocks all POST requests

## Alternative: Remove the Variable

If you want to use the code's defaults instead:
1. Go to Environment tab in Render
2. Find `CORS_ORIGINS`
3. Click "Delete" (trash icon)
4. Save changes
5. Redeploy

This will use the values from `config.py` which are already correct.

## Verification

After redeployment, test:
```bash
curl -X OPTIONS \
  -H "Origin: https://pack-guard.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  https://drugchain-backend.onrender.com/api/v1/auth/register \
  -v
```

Should return: `200 OK` (not 400)

---

## 🔴 ACTION REQUIRED

1. Go to Render Dashboard
2. Environment tab
3. Update or delete `CORS_ORIGINS` variable
4. Wait for automatic redeploy
5. Test OPTIONS request

**This is the final fix!**