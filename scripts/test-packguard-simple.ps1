# Simple PackGuard Test
Write-Host "Testing PackGuard Expansion..." -ForegroundColor Green

# Test Categories API
Write-Host "Testing Categories API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://drugchain-backend.onrender.com/api/v1/categories/" -Method GET
    Write-Host "Categories API: SUCCESS - Found $($response.Count) categories" -ForegroundColor Green
} catch {
    Write-Host "Categories API: FAILED" -ForegroundColor Red
}

# Test Frontend
Write-Host "Testing Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://drug-chain.vercel.app/about" -Method GET
    if ($response.Content -match "PackGuard") {
        Write-Host "Frontend: SUCCESS - PackGuard branding found" -ForegroundColor Green
    } else {
        Write-Host "Frontend: PARTIAL - Old branding still present" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Frontend: FAILED" -ForegroundColor Red
}

Write-Host "Test complete!" -ForegroundColor Green