# Test Strict Verification (No Fallback Logic)
# This will now show exactly where database relationships are broken

$baseUrl = "https://drugchain-1.onrender.com/api/v1"

Write-Host "=== TESTING STRICT VERIFICATION (NO FALLBACK LOGIC) ===" -ForegroundColor Red

Write-Host "`nThe verification service now has NO fallback logic." -ForegroundColor Yellow
Write-Host "It will fail clearly when database relationships are broken." -ForegroundColor Yellow

# Test with existing pack ID that was showing "Unknown"
Write-Host "`n1. Testing with pack ID that showed 'Unknown' before..." -ForegroundColor Yellow

$testPackId = "PK-ABC12345"  # Replace with actual pack ID you were testing
$testData = @{
    pack_id = $testPackId
    verification_method = "WEB"
} | ConvertTo-Json

Write-Host "Testing pack ID: $testPackId" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/verify/pack" -Method POST -Body $testData -ContentType "application/json" -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "`nRESULT:" -ForegroundColor Green
    Write-Host "Success: $($result.success)" -ForegroundColor White
    Write-Host "Status: $($result.verification_result)" -ForegroundColor White
    Write-Host "Message: $($result.message)" -ForegroundColor White
    
    if ($result.data) {
        Write-Host "`nData returned:" -ForegroundColor Green
        $result.data | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Gray
    }
    
} catch {
    Write-Host "`nERROR RESPONSE:" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host $errorContent -ForegroundColor Red
    } else {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "`n=== EXPECTED RESULTS ===" -ForegroundColor Green

Write-Host "`nIf you see 'DATA_ERROR' responses, that's GOOD!" -ForegroundColor Yellow
Write-Host "It means we've identified exactly where the database relationships are broken:" -ForegroundColor White

Write-Host "`n• MISSING_BATCH: Pack exists but batch is missing" -ForegroundColor Cyan
Write-Host "• MISSING_PRODUCT: Batch exists but product is missing" -ForegroundColor Cyan  
Write-Host "• MISSING_MANUFACTURER: Batch exists but manufacturer is missing" -ForegroundColor Cyan
Write-Host "• MISSING_ORGANIZATION: Manufacturer exists but organization is missing" -ForegroundColor Cyan

Write-Host "`n=== FIXING BROKEN RELATIONSHIPS ===" -ForegroundColor Green

Write-Host "`nBased on the error type, run the appropriate fix:" -ForegroundColor Yellow

Write-Host "`n1. If MISSING_BATCH:" -ForegroundColor Cyan
Write-Host "   - Run FIX_VERIFICATION_DATA_ISSUE.sql to create proper batches" -ForegroundColor White

Write-Host "`n2. If MISSING_PRODUCT:" -ForegroundColor Cyan
Write-Host "   - Create products using the fixed product creation system" -ForegroundColor White

Write-Host "`n3. If MISSING_MANUFACTURER:" -ForegroundColor Cyan
Write-Host "   - Create manufacturer records in organizations and manufacturers tables" -ForegroundColor White

Write-Host "`n4. If MISSING_ORGANIZATION:" -ForegroundColor Cyan
Write-Host "   - Create organization records for existing manufacturers" -ForegroundColor White

Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Green

Write-Host "1. Note the specific error type from the test above" -ForegroundColor White
Write-Host "2. Run the appropriate SQL fix for that error type" -ForegroundColor White
Write-Host "3. Test again - should show real product data" -ForegroundColor White
Write-Host "4. Repeat for any other broken pack IDs" -ForegroundColor White

Write-Host "`n🎯 GOAL: No more 'Unknown' values - only real data or clear error messages!" -ForegroundColor Green