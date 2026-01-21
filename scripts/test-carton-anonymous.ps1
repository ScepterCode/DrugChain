# Test Carton Verification Without Authentication
# This should return UNAUTHORIZED, confirming the backend is working

$BACKEND_URL = "https://drugchain-1.onrender.com/api/v1"
$CARTON_ID = "CT-20260121-829O4Q-0001"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ANONYMOUS CARTON VERIFICATION TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Testing carton verification WITHOUT authentication..." -ForegroundColor Yellow
Write-Host "Carton ID: $CARTON_ID" -ForegroundColor Gray
Write-Host ""

$verifyBody = @{
    carton_id = $CARTON_ID
    verification_method = "WEB"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/verify/carton" -Method Post -Body $verifyBody -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "Response received:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
    Write-Host ""
    
    if ($response.verification_result -eq "UNAUTHORIZED") {
        Write-Host "✅ EXPECTED RESULT: Unauthorized access blocked" -ForegroundColor Green
        Write-Host "   Backend is working correctly!" -ForegroundColor Green
        Write-Host ""
        Write-Host "NEXT STEP: Test with authentication" -ForegroundColor Yellow
        Write-Host "   You need to log in to the frontend and test from there" -ForegroundColor Gray
    } elseif ($response.verification_result -eq "INVALID") {
        Write-Host "⚠️  UNEXPECTED: Returned INVALID instead of UNAUTHORIZED" -ForegroundColor Yellow
        Write-Host "   This might indicate the carton doesn't exist in database" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  UNEXPECTED RESULT: $($response.verification_result)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        try {
            $errorData = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host ""
            Write-Host "Error details:" -ForegroundColor Yellow
            Write-Host ($errorData | ConvertTo-Json -Depth 5) -ForegroundColor White
            
            if ($errorData.verification_result -eq "UNAUTHORIZED") {
                Write-Host ""
                Write-Host "✅ EXPECTED RESULT: Unauthorized access blocked" -ForegroundColor Green
                Write-Host "   Backend is working correctly!" -ForegroundColor Green
            }
        } catch {
            Write-Host "   $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONCLUSION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see UNAUTHORIZED:" -ForegroundColor White
Write-Host "  ✅ Backend is working correctly" -ForegroundColor Green
Write-Host "  ✅ Authorization checks are in place" -ForegroundColor Green
Write-Host "  → Test with authenticated user on frontend" -ForegroundColor Yellow
Write-Host ""
Write-Host "If you see INVALID:" -ForegroundColor White
Write-Host "  ⚠️  Carton might not exist in database" -ForegroundColor Yellow
Write-Host "  → Check database for carton: $CARTON_ID" -ForegroundColor Yellow
Write-Host ""
Write-Host "To test with authentication:" -ForegroundColor White
Write-Host "  1. Go to https://pack-guard.vercel.app/login" -ForegroundColor Gray
Write-Host "  2. Log in as manufacturer" -ForegroundColor Gray
Write-Host "  3. Go to dashboard" -ForegroundColor Gray
Write-Host "  4. Open DevTools (F12) → Console tab" -ForegroundColor Gray
Write-Host "  5. Enter carton ID: $CARTON_ID" -ForegroundColor Gray
Write-Host "  6. Check console logs for debugging info" -ForegroundColor Gray
Write-Host ""
