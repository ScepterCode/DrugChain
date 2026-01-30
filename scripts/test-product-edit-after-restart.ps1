#!/usr/bin/env pwsh
# Test product editing after backend restart

Write-Host "=== TESTING PRODUCT EDIT AFTER BACKEND RESTART ===" -ForegroundColor Cyan

$baseUrl = "https://drugchain-1.onrender.com"

# Test 1: Check if backend has restarted with new code
Write-Host "`n1. Checking backend deployment status..." -ForegroundColor Yellow
try {
    $deployment = Invoke-RestMethod -Uri "$baseUrl/deployment-test" -Method GET -TimeoutSec 10
    Write-Host "✓ Backend deployment timestamp: $($deployment.deployment_timestamp)" -ForegroundColor Green
    Write-Host "✓ Database columns fixed: $($deployment.database_columns_fixed)" -ForegroundColor Green
    Write-Host "✓ Product edit should work: $($deployment.product_edit_should_work)" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend deployment check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Check products endpoint
Write-Host "`n2. Testing products endpoint..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/api/v1/products/public" -Method GET -TimeoutSec 10
    Write-Host "✓ Products endpoint working: Found $($products.Count) products" -ForegroundColor Green
    
    if ($products.Count -gt 0) {
        $product = $products[0]
        Write-Host "   Sample product: $($product.product_name)" -ForegroundColor Gray
        Write-Host "   Product ID: $($product.product_id)" -ForegroundColor Gray
        Write-Host "   Brand: $($product.brand_name)" -ForegroundColor Gray
        Write-Host "   Country: $($product.country_of_origin)" -ForegroundColor Gray
        
        # Test 3: Try to get specific product details
        Write-Host "`n3. Testing product details..." -ForegroundColor Yellow
        try {
            $detail = Invoke-RestMethod -Uri "$baseUrl/api/v1/products/$($product.product_id)" -Method GET -TimeoutSec 10
            Write-Host "✓ Product details working" -ForegroundColor Green
            Write-Host "   Brand: $($detail.brand_name)" -ForegroundColor Gray
            Write-Host "   Country: $($detail.country_of_origin)" -ForegroundColor Gray
            Write-Host "   Dosage: $($detail.dosage)" -ForegroundColor Gray
            Write-Host "   Form: $($detail.form)" -ForegroundColor Gray
        } catch {
            Write-Host "✗ Product details failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "✗ Products endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Cyan
Write-Host "1. Wait for backend to restart (may take 2-3 minutes)" -ForegroundColor Yellow
Write-Host "2. Run: FORCE_BACKEND_RESTART_AND_FIX.sql in Supabase" -ForegroundColor Yellow
Write-Host "3. Clear browser cache and try editing a product" -ForegroundColor Yellow
Write-Host "4. If still failing, check Render logs for detailed error messages" -ForegroundColor Yellow

Write-Host "`nBackend restart triggered! Check Render dashboard for deployment progress." -ForegroundColor Green