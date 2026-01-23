# Test if the correct backend URL works with actual carton data

$CORRECT_URL = "https://drugchain-1.onrender.com/api/v1"
$WRONG_URL = "https://drugchain-backend.onrender.com/api/v1"
$CARTON_ID = "CT-20260121-JGUYNW-0024"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BACKEND URL TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check WRONG URL (current in vercel.json)
Write-Host "[TEST 1] Testing WRONG URL: $WRONG_URL" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$WRONG_URL/../health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "❌ WRONG URL is accessible (Status: $($response.StatusCode))" -ForegroundColor Red
    Write-Host "   This is the problem! Vercel is using the wrong backend URL" -ForegroundColor Red
} catch {
    Write-Host "✅ WRONG URL is NOT accessible (as expected)" -ForegroundColor Green
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 2: Check CORRECT URL
Write-Host "[TEST 2] Testing CORRECT URL: $CORRECT_URL" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$CORRECT_URL/../health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ CORRECT URL is accessible" -ForegroundColor Green
    Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "❌ CORRECT URL is NOT accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 3: Test carton verification with CORRECT URL (anonymous - should return UNAUTHORIZED)
Write-Host "[TEST 3] Testing carton verification with CORRECT URL (anonymous)" -ForegroundColor Yellow
$verifyBody = @{
    carton_id = $CARTON_ID
    verification_method = "WEB"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$CORRECT_URL/verify/carton" -Method Post -Body $verifyBody -ContentType "application/json" -ErrorAction Stop
    
    if ($response.verification_result -eq "UNAUTHORIZED") {
        Write-Host "✅ Correct behavior: Returns UNAUTHORIZED for anonymous user" -ForegroundColor Green
        Write-Host "   Message: $($response.message)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Unexpected result: $($response.verification_result)" -ForegroundColor Yellow
    }
} catch {
    if ($_.ErrorDetails) {
        $errorData = $_.ErrorDetails.Message | ConvertFrom-Json
        if ($errorData.verification_result -eq "UNAUTHORIZED") {
            Write-Host "✅ Correct behavior: Returns UNAUTHORIZED for anonymous user" -ForegroundColor Green
        }
    }
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONCLUSION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The problem is:" -ForegroundColor Yellow
Write-Host "  ❌ Vercel is configured to use: $WRONG_URL" -ForegroundColor Red
Write-Host "  ✅ Should be using: $CORRECT_URL" -ForegroundColor Green
Write-Host ""
Write-Host "Solution:" -ForegroundColor Yellow
Write-Host "  1. Update frontend/vercel.json to use correct URL" -ForegroundColor White
Write-Host "  2. Commit and push changes" -ForegroundColor White
Write-Host "  3. Vercel will redeploy with correct backend URL" -ForegroundColor White
Write-Host "  4. Carton verification will work!" -ForegroundColor White
Write-Host ""
Write-Host "I've already updated the files. Ready to commit when you confirm." -ForegroundColor Green
Write-Host ""
