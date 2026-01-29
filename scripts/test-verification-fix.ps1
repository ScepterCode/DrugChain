#!/usr/bin/env pwsh

Write-Host "=== Testing Verification Fix - Product Details Display ===" -ForegroundColor Cyan

$baseUrl = "https://drugchain-1.onrender.com/api/v1"

Write-Host "`n1. Checking available products..." -ForegroundColor Yellow

try {
    $products = Invoke-RestMethod -Uri "$baseUrl/products/public" -Method GET
    Write-Host "Found $($products.Count) products" -ForegroundColor Green
    
    if ($products.Count -gt 0) {
        Write-Host "Sample product:" -ForegroundColor Gray
        $products[0] | ConvertTo-Json -Depth 2
    }
} catch {
    Write-Host "❌ Failed to get products: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing verification endpoint with invalid pack ID..." -ForegroundColor Yellow

try {
    $verifyData = @{
        pack_id = "PK-INVALID-TEST"
        location = "Test Location"
        phone_number = "+2348012345678"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/verify/pack" -Method POST -Body $verifyData -ContentType "application/json"
    
    Write-Host "✅ Verification endpoint working!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $response | ConvertTo-Json -Depth 3
    
} catch {
    Write-Host "❌ Verification failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error details: $errorBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error details" -ForegroundColor Red
        }
    }
}

Write-Host "`n3. Testing with different pack ID formats..." -ForegroundColor Yellow

$testPackIds = @(
    "PK-TEST-001",
    "AX7K9M2P5N8Q3R1T",
    "PK-DEMO-123",
    "TEST-PACK-001"
)

foreach ($packId in $testPackIds) {
    try {
        Write-Host "Testing pack ID: $packId" -ForegroundColor Gray
        
        $verifyData = @{
            pack_id = $packId
            location = "Test Location"
            phone_number = "+2348012345678"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/verify/pack" -Method POST -Body $verifyData -ContentType "application/json"
        
        Write-Host "  ✅ Response received" -ForegroundColor Green
        Write-Host "  Result: $($response.verification_result)" -ForegroundColor Gray
        Write-Host "  Message: $($response.message)" -ForegroundColor Gray
        
        if ($response.data) {
            Write-Host "  Product: $($response.data.product_name)" -ForegroundColor Gray
            Write-Host "  Manufacturer: $($response.data.manufacturer)" -ForegroundColor Gray
            Write-Host "  Brand: $($response.data.brand_name)" -ForegroundColor Gray
            Write-Host "  Dosage: $($response.data.dosage)" -ForegroundColor Gray
            Write-Host "  Form: $($response.data.form)" -ForegroundColor Gray
            Write-Host "  Country: $($response.data.country_of_origin)" -ForegroundColor Gray
            Write-Host "  NAFDAC: $($response.data.nafdac_reg)" -ForegroundColor Gray
        }
        
    } catch {
        Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host "If you see actual product details instead of 'Unknown', 'N/A', etc., the fix is working!" -ForegroundColor Green