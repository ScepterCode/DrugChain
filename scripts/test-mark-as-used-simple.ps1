#!/usr/bin/env pwsh

# Simple test for Mark as Used functionality
Write-Host "🧪 TESTING MARK AS USED FUNCTIONALITY" -ForegroundColor Cyan

$BACKEND_URL = "https://packguard-backend.onrender.com"
$TEST_PACK_ID = "PK-1D69V2TF"

Write-Host "Testing with pack: $TEST_PACK_ID"
Write-Host ""

# Step 1: Verify pack
Write-Host "🔍 Step 1: Verify pack" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/verify/pack/$TEST_PACK_ID" -Method POST -ContentType "application/json" -Body '{"location": "Test", "phone_number": "+1234567890"}'
    
    Write-Host "✅ Verification successful"
    Write-Host "   Result: $($response.verification_result)"
    Write-Host "   Pack Status: $($response.data.pack_status)"
    Write-Host "   Is Used: $($response.data.is_used)"
    
} catch {
    Write-Host "❌ Verification failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Step 2: Mark as used
Write-Host "🔒 Step 2: Mark as used" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/verify/pack/$TEST_PACK_ID/mark-used-anonymous" -Method POST
    
    Write-Host "✅ Mark as used successful"
    Write-Host "   Message: $($response.message)"
    Write-Host "   Status: $($response.status)"
    Write-Host "   Blockchain Synced: $($response.blockchain_synced)"
    
} catch {
    Write-Host "❌ Mark as used failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Test complete!" -ForegroundColor Green