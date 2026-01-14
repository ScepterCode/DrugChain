#!/usr/bin/env pwsh

# Test registration endpoint with various scenarios

$baseUrl = "https://drugchain-backend.onrender.com/api/v1"

Write-Host "Testing DrugChain Registration Endpoint..." -ForegroundColor Green

# Test 1: Valid manufacturer registration
Write-Host "`nTest 1: Valid Manufacturer Registration" -ForegroundColor Yellow
$manufacturerData = @{
    email = "test-manufacturer@example.com"
    password = "TestPass123"
    full_name = "Test Manufacturer"
    phone_number = "+2348012345678"
    role = "MANUFACTURER"
    organization_name = "Test Pharma Ltd"
    organization_type = "MANUFACTURER"
    registration_number = "RC123456"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $manufacturerData -ContentType "application/json"
    Write-Host "✓ Manufacturer registration successful" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "✗ Manufacturer registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 2: Valid distributor registration
Write-Host "`nTest 2: Valid Distributor Registration" -ForegroundColor Yellow
$distributorData = @{
    email = "test-distributor@example.com"
    password = "TestPass123"
    full_name = "Test Distributor"
    phone_number = "+2348012345679"
    role = "DISTRIBUTOR"
    organization_name = "Test Distribution Co"
    organization_type = "DISTRIBUTOR"
    registration_number = "RC789012"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $distributorData -ContentType "application/json"
    Write-Host "✓ Distributor registration successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Distributor registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 3: Invalid password (should fail)
Write-Host "`nTest 3: Invalid Password (should fail)" -ForegroundColor Yellow
$invalidPasswordData = @{
    email = "test-invalid@example.com"
    password = "weak"
    full_name = "Test User"
    role = "MANUFACTURER"
    organization_name = "Test Org"
    organization_type = "MANUFACTURER"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $invalidPasswordData -ContentType "application/json"
    Write-Host "✗ Should have failed with weak password" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly rejected weak password: $($_.Exception.Message)" -ForegroundColor Green
}

# Test 4: Mismatched role and organization_type (should fail)
Write-Host "`nTest 4: Mismatched Role and Organization Type (should fail)" -ForegroundColor Yellow
$mismatchedData = @{
    email = "test-mismatch@example.com"
    password = "TestPass123"
    full_name = "Test User"
    role = "DISTRIBUTOR"
    organization_name = "Test Org"
    organization_type = "MANUFACTURER"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $mismatchedData -ContentType "application/json"
    Write-Host "✗ Should have failed with mismatched types" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly handled mismatched role/org type: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`nRegistration tests completed!" -ForegroundColor Green