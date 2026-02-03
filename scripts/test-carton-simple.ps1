#!/usr/bin/env pwsh

# Simple test for carton codes blockchain integration
Write-Host "Testing Carton Codes Blockchain Integration" -ForegroundColor Cyan

$BACKEND_URL = "https://packguard-backend.onrender.com"

Write-Host "Backend URL: $BACKEND_URL"
Write-Host ""

# Test carton verification endpoint
Write-Host "Testing carton verification endpoint..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/verify/carton" -Method POST -ContentType "application/json" -Body '{"carton_id": "TEST-CARTON-001", "phone_number": "+1234567890"}'
    
    Write-Host "Carton verification response:"
    Write-Host "  Success: $($response.success)"
    Write-Host "  Result: $($response.verification_result)"
    Write-Host "  Message: $($response.message)"
    
} catch {
    Write-Host "Carton verification error (expected for unauthorized access):"
    Write-Host "  Error: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "Carton blockchain integration test complete!" -ForegroundColor Green