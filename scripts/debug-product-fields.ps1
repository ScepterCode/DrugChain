#!/usr/bin/env pwsh

Write-Host "=== Debugging Product Fields N/A Issue ===" -ForegroundColor Cyan

$baseUrl = "https://drugchain-1.onrender.com/api/v1"

# Step 1: Create a test user
Write-Host "`n1. Creating test user..." -ForegroundColor Yellow
$testUser = @{
    email = "debug-product-$(Get-Random)@example.com"
    password = "TestPass123!"
    full_name = "Debug Product User"
    phone_number = "+2348012345678"
    role = "MANUFACTURER"
    organization_name = "Debug Pharma $(Get-Random)"
    organization_type = "MANUFACTURER"
    registration_number = "RC$(Get-Random)"
}

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($testUser | ConvertTo-Json) -ContentType "application/json"
    $token = $registerResponse.data.access_token
    Write-Host "✅ User created successfully" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ User creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Create a product with ALL fields populated
Write-Host "`n2. Creating product with all fields..." -ForegroundColor Yellow
$productData = @{
    product_code = "DEBUG-$(Get-Random)"
    product_name = "Debug Test Product"
    description = "This is a test product for debugging"
    brand_name = "Debug Brand"
    country_of_origin = "Nigeria"
    dosage = "500mg"
    form = "Tablet"
    nafdac_registration_number = "NAFDAC-$(Get-Random)"
    therapeutic_category = "Antibiotic"
    requires_prescription = $true
    category_id = "Pharmaceuticals"
    model_number = "DBG-001"
    warranty_period_months = 24
    risk_level = "medium"
    verification_complexity = "standard"
    industry_type = "Healthcare"
}

Write-Host "Sending product data:" -ForegroundColor Gray
$productData | ConvertTo-Json -Depth 2 | Write-Host -ForegroundColor Gray

try {
    $headers = @{ "Authorization" = "Bearer $token" }
    $productResponse = Invoke-RestMethod -Uri "$baseUrl/products" -Method POST -Body ($productData | ConvertTo-Json) -ContentType "application/json" -Headers $headers
    
    Write-Host "✅ Product created successfully!" -ForegroundColor Green
    Write-Host "Product ID: $($productResponse.product_id)" -ForegroundColor Gray
    
    $productId = $productResponse.product_id
} catch {
    Write-Host "❌ Product creation failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
    exit 1
}

# Step 3: Retrieve the product and check all fields
Write-Host "`n3. Retrieving product to check saved fields..." -ForegroundColor Yellow

try {
    $retrievedProduct = Invoke-RestMethod -Uri "$baseUrl/products/$productId" -Method GET
    
    Write-Host "`n=== PRODUCT FIELDS IN DATABASE ===" -ForegroundColor Cyan
    Write-Host "Product ID: $($retrievedProduct.product_id)" -ForegroundColor White
    Write-Host "Product Code: $($retrievedProduct.product_code)" -ForegroundColor White
    Write-Host "Product Name: $($retrievedProduct.product_name)" -ForegroundColor White
    Write-Host "Description: $($retrievedProduct.description)" -ForegroundColor White
    
    # Check the problematic fields
    Write-Host "`n--- PROBLEMATIC FIELDS ---" -ForegroundColor Yellow
    Write-Host "Brand Name: '$($retrievedProduct.brand_name)'" -ForegroundColor $(if ($retrievedProduct.brand_name) { "Green" } else { "Red" })
    Write-Host "Country of Origin: '$($retrievedProduct.country_of_origin)'" -ForegroundColor $(if ($retrievedProduct.country_of_origin) { "Green" } else { "Red" })
    Write-Host "Dosage: '$($retrievedProduct.dosage)'" -ForegroundColor $(if ($retrievedProduct.dosage) { "Green" } else { "Red" })
    Write-Host "Form: '$($retrievedProduct.form)'" -ForegroundColor $(if ($retrievedProduct.form) { "Green" } else { "Red" })
    Write-Host "NAFDAC Reg: '$($retrievedProduct.nafdac_registration_number)'" -ForegroundColor $(if ($retrievedProduct.nafdac_registration_number) { "Green" } else { "Red" })
    Write-Host "Therapeutic Category: '$($retrievedProduct.therapeutic_category)'" -ForegroundColor $(if ($retrievedProduct.therapeutic_category) { "Green" } else { "Red" })
    Write-Host "Requires Prescription: '$($retrievedProduct.requires_prescription)'" -ForegroundColor $(if ($retrievedProduct.requires_prescription -ne $null) { "Green" } else { "Red" })
    
    # Check new fields
    Write-Host "`n--- NEW FIELDS ---" -ForegroundColor Yellow
    Write-Host "Category ID: '$($retrievedProduct.category_id)'" -ForegroundColor $(if ($retrievedProduct.category_id) { "Green" } else { "Red" })
    Write-Host "Model Number: '$($retrievedProduct.model_number)'" -ForegroundColor $(if ($retrievedProduct.model_number) { "Green" } else { "Red" })
    Write-Host "Warranty Period: '$($retrievedProduct.warranty_period_months)'" -ForegroundColor $(if ($retrievedProduct.warranty_period_months) { "Green" } else { "Red" })
    Write-Host "Risk Level: '$($retrievedProduct.risk_level)'" -ForegroundColor $(if ($retrievedProduct.risk_level) { "Green" } else { "Red" })
    Write-Host "Verification Complexity: '$($retrievedProduct.verification_complexity)'" -ForegroundColor $(if ($retrievedProduct.verification_complexity) { "Green" } else { "Red" })
    Write-Host "Industry Type: '$($retrievedProduct.industry_type)'" -ForegroundColor $(if ($retrievedProduct.industry_type) { "Green" } else { "Red" })
    Write-Host "Industry Data: '$($retrievedProduct.industry_data)'" -ForegroundColor $(if ($retrievedProduct.industry_data) { "Green" } else { "Red" })
    
    # Show full JSON for debugging
    Write-Host "`n=== FULL PRODUCT JSON ===" -ForegroundColor Cyan
    $retrievedProduct | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Product retrieval failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

# Step 4: Test updating the product
Write-Host "`n4. Testing product update..." -ForegroundColor Yellow

$updateData = @{
    product_code = $productData.product_code
    product_name = "Updated Debug Product"
    description = "Updated description"
    brand_name = "Updated Brand"
    country_of_origin = "Ghana"
    dosage = "750mg"
    form = "Capsule"
    nafdac_registration_number = "NAFDAC-UPDATED"
}

try {
    $headers = @{ "Authorization" = "Bearer $token" }
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/products/$productId" -Method PUT -Body ($updateData | ConvertTo-Json) -ContentType "application/json" -Headers $headers
    
    Write-Host "✅ Product updated successfully!" -ForegroundColor Green
    
    # Retrieve again to see if update worked
    $updatedProduct = Invoke-RestMethod -Uri "$baseUrl/products/$productId" -Method GET
    
    Write-Host "`n--- AFTER UPDATE ---" -ForegroundColor Yellow
    Write-Host "Brand Name: '$($updatedProduct.brand_name)'" -ForegroundColor $(if ($updatedProduct.brand_name -eq "Updated Brand") { "Green" } else { "Red" })
    Write-Host "Country of Origin: '$($updatedProduct.country_of_origin)'" -ForegroundColor $(if ($updatedProduct.country_of_origin -eq "Ghana") { "Green" } else { "Red" })
    Write-Host "Dosage: '$($updatedProduct.dosage)'" -ForegroundColor $(if ($updatedProduct.dosage -eq "750mg") { "Green" } else { "Red" })
    Write-Host "Form: '$($updatedProduct.form)'" -ForegroundColor $(if ($updatedProduct.form -eq "Capsule") { "Green" } else { "Red" })
    
} catch {
    Write-Host "❌ Product update failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`n=== DEBUG COMPLETE ===" -ForegroundColor Cyan
Write-Host "Check the output above to see which fields are null/empty" -ForegroundColor Gray