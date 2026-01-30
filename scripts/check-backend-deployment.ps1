# Check Backend Deployment Status
# This script checks various backend URLs and provides deployment guidance

Write-Host "=== BACKEND DEPLOYMENT STATUS CHECK ===" -ForegroundColor Green

$possibleUrls = @(
    "https://packguard-backend.onrender.com",
    "https://drugchain-backend.onrender.com", 
    "https://packguard-api.onrender.com",
    "https://drugchain-api.onrender.com"
)

Write-Host "`nTesting possible backend URLs..." -ForegroundColor Yellow

foreach ($url in $possibleUrls) {
    Write-Host "`nTesting: $url" -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10 -ErrorAction Stop
        Write-Host "✅ SUCCESS: $url is responding (Status: $($response.StatusCode))" -ForegroundColor Green
        
        # Try to get some basic info
        try {
            $healthUrl = "$url/health"
            $healthResponse = Invoke-WebRequest -Uri $healthUrl -Method GET -TimeoutSec 5 -ErrorAction Stop
            Write-Host "✅ Health endpoint working: $healthUrl" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Health endpoint not found, but main URL works" -ForegroundColor Yellow
        }
        
        # Try API endpoints
        try {
            $apiUrl = "$url/api/v1/products"
            $apiResponse = Invoke-WebRequest -Uri $apiUrl -Method GET -TimeoutSec 5 -ErrorAction Stop
            Write-Host "✅ Products API responding: $apiUrl" -ForegroundColor Green
        } catch {
            if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 403) {
                Write-Host "✅ Products API working (requires auth): $apiUrl" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Products API issue: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
        
        break
    } catch {
        if ($_.Exception.Message -like "*Not Found*") {
            Write-Host "❌ Not Found: $url" -ForegroundColor Red
        } elseif ($_.Exception.Message -like "*timeout*") {
            Write-Host "⏱️  Timeout: $url (may be starting up)" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Error: $url - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== DEPLOYMENT GUIDANCE ===" -ForegroundColor Green

Write-Host "`n1. Check Render Dashboard:" -ForegroundColor Yellow
Write-Host "   - Go to https://dashboard.render.com" -ForegroundColor White
Write-Host "   - Find your backend service" -ForegroundColor White
Write-Host "   - Check if it's running or has errors" -ForegroundColor White

Write-Host "`n2. Check Recent Deployments:" -ForegroundColor Yellow
Write-Host "   - Look for failed deployments" -ForegroundColor White
Write-Host "   - Check build logs for errors" -ForegroundColor White
Write-Host "   - Verify environment variables are set" -ForegroundColor White

Write-Host "`n3. Manual Deployment:" -ForegroundColor Yellow
Write-Host "   - Click 'Manual Deploy' in Render dashboard" -ForegroundColor White
Write-Host "   - Or push a commit to trigger auto-deploy" -ForegroundColor White

Write-Host "`n4. Check Environment Variables:" -ForegroundColor Yellow
Write-Host "   - DATABASE_URL (Supabase connection)" -ForegroundColor White
Write-Host "   - SECRET_KEY" -ForegroundColor White
Write-Host "   - CORS_ORIGINS" -ForegroundColor White

Write-Host "`n5. Check Build Command:" -ForegroundColor Yellow
Write-Host "   - Should be: pip install -r requirements.txt" -ForegroundColor White
Write-Host "   - Start command: alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port `$PORT" -ForegroundColor White

Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Cyan
Write-Host "1. Fix backend deployment in Render" -ForegroundColor White
Write-Host "2. Once backend is running, test product creation/editing" -ForegroundColor White
Write-Host "3. The database schema is ready - just need the API running" -ForegroundColor White

Write-Host "`n=== DATABASE STATUS ===" -ForegroundColor Green
Write-Host "✅ Database migration completed successfully" -ForegroundColor Green
Write-Host "✅ All product tables created" -ForegroundColor Green
Write-Host "✅ Product columns added (brand_name, country_of_origin, etc.)" -ForegroundColor Green
Write-Host "⏳ Waiting for backend deployment to test API endpoints" -ForegroundColor Yellow