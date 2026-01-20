# Test endpoints after running the industry_type migration
$baseUrl = "https://drugchain-1.onrender.com"

Write-Host "`n=== Testing DrugChain API After Migration ===" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl`n" -ForegroundColor Gray

# Test 1: Health check
Write-Host "1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Health check passed" -ForegroundColor Green
    Write-Host "   Response: $($health | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Products GET endpoint (was returning 405)
Write-Host "`n2. Testing GET /api/v1/products..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/api/v1/products" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Products endpoint working!" -ForegroundColor Green
    Write-Host "   Found $($products.Count) products" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   ❌ Products endpoint failed with status $statusCode" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Analytics endpoint (was returning 500)
Write-Host "`n3. Testing GET /api/v1/analytics/verification-stats..." -ForegroundColor Yellow
try {
    $analytics = Invoke-RestMethod -Uri "$baseUrl/api/v1/analytics/verification-stats" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Analytics endpoint working!" -ForegroundColor Green
    Write-Host "   Response: $($analytics | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   ❌ Analytics endpoint failed with status $statusCode" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Batches endpoint (was returning 500)
Write-Host "`n4. Testing GET /api/v1/batches..." -ForegroundColor Yellow
try {
    $batches = Invoke-RestMethod -Uri "$baseUrl/api/v1/batches" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Batches endpoint working!" -ForegroundColor Green
    Write-Host "   Found $($batches.Count) batches" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   ❌ Batches endpoint failed with status $statusCode" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Deployment test endpoint
Write-Host "`n5. Testing GET /deployment-test..." -ForegroundColor Yellow
try {
    $deployTest = Invoke-RestMethod -Uri "$baseUrl/deployment-test" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Deployment test passed" -ForegroundColor Green
    Write-Host "   Response: $($deployTest | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Deployment test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "If all tests pass, your migration was successful!" -ForegroundColor Green
Write-Host "If tests still fail, check Render logs for errors." -ForegroundColor Yellow
