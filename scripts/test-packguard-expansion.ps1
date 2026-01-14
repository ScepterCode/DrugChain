# Test PackGuard Expansion Features
Write-Host "Testing PackGuard Expansion Features..." -ForegroundColor Green

# Test 1: Check if categories API is working
Write-Host "`n1. Testing Categories API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://drugchain-backend.onrender.com/api/v1/categories/" -Method GET
    Write-Host "✓ Categories API working - Found $($response.Count) categories" -ForegroundColor Green
    
    # Show available industries
    $industries = $response | Select-Object -Property industry_type -Unique
    Write-Host "Available Industries:" -ForegroundColor Cyan
    foreach ($industry in $industries) {
        Write-Host "  - $($industry.industry_type)" -ForegroundColor White
    }
} catch {
    Write-Host "✗ Categories API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Check if industries endpoint is working
Write-Host "`n2. Testing Industries API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://drugchain-backend.onrender.com/api/v1/categories/industries" -Method GET
    Write-Host "✓ Industries API working - Found industries: $($response -join ', ')" -ForegroundColor Green
} catch {
    Write-Host "✗ Industries API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test specific industry categories
Write-Host "`n3. Testing Industry-Specific Categories..." -ForegroundColor Yellow
$testIndustries = @("Healthcare", "Technology", "Fashion")

foreach ($industry in $testIndustries) {
    try {
        $response = Invoke-RestMethod -Uri "https://drugchain-backend.onrender.com/api/v1/categories/industry/$industry" -Method GET
        Write-Host "✓ $industry categories: $($response.Count) found" -ForegroundColor Green
    } catch {
        Write-Host "✗ $industry categories failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Check if frontend is serving updated About page
Write-Host "`n4. Testing Frontend Updates..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://drug-chain.vercel.app/about" -Method GET
    if ($response.Content -match "PackGuard") {
        Write-Host "✓ Frontend shows PackGuard branding" -ForegroundColor Green
    } else {
        Write-Host "✗ Frontend still shows old branding" -ForegroundColor Red
    }
    
    if ($response.Content -match "Universal Product Authentication") {
        Write-Host "✓ Frontend shows universal messaging" -ForegroundColor Green
    } else {
        Write-Host "✗ Frontend missing universal messaging" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Frontend test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== PackGuard Expansion Test Complete ===" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Complete database migration" -ForegroundColor White
Write-Host "2. Implement industry-specific API endpoints" -ForegroundColor White
Write-Host "3. Deploy updated frontend with new components" -ForegroundColor White
Write-Host "4. Test end-to-end workflows for each industry" -ForegroundColor White