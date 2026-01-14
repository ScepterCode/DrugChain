# Test PackGuard Backend APIs
Write-Host "Testing PackGuard Backend APIs..." -ForegroundColor Green

$baseUrl = "https://drugchain-backend.onrender.com/api/v1"

# Test 1: Root endpoint
Write-Host "`n1. Testing Root Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://drugchain-backend.onrender.com/" -Method GET
    if ($response.message -eq "PackGuard API") {
        Write-Host "✓ Root endpoint updated to PackGuard" -ForegroundColor Green
    } else {
        Write-Host "⚠ Root endpoint: $($response.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Root endpoint failed" -ForegroundColor Red
}

# Test 2: Categories API
Write-Host "`n2. Testing Categories API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/categories/" -Method GET
    Write-Host "✓ Categories API: Found $($response.Count) categories" -ForegroundColor Green
} catch {
    Write-Host "✗ Categories API failed" -ForegroundColor Red
}

# Test 3: Industries API
Write-Host "`n3. Testing Industries API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/categories/industries" -Method GET
    Write-Host "✓ Industries API: $($response -join ', ')" -ForegroundColor Green
} catch {
    Write-Host "✗ Industries API failed" -ForegroundColor Red
}

# Test 4: Electronics API
Write-Host "`n4. Testing Electronics API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/electronics/recalls" -Method GET
    Write-Host "✓ Electronics API accessible" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -match "404") {
        Write-Host "⚠ Electronics API not yet deployed" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Electronics API failed" -ForegroundColor Red
    }
}

# Test 5: Luxury API
Write-Host "`n5. Testing Luxury API..." -ForegroundColor Yellow
try {
    $testData = @{
        product_id = "123e4567-e89b-12d3-a456-426614174000"
        pack_id = "PACK123456"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/luxury/authenticity-certificate" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "✓ Luxury API accessible" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -match "404") {
        Write-Host "⚠ Luxury API not yet deployed" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Luxury API failed" -ForegroundColor Red
    }
}

# Test 6: Enhanced Verification
Write-Host "`n6. Testing Enhanced Verification..." -ForegroundColor Yellow
try {
    $testData = @{
        pack_id = "PACK123456"
        verification_type = "enhanced"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/verify/enhanced" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "✓ Enhanced verification accessible" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -match "404") {
        Write-Host "⚠ Enhanced verification not yet deployed" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Enhanced verification failed" -ForegroundColor Red
    }
}

Write-Host "`n=== Backend API Test Complete ===" -ForegroundColor Green