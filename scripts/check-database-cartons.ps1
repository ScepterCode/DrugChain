# Check if cartons exist in the database
# This script will help diagnose why carton verification is failing

$BACKEND_URL = "https://drugchain-1.onrender.com/api/v1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DATABASE CARTON CHECK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login as manufacturer to get token
Write-Host "[1/3] Logging in as manufacturer..." -ForegroundColor Yellow
$loginBody = @{
    username = "manufacturer@test.com"
    password = "test123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    $token = $loginResponse.access_token
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.user.first_name) $($loginResponse.user.last_name)" -ForegroundColor Gray
    Write-Host "   Org ID: $($loginResponse.user.organization_id)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Note: You may need to register a manufacturer account first" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 2: Get batches to see if any exist
Write-Host "[2/3] Checking for batches..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $batchesResponse = Invoke-RestMethod -Uri "$BACKEND_URL/batches" -Method Get -Headers $headers -ErrorAction Stop
    $batches = $batchesResponse.data
    
    if ($batches.Count -eq 0) {
        Write-Host "❌ NO BATCHES FOUND" -ForegroundColor Red
        Write-Host "   You need to create a batch first before cartons can exist" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "TO CREATE A BATCH:" -ForegroundColor Yellow
        Write-Host "   1. Go to https://pack-guard.vercel.app/portal/batches/new" -ForegroundColor Gray
        Write-Host "   2. Fill in the batch details" -ForegroundColor Gray
        Write-Host "   3. Submit to create batch with cartons" -ForegroundColor Gray
        exit 1
    }
    
    Write-Host "✅ Found $($batches.Count) batch(es)" -ForegroundColor Green
    
    # Show first batch details
    $firstBatch = $batches[0]
    Write-Host ""
    Write-Host "First Batch Details:" -ForegroundColor Cyan
    Write-Host "   Batch ID: $($firstBatch.batch_id)" -ForegroundColor Gray
    Write-Host "   Product: $($firstBatch.product_name)" -ForegroundColor Gray
    Write-Host "   Batch Size: $($firstBatch.batch_size)" -ForegroundColor Gray
    Write-Host "   Number of Cartons: $($firstBatch.number_of_cartons)" -ForegroundColor Gray
    Write-Host "   Created: $($firstBatch.created_at)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Failed to get batches: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Try to get batch details to see cartons
Write-Host "[3/3] Checking for cartons in first batch..." -ForegroundColor Yellow
try {
    $batchId = $firstBatch.batch_id
    $batchDetailsResponse = Invoke-RestMethod -Uri "$BACKEND_URL/batches/$batchId" -Method Get -Headers $headers -ErrorAction Stop
    $batchDetails = $batchDetailsResponse.data
    
    if ($batchDetails.cartons -and $batchDetails.cartons.Count -gt 0) {
        Write-Host "✅ Found $($batchDetails.cartons.Count) carton(s)" -ForegroundColor Green
        Write-Host ""
        Write-Host "Sample Carton IDs:" -ForegroundColor Cyan
        
        $sampleCartons = $batchDetails.cartons | Select-Object -First 5
        foreach ($carton in $sampleCartons) {
            Write-Host "   $($carton.carton_id)" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "TEST THESE CARTON IDs" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Copy one of the carton IDs above and test it:" -ForegroundColor White
        Write-Host "1. Go to https://pack-guard.vercel.app/login" -ForegroundColor Gray
        Write-Host "2. Log in as manufacturer" -ForegroundColor Gray
        Write-Host "3. Go to dashboard" -ForegroundColor Gray
        Write-Host "4. Paste the carton ID in the verification widget" -ForegroundColor Gray
        Write-Host "5. Click 'Verify Now'" -ForegroundColor Gray
        Write-Host ""
        Write-Host "If it still shows INVALID:" -ForegroundColor Yellow
        Write-Host "- Check browser console (F12) for logs" -ForegroundColor Gray
        Write-Host "- Make sure you're logged in" -ForegroundColor Gray
        Write-Host "- Try hard refresh (Ctrl+Shift+R)" -ForegroundColor Gray
        Write-Host ""
        
    } else {
        Write-Host "❌ NO CARTONS FOUND in batch" -ForegroundColor Red
        Write-Host "   The batch exists but has no cartons" -ForegroundColor Yellow
        Write-Host "   This might be a batch creation issue" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "⚠️  Could not get batch details: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   The batch might not have cartons associated with it" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If cartons were found above, use those IDs for testing." -ForegroundColor White
Write-Host "If no cartons were found, you need to create a new batch." -ForegroundColor White
Write-Host ""
