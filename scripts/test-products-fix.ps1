#!/usr/bin/env pwsh

# Test the products endpoint fixes

$baseUrl = "https://drugchain-backend.onrender.com/api/v1"

Write-Host "Testing Products Endpoint Fixes..." -ForegroundColor Green

# Test 1: Public products endpoint (should work without auth)
Write-Host "`nTest 1: Public Products Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/products/public" -Method GET
    Write-Host "✓ Public products endpoint works" -ForegroundColor Green
    Write-Host "Found $($response.Count) public products"
} catch {
    Write-Host "✗ Public products endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Register a distributor and test authenticated products endpoint
Write-Host "`nTest 2: Authenticated Products Endpoint (Distributor)" -ForegroundColor Yellow
$randomId = Get-Random
$userData = @{
    email = "test-dist-$randomId@example.com"
    password = "TestPass123"
    full_name = "Test Distributor"
    phone_number = "+234801234567$($randomId % 10)"
    role = "DISTRIBUTOR"
    organization_name = "Test Dist Co $randomId"
    organization_type = "DISTRIBUTOR"
    registration_number = "RC$randomId"
} | ConvertTo-Json

try {
    # Register user
    $authResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $userData -ContentType "application/json"
    $token = $authResponse.data.access_token
    
    Write-Host "✓ Distributor registered successfully" -ForegroundColor Green
    
    # Test authenticated products endpoint
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $productsResponse = Invoke-RestMethod -Uri "$baseUrl/products" -Method GET -Headers $headers
    Write-Host "✓ Authenticated products endpoint works for distributor" -ForegroundColor Green
    Write-Host "Found $($productsResponse.Count) products"
    
} catch {
    Write-Host "✗ Authenticated products test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Register a pharmacy and test authenticated products endpoint
Write-Host "`nTest 3: Authenticated Products Endpoint (Pharmacy)" -ForegroundColor Yellow
$randomId2 = Get-Random
$pharmacyData = @{
    email = "test-pharmacy-$randomId2@example.com"
    password = "TestPass123"
    full_name = "Test Pharmacy"
    phone_number = "+234801234567$($randomId2 % 10)"
    role = "PHARMACY"
    organization_name = "Test Pharmacy $randomId2"
    organization_type = "PHARMACY"
    registration_number = "RC$randomId2"
} | ConvertTo-Json

try {
    # Register pharmacy user
    $authResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $pharmacyData -ContentType "application/json"
    $token = $authResponse.data.access_token
    
    Write-Host "✓ Pharmacy registered successfully" -ForegroundColor Green
    
    # Test authenticated products endpoint
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $productsResponse = Invoke-RestMethod -Uri "$baseUrl/products" -Method GET -Headers $headers
    Write-Host "✓ Authenticated products endpoint works for pharmacy" -ForegroundColor Green
    Write-Host "Found $($productsResponse.Count) products"
    
} catch {
    Write-Host "✗ Pharmacy products test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nProducts endpoint tests completed!" -ForegroundColor Green