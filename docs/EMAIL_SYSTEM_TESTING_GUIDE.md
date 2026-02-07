# Email System Testing Guide

## Overview

PackGuard uses **Supabase Auth** for all email functionality. Supabase handles email delivery automatically - no SMTP configuration needed in the backend!

## Email Types

PackGuard sends the following emails:

1. **Email Verification** - Sent when user registers
2. **Resend Verification** - Sent when user requests verification resend
3. **Password Reset** - Sent when user requests password reset
4. **Welcome Email** - Can be customized in Supabase templates

## Testing Methods

### Method 1: PowerShell Script (Recommended)

Run the automated test script:

```powershell
.\scripts\test-supabase-email-system.ps1
```

This script will:
- Register a test user (triggers verification email)
- Request verification resend
- Request password reset
- Show you what to check

### Method 2: Python Script

Run the Python test script:

```bash
cd backend
python test_email_system.py
```

This script will:
- Test all email service functions
- Check Supabase configuration
- Optionally test real registration
- Provide detailed diagnostics

### Method 3: Manual Testing

#### Test Email Verification

1. Go to https://packguard.vercel.app/register
2. Register with a real email address you can access
3. Check your email inbox for verification email
4. Click the verification link

#### Test Resend Verification

1. After registering, click "Resend Verification Email"
2. Check your email inbox
3. Verify you received another email

#### Test Password Reset

1. Go to https://packguard.vercel.app/forgot-password
2. Enter your email address
3. Check your email inbox for reset link
4. Click the link and reset your password

## Checking Email Configuration

### Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication → Email Templates**
4. Verify these templates are enabled:
   - Confirm signup
   - Reset password
   - Magic Link (optional)

### Email Template Customization

You can customize email templates in Supabase:

1. Go to **Authentication → Email Templates**
2. Click on a template (e.g., "Confirm signup")
3. Edit the HTML/text content
4. Add your branding, logo, colors
5. Save changes

### SMTP Settings

Check SMTP configuration:

1. Go to **Project Settings → Auth**
2. Scroll to **SMTP Settings**
3. Verify SMTP is configured (or using Supabase's default)

## Troubleshooting

### Emails Not Arriving

**Check 1: Spam/Junk Folder**
- Emails might be filtered as spam
- Check spam folder in your email client

**Check 2: Email Rate Limits**
- Supabase has rate limits on emails
- Free tier: Limited emails per hour
- Check Supabase dashboard for rate limit errors

**Check 3: Email Verification Status**
- Go to Supabase Dashboard → Authentication → Users
- Check if user exists and email verification status

**Check 4: Supabase Logs**
- Go to Supabase Dashboard → Logs
- Filter for authentication events
- Look for email delivery errors

**Check 5: Email Address Validity**
- Ensure email address is valid
- Some email providers block automated emails

### Common Issues

#### Issue: "Email not sent"
**Solution:** Check Supabase logs for errors. Verify SMTP settings.

#### Issue: "Rate limit exceeded"
**Solution:** Wait a few minutes. Consider upgrading Supabase plan for higher limits.

#### Issue: "Invalid email template"
**Solution:** Go to Email Templates in Supabase and verify templates are enabled.

#### Issue: "User already exists"
**Solution:** Use a different email address or delete the test user from Supabase dashboard.

## Email Flow Diagram

```
User Registration
    ↓
Backend creates user in database
    ↓
Backend calls Supabase Auth signup
    ↓
Supabase automatically sends verification email
    ↓
User receives email
    ↓
User clicks verification link
    ↓
Supabase verifies email
    ↓
Backend updates user status
```

## Production Checklist

Before going to production, verify:

- [ ] Email templates are customized with your branding
- [ ] SMTP settings are configured (or using Supabase default)
- [ ] Email rate limits are sufficient for your user base
- [ ] Verification links point to correct domain
- [ ] Password reset links point to correct domain
- [ ] Email sender name is set correctly
- [ ] Test emails from production environment
- [ ] Monitor email delivery rates
- [ ] Set up email delivery monitoring/alerts

## Monitoring Email Delivery

### Supabase Dashboard

Monitor email delivery in real-time:

1. Go to **Logs** in Supabase Dashboard
2. Filter by "auth" events
3. Look for email-related events
4. Check for errors or failures

### Backend Logs

Check backend logs for email-related messages:

```bash
# On Render
# Go to your service → Logs
# Search for "email" or "verification"
```

### User Feedback

Monitor user reports:
- Users not receiving emails
- Emails going to spam
- Verification links not working

## Testing Checklist

Use this checklist when testing emails:

- [ ] Registration email verification works
- [ ] Resend verification email works
- [ ] Password reset email works
- [ ] Emails arrive within 1 minute
- [ ] Email links work correctly
- [ ] Email formatting looks good
- [ ] Email sender name is correct
- [ ] Emails don't go to spam
- [ ] Test with multiple email providers (Gmail, Outlook, etc.)
- [ ] Test on mobile devices

## Contact Information Updates

All contact information has been updated to use:

**PackGuard Official Email:** Contact@packguard.org

**NAFDAC Reporting (Regulatory):**
- Phone: +234-1-448-0772
- Email: pharmacovigilance@nafdac.gov.ng

Updated in:
- Landing page footer
- Verification result alerts
- How to Use page
- All error messages

## Support

If you encounter issues with email delivery:

1. Check this guide first
2. Review Supabase documentation: https://supabase.com/docs/guides/auth
3. Check Supabase status: https://status.supabase.com
4. Contact PackGuard support: Contact@packguard.org

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Rate Limits](https://supabase.com/docs/guides/platform/going-into-prod#rate-limiting)
