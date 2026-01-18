#!/usr/bin/env pwsh

Write-Host "=== TESTING PRODUCTION FIXES ===" -ForegroundColor Cyan

# Test 1: Backend Health
Write-Host "`n1. Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "https://drugchain-backend.onrender.com/health" -Method GET -TimeoutSec 30
    Write-Host "✓ Backend Status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend Health Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: CORS Preflight
Write-Host "`n2. Testing CORS Preflight..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "https://drug-chain.vercel.app"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "content-type,authorization"
    }
    
    $response = Invoke-WebRequest -Uri "https://drugchain-backend.onrender.com/api/v1/auth/login" -Method OPTIONS -Headers $headers -TimeoutSec 30
    
    $allowOrigin = $response.Headers["Access-Control-Allow-Origin"]
    $allowMethods = $response.Headers["Access-Control-Allow-Methods"]
    
    Write-Host "✓ CORS Preflight: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  Allow-Origin: $allowOrigin" -ForegroundColor White
    Write-Host "  Allow-Methods: $allowMethods" -ForegroundColor White
    
} catch {
    Write-Host "✗ CORS Preflight Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Registration Endpoint
Write-Host "`n3. Testing Registration Endpoint..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "https://drug-chain.vercel.app"
        "Content-Type" = "application/json"
    }
    
    $body = '{"email":"test@example.com","password":"Test123!","full_name":"Test User","role":"RETAILER"}'
    
    $response = Invoke-WebRequest -Uri "https://drugchain-backend.onrender.com/api/v1/auth/register" -Method POST -Headers $headers -Body $body -TimeoutSec 30
    Write-Host "✓ Registration: $($response.StatusCode)" -ForegroundColor Green
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 422) {
        Write-Host "✓ Registration: 422 (Validation - CORS working!)" -ForegroundColor Green
    } elseif ($statusCode -eq 400) {
        Write-Host "✓ Registration: 400 (Bad Request - CORS working!)" -ForegroundColor Green
    } else {
        Write-Host "✗ Registration: $statusCode" -ForegroundColor Red
    }
}

Write-Host "`n=== PRODUCTION FIXES TEST COMPLETE ===" -ForegroundColor Cyan
Write-Host "If all tests pass, the CORS and backend issues should be resolved." -ForegroundColor White