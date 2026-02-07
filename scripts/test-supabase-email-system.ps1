# Test Supabase Email System
# This script tests all email functionality to ensure Supabase is sending emails correctly

$BACKEND_URL = "https://drugchain-1.onrender.com"
$TEST_EMAIL = "test-$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUPABASE EMAIL SYSTEM TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will test:" -ForegroundColor Yellow
Write-Host "  1. Email Verification (on registration)" -ForegroundColor White
Write-Host "  2. Resend Verification Email" -ForegroundColor White
Write-Host "  3. Password Reset Email" -ForegroundColor White
Write-Host ""
Write-Host "Test Email: $TEST_EMAIL" -ForegroundColor Green
Write-Host ""

# Test 1: Registration (triggers email verification)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST 1: Registration Email Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Registering new user..." -ForegroundColor Yellow

$registrationBody = @{
    email = $TEST_EMAIL
    password = "TestPassword123!"
    full_name = "Email Test User"
    role = "MANUFACTURER"
    organization_name = "Test Organization"
    phone = "+1234567890"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registrationBody `
        -ErrorAction Stop
    
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 3
    Write-Host ""
    Write-Host "📧 CHECK YOUR EMAIL: Supabase should have sent a verification email to $TEST_EMAIL" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host "❌ Registration failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "Press any key to continue to Test 2..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Test 2: Resend Verification Email
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST 2: Resend Verification Email" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Requesting to resend verification email..." -ForegroundColor Yellow

$resendBody = @{
    email = $TEST_EMAIL
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/auth/resend-verification" `
        -Method POST `
        -ContentType "application/json" `
        -Body $resendBody `
        -ErrorAction Stop
    
    Write-Host "✅ Resend request successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 3
    Write-Host ""
    Write-Host "📧 CHECK YOUR EMAIL: Supabase should have sent another verification email to $TEST_EMAIL" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host "❌ Resend verification failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "Press any key to continue to Test 3..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Test 3: Password Reset Email
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST 3: Password Reset Email" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Requesting password reset..." -ForegroundColor Yellow

$resetBody = @{
    email = $TEST_EMAIL
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/auth/request-password-reset" `
        -Method POST `
        -ContentType "application/json" `
        -Body $resetBody `
        -ErrorAction Stop
    
    Write-Host "✅ Password reset request successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 3
    Write-Host ""
    Write-Host "📧 CHECK YOUR EMAIL: Supabase should have sent a password reset email to $TEST_EMAIL" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host "❌ Password reset request failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Email: $TEST_EMAIL" -ForegroundColor Green
Write-Host ""
Write-Host "Expected Emails:" -ForegroundColor Yellow
Write-Host "  1. Email Verification (from registration)" -ForegroundColor White
Write-Host "  2. Email Verification (from resend)" -ForegroundColor White
Write-Host "  3. Password Reset" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT: Check the email inbox for $TEST_EMAIL" -ForegroundColor Yellow
Write-Host ""
Write-Host "If emails are NOT arriving:" -ForegroundColor Red
Write-Host "  1. Check Supabase Dashboard → Authentication → Email Templates" -ForegroundColor White
Write-Host "  2. Verify SMTP settings in Supabase Dashboard → Project Settings → Auth" -ForegroundColor White
Write-Host "  3. Check spam/junk folder" -ForegroundColor White
Write-Host "  4. Verify email rate limits haven't been exceeded" -ForegroundColor White
Write-Host "  5. Check Supabase logs for email delivery errors" -ForegroundColor White
Write-Host ""
Write-Host "To check Supabase email configuration:" -ForegroundColor Cyan
Write-Host "  1. Go to https://supabase.com/dashboard" -ForegroundColor White
Write-Host "  2. Select your project" -ForegroundColor White
Write-Host "  3. Go to Authentication → Email Templates" -ForegroundColor White
Write-Host "  4. Verify templates are enabled and configured" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
