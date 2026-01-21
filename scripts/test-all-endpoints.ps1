# Test all backend endpoints
Write-Host "Testing All Backend Endpoints..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://drugchain-backend.onrender.com"

# Test 1: Root
Write-Host "1. Testing Root (/)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method GET
    Write-Host "   SUCCESS: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Health
Write-Host "2. Testing Health (/health)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "   SUCCESS: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Docs (correct path)
Write-Host "3. Testing Docs (/api/docs)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/docs" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   SUCCESS: Docs page loads" -ForegroundColor Green
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   FAILED: Status $statusCode" -ForegroundColor Red
}

# Test 4: Products Public
Write-Host "4. Testing Products Public (/api/v1/products/public)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/products/public" -Method GET
    Write-Host "   SUCCESS: Returns products array" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 500) {
        Write-Host "   Status 500: Route exists, database issue" -ForegroundColor Yellow
    } elseif ($statusCode -eq 405) {
        Write-Host "   Status 405: OLD CODE - Route doesn't exist!" -ForegroundColor Red
    } else {
        Write-Host "   FAILED: Status $statusCode" -ForegroundColor Red
    }
}

# Test 5: POST Products (should return 401/403, not 405)
Write-Host "5. Testing POST Products (/api/v1/products)..." -ForegroundColor Yellow
try {
    $body = @{
        product_code = "TEST123"
        product_name = "Test"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/products" -Method POST -Body $body -ContentType "application/json"
    Write-Host "   UNEXPECTED: Succeeded without auth" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401 -or $statusCode -eq 403 -or $statusCode -eq 422) {
        Write-Host "   EXPECTED: Status $statusCode (route exists!)" -ForegroundColor Green
    } elseif ($statusCode -eq 405) {
        Write-Host "   Status 405: OLD CODE - POST route doesn't exist!" -ForegroundColor Red
    } else {
        Write-Host "   Status $statusCode" -ForegroundColor Yellow
    }
}

# Test 6: Categories
Write-Host "6. Testing Categories (/api/v1/categories/industries)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/categories/industries" -Method GET
    Write-Host "   SUCCESS: Returns industries" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 500) {
        Write-Host "   Status 500: Route exists, database issue" -ForegroundColor Yellow
    } elseif ($statusCode -eq 405) {
        Write-Host "   Status 405: OLD CODE!" -ForegroundColor Red
    } else {
        Write-Host "   FAILED: Status $statusCode" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "DIAGNOSIS:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see 405 errors:" -ForegroundColor Yellow
Write-Host "  → Render is serving OLD CODE" -ForegroundColor Yellow
Write-Host "  → Action: Force rebuild with 'Clear build cache & deploy'" -ForegroundColor Yellow
Write-Host ""
Write-Host "If you see 401/403/422 errors:" -ForegroundColor Green
Write-Host "  → Latest code IS deployed" -ForegroundColor Green
Write-Host "  → Routes exist and are working" -ForegroundColor Green
Write-Host ""
Write-Host "If you see 500 errors:" -ForegroundColor Yellow
Write-Host "  → Latest code IS deployed" -ForegroundColor Yellow
Write-Host "  → Database migration needed" -ForegroundColor Yellow
Write-Host ""
