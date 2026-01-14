#!/usr/bin/env pwsh

# Monitor backend deployment progress

$baseUrl = "https://drugchain-backend.onrender.com/api/v1"
$maxAttempts = 20
$attempt = 1

Write-Host "Monitoring backend deployment progress..." -ForegroundColor Green
Write-Host "This will check every 30 seconds for up to 10 minutes" -ForegroundColor Yellow

while ($attempt -le $maxAttempts) {
    Write-Host "`nAttempt $attempt/$maxAttempts - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
    
    # Test health endpoint
    try {
        $healthResponse = Invoke-RestMethod -Uri "https://drugchain-backend.onrender.com/health" -Method GET -TimeoutSec 10
        Write-Host "✓ Health check: $($healthResponse.status)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
        $attempt++
        Start-Sleep -Seconds 30
        continue
    }
    
    # Test public products endpoint
    try {
        $productsResponse = Invoke-RestMethod -Uri "$baseUrl/products/public" -Method GET -TimeoutSec 10
        Write-Host "✓ Public products endpoint working! Found $($productsResponse.Count) products" -ForegroundColor Green
        
        # Test authenticated products endpoint
        Write-Host "Testing authenticated endpoints..." -ForegroundColor Yellow
        try {
            $response = Invoke-RestMethod -Uri "$baseUrl/products" -Method GET -TimeoutSec 10
            Write-Host "✗ Products endpoint should require auth but didn't" -ForegroundColor Yellow
        } catch {
            if ($_.Exception.Response.StatusCode -eq 401) {
                Write-Host "✓ Products endpoint correctly requires authentication" -ForegroundColor Green
            } else {
                Write-Host "? Products endpoint returned: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
            }
        }
        
        Write-Host "`n🎉 Backend deployment completed successfully!" -ForegroundColor Green
        Write-Host "Frontend should now work properly with products." -ForegroundColor Green
        break
        
    } catch {
        Write-Host "✗ Public products endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        }
    }
    
    if ($attempt -eq $maxAttempts) {
        Write-Host "`n⚠️  Deployment monitoring timed out" -ForegroundColor Yellow
        Write-Host "The backend may still be deploying. Check Render dashboard for status." -ForegroundColor Yellow
        break
    }
    
    Write-Host "Waiting 30 seconds before next check..." -ForegroundColor Gray
    Start-Sleep -Seconds 30
    $attempt++
}

Write-Host "`nMonitoring completed at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan