# Email System - Quick Start Guide

**TL;DR**: Email system works, just needs API key. 10 minutes to enable.

---

## Current Status

✅ **Working**: Registration, tokens, templates, endpoints  
⚠️ **Missing**: Email provider API key (emails logged, not sent)

---

## Enable Emails (10 Minutes)

### 1. Get Resend API Key (5 min)
```
1. Go to https://resend.com
2. Sign up (free)
3. Create API key
4. Copy key (starts with "re_")
```

### 2. Update Render (3 min)
```
Go to: https://dashboard.render.com
Service: drugchain-1
Tab: Environment

Add:
  SEND_EMAILS = True
  RESEND_API_KEY = re_your_key_here
  FRONTEND_URL = https://packguard.vercel.app

Save → Auto redeploys
```

### 3. Test (2 min)
```powershell
./scripts/test-email-sending.ps1
```

---

## Quick Commands

### Setup Wizard
```powershell
./scripts/setup-resend-email.ps1
```

### Test Emails
```powershell
./scripts/test-email-sending.ps1
```

### Full Diagnostic
```powershell
./scripts/deep-email-diagnostic.ps1
```

---

## What Gets Sent

1. **Verification Email** - After registration
2. **Password Reset** - When requested
3. **Welcome Email** - After verification
4. **Account Locked** - After failed logins

---

## Troubleshooting

**No email received?**
1. Check spam folder
2. Verify Render environment variables
3. Check Render logs
4. Check Resend dashboard
5. Wait 2-3 minutes

**Still stuck?**
```
Read: docs/EMAIL_SYSTEM_DIAGNOSIS_COMPLETE.md
```

---

## Free Tier Limits

**Resend Free**:
- 100 emails/day
- 3,000 emails/month
- Perfect for testing

**Need more?**
- $20/month = 50,000 emails
- $80/month = 100,000 emails

---

## Documentation

- `EMAIL_SYSTEM_DIAGNOSIS_COMPLETE.md` - Full analysis
- `EMAIL_SYSTEM_READY_TO_ENABLE.md` - Detailed guide
- `EMAIL_QUICK_START.md` - This file

---

## That's It!

Run the setup wizard and you're done:
```powershell
./scripts/setup-resend-email.ps1
```

🎉
