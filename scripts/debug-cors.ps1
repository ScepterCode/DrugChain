# Debug CORS Issues Script

Write-Host "🔍 Debugging CORS Issues..." -ForegroundColor Green

# Test 1: Simple GET request (should always work)
Write-Host "`n1. Testing simple GET request..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "https://drugchain-backend.onrender.com/health" -Method GET
    Write-Host "✅ GET Health: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ GET Health Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: OPTIONS preflight with exact browser headers
Write-Host "`n2. Testing OPTIONS with browser-like headers..." -ForegroundColor Blue
try {
    $preflightHeaders = @{
        "Origin" = "https://drug-chain.vercel.app"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "content-type,authorization"
        "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    $response = Invoke-WebRequest -Uri "https://drugchain-backend.onrender.com/api/v1/auth/register" -Method OPTIONS -Headers $preflightHeaders
    Write-Host "✅ OPTIONS Preflight: $($response.StatusCode)" -ForegroundColor Green
    
    # Check specific CORS headers
    $allowOrigin = $response.Headers["Access-Control-Allow-Origin"]
    $allowMethods = $response.Headers["Access-Control-Allow-Methods"] 
    $allowHeaders = $response.Headers["Access-Control-Allow-Headers"]
    $allowCredentials = $response.Headers["Access-Control-Allow-Credentials"]
    
    Write-Host "CORS Response Headers:" -ForegroundColor Yellow
    Write-Host "  Access-Control-Allow-Origin: $allowOrigin" -ForegroundColor Gray
    Write-Host "  Access-Control-Allow-Methods: $allowMethods" -ForegroundColor Gray
    Write-Host "  Access-Control-Allow-Headers: $allowHeaders" -ForegroundColor Gray
    Write-Host "  Access-Control-Allow-Credentials: $allowCredentials" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ OPTIONS Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: POST with exact browser headers
Write-Host "`n3. Testing POST with browser-like headers..." -ForegroundColor Blue
try {
    $postHeaders = @{
        "Origin" = "https://drug-chain.vercel.app"
        "Content-Type" = "application/json"
        "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        "Referer" = "https://drug-chain.vercel.app/"
    }
    
    $testData = @{
        email = "test@example.com"
        password = "Test123!"
        full_name = "Test User"
        role = "consumer"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "https://drugchain-backend.onrender.com/api/v1/auth/register" -Method POST -Headers $postHeaders -Body $testData
    Write-Host "✅ POST Request: $($response.StatusCode)" -ForegroundColor Green
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "POST Status: $statusCode" -ForegroundColor Yellow
    
    # Check if response has CORS headers even on error
    try {
        $errorResponse = $_.Exception.Response
        $corsOrigin = $errorResponse.Headers["Access-Control-Allow-Origin"]
        if ($corsOrigin) {
            Write-Host "✅ CORS headers present in error response: $corsOrigin" -ForegroundColor Green
        } else {
            Write-Host "❌ NO CORS headers in error response!" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Could not check error response headers" -ForegroundColor Red
    }
}

Write-Host "`n📋 Analysis:" -ForegroundColor Yellow
Write-Host "- If OPTIONS works but POST fails → Backend logic issue" -ForegroundColor White
Write-Host "- If POST has no CORS headers → CORS middleware not applied to errors" -ForegroundColor White
Write-Host "- If all tests pass → Browser cache or different headers issue" -ForegroundColor White

Write-Host "`n🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Clear browser cache completely" -ForegroundColor White
Write-Host "2. Try incognito/private mode" -ForegroundColor White
Write-Host "3. Check browser Network tab for exact headers sent" -ForegroundColor White