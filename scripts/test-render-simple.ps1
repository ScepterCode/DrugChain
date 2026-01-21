# Simple Render Deployment Test
Write-Host "Testing Render Deployment..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://drugchain-backend.onrender.com"

# Test 1: Health
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "   SUCCESS: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Products Public
Write-Host "2. Testing Products Public Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/products/public" -Method GET
    Write-Host "   SUCCESS: Got products array" -ForegroundColor Green
    Write-Host "   This means NEW CODE is deployed!" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 405) {
        Write-Host "   FAILED: 405 Method Not Allowed" -ForegroundColor Red
        Write-Host "   This means OLD CODE is still deployed!" -ForegroundColor Red
        Write-Host "" 
        Write-Host "   ACTION REQUIRED:" -ForegroundColor Yellow
        Write-Host "   1. Go to https://dashboard.render.com" -ForegroundColor White
        Write-Host "   2. Click on drugchain-backend" -ForegroundColor White
        Write-Host "   3. Manual Deploy -> Clear build cache and deploy" -ForegroundColor White
    } else {
        Write-Host "   FAILED: Status $statusCode" -ForegroundColor Red
    }
}

# Test 3: Categories
Write-Host "3. Testing Categories Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/categories/industries" -Method GET
    Write-Host "   SUCCESS: Got industries" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   FAILED: Status $statusCode" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Cyan
