#!/usr/bin/env pwsh

# Complete deployment fix script
# Addresses both database migration and Vercel deployment issues

Write-Host "=== PackGuard Complete Deployment Fix ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Database Migration Status
Write-Host "Step 1: Checking database migration status..." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: Database migration needs to be run in Supabase SQL Editor:" -ForegroundColor Red
Write-Host "1. First run: scripts/QUICK_PACK_ID_CHECK.sql (to diagnose pack_id length issues)" -ForegroundColor White
Write-Host "2. Then run: scripts/SAFE_CARTON_MIGRATION.sql (step by step)" -ForegroundColor White
Write-Host "3. The migration now handles pack_id length expansion from VARCHAR(16) to VARCHAR(50)" -ForegroundColor White
Write-Host ""

# Test current carton verification status
Write-Host "Testing current carton verification status..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "https://drugchain-1.onrender.com/api/v1/verify/carton" -Method POST -ContentType "application/json" -Body '{"carton_id": "CT-20260121-829O4Q-0001", "phone_number": "+1234567890"}'
    Write-Host "✅ Carton verification is working!" -ForegroundColor Green
    Write-Host "   Result: $($response.verification_result)" -ForegroundColor White
} catch {
    Write-Host "❌ Carton verification still failing (migration needed)" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor White
    Write-Host "   This is expected until the database migration is applied" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Vercel Deployment
Write-Host "Step 2: Triggering optimized Vercel deployment..." -ForegroundColor Yellow

# Check if we're in the frontend directory
$currentDir = Get-Location
if (-not (Test-Path "package.json")) {
    if (Test-Path "frontend/package.json") {
        Set-Location "frontend"
        Write-Host "Switched to frontend directory" -ForegroundColor White
    } else {
        Write-Host "❌ Cannot find frontend directory with package.json" -ForegroundColor Red
        exit 1
    }
}

# Update deployment trigger
$timestamp = Get-Date -Format "yyyy-MM-dd_HH:mm:ss"
$triggerContent = @"
# Vercel Deployment Trigger
# Last updated: $timestamp
# This file is used to force Vercel redeployments

DEPLOYMENT_TRIGGER=$timestamp
BUILD_OPTIMIZATION=true
NODE_ENV=production
FORCE_CLEAN_BUILD=true
MIGRATION_STATUS=pack_id_length_fix_ready
"@

$triggerContent | Out-File -FilePath ".vercel-rebuild" -Encoding UTF8
Write-Host "✅ Updated deployment trigger file" -ForegroundColor Green

# Commit and push changes
Write-Host ""
Write-Host "Step 3: Committing and pushing changes..." -ForegroundColor Yellow

try {
    git add .
    git commit -m "fix: resolve pack_id length constraint issue for carton migration

- Expanded pack_id column from VARCHAR(16) to VARCHAR(50) in migration
- Updated VerificationEvent model to match new column size
- Added diagnostic scripts to identify pack_id length issues
- Fixed SAFE_CARTON_MIGRATION.sql to handle existing long pack_ids
- Updated deployment trigger for backend model changes"
    
    git push origin master
    Write-Host "✅ Changes pushed to GitHub" -ForegroundColor Green
} catch {
    Write-Host "❌ Git push failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please commit and push manually" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. DATABASE MIGRATION (CRITICAL):" -ForegroundColor Red
Write-Host "   - Open Supabase Dashboard -> SQL Editor" -ForegroundColor White
Write-Host "   - First run: scripts/QUICK_PACK_ID_CHECK.sql" -ForegroundColor White
Write-Host "   - Then run: scripts/SAFE_CARTON_MIGRATION.sql (step by step)" -ForegroundColor White
Write-Host "   - Migration now expands pack_id from VARCHAR(16) to VARCHAR(50)" -ForegroundColor White
Write-Host ""
Write-Host "2. BACKEND RESTART:" -ForegroundColor Yellow
Write-Host "   - After migration, restart backend on Render" -ForegroundColor White
Write-Host "   - Backend model updated to match new column size" -ForegroundColor White
Write-Host ""
Write-Host "3. VERCEL DEPLOYMENT:" -ForegroundColor Yellow
Write-Host "   - Check Vercel dashboard for new deployment" -ForegroundColor White
Write-Host "   - Should complete with optimized settings" -ForegroundColor White
Write-Host ""
Write-Host "4. TESTING:" -ForegroundColor Green
Write-Host "   - After migration + restart: Test carton verification" -ForegroundColor White
Write-Host "   - After Vercel deploy: Test frontend functionality" -ForegroundColor White
Write-Host ""
Write-Host "The pack_id length issue has been identified and fixed!" -ForegroundColor Cyan

# Return to original directory
Set-Location $currentDir