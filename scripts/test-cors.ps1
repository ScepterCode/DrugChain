# Test CORS Configuration Script

Write-Host "🧪 Testing CORS Configuration..." -ForegroundColor Green

# Test CORS preflight request
Write-Host "`n1. Testing CORS Preflight (OPTIONS)..." -ForegroundColor Blue
try {
    $corsHeaders = @{
        "Origin" = "https://drug-chain.vercel.app"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type"
    }
    
    $response = Invoke-WebRequest -Uri "https://drugchain-backend.onrender.com/api/v1/auth/register" -Method OPTIONS -Headers $corsHeaders
    Write-Host "✅ CORS Preflight: $($response.StatusCode)" -ForegroundColor Green
    
    # Check for CORS headers in response
    $corsOrigin = $response.Headers["Access-Control-Allow-Origin"]
    $corsMethods = $response.Headers["Access-Control-Allow-Methods"]
    $corsHeaders = $response.Headers["Access-Control-Allow-Headers"]
    
    Write-Host "CORS Headers:" -ForegroundColor Yellow
    Write-Host "  Allow-Origin: $corsOrigin" -ForegroundColor Gray
    Write-Host "  Allow-Methods: $corsMethods" -ForegroundColor Gray
    Write-Host "  Allow-Headers: $corsHeaders" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ CORS Preflight Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test actual POST request with CORS
Write-Host "`n2. Testing POST with CORS..." -ForegroundColor Blue
try {
    $postHeaders = @{
        "Origin" = "https://drug-chain.vercel.app"
        "Content-Type" = "application/json"
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
    Write-Host "POST Request Status: $statusCode" -ForegroundColor Yellow
    
    if ($statusCode -eq 422) {
        Write-Host "✅ This is GOOD! 422 = Validation error (CORS is working)" -ForegroundColor Green
    } elseif ($statusCode -eq 500) {
        Write-Host "❌ 500 = Server error (might still be CORS issue)" -ForegroundColor Red
    } else {
        Write-Host "Status: $statusCode - $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n📋 What to Look For:" -ForegroundColor Yellow
Write-Host "✅ OPTIONS request returns 200 with CORS headers" -ForegroundColor White
Write-Host "✅ POST request returns 422 (validation error) or 201 (success)" -ForegroundColor White
Write-Host "❌ If you still get CORS errors, wait 2-3 minutes for Render to redeploy" -ForegroundColor White

Write-Host "`n🔍 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Wait for Render to finish redeploying (check dashboard)" -ForegroundColor White
Write-Host "2. Test registration at https://drug-chain.vercel.app" -ForegroundColor White
Write-Host "3. Check browser dev tools for CORS errors" -ForegroundColor White