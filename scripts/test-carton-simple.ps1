# Simple carton verification test
$BACKEND_URL = "https://drugchain-1.onrender.com/api/v1"
$CARTON_ID = "CT-20260121-829O4Q-0001"

Write-Host "Testing Carton Verification..." -ForegroundColor Cyan
Write-Host ""

# Test without authentication
Write-Host "Test: Carton verification (no auth)" -ForegroundColor Yellow
$body = @{
    carton_id = $CARTON_ID
    verification_method = "WEB"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/verify/carton" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "Result: $($response.verification_result)" -ForegroundColor Green
    Write-Host "Message: $($response.message)"
    Write-Host "Success: $($response.success)"
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Frontend detection test:" -ForegroundColor Yellow
$testId = "CT-20260121-829O4Q-0001"
Write-Host "Input: $testId"
Write-Host "Starts with CT-: $($testId.StartsWith('CT-'))"
