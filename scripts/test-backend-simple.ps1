# Simple Backend API Test
Write-Host "Testing PackGuard Backend APIs..." -ForegroundColor Green

$baseUrl = "https://drugchain-backend.onrender.com"

# Test Root endpoint
Write-Host "Testing Root Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $baseUrl -Method GET
    Write-Host "Root API: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "Root API: FAILED" -ForegroundColor Red
}

# Test Categories API
Write-Host "Testing Categories API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/categories/" -Method GET
    Write-Host "Categories API: SUCCESS - $($response.Count) categories" -ForegroundColor Green
} catch {
    Write-Host "Categories API: FAILED" -ForegroundColor Red
}

Write-Host "Test complete!" -ForegroundColor Green