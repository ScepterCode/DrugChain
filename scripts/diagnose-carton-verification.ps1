# COMPREHENSIVE CARTON VERIFICATION DIAGNOSTIC
# This script tests the entire carton verification flow from frontend to backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CARTON VERIFICATION DIAGNOSTIC TOOL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$BACKEND_URL = "https://drugchain-1.onrender.com/api/v1"
$FRONTEND_URL = "https://pack-guard.vercel.app"
$CARTON_ID = "CT-20260121-829O4Q-0001"

# Test 1: Check if backend is accessible
Write-Host "[TEST 1] Backend Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$BACKEND_URL/../health" -Method Get -ErrorAction Stop
    Write-Host "✅ Backend is accessible" -ForegroundColor Green
    Write-Host "   Response: $($healthResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend is NOT accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Login as manufacturer to get JWT token
Write-Host "[TEST 2] Login as Manufacturer..." -ForegroundColor Yellow
$loginBody = @{
    username = "manufacturer@test.com"
    password = "test123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    $JWT_TOKEN = $loginResponse.access_token
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.user.first_name) $($loginResponse.user.last_name)" -ForegroundColor Gray
    Write-Host "   Role: $($loginResponse.user.role)" -ForegroundColor Gray
    Write-Host "   Token: $($JWT_TOKEN.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Note: Using test credentials. Update script if credentials are different." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 3: Check if carton exists in database
Write-Host "[TEST 3] Check Carton in Database..." -ForegroundColor Yellow
Write-Host "   Carton ID: $CARTON_ID" -ForegroundColor Gray
try {
    # Try to get batch info (indirect way to check carton)
    $headers = @{
        "Authorization" = "Bearer $JWT_TOKEN"
        "Content-Type" = "application/json"
    }
    
    # Note: We don't have a direct carton lookup endpoint, so we'll test verification directly
    Write-Host "   ℹ️  No direct carton lookup endpoint - will test via verification" -ForegroundColor Gray
} catch {
    Write-Host "   ⚠️  Could not check carton existence" -ForegroundColor Yellow
}
Write-Host ""

# Test 4: Verify carton WITHOUT authentication (should fail)
Write-Host "[TEST 4] Verify Carton WITHOUT Auth (should fail)..." -ForegroundColor Yellow
$verifyBody = @{
    carton_id = $CARTON_ID
    verification_method = "WEB"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/verify/carton" -Method Post -Body $verifyBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "   Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
    
    if ($response.verification_result -eq "UNAUTHORIZED") {
        Write-Host "✅ Correctly blocked unauthorized access" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unexpected result: $($response.verification_result)" -ForegroundColor Yellow
    }
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorDetails.verification_result -eq "UNAUTHORIZED") {
        Write-Host "✅ Correctly blocked unauthorized access" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 5: Verify carton WITH authentication (should succeed)
Write-Host "[TEST 5] Verify Carton WITH Auth (should succeed)..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $JWT_TOKEN"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/verify/carton" -Method Post -Body $verifyBody -Headers $headers -ContentType "application/json" -ErrorAction Stop
    Write-Host "   Response:" -ForegroundColor Gray
    Write-Host "   $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Gray
    
    if ($response.success -eq $true) {
        Write-Host "✅ Carton verification SUCCESSFUL" -ForegroundColor Green
        Write-Host "   Status: $($response.verification_result)" -ForegroundColor Green
        Write-Host "   Product: $($response.data.product_name)" -ForegroundColor Green
        Write-Host "   Batch: $($response.data.batch_id)" -ForegroundColor Green
    } elseif ($response.verification_result -eq "INVALID") {
        Write-Host "❌ Carton verification returned INVALID" -ForegroundColor Red
        Write-Host "   This is the BUG we're investigating!" -ForegroundColor Red
        Write-Host "   Message: $($response.message)" -ForegroundColor Red
    } else {
        Write-Host "⚠️  Unexpected result: $($response.verification_result)" -ForegroundColor Yellow
        Write-Host "   Message: $($response.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Carton verification FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 6: Check frontend deployment
Write-Host "[TEST 6] Check Frontend Deployment..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri $FRONTEND_URL -Method Get -ErrorAction Stop
    Write-Host "✅ Frontend is accessible" -ForegroundColor Green
    Write-Host "   Status: $($frontendResponse.StatusCode)" -ForegroundColor Gray
    
    # Check if the response contains the CT- detection logic
    $content = $frontendResponse.Content
    if ($content -match "CT-") {
        Write-Host "✅ Frontend code contains 'CT-' string" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend code does NOT contain 'CT-' string" -ForegroundColor Yellow
        Write-Host "   This might indicate old code is still deployed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Frontend is NOT accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: Check GitHub latest commit
Write-Host "[TEST 7] Check GitHub Latest Commit..." -ForegroundColor Yellow
try {
    $githubResponse = Invoke-RestMethod -Uri "https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/commits?per_page=1" -Method Get -ErrorAction Stop
    Write-Host "✅ Latest commit: $($githubResponse[0].sha.Substring(0, 7))" -ForegroundColor Green
    Write-Host "   Message: $($githubResponse[0].commit.message)" -ForegroundColor Gray
    Write-Host "   Date: $($githubResponse[0].commit.author.date)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Could not fetch GitHub info (update repo URL in script)" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. If Test 5 shows INVALID - the backend database lookup is failing" -ForegroundColor White
Write-Host "2. If Test 5 succeeds but frontend still shows INVALID - it's a frontend deployment issue" -ForegroundColor White
Write-Host "3. Check Vercel deployment logs to see if latest commit is deployed" -ForegroundColor White
Write-Host "4. Try hard refresh in browser (Ctrl+Shift+R) to clear cache" -ForegroundColor White
Write-Host ""
Write-Host "DEBUGGING TIPS:" -ForegroundColor Yellow
Write-Host "- Open browser DevTools (F12) → Network tab" -ForegroundColor White
Write-Host "- Scan a carton code on manufacturer dashboard" -ForegroundColor White
Write-Host "- Look for the API call to /verify/carton" -ForegroundColor White
Write-Host "- Check if Authorization header is present" -ForegroundColor White
Write-Host "- Check the response body for error details" -ForegroundColor White
Write-Host ""
