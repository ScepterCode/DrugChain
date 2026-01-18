#!/usr/bin/env pwsh

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRODUCTION DEPLOYMENT VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Test 1: Backend Health
Write-Host "`n[1/6] Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "https://drugchain-backend.onrender.com/health" -TimeoutSec 30
    Write-Host "  ✓ Backend is responding" -ForegroundColor Green
    Write-Host "    Status: $($health.status)" -ForegroundColor White
    Write-Host "    Service: $($health.service)" -ForegroundColor White
} catch {
    Write-Host "  ✗ Backend health check failed" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Backend Version
Write-Host "`n[2/6] Checking Backend Version..." -ForegroundColor Yellow
try {
    $root = Invoke-RestMethod -Uri "https://drugchain-backend.onrender.com/" -TimeoutSec 30
    Write-Host "  Version: $($root.version)" -ForegroundColor White
    Write-Host "  Message: $($root.message)" -ForegroundColor White
    Write-Host "  Description: $($root.description)" -ForegroundColor White
    
    if ($root.message -eq "PackGuard API") {
        Write-Host "  ✓ Backend shows updated branding" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Backend may be running old code" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ Version check failed" -ForegroundColor Red
}

# Test 3: CORS Configuration
Write-Host "`n[3/6] Testing CORS Configuration..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://drugchain-backend.onrender.com/health" `
                                  -Headers @{"Origin"="https://drug-chain.vercel.app"} `
                                  -Method GET -TimeoutSec 30
    
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-Host "  ✓ CORS header present: $corsHeader" -ForegroundColor Green
        if ($corsHeader -eq "https://drug-chain.vercel.app" -or $corsHeader -eq "*") {
            Write-Host "  ✓ CORS properly configured" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ CORS header unexpected value" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ✗ CORS header NOT FOUND" -ForegroundColor Red
        Write-Host "  ⚠ Backend changes NOT deployed!" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ CORS test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Frontend Accessibility
Write-Host "`n[4/6] Testing Frontend..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "https://drug-chain.vercel.app" -TimeoutSec 30
    Write-Host "  ✓ Frontend is accessible" -ForegroundColor Green
    Write-Host "    Status: $($frontend.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "  ✗ Frontend not accessible" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Backend Wake-up Time
Write-Host "`n[5/6] Testing Backend Response Time..." -ForegroundColor Yellow
$startTime = Get-Date
try {
    $response = Invoke-RestMethod -Uri "https://drugchain-backend.onrender.com/health" -TimeoutSec 60
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host "  Response time: $([math]::Round($duration, 2)) seconds" -ForegroundColor White
    
    if ($duration -lt 2) {
        Write-Host "  ✓ Backend is warm (fast response)" -ForegroundColor Green
    } elseif ($duration -lt 30) {
        Write-Host "  ⚠ Backend was sleeping (cold start)" -ForegroundColor Yellow
    } else {
        Write-Host "  ⚠ Backend very slow (may have issues)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ Response time test failed" -ForegroundColor Red
}

# Test 6: Git Status
Write-Host "`n[6/6] Checking Git Status..." -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "  ⚠ Uncommitted changes detected:" -ForegroundColor Yellow
        Write-Host $gitStatus -ForegroundColor White
    } else {
        Write-Host "  ✓ Working directory clean" -ForegroundColor Green
    }
    
    $gitLog = git log --oneline -1
    Write-Host "  Latest commit: $gitLog" -ForegroundColor White
    
    # Check if local is ahead of remote
    $ahead = git rev-list --count origin/master..HEAD
    if ($ahead -gt 0) {
        Write-Host "  ⚠ Local is $ahead commit(s) ahead of remote" -ForegroundColor Yellow
        Write-Host "    Run: git push origin master" -ForegroundColor White
    } else {
        Write-Host "  ✓ Local and remote are in sync" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠ Git status check failed" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT STATUS SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nIf CORS header is NOT FOUND:" -ForegroundColor Yellow
Write-Host "  1. Backend changes are NOT deployed to Render" -ForegroundColor White
Write-Host "  2. Go to https://dashboard.render.com" -ForegroundColor White
Write-Host "  3. Find 'drugchain-backend' service" -ForegroundColor White
Write-Host "  4. Click 'Manual Deploy' → 'Deploy latest commit'" -ForegroundColor White
Write-Host "  5. Wait 5-10 minutes for deployment" -ForegroundColor White
Write-Host "  6. Run this script again to verify" -ForegroundColor White

Write-Host "`nIf Frontend issues persist:" -ForegroundColor Yellow
Write-Host "  1. Check Vercel dashboard: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "  2. Find 'drug-chain' project" -ForegroundColor White
Write-Host "  3. Check latest deployment status" -ForegroundColor White
Write-Host "  4. If needed, trigger manual redeploy" -ForegroundColor White
Write-Host "  5. Clear browser cache completely" -ForegroundColor White

Write-Host "`n========================================" -ForegroundColor Cyan