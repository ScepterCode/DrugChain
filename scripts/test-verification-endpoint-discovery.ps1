# Discover Working Verification Endpoint
# Test different endpoint variations to find what's actually deployed

Write-Host "=== DISCOVERING VERIFICATION ENDPOINTS ===" -ForegroundColor Green

$baseUrl = "https://drugchain-1.onrender.com"
$testPackId = "PK-1D69V2TF"

# Test different endpoint patterns
$endpoints = @(
    "/api/v1/verify",
    "/api/v1/verify/pack", 
    "/api/v1/verification",
    "/api/v1/verification/pack",
    "/verify",
    "/verify/pack",
    "/verification",
    "/verification/pack"
)

foreach ($endpoint in $endpoints) {
    Write-Host "`n--- Testing: $endpoint ---" -ForegroundColor Cyan
    
    try {
        # Try POST with JSON body
        $body = @{
            pack_id = $testPackId
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
        
        Write-Host "✅ SUCCESS: $endpoint works!" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Yellow
        $response | ConvertTo-Json -Depth 3 | Write-Host
        
        # Check if we're getting real data or fallback values
        if ($response.data) {
            if ($response.data.product_name -and $response.data.product_name -ne "Unknown") {
                Write-Host "🎉 REAL DATA FOUND!" -ForegroundColor Green
                Write-Host "Product: $($response.data.product_name)" -ForegroundColor Green
                Write-Host "Manufacturer: $($response.data.manufacturer)" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Fallback data detected" -ForegroundColor Yellow
            }
        }
        
        break  # Stop on first success
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "❌ Failed: HTTP $statusCode" -ForegroundColor Red
    }
}

Write-Host "`n--- Testing GET endpoints ---" -ForegroundColor Cyan

# Also try GET endpoints (some might be GET instead of POST)
$getEndpoints = @(
    "/api/v1/verify/$testPackId",
    "/api/v1/verification/$testPackId",
    "/verify/$testPackId",
    "/verification/$testPackId"
)

foreach ($endpoint in $getEndpoints) {
    Write-Host "`nTesting GET: $endpoint" -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method GET -TimeoutSec 10
        
        Write-Host "✅ SUCCESS: $endpoint works!" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Yellow
        $response | ConvertTo-Json -Depth 3 | Write-Host
        
        break  # Stop on first success
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "❌ Failed: HTTP $statusCode" -ForegroundColor Red
    }
}

Write-Host "`n=== ENDPOINT DISCOVERY COMPLETE ===" -ForegroundColor Green