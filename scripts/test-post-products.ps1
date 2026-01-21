# Test POST to products endpoint
Write-Host "Testing POST /api/v1/products..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://drugchain-backend.onrender.com"

# Test POST without auth (should fail with 401 or 403, NOT 405)
Write-Host "1. Testing POST without authentication..." -ForegroundColor Yellow
try {
    $body = @{
        product_code = "TEST123"
        product_name = "Test Product"
        industry_type = "HEALTHCARE"
        category = "Test"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/products" -Method POST -Body $body -ContentType "application/json"
    Write-Host "   UNEXPECTED: Request succeeded without auth!" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 405) {
        Write-Host "   FAILED: 405 Method Not Allowed" -ForegroundColor Red
        Write-Host "   This means POST route DOES NOT EXIST in deployed code!" -ForegroundColor Red
        Write-Host "   Render is serving OLD CODE!" -ForegroundColor Red
    } elseif ($statusCode -eq 401 -or $statusCode -eq 403) {
        Write-Host "   EXPECTED: $statusCode (authentication required)" -ForegroundColor Green
        Write-Host "   This means POST route EXISTS in deployed code!" -ForegroundColor Green
    } else {
        Write-Host "   Status: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "2. Testing GET /api/v1/products/public..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/products/public" -Method GET
    Write-Host "   SUCCESS: Route exists and returns data" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   FAILED: Status $statusCode" -ForegroundColor Red
}

Write-Host ""
Write-Host "CONCLUSION:" -ForegroundColor Cyan
Write-Host "If POST returns 405: Render is serving old code - FORCE REBUILD REQUIRED" -ForegroundColor Yellow
Write-Host "If POST returns 401/403: Latest code is deployed - Database migration needed" -ForegroundColor Yellow
