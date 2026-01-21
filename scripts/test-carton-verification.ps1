# Deep diagnostic script for carton verification
# Tests the entire flow from frontend to backend

$BACKEND_URL = "https://drugchain-1.onrender.com/api/v1"
$CARTON_ID = "CT-20260121-829O4Q-0001"

Write-Host "=== DEEP CARTON VERIFICATION DIAGNOSTIC ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if backend is responding
Write-Host "Test 1: Backend Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BACKEND_URL/deployment-test" -Method Get
    Write-Host "✓ Backend is responding" -ForegroundColor Green
    Write-Host "  Deployment time: $($response.deployment_time)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Backend not responding" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Test carton verification WITHOUT authentication (should fail with UNAUTHORIZED)
Write-Host "Test 2: Carton Verification (No Auth - Should be UNAUTHORIZED)" -ForegroundColor Yellow
try {
    $body = @{
        carton_id = $CARTON_ID
        verification_method = "WEB"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BACKEND_URL/verify/carton" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "  Result: $($response.verification_result)" -ForegroundColor $(if ($response.verification_result -eq "UNAUTHORIZED") { "Green" } else { "Red" })
    Write-Host "  Message: $($response.message)" -ForegroundColor Gray
    Write-Host "  Success: $($response.success)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Request failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Check what the frontend would send
Write-Host "Test 3: Frontend Detection Logic Simulation" -ForegroundColor Yellow
$testId = "CT-20260121-829O4Q-0001"
$cleanId = $testId.Trim().ToUpper()

Write-Host "  Input: $testId" -ForegroundColor Gray
Write-Host "  Cleaned: $cleanId" -ForegroundColor Gray
Write-Host "  Starts with 'CT-': $($cleanId.StartsWith('CT-'))" -ForegroundColor $(if ($cleanId.StartsWith('CT-')) { "Green" } else { "Red" })
Write-Host "  Starts with 'CARTON-': $($cleanId.StartsWith('CARTON-'))" -ForegroundColor Gray
Write-Host "  Contains 'CARTON': $($cleanId.Contains('CARTON'))" -ForegroundColor Gray

if ($cleanId.StartsWith('CT-') -or $cleanId.StartsWith('CARTON-') -or $cleanId.Contains('CARTON')) {
    Write-Host "  -> Would call: verifyCarton()" -ForegroundColor Green
} else {
    Write-Host "  -> Would call: verifyPack()" -ForegroundColor Red
}
Write-Host ""

# Test 4: Instructions for authenticated test
Write-Host "Test 4: Authenticated Test (Manual)" -ForegroundColor Yellow
Write-Host "  To test with authentication:" -ForegroundColor Gray
Write-Host "  1. Log in to https://pack-guard.vercel.app/login as manufacturer" -ForegroundColor Gray
Write-Host "  2. Open browser DevTools (F12)" -ForegroundColor Gray
Write-Host "  3. Go to Console tab" -ForegroundColor Gray
Write-Host "  4. Paste the JavaScript code from the console test file" -ForegroundColor Gray
Write-Host ""

Write-Host "=== DIAGNOSTIC COMPLETE ===" -ForegroundColor Cyan
