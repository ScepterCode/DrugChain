# Diagnose Email System - Complete Analysis
# This script checks all components of the email system

$BACKEND_URL = "https://drugchain-1.onrender.com"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EMAIL SYSTEM DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check Backend Health
Write-Host "TEST 1: Backend Health Check" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Backend is online" -ForegroundColor Green
    Write-Host "Response: $($health | ConvertTo-Json)" -ForegroundColor White
} catch {
    Write-Host "❌ Backend is offline or unreachable" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "CRITICAL: Cannot proceed without backend access" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Check Registration Endpoint
Write-Host "TEST 2: Registration Endpoint Check" -ForegroundColor Yellow
Write-Host "------------------------------------" -ForegroundColor Yellow
$testEmail = "diagnostic-$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"
$registrationBody = @{
    email = $testEmail
    password = "TestPassword123!"
    full_name = "Diagnostic Test User"
    role = "MANUFACTURER"
    organization_name = "Test Organization"
    phone = "+1234567890"
} | ConvertTo-Json

Write-Host "Attempting registration with: $testEmail" -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registrationBody `
        -ErrorAction Stop
    
    Write-Host "✅ Registration endpoint is working" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  CHECK: Did you receive an email at $testEmail?" -ForegroundColor Yellow
    Write-Host "   If NO email received, Supabase credentials are likely missing" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Registration failed" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: Check Resend Verification Endpoint
Write-Host "TEST 3: Resend Verification Endpoint" -ForegroundColor Yellow
Write-Host "-------------------------------------" -ForegroundColor Yellow
$resendBody = @{
    email = $testEmail
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/auth/resend-verification" `
        -Method POST `
        -ContentType "application/json" `
        -Body $resendBody `
        -ErrorAction Stop
    
    Write-Host "✅ Resend verification endpoint is working" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  CHECK: Did you receive another email at $testEmail?" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Resend verification failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 4: Check Password Reset Endpoint
Write-Host "TEST 4: Password Reset Endpoint" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow
$resetBody = @{
    email = $testEmail
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/auth/request-password-reset" `
        -Method POST `
        -ContentType "application/json" `
        -Body $resetBody `
        -ErrorAction Stop
    
    Write-Host "✅ Password reset endpoint is working" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  CHECK: Did you receive a password reset email at $testEmail?" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Password reset failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Email: $testEmail" -ForegroundColor White
Write-Host ""
Write-Host "Expected Emails (if system is working):" -ForegroundColor Yellow
Write-Host "  1. Email Verification (from registration)" -ForegroundColor White
Write-Host "  2. Email Verification (from resend)" -ForegroundColor White
Write-Host "  3. Password Reset" -ForegroundColor White
Write-Host ""

Write-Host "CRITICAL CHECKS:" -ForegroundColor Red
Write-Host ""
Write-Host "1. Did you receive ANY emails?" -ForegroundColor Yellow
Write-Host "   YES → Email system is working!" -ForegroundColor Green
Write-Host "   NO  → Continue to step 2" -ForegroundColor Red
Write-Host ""

Write-Host "2. Check Supabase Credentials:" -ForegroundColor Yellow
Write-Host "   Go to: https://dashboard.render.com" -ForegroundColor White
Write-Host "   Select your backend service" -ForegroundColor White
Write-Host "   Go to Environment tab" -ForegroundColor White
Write-Host "   Check if these exist:" -ForegroundColor White
Write-Host "     - SUPABASE_URL" -ForegroundColor Cyan
Write-Host "     - SUPABASE_KEY" -ForegroundColor Cyan
Write-Host "     - SUPABASE_SERVICE_KEY" -ForegroundColor Cyan
Write-Host ""
Write-Host "   If ANY are missing → THIS IS THE PROBLEM!" -ForegroundColor Red
Write-Host ""

Write-Host "3. Check Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "   Go to: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "   Select project: aykzdgvdzmjhwsbjazon" -ForegroundColor White
Write-Host "   Go to: Authentication → Email Templates" -ForegroundColor White
Write-Host "   Verify these are enabled:" -ForegroundColor White
Write-Host "     - Confirm signup" -ForegroundColor Cyan
Write-Host "     - Reset password" -ForegroundColor Cyan
Write-Host ""
Write-Host "   If NOT enabled → Enable them!" -ForegroundColor Red
Write-Host ""

Write-Host "4. Check Supabase Logs:" -ForegroundColor Yellow
Write-Host "   Go to: Supabase Dashboard → Logs" -ForegroundColor White
Write-Host "   Filter by: auth" -ForegroundColor White
Write-Host "   Look for: email delivery events" -ForegroundColor White
Write-Host "   Check for: errors or failures" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "If NO emails received:" -ForegroundColor Red
Write-Host ""
Write-Host "1. Read: docs/EMAIL_SYSTEM_ROOT_CAUSE_AND_FIX.md" -ForegroundColor Yellow
Write-Host "2. Get Supabase credentials from dashboard" -ForegroundColor Yellow
Write-Host "3. Add to Render environment variables" -ForegroundColor Yellow
Write-Host "4. Redeploy backend" -ForegroundColor Yellow
Write-Host "5. Run this diagnostic again" -ForegroundColor Yellow
Write-Host ""

Write-Host "If emails ARE received:" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Email system is working correctly!" -ForegroundColor Green
Write-Host "   No action needed." -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
