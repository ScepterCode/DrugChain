# Test Batch and Supply Chain Endpoints After Trailing Slash Fix
# Run this after deploying to Render

$BASE_URL = "https://drugchain-1.onrender.com/api/v1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Batch & Supply Chain Endpoints" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Deployment verification
Write-Host "1. Checking deployment status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://drugchain-1.onrender.com/deployment-test" -Method Get
    Write-Host "✓ Deployment timestamp: $($response.deployment_timestamp)" -ForegroundColor Green
    Write-Host "✓ Batches fix applied: $($response.batches_trailing_slash_fix)" -ForegroundColor Green
    Write-Host "✓ Supply chain fix applied: $($response.supply_chain_trailing_slash_fix)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to check deployment" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
Write-Host ""

# Test 2: List batches (should work - no trailing slash issue)
Write-Host "2. Testing GET /api/v1/ids/batches..." -ForegroundColor Yellow
try {
    $token = Read-Host "Enter your access token (or press Enter to skip auth tests)"
    if ($token) {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $response = Invoke-RestMethod -Uri "$BASE_URL/ids/batches" -Method Get -Headers $headers
        Write-Host "✓ Batches endpoint working!" -ForegroundColor Green
        Write-Host "  Found $($response.data.Count) batches" -ForegroundColor Gray
        
        if ($response.data.Count -gt 0) {
            $batchId = $response.data[0].batch_id
            Write-Host "  Sample batch ID: $batchId" -ForegroundColor Gray
            
            # Test 3: Get batch details
            Write-Host ""
            Write-Host "3. Testing GET /api/v1/ids/batch/{id}..." -ForegroundColor Yellow
            try {
                $batchResponse = Invoke-RestMethod -Uri "$BASE_URL/ids/batch/$batchId" -Method Get -Headers $headers
                Write-Host "✓ Batch details endpoint working!" -ForegroundColor Green
                Write-Host "  Product: $($batchResponse.data.product_name)" -ForegroundColor Gray
                Write-Host "  Total packs: $($batchResponse.data.total_packs)" -ForegroundColor Gray
            } catch {
                Write-Host "✗ Batch details failed: $($_.Exception.Message)" -ForegroundColor Red
            }
            
            # Test 4: Get batch packs (THIS WAS BROKEN)
            Write-Host ""
            Write-Host "4. Testing GET /api/v1/ids/batch/{id}/packs..." -ForegroundColor Yellow
            try {
                $packsResponse = Invoke-RestMethod -Uri "$BASE_URL/ids/batch/$batchId/packs" -Method Get -Headers $headers
                Write-Host "✓ Batch packs endpoint working! (FIXED)" -ForegroundColor Green
                Write-Host "  Total packs: $($packsResponse.data.total_count)" -ForegroundColor Gray
                Write-Host "  Returned: $($packsResponse.data.packs.Count) packs" -ForegroundColor Gray
            } catch {
                Write-Host "✗ Batch packs failed: $($_.Exception.Message)" -ForegroundColor Red
                Write-Host "  This should be fixed now!" -ForegroundColor Yellow
            }
            
            # Test 5: Download QR codes (THIS WAS TIMING OUT)
            Write-Host ""
            Write-Host "5. Testing GET /api/v1/ids/batch/{id}/qr-codes..." -ForegroundColor Yellow
            Write-Host "  (Skipping actual download to avoid timeout)" -ForegroundColor Gray
            Write-Host "  Try this in browser: $BASE_URL/ids/batch/$batchId/qr-codes" -ForegroundColor Cyan
        }
    } else {
        Write-Host "⊘ Skipping authenticated tests" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Batches endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Supply chain endpoints
Write-Host "6. Testing supply chain endpoints..." -ForegroundColor Yellow
if ($token) {
    try {
        $inventoryResponse = Invoke-RestMethod -Uri "$BASE_URL/supply-chain/inventory" -Method Get -Headers $headers
        Write-Host "✓ Inventory endpoint working!" -ForegroundColor Green
        Write-Host "  Total products: $($inventoryResponse.data.summary.total_products)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Inventory failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    try {
        $historyResponse = Invoke-RestMethod -Uri "$BASE_URL/supply-chain/transfer-history" -Method Get -Headers $headers
        Write-Host "✓ Transfer history endpoint working!" -ForegroundColor Green
    } catch {
        Write-Host "✗ Transfer history failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⊘ Skipping supply chain tests (no token)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Deploy to Render (Clear build cache & deploy)" -ForegroundColor White
Write-Host "2. Wait for deployment to complete" -ForegroundColor White
Write-Host "3. Run this script again to verify fixes" -ForegroundColor White
Write-Host "4. Test QR code download in the frontend" -ForegroundColor White
Write-Host "5. Test supply chain flow visualization" -ForegroundColor White
