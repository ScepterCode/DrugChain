# Simple CORS Debug Script

Write-Host "🔍 Testing CORS..." -ForegroundColor Green

# Test OPTIONS request
Write-Host "`n1. Testing OPTIONS preflight..." -ForegroundColor Blue
try {
    $headers = @{
        "Origin" = "https://drug-chain.vercel.app"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "content-type"
    }
    
    $response = Invoke-WebRequest -Uri "https://drugchain-backend.onrender.com/api/v1/auth/register" -Method OPTIONS -Headers $headers
    Write-Host "✅ OPTIONS: $($response.StatusCode)" -ForegroundColor Green
    
    $allowOrigin = $response.Headers["Access-Control-Allow-Origin"]
    Write-Host "Allow-Origin: $allowOrigin" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ OPTIONS Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test POST request  
Write-Host "`n2. Testing POST request..." -ForegroundColor Blue
try {
    $headers = @{
        "Origin" = "https://drug-chain.vercel.app"
        "Content-Type" = "application/json"
    }
    
    $body = '{"email":"test@example.com","password":"Test123!","full_name":"Test User","role":"consumer"}'
    
    $response = Invoke-WebRequest -Uri "https://drugchain-backend.onrender.com/api/v1/auth/register" -Method POST -Headers $headers -Body $body
    Write-Host "✅ POST: $($response.StatusCode)" -ForegroundColor Green
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "POST Status: $statusCode" -ForegroundColor Yellow
    
    if ($statusCode -eq 422) {
        Write-Host "✅ 422 = Validation error (CORS working!)" -ForegroundColor Green
    } elseif ($statusCode -eq 500) {
        Write-Host "❌ 500 = Server error" -ForegroundColor Red
    }
}

Write-Host "`n📋 If OPTIONS works but browser fails:" -ForegroundColor Yellow
Write-Host "1. Clear browser cache completely" -ForegroundColor White
Write-Host "2. Try incognito mode" -ForegroundColor White
Write-Host "3. Check if Render finished deploying" -ForegroundColor White