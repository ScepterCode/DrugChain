#!/usr/bin/env pwsh

# Deep Email System Diagnostic
# Comprehensive check of the entire email verification flow

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEEP EMAIL SYSTEM DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$BACKEND_URL = "https://drugchain-1.onrender.com/api/v1"
$issues = @()
$checks = @()

# Test 1: Check if backend is responding
Write-Host "TEST 1: Backend Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BACKEND_URL/../health" -Method GET -TimeoutSec 10
    Write-Host "✅ Backend is responding" -ForegroundColor Green
    $checks += "Backend Health: PASS"
} catch {
    Write-Host "❌ Backend is not responding: $($_.Exception.Message)" -ForegroundColor Red
    $issues += "Backend not responding"
    $checks += "Backend Health: FAIL"
}
Write-Host ""

# Test 2: Test Registration Endpoint
Write-Host "TEST 2: Registration Endpoint Test" -ForegroundColor Yellow
$testEmail = "test_$(Get-Random)@packguard.test"
$registrationData = @{
    email = $testEmail
    password = "TestPass123!"
    full_name = "Test User"
    phone_number = "+1234567890"
    role = "MANUFACTURER"
    organization_name = "Test Org"
    organization_type = "MANUFACTURER"
} | ConvertTo-Json

try {
    $regResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/register" -Method POST -Body $registrationData -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ Registration endpoint works" -ForegroundColor Green
    Write-Host "   Response: $($regResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
    $checks += "Registration: PASS"
    
    # Check if email verification fields exist
    if ($regResponse.data.user) {
        Write-Host "   User created: $($regResponse.data.user.email)" -ForegroundColor Gray
        Write-Host "   Is Verified: $($regResponse.data.user.is_verified)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    $issues += "Registration endpoint error"
    $checks += "Registration: FAIL"
    
    # Try to get more details
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Error details: $responseBody" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: Test Resend Verification Endpoint
Write-Host "TEST 3: Resend Verification Endpoint" -ForegroundColor Yellow
$resendData = @{
    email = "test@example.com"
} | ConvertTo-Json

try {
    $resendResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/resend-verification" -Method POST -Body $resendData -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ Resend verification endpoint works" -ForegroundColor Green
    Write-Host "   Response: $($resendResponse | ConvertTo-Json)" -ForegroundColor Gray
    $checks += "Resend Verification: PASS"
} catch {
    Write-Host "❌ Resend verification failed: $($_.Exception.Message)" -ForegroundColor Red
    $issues += "Resend verification endpoint error"
    $checks += "Resend Verification: FAIL"
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 422) {
            Write-Host "   ⚠️  422 Error: Request format issue (should be fixed)" -ForegroundColor Yellow
        }
    }
}
Write-Host ""

# Test 4: Check Environment Variables
Write-Host "TEST 4: Environment Configuration Check" -ForegroundColor Yellow
Write-Host "Checking if Supabase credentials are configured..." -ForegroundColor Gray

# We can't directly check env vars on Render, but we can infer from behavior
Write-Host "⚠️  Cannot directly check Render environment variables" -ForegroundColor Yellow
Write-Host "   Required variables:" -ForegroundColor Gray
Write-Host "   - SUPABASE_URL" -ForegroundColor Gray
Write-Host "   - SUPABASE_KEY" -ForegroundColor Gray
Write-Host "   - SUPABASE_JWT_SECRET" -ForegroundColor Gray
Write-Host ""
Write-Host "   To verify, check Render Dashboard → Environment" -ForegroundColor Cyan
$checks += "Environment Check: MANUAL REQUIRED"
Write-Host ""

# Test 5: Check Database Schema
Write-Host "TEST 5: Database Schema Check" -ForegroundColor Yellow
Write-Host "⚠️  Cannot directly query Supabase from PowerShell" -ForegroundColor Yellow
Write-Host "   Required columns in 'users' table:" -ForegroundColor Gray
Write-Host "   - email_verification_token (VARCHAR)" -ForegroundColor Gray
Write-Host "   - email_verification_token_expires (TIMESTAMP)" -ForegroundColor Gray
Write-Host "   - password_reset_token (VARCHAR)" -ForegroundColor Gray
Write-Host "   - password_reset_token_expires (TIMESTAMP)" -ForegroundColor Gray
Write-Host ""
Write-Host "   To verify, run in Supabase SQL Editor:" -ForegroundColor Cyan
Write-Host "   SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';" -ForegroundColor White
$checks += "Database Schema: MANUAL REQUIRED"
Write-Host ""

# Test 6: Check Supabase Auth Settings
Write-Host "TEST 6: Supabase Auth Configuration" -ForegroundColor Yellow
Write-Host "⚠️  Manual check required in Supabase Dashboard" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Required Settings:" -ForegroundColor Gray
Write-Host "   1. Authentication → Settings → Email Auth: ENABLED" -ForegroundColor White
Write-Host "   2. Authentication → Settings → Confirm Email: ENABLED" -ForegroundColor White
Write-Host "   3. Authentication → Email Templates: Configured" -ForegroundColor White
Write-Host "   4. Project Settings → API: Valid keys present" -ForegroundColor White
Write-Host ""
$checks += "Supabase Auth: MANUAL REQUIRED"

# Test 7: Check Email Provider
Write-Host "TEST 7: Email Provider Configuration" -ForegroundColor Yellow
Write-Host "⚠️  Manual check required in Supabase Dashboard" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Supabase Email Options:" -ForegroundColor Gray
Write-Host "   1. Built-in (Limited to 3 emails/hour in free tier)" -ForegroundColor White
Write-Host "   2. Custom SMTP (Recommended for production)" -ForegroundColor White
Write-Host ""
Write-Host "   To check: Project Settings → Auth → SMTP Settings" -ForegroundColor Cyan
$checks += "Email Provider: MANUAL REQUIRED"
Write-Host ""

# Test 8: Test Password Reset Flow
Write-Host "TEST 8: Password Reset Endpoint" -ForegroundColor Yellow
$resetData = @{
    email = "test@example.com"
} | ConvertTo-Json

try {
    $resetResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/request-password-reset" -Method POST -Body $resetData -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ Password reset endpoint works" -ForegroundColor Green
    Write-Host "   Response: $($resetResponse | ConvertTo-Json)" -ForegroundColor Gray
    $checks += "Password Reset: PASS"
} catch {
    Write-Host "❌ Password reset failed: $($_.Exception.Message)" -ForegroundColor Red
    $issues += "Password reset endpoint error"
    $checks += "Password Reset: FAIL"
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Test Results:" -ForegroundColor Yellow
foreach ($check in $checks) {
    if ($check -like "*PASS*") {
        Write-Host "  ✅ $check" -ForegroundColor Green
    } elseif ($check -like "*FAIL*") {
        Write-Host "  ❌ $check" -ForegroundColor Red
    } else {
        Write-Host "  ⚠️  $check" -ForegroundColor Yellow
    }
}
Write-Host ""

if ($issues.Count -gt 0) {
    Write-Host "Issues Found:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  • $issue" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. MANUAL CHECKS REQUIRED:" -ForegroundColor Yellow
Write-Host "   a) Verify Supabase environment variables in Render" -ForegroundColor White
Write-Host "   b) Check database schema has email verification columns" -ForegroundColor White
Write-Host "   c) Verify Supabase Auth is enabled and configured" -ForegroundColor White
Write-Host "   d) Check email provider settings in Supabase" -ForegroundColor White
Write-Host ""

Write-Host "2. COMMON ISSUES:" -ForegroundColor Yellow
Write-Host "   • Missing SUPABASE_URL or SUPABASE_KEY in Render env" -ForegroundColor White
Write-Host "   • Email confirmation not enabled in Supabase Auth" -ForegroundColor White
Write-Host "   • Database columns missing (need migration)" -ForegroundColor White
Write-Host "   • Supabase free tier email limit (3/hour)" -ForegroundColor White
Write-Host "   • Custom SMTP not configured" -ForegroundColor White
Write-Host ""

Write-Host "3. RECOMMENDED ACTIONS:" -ForegroundColor Yellow
Write-Host "   1. Check Render logs for email-related errors" -ForegroundColor White
Write-Host "   2. Verify Supabase Dashboard → Authentication → Users" -ForegroundColor White
Write-Host "   3. Test with a real email address (not @test)" -ForegroundColor White
Write-Host "   4. Check Supabase logs for email delivery attempts" -ForegroundColor White
Write-Host ""

Write-Host "Diagnostic complete!" -ForegroundColor Cyan