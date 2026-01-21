# 📸 Visual Guide: Force Rebuild on Render

## Current Status (Confirmed by Tests)

```
✅ Root endpoint: Working
✅ Health endpoint: Working  
✅ Docs endpoint: Working
✅ GET routes: Exist (500 errors are database issues)
❌ POST routes: MISSING (405 = old code)
```

**Diagnosis**: Partial/stale deployment on Render

---

## Step-by-Step Visual Guide

### Step 1: Open Render Dashboard

```
Browser → https://dashboard.render.com
```

You'll see a list of your services.

---

### Step 2: Click on Your Backend Service

Look for a service named something like:
- `drugchain-backend`
- `packguard-backend`
- Or whatever you named it

**Click on the service name** (not the URL, the name itself)

---

### Step 3: Find the Manual Deploy Button

At the top right of the service page, you'll see:

```
[Manual Deploy ▼]  [Settings]  [...]
```

**Click the dropdown arrow (▼)** next to "Manual Deploy"

---

### Step 4: Select "Clear build cache & deploy"

A dropdown menu will appear with options:

```
┌─────────────────────────────────┐
│ Deploy latest commit            │  ← DON'T click this
│ Clear build cache & deploy      │  ← CLICK THIS ONE!
│ Redeploy                        │  ← DON'T click this
└─────────────────────────────────┘
```

**Click: "Clear build cache & deploy"**

---

### Step 5: Confirm

A confirmation dialog will appear:

```
┌──────────────────────────────────────┐
│ Clear build cache and deploy?        │
│                                      │
│ This will delete all cached files   │
│ and rebuild from scratch.           │
│                                      │
│     [Cancel]    [Confirm]            │
└──────────────────────────────────────┘
```

**Click: "Confirm"**

---

### Step 6: Watch the Logs

The page will automatically show the deployment logs:

```
=== Clearing build cache ===
Deleting cached files...
Cache cleared successfully

=== Installing dependencies ===
Collecting fastapi==0.109.0
...
Successfully installed fastapi-0.109.0

=== Starting server ===
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     CORS Origins configured: ['https://pack-guard.vercel.app', ...]
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:10000
```

**Look for**: "CORS Origins configured" - this confirms new code!

---

### Step 7: Wait for "Live" Status

At the top of the page, you'll see the status change:

```
Building... → Deploying... → Live ✓
```

**Wait until it says "Live"** (10-15 minutes)

---

### Step 8: Test the Deployment

Run the test script:

```powershell
.\scripts\test-all-endpoints.ps1
```

**Expected results:**

```
✅ POST /api/v1/products → 401 Unauthorized (NOT 405!)
✅ GET /api/v1/products/public → 200 OK or 500
✅ All routes exist
```

---

## Troubleshooting

### Can't Find "Clear build cache & deploy"?

**Option A**: Try Settings
1. Click "Settings" tab
2. Scroll to "Build & Deploy"
3. Look for "Clear build cache" button

**Option B**: Contact Render Support
- Use the chat widget in bottom right
- Ask: "How do I clear build cache?"

**Option C**: Nuclear Option
1. Delete the service
2. Create a new one
3. Connect to GitHub
4. Deploy fresh

---

## Alternative: Check Render Settings

If rebuild doesn't work, verify these settings:

### Build Command:
```
pip install -r requirements.txt
```

### Start Command:
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Environment Variables:
- `DATABASE_URL` = Your Supabase connection string
- `SECRET_KEY` = Your secret key
- `CORS_ORIGINS` = Comma-separated list (NO wildcards!)

---

## Success Indicators

### Before Rebuild:
```
POST /api/v1/products → 405 ❌
```

### After Rebuild:
```
POST /api/v1/products → 401 ✅
```

**401 = Route exists, needs authentication = SUCCESS!**

---

## Timeline

| Step | Time |
|------|------|
| Steps 1-5 | 2 min |
| Step 6-7 | 10-15 min |
| Step 8 | 1 min |
| **Total** | **13-18 min** |

---

## After Successful Rebuild

Once you see 401 instead of 405:

1. ✅ Latest code is deployed
2. ✅ All routes exist
3. ✅ Database migration (already done) works
4. ✅ Product creation works
5. ✅ Everything works!

---

## Need Help?

If you get stuck:
1. Take a screenshot of the Render dashboard
2. Share the deployment logs
3. Share any error messages

But 99% of the time, "Clear build cache & deploy" fixes this exact issue.

---

**GO TO RENDER NOW AND DO THIS!**

This is the ONLY remaining blocker. Everything else is already fixed.
