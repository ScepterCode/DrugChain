# Diagnose why products endpoint returns 405
$baseUrl = "https://drugchain-1.onrender.com"

Write-Host "`n=== Diagnosing Products 405 Error ===" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl`n" -ForegroundColor Gray

# Test 1: Check if API is responding
Write-Host "1. Testing API health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET -TimeoutSec 10
    Write-Host "   ✅ API is responding" -ForegroundColor Green
    Write-Host "   Response: $($health | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ API is not responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Check products endpoint with different methods
Write-Host "`n2. Testing products endpoint methods..." -ForegroundColor Yellow

# Test GET
Write-Host "   Testing GET /api/v1/products..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/products" -Method GET -TimeoutSec 10 -SkipHttpErrorCheck
    $statusCode = $response.StatusCode
    if ($statusCode -eq 200) {
        Write-Host "   ✅ GET works! Status: $statusCode" -ForegroundColor Green
    } elseif ($statusCode -eq 401) {
        Write-Host "   ⚠️  GET exists but requires auth. Status: $statusCode" -ForegroundColor Yellow
        Write-Host "   This is expected - route exists!" -ForegroundColor Green
    } elseif ($statusCode -eq 405) {
        Write-Host "   ❌ GET not allowed. Status: $statusCode" -ForegroundColor Red
        Write-Host "   This means old code is deployed!" -ForegroundColor Red
    } else {
        Write-Host "   ⚠️  Unexpected status: $statusCode" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Request failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test GET /public (no auth required)
Write-Host "`n   Testing GET /api/v1/products/public..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/products/public" -Method GET -TimeoutSec 10 -SkipHttpErrorCheck
    $statusCode = $response.StatusCode
    if ($statusCode -eq 200) {
        Write-Host "   ✅ GET /public works! Status: $statusCode" -ForegroundColor Green
        $products = $response.Content | ConvertFrom-Json
        Write-Host "   Found $($products.Count) public products" -ForegroundColor Gray
    } elseif ($statusCode -eq 404) {
        Write-Host "   ⚠️  Route not found. Status: $statusCode" -ForegroundColor Yellow
        Write-Host "   Old code is deployed!" -ForegroundColor Red
    } elseif ($statusCode -eq 405) {
        Write-Host "   ❌ Method not allowed. Status: $statusCode" -ForegroundColor Red
        Write-Host "   Old code is deployed!" -ForegroundColor Red
    } else {
        Write-Host "   ⚠️  Unexpected status: $statusCode" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Request failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Check OpenAPI docs
Write-Host "`n3. Checking API documentation..." -ForegroundColor Yellow
try {
    $openapi = Invoke-RestMethod -Uri "$baseUrl/openapi.json" -Method GET -TimeoutSec 10
    
    # Check if products routes exist in OpenAPI spec
    $productsRoutes = $openapi.paths.PSObject.Properties | Where-Object { $_.Name -like "*products*" }
    
    if ($productsRoutes.Count -gt 0) {
        Write-Host "   ✅ Products routes found in OpenAPI spec:" -ForegroundColor Green
        foreach ($route in $productsRoutes) {
            $methods = $route.Value.PSObject.Properties.Name -join ", "
            Write-Host "      $($route.Name): $methods" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ❌ No products routes in OpenAPI spec" -ForegroundColor Red
        Write-Host "   Old code is definitely deployed!" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠️  Could not fetch OpenAPI spec" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 4: Check deployment timestamp
Write-Host "`n4. Checking deployment info..." -ForegroundColor Yellow
try {
    $deployTest = Invoke-RestMethod -Uri "$baseUrl/deployment-test" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Deployment test endpoint exists" -ForegroundColor Green
    Write-Host "   Response: $($deployTest | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "   ⚠️  Deployment test endpoint not found" -ForegroundColor Yellow
}

# Test 5: Check other endpoints to verify API is working
Write-Host "`n5. Testing other endpoints for comparison..." -ForegroundColor Yellow

# Test batches
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/ids/batches" -Method GET -TimeoutSec 10 -SkipHttpErrorCheck
    Write-Host "   Batches endpoint: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "   Batches endpoint: Failed" -ForegroundColor Gray
}

# Test analytics
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/analytics/verification-stats" -Method GET -TimeoutSec 10 -SkipHttpErrorCheck
    Write-Host "   Analytics endpoint: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "   Analytics endpoint: Failed" -ForegroundColor Gray
}

# Summary
Write-Host "`n=== Diagnosis Summary ===" -ForegroundColor Cyan

Write-Host "`nIf you see:" -ForegroundColor White
Write-Host "  • 405 on products endpoint → Old code deployed, need to redeploy" -ForegroundColor Yellow
Write-Host "  • 401 on products endpoint → New code deployed, route exists!" -ForegroundColor Green
Write-Host "  • 200 on products endpoint → Everything working perfectly!" -ForegroundColor Green
Write-Host "  • No products routes in OpenAPI → Old code deployed" -ForegroundColor Yellow

Write-Host "`nNext steps:" -ForegroundColor White
Write-Host "  1. Go to Render Dashboard" -ForegroundColor Gray
Write-Host "  2. Click 'Manual Deploy' → 'Clear build cache & deploy'" -ForegroundColor Gray
Write-Host "  3. Wait 5 minutes" -ForegroundColor Gray
Write-Host "  4. Run this script again" -ForegroundColor Gray

Write-Host "`nSee PRODUCTS_405_FIX.md for detailed instructions`n" -ForegroundColor Cyan
