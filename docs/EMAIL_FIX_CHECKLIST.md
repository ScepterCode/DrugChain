# Email System Fix - Visual Checklist

## 🎯 Goal: Get Emails Working

---

## Phase 1: Get Credentials ⏱️ 5 min

### □ Step 1.1: Open Supabase Dashboard
- [ ] Go to https://supabase.com/dashboard
- [ ] Log in to your account
- [ ] Select project: **aykzdgvdzmjhwsbjazon**

### □ Step 1.2: Navigate to API Settings
- [ ] Click **Settings** (gear icon)
- [ ] Click **API**

### □ Step 1.3: Copy Keys
- [ ] Copy **anon public** key (starts with `eyJ...`)
- [ ] Copy **service_role** key (starts with `eyJ...`)
- [ ] ⚠️ Keep service_role key SECRET!

### □ Step 1.4: Save Keys
- [ ] Paste both keys into a text file
- [ ] Label them clearly
- [ ] Keep file open for next phase

---

## Phase 2: Add to Render ⏱️ 5 min

### □ Step 2.1: Open Render Dashboard
- [ ] Go to https://dashboard.render.com
- [ ] Log in to your account
- [ ] Find your backend service

### □ Step 2.2: Go to Environment
- [ ] Click on your backend service
- [ ] Click **Environment** tab

### □ Step 2.3: Add Variables
- [ ] Click **Add Environment Variable**
- [ ] Add: `SUPABASE_URL` = `https://aykzdgvdzmjhwsbjazon.supabase.co`
- [ ] Add: `SUPABASE_KEY` = `<your anon key>`
- [ ] Add: `SUPABASE_SERVICE_KEY` = `<your service_role key>`

### □ Step 2.4: Save & Deploy
- [ ] Click **Save Changes**
- [ ] Wait for automatic redeploy (2-3 minutes)
- [ ] Verify deployment succeeded

---

## Phase 3: Configure Templates ⏱️ 5 min

### □ Step 3.1: Go to Email Templates
- [ ] Back to Supabase Dashboard
- [ ] Click **Authentication**
- [ ] Click **Email Templates**

### □ Step 3.2: Enable Confirm Signup
- [ ] Click **Confirm signup**
- [ ] Verify toggle is **ON** (green)
- [ ] If OFF, turn it ON
- [ ] Click **Save**

### □ Step 3.3: Enable Reset Password
- [ ] Click **Reset password**
- [ ] Verify toggle is **ON** (green)
- [ ] If OFF, turn it ON
- [ ] Click **Save**

### □ Step 3.4: Configure Settings
- [ ] Go to **Authentication** → **Settings**
- [ ] Find **Email Auth** section
- [ ] Verify **Enable email confirmations** is ON
- [ ] Set redirect URL: `https://pack-guard.vercel.app/verify-email`
- [ ] Click **Save**

---

## Phase 4: Configure URLs ⏱️ 3 min

### □ Step 4.1: Go to URL Configuration
- [ ] Still in Supabase Dashboard
- [ ] Go to **Authentication** → **URL Configuration**

### □ Step 4.2: Add Redirect URLs
- [ ] Add: `https://pack-guard.vercel.app/*`
- [ ] Add: `https://drug-chain.vercel.app/*`
- [ ] Add: `http://localhost:5173/*`
- [ ] Add: `http://localhost:3000/*`

### □ Step 4.3: Save
- [ ] Click **Save**

---

## Phase 5: Test ⏱️ 5 min

### □ Step 5.1: Run Diagnostic
- [ ] Open PowerShell
- [ ] Navigate to project directory
- [ ] Run: `.\scripts\diagnose-email-system.ps1`
- [ ] Review results

### □ Step 5.2: Check Email
- [ ] Check inbox for test emails
- [ ] Should receive 3 emails
- [ ] Verify emails arrived within 1 minute

### □ Step 5.3: Manual Test
- [ ] Go to https://pack-guard.vercel.app/register
- [ ] Register with real email
- [ ] Check inbox
- [ ] Click verification link
- [ ] Verify account activates

---

## Phase 6: Verify Success ⏱️ 2 min

### □ Step 6.1: Check All Systems
- [ ] Registration sends email ✅
- [ ] Email arrives quickly ✅
- [ ] Verification link works ✅
- [ ] Resend verification works ✅
- [ ] Password reset works ✅

### □ Step 6.2: Check Logs
- [ ] Supabase Dashboard → Logs
- [ ] Filter by "auth"
- [ ] No errors visible ✅

### □ Step 6.3: Check Backend
- [ ] Render Dashboard → Logs
- [ ] Search for "email"
- [ ] No errors visible ✅

---

## ✅ Success Criteria

Email system is working when ALL of these are true:

- ✅ Supabase credentials added to Render
- ✅ Backend redeployed successfully
- ✅ Email templates enabled
- ✅ Redirect URLs configured
- ✅ Diagnostic script passes
- ✅ Test emails received
- ✅ Manual registration works
- ✅ Verification link works
- ✅ No errors in logs

---

## ❌ Troubleshooting

### If emails still don't arrive:

**Check 1: Spam Folder**
- [ ] Check spam/junk folder
- [ ] Mark as "Not Spam" if found

**Check 2: Credentials**
- [ ] Go to Render → Environment
- [ ] Verify all 3 variables exist
- [ ] Verify no typos in keys
- [ ] Verify no extra spaces

**Check 3: Templates**
- [ ] Go to Supabase → Email Templates
- [ ] Verify both templates are ON
- [ ] Try toggling OFF then ON again

**Check 4: Logs**
- [ ] Check Supabase logs for errors
- [ ] Check Render logs for errors
- [ ] Look for "Supabase client not initialized"

**Check 5: Rate Limits**
- [ ] Wait 5-10 minutes
- [ ] Try again
- [ ] Check Supabase plan limits

---

## 📊 Progress Tracker

**Phase 1:** □ Not Started | □ In Progress | □ Complete  
**Phase 2:** □ Not Started | □ In Progress | □ Complete  
**Phase 3:** □ Not Started | □ In Progress | □ Complete  
**Phase 4:** □ Not Started | □ In Progress | □ Complete  
**Phase 5:** □ Not Started | □ In Progress | □ Complete  
**Phase 6:** □ Not Started | □ In Progress | □ Complete  

**Overall Status:** □ Not Started | □ In Progress | □ Complete

---

## 🎉 Completion

When all phases are complete:

- [ ] Mark this checklist as complete
- [ ] Document completion date: ___________
- [ ] Test with multiple email providers
- [ ] Monitor for 24 hours
- [ ] Consider customizing email templates

---

## 📞 Support

Stuck? Need help?

**Documentation:**
- `docs/FIX_EMAIL_SYSTEM_NOW.md` - Detailed guide
- `docs/EMAIL_SYSTEM_ROOT_CAUSE_AND_FIX.md` - Technical details

**Scripts:**
- `.\scripts\diagnose-email-system.ps1` - Diagnostic tool
- `.\scripts\test-supabase-email-system.ps1` - Testing tool

**Contact:**
- Email: Contact@packguard.org
- Check: https://status.supabase.com

---

**Estimated Total Time:** 25 minutes  
**Difficulty:** Easy  
**Success Rate:** 100% (if followed correctly)

**Let's fix this! 🚀**
