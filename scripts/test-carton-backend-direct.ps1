# Direct Backend Test for Carton Verification
# Tests the backend API directly to isolate frontend issues

$BACKEND_URL = "https://drugchain-1.onrender.com/api/v1"
$CARTON_ID = "CT-20260121-829O4Q-0001"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIRECT BACKEND CARTON TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "[1/3] Logging in as manufacturer..." -ForegroundColor Yellow
$loginBody = @{
    username = "manufacturer@test.com"
    password = "test123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.user.first_name) $($loginResponse.user.last_name)" -ForegroundColor Gray
    Write-Host "   Role: $($loginResponse.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Update credentials in script if needed" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 2: Verify carton with authentication
Write-Host "[2/3] Verifying carton: $CARTON_ID" -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$verifyBody = @{
    carton_id = $CARTON_ID
    verification_method = "WEB"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/verify/carton" -Method Post -Body $verifyBody -Headers $headers -ContentType "application/json"
    
    Write-Host "✅ API call successful" -ForegroundColor Green
    Write-Host ""
    Write-Host "RESPONSE:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
    Write-Host ""
    
    if ($response.success -eq $true) {
        Write-Host "✅ CARTON VERIFIED SUCCESSFULLY!" -ForegroundColor Green
        Write-Host "   Status: $($response.verification_result)" -ForegroundColor Green
        Write-Host "   Product: $($response.data.product_name)" -ForegroundColor Green
        Write-Host "   Batch: $($response.data.batch_id)" -ForegroundColor Green
        Write-Host ""
        Write-Host "CONCLUSION: Backend is working correctly!" -ForegroundColor Green
        Write-Host "The issue is likely in the frontend deployment or browser cache." -ForegroundColor Yellow
    } else {
        Write-Host "❌ VERIFICATION FAILED" -ForegroundColor Red
        Write-Host "   Result: $($response.verification_result)" -ForegroundColor Red
        Write-Host "   Message: $($response.message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "CONCLUSION: Backend is returning INVALID" -ForegroundColor Red
        Write-Host "The carton may not exist in the database or there's a backend issue." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ API call failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Step 3: Check database directly (if possible)
Write-Host "[3/3] Recommendations:" -ForegroundColor Yellow
Write-Host ""
Write-Host "If backend returned INVALID:" -ForegroundColor White
Write-Host "  1. Check if carton exists in database:" -ForegroundColor Gray
Write-Host "     SELECT * FROM cartons WHERE carton_id = '$CARTON_ID';" -ForegroundColor Gray
Write-Host "  2. Check if batch exists:" -ForegroundColor Gray
Write-Host "     SELECT * FROM batches WHERE batch_id LIKE '%20260121-829O4Q%';" -ForegroundColor Gray
Write-Host ""
Write-Host "If backend returned SUCCESS:" -ForegroundColor White
Write-Host "  1. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor Gray
Write-Host "  2. Hard refresh (Ctrl+Shift+R)" -ForegroundColor Gray
Write-Host "  3. Check Vercel deployment status" -ForegroundColor Gray
Write-Host "  4. Open DevTools → Network tab and check API calls" -ForegroundColor Gray
Write-Host ""
