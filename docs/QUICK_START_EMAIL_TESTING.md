# Quick Start: Email Testing

## 🚀 Test Emails in 2 Minutes

### Option 1: PowerShell (Windows)

```powershell
.\scripts\test-supabase-email-system.ps1
```

**What it does:**
- Registers a test user
- Sends verification email
- Tests resend verification
- Tests password reset

**Expected result:** You'll see 3 emails sent to the test address

---

### Option 2: Python (Any OS)

```bash
cd backend
python test_email_system.py
```

**What it does:**
- Tests all email services
- Validates configuration
- Provides diagnostics

**Expected result:** All tests pass with green checkmarks

---

### Option 3: Manual Test (Production)

1. Go to https://packguard.vercel.app/register
2. Register with your real email
3. Check inbox for verification email
4. Click verification link

**Expected result:** Email arrives within 1 minute

---

## ✅ Success Indicators

**Emails are working if:**
- ✅ Verification email arrives after registration
- ✅ Resend verification works
- ✅ Password reset email arrives
- ✅ Links in emails work correctly

---

## ❌ Troubleshooting

**Emails not arriving?**

1. **Check spam folder** - Most common issue
2. **Check Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Authentication → Users (verify user exists)
   - Logs (check for errors)
3. **Verify email templates:**
   - Authentication → Email Templates
   - Ensure templates are enabled
4. **Check rate limits:**
   - Free tier has limits
   - Wait a few minutes and retry

---

## 📧 Contact Information

**PackGuard Support:**
- Email: Contact@packguard.org

**NAFDAC Reporting:**
- Phone: +234-1-448-0772
- Email: pharmacovigilance@nafdac.gov.ng

---

## 📚 Full Documentation

For detailed information, see:
- `docs/EMAIL_SYSTEM_TESTING_GUIDE.md` - Complete testing guide
- `docs/CONTACT_INFO_AND_EMAIL_TESTING_COMPLETE.md` - Implementation summary

---

## 🎯 Quick Checklist

Before going live:

- [ ] Run email test script
- [ ] Verify emails arrive
- [ ] Test on multiple email providers (Gmail, Outlook, etc.)
- [ ] Check email formatting
- [ ] Verify links work
- [ ] Test on mobile
- [ ] Customize email templates in Supabase
- [ ] Set up monitoring

---

**That's it! Email testing made simple.** 🎉
