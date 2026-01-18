#!/usr/bin/env pwsh

Write-Host "=== BACKEND HEALTH CHECK ===" -ForegroundColor Cyan

# Test 1: Check if backend is responding
Write-Host "`n1. Testing Backend Health Endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "https://drugchain-backend.onrender.com/health" -Method GET -TimeoutSec 30
    Write-Host "✓ Backend Health: $($healthResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Check root endpoint
Write-Host "`n2. Testing Root Endpoint..." -ForegroundColor Yellow
try {
    $rootResponse = Invoke-RestMethod -Uri "https://drugchain-backend.onrender.com/" -Method GET -TimeoutSec 30
    Write-Host "✓ Root Endpoint: $($rootResponse.message)" -ForegroundColor Green
    Write-Host "  Version: $($rootResponse.version)" -ForegroundColor White
} catch {
    Write-Host "✗ Root Endpoint Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nBackend health check complete." -ForegroundColor Cyan