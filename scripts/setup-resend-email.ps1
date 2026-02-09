#!/usr/bin/env pwsh

# Quick Setup Script for Resend Email Service
# This script helps you configure email sending in 5 minutes

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         PackGuard Email Setup - Resend Configuration         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you enable email sending using Resend." -ForegroundColor White
Write-Host ""

# Step 1: Check if user has Resend account
Write-Host "STEP 1: Resend Account" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "Do you have a Resend account? (y/n): " -ForegroundColor White -NoNewline
$hasAccount = Read-Host

if ($hasAccount -ne "y") {
    Write-Host ""
    Write-Host "Please follow these steps:" -ForegroundColor Cyan
    Write-Host "1. Go to https://resend.com" -ForegroundColor White
    Write-Host "2. Click 'Sign Up' (free account)" -ForegroundColor White
    Write-Host "3. Verify your email" -ForegroundColor White
    Write-Host "4. Come back and run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to open Resend in your browser..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Start-Process "https://resend.com"
    exit 0
}

# Step 2: Get API Key
Write-Host ""
Write-Host "STEP 2: Get Your API Key" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "To get your Resend API key:" -ForegroundColor Cyan
Write-Host "1. Go to https://resend.com/api-keys" -ForegroundColor White
Write-Host "2. Click 'Create API Key'" -ForegroundColor White
Write-Host "3. Name it 'PackGuard Backend'" -ForegroundColor White
Write-Host "4. Copy the key (starts with 're_')" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to open Resend API Keys page..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "https://resend.com/api-keys"
Write-Host ""

Write-Host "Enter your Resend API Key: " -ForegroundColor White -NoNewline
$apiKey = Read-Host

if (-not $apiKey -or -not $apiKey.StartsWith("re_")) {
    Write-Host ""
    Write-Host "❌ Invalid API key. It should start with 're_'" -ForegroundColor Red
    Write-Host "Please run this script again with a valid API key." -ForegroundColor Yellow
    exit 1
}

# Step 3: Configure From Email
Write-Host ""
Write-Host "STEP 3: Configure From Email" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "What email address should emails come from?" -ForegroundColor White
Write-Host "(Default: noreply@packguard.org): " -ForegroundColor Gray -NoNewline
$fromEmail = Read-Host

if (-not $fromEmail) {
    $fromEmail = "noreply@packguard.org"
}

Write-Host ""
Write-Host "What name should appear as sender?" -ForegroundColor White
Write-Host "(Default: PackGuard): " -ForegroundColor Gray -NoNewline
$fromName = Read-Host

if (-not $fromName) {
    $fromName = "PackGuard"
}

# Step 4: Update Local .env
Write-Host ""
Write-Host "STEP 4: Update Local Configuration" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

$envPath = "backend/.env"
if (Test-Path $envPath) {
    Write-Host "Updating $envPath..." -ForegroundColor Cyan
    
    $envContent = Get-Content $envPath -Raw
    
    # Update SEND_EMAILS
    if ($envContent -match "SEND_EMAILS=.*") {
        $envContent = $envContent -replace "SEND_EMAILS=.*", "SEND_EMAILS=True"
    } else {
        $envContent += "`nSEND_EMAILS=True"
    }
    
    # Add RESEND_API_KEY
    if ($envContent -match "RESEND_API_KEY=.*") {
        $envContent = $envContent -replace "RESEND_API_KEY=.*", "RESEND_API_KEY=$apiKey"
    } else {
        $envContent += "`nRESEND_API_KEY=$apiKey"
    }
    
    # Update MAIL_FROM
    if ($envContent -match "MAIL_FROM=.*") {
        $envContent = $envContent -replace "MAIL_FROM=.*", "MAIL_FROM=$fromEmail"
    }
    
    # Update MAIL_FROM_NAME
    if ($envContent -match "MAIL_FROM_NAME=.*") {
        $envContent = $envContent -replace "MAIL_FROM_NAME=.*", "MAIL_FROM_NAME=$fromName"
    }
    
    # Update FRONTEND_URL
    if ($envContent -match "FRONTEND_URL=http://localhost:5173") {
        $envContent = $envContent -replace "FRONTEND_URL=http://localhost:5173", "FRONTEND_URL=https://packguard.vercel.app"
    }
    
    Set-Content -Path $envPath -Value $envContent
    Write-Host "✅ Local .env updated" -ForegroundColor Green
} else {
    Write-Host "⚠️  backend/.env not found" -ForegroundColor Yellow
}

# Step 5: Render Configuration
Write-Host ""
Write-Host "STEP 5: Update Render Environment" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "Now you need to update Render environment variables:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to https://dashboard.render.com" -ForegroundColor White
Write-Host "2. Select your backend service (drugchain-1)" -ForegroundColor White
Write-Host "3. Go to 'Environment' tab" -ForegroundColor White
Write-Host "4. Add/Update these variables:" -ForegroundColor White
Write-Host ""
Write-Host "   SEND_EMAILS = True" -ForegroundColor Yellow
Write-Host "   RESEND_API_KEY = $apiKey" -ForegroundColor Yellow
Write-Host "   MAIL_FROM = $fromEmail" -ForegroundColor Yellow
Write-Host "   MAIL_FROM_NAME = $fromName" -ForegroundColor Yellow
Write-Host "   FRONTEND_URL = https://packguard.vercel.app" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Click 'Save Changes'" -ForegroundColor White
Write-Host "6. Render will automatically redeploy" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to open Render Dashboard..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "https://dashboard.render.com"

# Step 6: Test
Write-Host ""
Write-Host "STEP 6: Test Email Sending" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "After Render finishes redeploying (2-3 minutes):" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test with this command:" -ForegroundColor White
Write-Host "  ./scripts/test-registration.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Or test manually:" -ForegroundColor White
Write-Host "  1. Go to https://packguard.vercel.app/register" -ForegroundColor Yellow
Write-Host "  2. Register with your real email" -ForegroundColor Yellow
Write-Host "  3. Check your inbox for verification email" -ForegroundColor Yellow
Write-Host ""

# Summary
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    SETUP COMPLETE!                           ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Local .env updated" -ForegroundColor Green
Write-Host "⏳ Waiting for Render redeploy" -ForegroundColor Yellow
Write-Host "📧 Emails will be sent via Resend" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration Summary:" -ForegroundColor Cyan
Write-Host "  API Key: $($apiKey.Substring(0, 10))..." -ForegroundColor Gray
Write-Host "  From: $fromName <$fromEmail>" -ForegroundColor Gray
Write-Host "  Frontend: https://packguard.vercel.app" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Wait for Render to finish redeploying" -ForegroundColor White
Write-Host "  2. Run: ./scripts/test-registration.ps1" -ForegroundColor White
Write-Host "  3. Check your email inbox" -ForegroundColor White
Write-Host ""
Write-Host "Need help? Check docs/EMAIL_SYSTEM_DIAGNOSIS_COMPLETE.md" -ForegroundColor Cyan
Write-Host ""
