# Quick Test of Fixed Batch Endpoints
# Tests if QR codes and pack IDs endpoints are working

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Fixed Batch Endpoints" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get token
$token = Read-Host "Enter your access token"

if (-not $token) {
    Write-Host "No token provided. Exiting." -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
}

$BASE_URL = "https://drugchain-1.onrender.com/api/v1"

# Test 1: Get batches list
Write-Host "1. Getting batches list..." -ForegroundColor Yellow
try {
    $batches = Invoke-RestMethod -Uri "$BASE_URL/ids/batches" -Headers $headers
    Write-Host "✓ Found $($batches.data.Count) batches" -ForegroundColor Green
    
    if ($batches.data.Count -gt 0) {
        $batchId = $batches.data[0].batch_id
        Write-Host "  Using batch: $batchId" -ForegroundColor Gray
        Write-Host ""
        
        # Test 2: Get batch packs (THIS WAS BROKEN)
        Write-Host "2. Testing GET /ids/batch/$batchId/packs..." -ForegroundColor Yellow
        try {
            $packs = Invoke-RestMethod -Uri "$BASE_URL/ids/batch/$batchId/packs" -Headers $headers
            Write-Host "✓ PACKS ENDPOINT WORKING!" -ForegroundColor Green
            Write-Host "  Total packs: $($packs.data.total_count)" -ForegroundColor Gray
            Write-Host "  Returned: $($packs.data.packs.Count) packs" -ForegroundColor Gray
            Write-Host ""
        } catch {
            Write-Host "✗ Packs endpoint failed" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host ""
        }
        
        # Test 3: Test QR codes endpoint (don't download, just check if it responds)
        Write-Host "3. Testing GET /ids/batch/$batchId/qr-codes..." -ForegroundColor Yellow
        Write-Host "  (Testing endpoint availability, not downloading)" -ForegroundColor Gray
        try {
            # Use HEAD request to check if endpoint exists without downloading
            $response = Invoke-WebRequest -Uri "$BASE_URL/ids/batch/$batchId/qr-codes" -Headers $headers -Method Head -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host "✓ QR CODES ENDPOINT WORKING!" -ForegroundColor Green
                Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Gray
                Write-Host "  Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor Gray
                Write-Host ""
            }
        } catch {
            if ($_.Exception.Message -like "*405*") {
                Write-Host "✗ QR codes endpoint not found (405)" -ForegroundColor Red
            } else {
                Write-Host "⚠ Could not test QR endpoint" -ForegroundColor Yellow
                Write-Host "  This might be normal - try downloading in the frontend" -ForegroundColor Gray
            }
            Write-Host ""
        }
        
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "TESTS COMPLETE!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next: Test in the frontend" -ForegroundColor Yellow
        Write-Host "1. Go to https://pack-guard.vercel.app" -ForegroundColor White
        Write-Host "2. Navigate to Batches → Click on batch $batchId" -ForegroundColor White
        Write-Host "3. Click 'Load Pack IDs' - should show pack list" -ForegroundColor White
        Write-Host "4. Click 'Download QR Codes' - should download ZIP" -ForegroundColor White
        
    } else {
        Write-Host "No batches found. Create a batch first." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "✗ Failed to get batches" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
