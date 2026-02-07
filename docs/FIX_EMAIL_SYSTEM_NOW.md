# Fix Email System NOW - Step-by-Step Guide

## 🚨 CRITICAL ISSUE: Emails Not Being Sent

**Root Cause:** Missing Supabase credentials in environment variables  
**Time to Fix:** 15-30 minutes  
**Difficulty:** Easy (configuration only)

---

## Step 1: Get Supabase Credentials (5 minutes)

### 1.1 Go to Supabase Dashboard

Open your browser and go to:
```
https://supabase.com/dashboard
```

### 1.2 Select Your Project

Click on your project: **aykzdgvdzmjhwsbjazon**

### 1.3 Get API Keys

1. Click on **Settings** (gear icon in sidebar)
2. Click on **API** in the settings menu
3. You'll see two keys:

**anon public key** (starts with `eyJ...`)
```
Copy this entire key
```

**service_role key** (starts with `eyJ...`)
```
Copy this entire key
⚠️ KEEP THIS SECRET - It has admin access!
```

### 1.4 Save Keys Temporarily

Paste both keys into a text file temporarily. You'll need them in the next step.

---

## Step 2: Add Credentials to Render (5 minutes)

### 2.1 Go to Render Dashboard

Open your browser and go to:
```
https://dashboard.render.com
```

### 2.2 Select Your Backend Service

1. Find your backend service (should be named something like "drugchain" or "packguard-backend")
2. Click on it

### 2.3 Go to Environment Tab

1. Click on **Environment** in the left sidebar
2. You'll see a list of environment variables

### 2.4 Add/Update These Variables

Click **Add Environment Variable** for each of these:

**Variable 1:**
```
Key: SUPABASE_URL
Value: https://aykzdgvdzmjhwsbjazon.supabase.co
```

**Variable 2:**
```
Key: SUPABASE_KEY
Value: <paste your anon public key here>
```

**Variable 3:**
```
Key: SUPABASE_SERVICE_KEY
Value: <paste your service_role key here>
```

### 2.5 Save Changes

1. Click **Save Changes** button
2. Render will automatically redeploy your backend
3. Wait 2-3 minutes for deployment to complete

---

## Step 3: Configure Email Templates (5 minutes)

### 3.1 Go Back to Supabase Dashboard

```
https://supabase.com/dashboard
```

### 3.2 Go to Email Templates

1. Click on **Authentication** in the sidebar
2. Click on **Email Templates**

### 3.3 Enable "Confirm signup" Template

1. Click on **Confirm signup**
2. Verify the toggle is **ON** (green)
3. If OFF, turn it ON
4. Click **Save** if you made changes

### 3.4 Enable "Reset password" Template

1. Click on **Reset password**
2. Verify the toggle is **ON** (green)
3. If OFF, turn it ON
4. Click **Save** if you made changes

### 3.5 Configure Email Settings

1. Go to **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. Verify **Enable email confirmations** is **ON**
4. Set **Confirm email** redirect URL:
   ```
   https://pack-guard.vercel.app/verify-email
   ```
5. Click **Save**

---

## Step 4: Configure Redirect URLs (3 minutes)

### 4.1 Go to URL Configuration

1. Still in Supabase Dashboard
2. Go to **Authentication** → **URL Configuration**

### 4.2 Add Redirect URLs

Add these URLs (one per line):
```
https://pack-guard.vercel.app/*
https://drug-chain.vercel.app/*
http://localhost:5173/*
http://localhost:3000/*
```

### 4.3 Save Changes

Click **Save**

---

## Step 5: Test the Fix (5 minutes)

### 5.1 Run Diagnostic Script

Open PowerShell and run:
```powershell
.\scripts\diagnose-email-system.ps1
```

### 5.2 Check Results

The script will:
- Test backend health
- Test registration
- Test resend verification
- Test password reset

**Expected Result:** All tests pass and you receive 3 emails

### 5.3 Manual Test

1. Go to https://pack-guard.vercel.app/register
2. Register with your real email address
3. Check your inbox
4. You should receive a verification email within 1 minute

---

## Step 6: Verify Success

### ✅ Email System is Working If:

- [ ] Registration sends verification email
- [ ] Email arrives within 1 minute
- [ ] Verification link works
- [ ] Resend verification works
- [ ] Password reset email sends
- [ ] No errors in Supabase logs

### ❌ Still Not Working?

If emails still don't arrive:

1. **Check Spam Folder** - Most common issue
2. **Check Supabase Logs:**
   - Go to Supabase Dashboard → Logs
   - Filter by "auth"
   - Look for errors
3. **Check Render Logs:**
   - Go to Render Dashboard → Your Service → Logs
   - Search for "email" or "supabase"
   - Look for errors
4. **Verify Credentials:**
   - Go to Render → Environment
   - Verify all 3 variables are set correctly
   - No typos in keys

---

## Troubleshooting

### Issue: "Supabase client not initialized"

**Solution:**
1. Verify SUPABASE_KEY is set in Render
2. Verify key is correct (no extra spaces)
3. Redeploy backend

### Issue: "Email template not found"

**Solution:**
1. Go to Supabase → Authentication → Email Templates
2. Enable "Confirm signup" template
3. Enable "Reset password" template

### Issue: "Invalid redirect URL"

**Solution:**
1. Go to Supabase → Authentication → URL Configuration
2. Add your frontend URL
3. Include wildcard: `https://pack-guard.vercel.app/*`

### Issue: "Rate limit exceeded"

**Solution:**
1. Supabase has email rate limits
2. Wait 5-10 minutes
3. Try again
4. Consider upgrading Supabase plan

---

## Quick Reference

### Supabase Dashboard URLs

**Main Dashboard:**
```
https://supabase.com/dashboard
```

**Email Templates:**
```
Dashboard → Authentication → Email Templates
```

**URL Configuration:**
```
Dashboard → Authentication → URL Configuration
```

**Logs:**
```
Dashboard → Logs (filter by "auth")
```

### Render Dashboard URLs

**Main Dashboard:**
```
https://dashboard.render.com
```

**Environment Variables:**
```
Dashboard → Your Service → Environment
```

**Logs:**
```
Dashboard → Your Service → Logs
```

---

## Success Checklist

Before marking as complete:

- [ ] Got Supabase anon key
- [ ] Got Supabase service_role key
- [ ] Added SUPABASE_URL to Render
- [ ] Added SUPABASE_KEY to Render
- [ ] Added SUPABASE_SERVICE_KEY to Render
- [ ] Saved changes in Render
- [ ] Backend redeployed
- [ ] Enabled "Confirm signup" template
- [ ] Enabled "Reset password" template
- [ ] Configured redirect URLs
- [ ] Ran diagnostic script
- [ ] Received test emails
- [ ] Tested manual registration
- [ ] Verified email link works

---

## What to Expect After Fix

### Registration Flow:
1. User registers → Email sent immediately
2. User receives email within 1 minute
3. User clicks verification link
4. Account is activated
5. User can log in

### Password Reset Flow:
1. User requests reset → Email sent immediately
2. User receives email within 1 minute
3. User clicks reset link
4. User sets new password
5. User can log in with new password

---

## Need Help?

If you're stuck:

1. **Read the detailed guide:**
   - `docs/EMAIL_SYSTEM_ROOT_CAUSE_AND_FIX.md`

2. **Run the diagnostic:**
   - `.\scripts\diagnose-email-system.ps1`

3. **Check Supabase status:**
   - https://status.supabase.com

4. **Contact support:**
   - Contact@packguard.org

---

## Summary

**The fix is simple:**
1. Get Supabase credentials
2. Add to Render environment
3. Enable email templates
4. Test

**Total time:** 15-30 minutes  
**Difficulty:** Easy  
**Risk:** None (just configuration)

**Once fixed, emails will work perfectly!** ✅
