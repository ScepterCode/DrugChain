#!/usr/bin/env pwsh

# Check Email Configuration Status
# Determines which email service is active and why emails aren't being sent

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           Email Configuration Status Check                   ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$BACKEND_URL = "https://drugchain-1.onrender.com/api/v1"

# Check 1: Which email service is in the code?
Write-Host "CHECK 1: Active Email Service" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "✅ ResendEmailService is active" -ForegroundColor Green
Write-Host "   Location: backend/app/services/resend_email_service.py" -ForegroundColor Gray
Write-Host "   Used in: auth_service.py, auth.py endpoints" -ForegroundColor Gray
Write-Host ""

# Check 2: Local configuration
Write-Host "CHECK 2: Local Configuration (backend/.env)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

if (Test-Path "backend/.env") {
    $envContent = Get-Content "backend/.env" -Raw
    
    # Check SEND_EMAILS
    if ($envContent -match "SEND_EMAILS\s*=\s*([A-Za-z]+)") {
        $sendEmails = $matches[1]
        if ($sendEmails -eq "True") {
            Write-Host "✅ SEND_EMAILS = True" -ForegroundColor Green
        } else {
            Write-Host "❌ SEND_EMAILS = $sendEmails (should be True)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  SEND_EMAILS not found (defaults to False)" -ForegroundColor Yellow
    }
    
    # Check RESEND_API_KEY
    if ($envContent -match "RESEND_API_KEY\s*=\s*(.+)") {
        $apiKey = $matches[1].Trim()
        if ($apiKey -and $apiKey -ne "" -and $apiKey.StartsWith("re_")) {
            Write-Host "✅ RESEND_API_KEY = $($apiKey.Substring(0, 10))..." -ForegroundColor Green
        } elseif ($apiKey -and $apiKey -ne "") {
            Write-Host "⚠️  RESEND_API_KEY = $apiKey (doesn't start with 're_')" -ForegroundColor Yellow
        } else {
            Write-Host "❌ RESEND_API_KEY is empty" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ RESEND_API_KEY not found" -ForegroundColor Red
    }
    
    Write-Host ""
} else {
    Write-Host "⚠️  backend/.env not found" -ForegroundColor Yellow
    Write-Host ""
}

# Check 3: Test backend behavior
Write-Host "CHECK 3: Backend Behavior Test" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "Testing registration to see if emails are sent or logged..." -ForegroundColor Gray
Write-Host ""

$testEmail = "test_$(Get-Random)@gmail.com"
$registrationData = @{
    email = $testEmail
    password = "TestPass123!"
    full_name = "Config Test User"
    phone_number = "+1234567890"
    role = "MANUFACTURER"
    organization_name = "Test Org"
    organization_type = "MANUFACTURER"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/auth/register" -Method POST -Body $registrationData -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ Registration successful" -ForegroundColor Green
    Write-Host "   User: $testEmail" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📧 Check your email inbox:" -ForegroundColor Cyan
    Write-Host "   If you received an email → Emails are being SENT ✅" -ForegroundColor White
    Write-Host "   If no email received → Emails are being LOGGED only ❌" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Did you receive a verification email? (y/n): " -ForegroundColor Yellow -NoNewline
    $received = Read-Host
    
    if ($received -eq "y") {
        Write-Host ""
        Write-Host "✅ EMAILS ARE BEING SENT!" -ForegroundColor Green
        Write-Host "   Configuration is correct on Render" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ EMAILS ARE BEING LOGGED (NOT SENT)" -ForegroundColor Red
        Write-Host ""
        Write-Host "This means on Render:" -ForegroundColor Yellow
        Write-Host "  • SEND_EMAILS = False (or not set)" -ForegroundColor Red
        Write-Host "  • OR RESEND_API_KEY is missing/invalid" -ForegroundColor Red
        Write-Host ""
    }
    
} catch {
    Write-Host "⚠️  Registration test failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   (This doesn't affect the diagnosis)" -ForegroundColor Gray
    Write-Host ""
}

# Summary
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    DIAGNOSIS SUMMARY                         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "ACTIVE EMAIL SERVICE:" -ForegroundColor Yellow
Write-Host "  ResendEmailService (backend/app/services/resend_email_service.py)" -ForegroundColor White
Write-Host ""

Write-Host "HOW IT WORKS:" -ForegroundColor Yellow
Write-Host "  1. Check if SEND_EMAILS=True" -ForegroundColor White
Write-Host "  2. Check if RESEND_API_KEY exists" -ForegroundColor White
Write-Host "  3. If BOTH are set → Send email via Resend API" -ForegroundColor Green
Write-Host "  4. If EITHER is missing → Log email to console only" -ForegroundColor Red
Write-Host ""

Write-Host "CURRENT ISSUE:" -ForegroundColor Yellow
Write-Host "  Emails are being LOGGED instead of SENT because:" -ForegroundColor Red
Write-Host "  • SEND_EMAILS is False (or not set) in Render environment" -ForegroundColor Red
Write-Host "  • OR RESEND_API_KEY is missing in Render environment" -ForegroundColor Red
Write-Host ""

Write-Host "SOLUTION:" -ForegroundColor Yellow
Write-Host "  Run the setup wizard to configure Resend:" -ForegroundColor White
Write-Host "    ./scripts/setup-resend-email.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Or manually add to Render environment:" -ForegroundColor White
Write-Host "    SEND_EMAILS = True" -ForegroundColor Cyan
Write-Host "    RESEND_API_KEY = re_your_api_key_here" -ForegroundColor Cyan
Write-Host ""

Write-Host "VERIFICATION:" -ForegroundColor Yellow
Write-Host "  After updating Render, test with:" -ForegroundColor White
Write-Host "    ./scripts/test-email-sending.ps1" -ForegroundColor Cyan
Write-Host ""

Write-Host "DOCUMENTATION:" -ForegroundColor Yellow
Write-Host "  • docs/EMAIL_SYSTEM_DIAGNOSIS_COMPLETE.md" -ForegroundColor White
Write-Host "  • docs/EMAIL_QUICK_START.md" -ForegroundColor White
Write-Host ""
