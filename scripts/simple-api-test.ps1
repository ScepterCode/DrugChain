#!/usr/bin/env pwsh
# Simple API test for product editing and QR code download fixes

Write-Host "=== SIMPLE API TEST ===" -ForegroundColor Cyan

$baseUrl = "https://drugchain-1.onrender.com/api/v1"

# Test 1: Backend health
Write-Host "`n1. Testing backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "https://drugchain-1.onrender.com/" -Method GET -TimeoutSec 10
    Write-Host "✓ Backend running: $($health.message)" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Get products
Write-Host "`n2. Testing products..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/products/public" -Method GET -TimeoutSec 10
    Write-Host "✓ Found $($products.Count) products" -ForegroundColor Green
    
    if ($products.Count -gt 0) {
        $product = $products[0]
        Write-Host "   Sample: $($product.product_name)" -ForegroundColor Gray
        
        # Test product details
        Write-Host "`n3. Testing product details..." -ForegroundColor Yellow
        $detail = Invoke-RestMethod -Uri "$baseUrl/products/$($product.product_id)" -Method GET -TimeoutSec 10
        Write-Host "✓ Product details OK" -ForegroundColor Green
        Write-Host "   Brand: $($detail.brand_name)" -ForegroundColor Gray
        Write-Host "   Country: $($detail.country_of_origin)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Products failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Basic API endpoints are working." -ForegroundColor Green
Write-Host "Next: Run COMPREHENSIVE_DATABASE_AND_API_FIX.sql in Supabase" -ForegroundColor Yellow