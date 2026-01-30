# Test PUT endpoint for product updates
# This will help us see the detailed logs and identify the 500 error

Write-Host "=== Testing Product PUT Endpoint ===" -ForegroundColor Green

# First, let's get a valid product ID and auth token
Write-Host "Step 1: Login to get auth token..." -ForegroundColor Yellow

$loginBody = @{
    email = "manufacturer@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "https://drugchain-1.onrender.com/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.access_token
    Write-Host "✅ Login successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Get products to find a valid product ID
Write-Host "Step 2: Get products to find valid product ID..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $productsResponse = Invoke-WebRequest -Uri "https://drugchain-1.onrender.com/api/v1/products" -Method GET -Headers $headers
    $products = $productsResponse.Content | ConvertFrom-Json
    
    if ($products.Count -eq 0) {
        Write-Host "❌ No products found" -ForegroundColor Red
        exit 1
    }
    
    $productId = $products[0].product_id
    Write-Host "✅ Found product ID: $productId" -ForegroundColor Green
    Write-Host "   Product name: $($products[0].product_name)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to get products: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test PUT request with minimal data
Write-Host "Step 3: Testing PUT request..." -ForegroundColor Yellow

$updateBody = @{
    product_code = $products[0].product_code
    product_name = "Updated Product Name - Test"
    description = "Updated description for testing"
    industry_type = "Healthcare"
    brand_name = "Test Brand"
    country_of_origin = "Nigeria"
} | ConvertTo-Json

Write-Host "Payload being sent:" -ForegroundColor Cyan
Write-Host $updateBody -ForegroundColor Gray

try {
    $updateResponse = Invoke-WebRequest -Uri "https://drugchain-1.onrender.com/api/v1/products/$productId" -Method PUT -Body $updateBody -Headers $headers
    Write-Host "✅ PUT request successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host $updateResponse.Content -ForegroundColor Gray
} catch {
    Write-Host "❌ PUT request failed!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to get response content for more details
    try {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error Response Body:" -ForegroundColor Red
        Write-Host $errorContent -ForegroundColor Gray
    } catch {
        Write-Host "Could not read error response body" -ForegroundColor Red
    }
}

Write-Host "`n=== Check backend logs at https://dashboard.render.com for detailed error info ===" -ForegroundColor Yellow