# Verify Render Deployment Script
# Tests if Render is serving the latest code

Write-Host "🔍 Verifying Render Deployment..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://drugchain-backend.onrender.com"

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed" -ForegroundColor Green
        Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Products Public Endpoint (GET)
Write-Host "Test 2: Products Public Endpoint (GET)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/products/public" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ GET /api/v1/products/public works (code is deployed!)" -ForegroundColor Green
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 405) {
        Write-Host "❌ 405 Method Not Allowed - RENDER IS SERVING OLD CODE!" -ForegroundColor Red
        Write-Host "   Action: Go to Render -> Manual Deploy -> Clear build cache and deploy" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Failed with status $statusCode" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: CORS Preflight
Write-Host "Test 3: CORS Preflight (OPTIONS)" -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "https://pack-guard.vercel.app"
        "Access-Control-Request-Method" = "GET"
        "Access-Control-Request-Headers" = "content-type"
    }
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/products" -Method OPTIONS -Headers $headers -UseBasicParsing
    
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-Host "✅ CORS preflight works" -ForegroundColor Green
        Write-Host "   Access-Control-Allow-Origin: $corsHeader" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  No CORS headers found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ CORS preflight failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Categories Endpoint
Write-Host "Test 4: Categories/Industries Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/categories/industries" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Categories endpoint works" -ForegroundColor Green
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ Failed with status $statusCode" -ForegroundColor Red
}
Write-Host ""

# Test 5: Check for CORS in actual request
Write-Host "Test 5: CORS Headers in GET Request" -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "https://pack-guard.vercel.app"
    }
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/products/public" -Method GET -Headers $headers -UseBasicParsing
    
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-Host "✅ CORS headers present in GET response" -ForegroundColor Green
        Write-Host "   Access-Control-Allow-Origin: $corsHeader" -ForegroundColor Gray
    } else {
        Write-Host "❌ No CORS headers in GET response" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Request failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see 405 errors above:" -ForegroundColor Yellow
Write-Host "  → Render is serving OLD CODE" -ForegroundColor Yellow
Write-Host "  → Action: Clear build cache & deploy" -ForegroundColor Yellow
Write-Host ""
Write-Host "If you see 200 OK:" -ForegroundColor Green
Write-Host "  → Latest code is deployed!" -ForegroundColor Green
Write-Host "  → Check database migration next" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Go to: https://dashboard.render.com" -ForegroundColor White
Write-Host "  2. Find: drugchain-backend service" -ForegroundColor White
Write-Host "  3. Click: Manual Deploy -> Clear build cache and deploy" -ForegroundColor White
Write-Host "  4. Wait: 10 minutes for rebuild" -ForegroundColor White
Write-Host "  5. Run: this script again to verify" -ForegroundColor White
Write-Host ""
