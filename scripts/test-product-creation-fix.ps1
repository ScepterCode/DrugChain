# Test Product Creation and Editing Fix
# Run this after applying the database migration and backend fixes

$baseUrl = "https://packguard-backend.onrender.com/api/v1"
$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

Write-Host "=== TESTING PRODUCT CREATION/EDITING FIX ===" -ForegroundColor Green

# Test 1: Check if backend is responding
Write-Host "`n1. Testing backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "✅ Backend is responding" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "⚠️  Backend may be down. Check Render deployment." -ForegroundColor Yellow
}

# Test 2: Test public products endpoint (should work without auth)
Write-Host "`n2. Testing public products endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/products/public" -Method GET -Headers $headers -ErrorAction Stop
    $products = $response.Content | ConvertFrom-Json
    Write-Host "✅ Public products endpoint works. Found $($products.Count) products" -ForegroundColor Green
    
    if ($products.Count -gt 0) {
        $sampleProduct = $products[0]
        Write-Host "Sample product fields:" -ForegroundColor Cyan
        $sampleProduct.PSObject.Properties | ForEach-Object {
            Write-Host "  - $($_.Name): $($_.Value)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Public products endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "⚠️  Public endpoint not found. This is expected if not implemented." -ForegroundColor Yellow
    }
}

# Test 3: Test authenticated products endpoint (will fail without token, but should return 401 not 500)
Write-Host "`n3. Testing authenticated products endpoint (without token)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/products" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "✅ Products endpoint accessible" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Products endpoint properly requires authentication (401)" -ForegroundColor Green
    } elseif ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ Products endpoint properly requires authorization (403)" -ForegroundColor Green
    } else {
        Write-Host "❌ Products endpoint failed with unexpected error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 4: Test product creation endpoint (will fail without token, but should return 401 not 500)
Write-Host "`n4. Testing product creation endpoint (without token)..." -ForegroundColor Yellow
$testProduct = @{
    product_code = "TEST001"
    product_name = "Test Product"
    brand_name = "Test Brand"
    industry_type = "Healthcare"
    description = "Test product for validation"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/products" -Method POST -Headers $headers -Body $testProduct -ErrorAction Stop
    Write-Host "❌ Product creation should require authentication" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Product creation properly requires authentication (401)" -ForegroundColor Green
    } elseif ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ Product creation properly requires authorization (403)" -ForegroundColor Green
    } else {
        Write-Host "❌ Product creation failed with unexpected error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 5: Check database schema (if we can access it)
Write-Host "`n5. Database schema verification..." -ForegroundColor Yellow
Write-Host "⚠️  To verify database schema, run this SQL in Supabase:" -ForegroundColor Yellow
Write-Host @"
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN (
    'brand_name', 'country_of_origin', 'category_id', 
    'model_number', 'warranty_period_months', 'risk_level', 
    'verification_complexity', 'industry_type', 'industry_data'
)
ORDER BY column_name;
"@ -ForegroundColor Gray

Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Green
Write-Host "1. If backend health check passes: ✅ Backend is deployed" -ForegroundColor White
Write-Host "2. If products endpoints return 401/403: ✅ Authentication is working" -ForegroundColor White
Write-Host "3. If no 500 errors: ✅ Database schema issues are likely fixed" -ForegroundColor White
Write-Host "4. Run the SQL query above to verify all product columns exist" -ForegroundColor White

Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Cyan
Write-Host "1. Run COMPREHENSIVE_PRODUCT_FIX.sql in Supabase if not done already" -ForegroundColor White
Write-Host "2. Test with actual authentication tokens from the frontend" -ForegroundColor White
Write-Host "3. Try creating and editing products through the UI" -ForegroundColor White
Write-Host "4. Monitor backend logs for any remaining issues" -ForegroundColor White