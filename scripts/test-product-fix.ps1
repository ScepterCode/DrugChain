#!/usr/bin/env pwsh

Write-Host "=== Testing Product Fields Fix ===" -ForegroundColor Cyan

# Create test user
$testUser = @{
    email = "test-final-$(Get-Random)@example.com"
    password = "TestPass123!"
    full_name = "Final Test User"
    phone_number = "+2348012345678"
    role = "MANUFACTURER"
    organization_name = "Final Test Pharma $(Get-Random)"
    organization_type = "MANUFACTURER"
    registration_number = "RC$(Get-Random)"
}

try {
    Write-Host "Creating test user..."
    $registerResponse = Invoke-RestMethod -Uri "https://drugchain-1.onrender.com/api/v1/auth/register" -Method POST -Body ($testUser | ConvertTo-Json) -ContentType "application/json"
    $token = $registerResponse.data.access_token
    Write-Host "✅ User created"
    
    # Create product with the problematic fields
    $productData = @{
        product_code = "FINAL-$(Get-Random)"
        product_name = "Final Test Product"
        brand_name = "Final Brand"
        country_of_origin = "Nigeria"
        dosage = "500mg"
        form = "Tablet"
    }
    
    Write-Host "`nCreating product..."
    $headers = @{ "Authorization" = "Bearer $token" }
    $productResponse = Invoke-RestMethod -Uri "https://drugchain-1.onrender.com/api/v1/products" -Method POST -Body ($productData | ConvertTo-Json) -ContentType "application/json" -Headers $headers
    
    Write-Host "✅ Product created: $($productResponse.product_id)"
    
    # Check the saved values
    Write-Host "`nChecking saved values..."
    $retrievedProduct = Invoke-RestMethod -Uri "https://drugchain-1.onrender.com/api/v1/products/$($productResponse.product_id)" -Method GET
    
    $success = $true
    
    if ($retrievedProduct.brand_name -eq "Final Brand") {
        Write-Host "✅ Brand Name: '$($retrievedProduct.brand_name)'" -ForegroundColor Green
    } else {
        Write-Host "❌ Brand Name: '$($retrievedProduct.brand_name)' (expected 'Final Brand')" -ForegroundColor Red
        $success = $false
    }
    
    if ($retrievedProduct.country_of_origin -eq "Nigeria") {
        Write-Host "✅ Country of Origin: '$($retrievedProduct.country_of_origin)'" -ForegroundColor Green
    } else {
        Write-Host "❌ Country of Origin: '$($retrievedProduct.country_of_origin)' (expected 'Nigeria')" -ForegroundColor Red
        $success = $false
    }
    
    if ($retrievedProduct.dosage -eq "500mg") {
        Write-Host "✅ Dosage: '$($retrievedProduct.dosage)'" -ForegroundColor Green
    } else {
        Write-Host "❌ Dosage: '$($retrievedProduct.dosage)' (expected '500mg')" -ForegroundColor Red
        $success = $false
    }
    
    if ($retrievedProduct.form -eq "Tablet") {
        Write-Host "✅ Form: '$($retrievedProduct.form)'" -ForegroundColor Green
    } else {
        Write-Host "❌ Form: '$($retrievedProduct.form)' (expected 'Tablet')" -ForegroundColor Red
        $success = $false
    }
    
    if ($success) {
        Write-Host "`n🎉 SUCCESS! All product fields are now working correctly!" -ForegroundColor Green
        Write-Host "The N/A issue has been resolved." -ForegroundColor Green
    } else {
        Write-Host "`n❌ Some fields are still not working." -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}