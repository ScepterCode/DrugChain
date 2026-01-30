# Diagnose 500 Error in Product Creation
# This script tests the debug endpoint and provides detailed error analysis

$baseUrl = "https://drugchain-1.onrender.com/api/v1"

Write-Host "=== DIAGNOSING 500 ERROR IN PRODUCT CREATION ===" -ForegroundColor Red

# You'll need to get a valid JWT token from the frontend
# For now, let's test without authentication to see the error
Write-Host "`n1. Testing debug endpoint (requires auth token)..." -ForegroundColor Yellow
Write-Host "⚠️  You need to provide a valid JWT token to test this" -ForegroundColor Yellow

# Test the debug endpoint structure
$debugUrl = "$baseUrl/products/debug-test"
Write-Host "Debug endpoint URL: $debugUrl" -ForegroundColor Cyan

# Test basic connectivity
Write-Host "`n2. Testing basic backend connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/products" -Method GET -ErrorAction Stop
    Write-Host "✅ Backend is responding" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Backend responding (401 - needs auth)" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== MANUAL TESTING STEPS ===" -ForegroundColor Green

Write-Host "`n1. Get JWT Token from Frontend:" -ForegroundColor Yellow
Write-Host "   - Login to your frontend application" -ForegroundColor White
Write-Host "   - Open browser developer tools (F12)" -ForegroundColor White
Write-Host "   - Go to Application/Storage > Local Storage" -ForegroundColor White
Write-Host "   - Find 'token' or 'authToken' and copy the value" -ForegroundColor White

Write-Host "`n2. Test Debug Endpoint:" -ForegroundColor Yellow
Write-Host @"
   curl -X POST "$debugUrl" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
"@ -ForegroundColor Gray

Write-Host "`n3. Test Product Creation:" -ForegroundColor Yellow
Write-Host @"
   curl -X POST "$baseUrl/products" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
     -d '{
       "product_code": "TEST001",
       "product_name": "Test Product",
       "brand_name": "Test Brand",
       "description": "Test description"
     }'
"@ -ForegroundColor Gray

Write-Host "`n4. Check Render Logs:" -ForegroundColor Yellow
Write-Host "   - Go to https://dashboard.render.com" -ForegroundColor White
Write-Host "   - Find your backend service" -ForegroundColor White
Write-Host "   - Click on 'Logs' tab" -ForegroundColor White
Write-Host "   - Look for detailed error messages after testing" -ForegroundColor White

Write-Host "`n=== LIKELY CAUSES OF 500 ERROR ===" -ForegroundColor Red

Write-Host "`n1. Database Schema Mismatch:" -ForegroundColor Yellow
Write-Host "   - Product model expects columns that don't exist in database" -ForegroundColor White
Write-Host "   - Run DIAGNOSE_500_ERROR.sql in Supabase to check" -ForegroundColor White

Write-Host "`n2. Missing Manufacturer Record:" -ForegroundColor Yellow
Write-Host "   - User's organization_id doesn't match any manufacturer" -ForegroundColor White
Write-Host "   - Check manufacturers table in Supabase" -ForegroundColor White

Write-Host "`n3. Database Connection Issues:" -ForegroundColor Yellow
Write-Host "   - Connection pool exhaustion" -ForegroundColor White
Write-Host "   - Database timeout" -ForegroundColor White
Write-Host "   - Invalid DATABASE_URL in environment" -ForegroundColor White

Write-Host "`n4. SQLAlchemy Model Issues:" -ForegroundColor Yellow
Write-Host "   - Field type mismatch (e.g., UUID vs String)" -ForegroundColor White
Write-Host "   - Required field missing default value" -ForegroundColor White
Write-Host "   - Foreign key constraint violation" -ForegroundColor White

Write-Host "`n=== IMMEDIATE FIXES TO TRY ===" -ForegroundColor Green

Write-Host "`n1. Run Database Diagnostic:" -ForegroundColor Yellow
Write-Host "   - Execute DIAGNOSE_500_ERROR.sql in Supabase" -ForegroundColor White
Write-Host "   - Check if all required columns exist" -ForegroundColor White

Write-Host "`n2. Check Manufacturer Data:" -ForegroundColor Yellow
Write-Host "   - Verify manufacturers table has data" -ForegroundColor White
Write-Host "   - Ensure user's organization_id matches a manufacturer" -ForegroundColor White

Write-Host "`n3. Test with Minimal Data:" -ForegroundColor Yellow
Write-Host "   - Try creating product with only required fields" -ForegroundColor White
Write-Host "   - Use the debug endpoint to check model fields" -ForegroundColor White

Write-Host "`n4. Check Backend Logs:" -ForegroundColor Yellow
Write-Host "   - The updated code now provides detailed error logging" -ForegroundColor White
Write-Host "   - Look for specific error messages in Render logs" -ForegroundColor White

Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Cyan
Write-Host "1. Run DIAGNOSE_500_ERROR.sql in Supabase" -ForegroundColor White
Write-Host "2. Get JWT token and test debug endpoint" -ForegroundColor White
Write-Host "3. Check Render logs for detailed error messages" -ForegroundColor White
Write-Host "4. Report back with specific error details" -ForegroundColor White

Write-Host "`n⚠️  The backend code has been updated with detailed logging." -ForegroundColor Yellow
Write-Host "   Try creating a product now and check the logs for specific errors." -ForegroundColor Yellow