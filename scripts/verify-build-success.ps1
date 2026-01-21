# Verify Render Build Success
Write-Host "🔍 Verifying Render Deployment..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://drugchain-backend.onrender.com"

# Test 1: Deployment Test Endpoint
Write-Host "1. Testing Deployment Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/deployment-test" -Method GET
    Write-Host "   ✅ SUCCESS: New code is deployed!" -ForegroundColor Green
    Write-Host "   Deployment Time: $($response.deployment_timestamp)" -ForegroundColor Gray
    Write-Host "   Server Time: $($response.server_time)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 404) {
        Write-Host "   ❌ FAILED: Old code still running (404)" -ForegroundColor Red
        Write-Host "   Wait a few more minutes for deployment..." -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ FAILED: Status $statusCode" -ForegroundColor Red
    }
}

Write-Host ""

# Test 2: POST Products (should be 401, not 405)
Write-Host "2. Testing POST /api/v1/products..." -ForegroundColor Yellow
try {
    $body = @{
        product_code = "TEST123"
        product_name = "Test"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/products" -Method POST -Body $body -ContentType "application/json"
    Write-Host "   ⚠️  UNEXPECTED: Succeeded without auth" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401 -or $statusCode -eq 403 -or $statusCode -eq 422) {
        Write-Host "   ✅ SUCCESS: Route exists! (Status $statusCode)" -ForegroundColor Green
        Write-Host "   Build succeeded and new code is deployed!" -ForegroundColor Green
    } elseif ($statusCode -eq 405) {
        Write-Host "   ❌ FAILED: Still getting 405" -ForegroundColor Red
        Write-Host "   Build may still be in progress..." -ForegroundColor Yellow
    } else {
        Write-Host "   Status: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host ""

# Test 3: GET Products Public
Write-Host "3. Testing GET /api/v1/products/public..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/products/public" -Method GET
    Write-Host "   ✅ SUCCESS: Returns products" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 500) {
        Write-Host "   ⚠️  Status 500: Route exists, database issue" -ForegroundColor Yellow
    } elseif ($statusCode -eq 405) {
        Write-Host "   ❌ Status 405: Old code still running" -ForegroundColor Red
    } else {
        Write-Host "   Status: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see ✅ SUCCESS messages:" -ForegroundColor Green
Write-Host "  → Build succeeded!" -ForegroundColor Green
Write-Host "  → New code is deployed!" -ForegroundColor Green
Write-Host "  → All 405 errors are fixed!" -ForegroundColor Green
Write-Host ""
Write-Host "If you see ❌ FAILED messages:" -ForegroundColor Yellow
Write-Host "  → Build may still be in progress" -ForegroundColor Yellow
Write-Host "  → Wait 5 more minutes and run this script again" -ForegroundColor Yellow
Write-Host ""
Write-Host "Check Render logs at:" -ForegroundColor Cyan
Write-Host "  https://dashboard.render.com" -ForegroundColor White
Write-Host ""
