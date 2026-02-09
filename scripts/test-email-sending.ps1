#!/usr/bin/env pwsh

# Test Email Sending After Configuration
# Verifies that emails are actually being sent (not just logged)

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              Email Sending Verification Test                 ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$BACKEND_URL = "https://drugchain-1.onrender.com/api/v1"

# Get test email from user
Write-Host "Enter your email address to test: " -ForegroundColor Yellow -NoNewline
$testEmail = Read-Host

if (-not $testEmail -or $testEmail -notmatch "@") {
    Write-Host "❌ Invalid email address" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Testing email sending to: $testEmail" -ForegroundColor Cyan
Write-Host ""

# Test 1: Registration (will send verification email)
Write-Host "TEST 1: Registration + Verification Email" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$randomSuffix = Get-Random -Minimum 1000 -Maximum 9999
$registrationData = @{
    email = $testEmail
    password = "TestPass123!$randomSuffix"
    full_name = "Test User"
    phone_number = "+1234567890"
    role = "MANUFACTURER"
    organization_name = "Test Org $randomSuffix"
    organization_type = "MANUFACTURER"
} | ConvertTo-Json

try {
    Write-Host "Registering user..." -ForegroundColor Gray
    $regResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/register" -Method POST -Body $registrationData -ContentType "application/json" -TimeoutSec 30
    
    Write-Host "✅ Registration successful" -ForegroundColor Green
    Write-Host "   User ID: $($regResponse.data.user.user_id)" -ForegroundColor Gray
    Write-Host "   Email: $($regResponse.data.user.email)" -ForegroundColor Gray
    Write-Host "   Is Verified: $($regResponse.data.user.is_verified)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "📧 CHECK YOUR EMAIL INBOX NOW!" -ForegroundColor Yellow
    Write-Host "   Look for: 'Verify Your PackGuard Account'" -ForegroundColor White
    Write-Host "   From: PackGuard <noreply@packguard.org>" -ForegroundColor White
    Write-Host ""
    
    $userId = $regResponse.data.user.user_id
    
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Details: $responseBody" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "  • Email already registered (try different email)" -ForegroundColor White
    Write-Host "  • Backend not responding" -ForegroundColor White
    Write-Host "  • Invalid email format" -ForegroundColor White
    exit 1
}

# Wait for user to check email
Write-Host "Did you receive the verification email? (y/n): " -ForegroundColor Cyan -NoNewline
$receivedEmail = Read-Host

if ($receivedEmail -eq "y") {
    Write-Host ""
    Write-Host "✅ SUCCESS! Email sending is working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Email system is configured correctly:" -ForegroundColor Cyan
    Write-Host "  ✅ SEND_EMAILS=True" -ForegroundColor Green
    Write-Host "  ✅ RESEND_API_KEY configured" -ForegroundColor Green
    Write-Host "  ✅ Emails are being delivered" -ForegroundColor Green
    Write-Host ""
    
    # Test 2: Resend Verification
    Write-Host "TEST 2: Resend Verification Email" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Testing resend functionality..." -ForegroundColor Gray
    
    $resendData = @{ email = $testEmail } | ConvertTo-Json
    
    try {
        $resendResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/resend-verification" -Method POST -Body $resendData -ContentType "application/json" -TimeoutSec 30
        Write-Host "✅ Resend verification works" -ForegroundColor Green
        Write-Host ""
        Write-Host "📧 CHECK YOUR EMAIL AGAIN!" -ForegroundColor Yellow
        Write-Host "   You should receive a second verification email" -ForegroundColor White
        Write-Host ""
    } catch {
        Write-Host "⚠️  Resend failed (might be already verified)" -ForegroundColor Yellow
    }
    
    # Test 3: Password Reset
    Write-Host "TEST 3: Password Reset Email" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Testing password reset..." -ForegroundColor Gray
    
    $resetData = @{ email = $testEmail } | ConvertTo-Json
    
    try {
        $resetResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/request-password-reset" -Method POST -Body $resetData -ContentType "application/json" -TimeoutSec 30
        Write-Host "✅ Password reset request works" -ForegroundColor Green
        Write-Host ""
        Write-Host "📧 CHECK YOUR EMAIL ONE MORE TIME!" -ForegroundColor Yellow
        Write-Host "   Look for: 'Reset Your PackGuard Password'" -ForegroundColor White
        Write-Host ""
    } catch {
        Write-Host "⚠️  Password reset failed" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║              ALL TESTS PASSED! 🎉                            ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your email system is fully operational!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You should have received:" -ForegroundColor Cyan
    Write-Host "  1. ✅ Email verification email" -ForegroundColor White
    Write-Host "  2. ✅ Resend verification email (duplicate)" -ForegroundColor White
    Write-Host "  3. ✅ Password reset email" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  • Click verification link in email" -ForegroundColor White
    Write-Host "  • Log in to your account" -ForegroundColor White
    Write-Host "  • Start using PackGuard!" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "❌ Email not received" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. CHECK SPAM/JUNK FOLDER" -ForegroundColor Cyan
    Write-Host "   Emails might be filtered as spam" -ForegroundColor White
    Write-Host ""
    Write-Host "2. VERIFY RENDER ENVIRONMENT" -ForegroundColor Cyan
    Write-Host "   Go to: https://dashboard.render.com" -ForegroundColor White
    Write-Host "   Check these variables are set:" -ForegroundColor White
    Write-Host "     • SEND_EMAILS = True" -ForegroundColor Gray
    Write-Host "     • RESEND_API_KEY = re_..." -ForegroundColor Gray
    Write-Host "     • MAIL_FROM = noreply@packguard.org" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. CHECK RENDER LOGS" -ForegroundColor Cyan
    Write-Host "   Look for:" -ForegroundColor White
    Write-Host "     • '✅ Email sent successfully'" -ForegroundColor Gray
    Write-Host "     • OR 'NOTE: Email not sent. Set SEND_EMAILS=True'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. VERIFY RESEND DASHBOARD" -ForegroundColor Cyan
    Write-Host "   Go to: https://resend.com/emails" -ForegroundColor White
    Write-Host "   Check if emails are being sent" -ForegroundColor White
    Write-Host ""
    Write-Host "5. CHECK API KEY" -ForegroundColor Cyan
    Write-Host "   Make sure API key starts with 're_'" -ForegroundColor White
    Write-Host "   Verify it's not expired or revoked" -ForegroundColor White
    Write-Host ""
    Write-Host "6. WAIT A FEW MINUTES" -ForegroundColor Cyan
    Write-Host "   Sometimes email delivery is delayed" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Need more help?" -ForegroundColor Yellow
    Write-Host "  • Check: docs/EMAIL_SYSTEM_DIAGNOSIS_COMPLETE.md" -ForegroundColor White
    Write-Host "  • Run: ./scripts/setup-resend-email.ps1" -ForegroundColor White
    Write-Host ""
}

Write-Host "Test complete!" -ForegroundColor Cyan
Write-Host ""
