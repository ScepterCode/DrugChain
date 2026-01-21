# Verify Latest Deployment is Live
# This checks if the batch endpoints fix has been deployed

$BASE_URL = "https://drugchain-1.onrender.com"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verifying Latest Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking deployment timestamp..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/deployment-test" -Method Get
    
    Write-Host "Deployment timestamp: $($response.deployment_timestamp)" -ForegroundColor White
    Write-Host "Server time: $($response.server_time)" -ForegroundColor Gray
    Write-Host ""
    
    # Check if it's the latest deployment
    if ($response.deployment_timestamp -eq "2026-01-21T11:30:00Z") {
        Write-Host "✓ LATEST CODE IS DEPLOYED!" -ForegroundColor Green
        Write-Host ""
        
        # Check for fix flags
        if ($response.batches_trailing_slash_fix -eq $true) {
            Write-Host "✓ Batches trailing slash fix: APPLIED" -ForegroundColor Green
        } else {
            Write-Host "✗ Batches trailing slash fix: NOT FOUND" -ForegroundColor Red
        }
        
        if ($response.supply_chain_trailing_slash_fix -eq $true) {
            Write-Host "✓ Supply chain trailing slash fix: APPLIED" -ForegroundColor Green
        } else {
            Write-Host "✗ Supply chain trailing slash fix: NOT FOUND" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "READY TO TEST!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Go to https://pack-guard.vercel.app" -ForegroundColor White
        Write-Host "2. Login as manufacturer" -ForegroundColor White
        Write-Host "3. Go to Batches page" -ForegroundColor White
        Write-Host "4. Click on a batch" -ForegroundColor White
        Write-Host "5. Try 'Download QR Codes' button" -ForegroundColor White
        Write-Host "6. Try 'Load Pack IDs' button" -ForegroundColor White
        Write-Host ""
        Write-Host "Both should work now! 🎉" -ForegroundColor Green
        
    } elseif ($response.deployment_timestamp -eq "2026-01-21T10:15:00Z") {
        Write-Host "✗ OLD CODE STILL DEPLOYED" -ForegroundColor Red
        Write-Host ""
        Write-Host "The deployment hasn't updated yet." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "ACTION REQUIRED:" -ForegroundColor Red
        Write-Host "1. Go to Render dashboard: https://dashboard.render.com" -ForegroundColor White
        Write-Host "2. Select 'drugchain-1' service" -ForegroundColor White
        Write-Host "3. Click 'Manual Deploy' → 'Clear build cache & deploy'" -ForegroundColor White
        Write-Host "4. Wait 5-10 minutes for deployment" -ForegroundColor White
        Write-Host "5. Run this script again to verify" -ForegroundColor White
        Write-Host ""
        Write-Host "NOTE: The code changes are committed, but Render" -ForegroundColor Yellow
        Write-Host "needs to rebuild with cleared cache to pick them up." -ForegroundColor Yellow
        
    } else {
        Write-Host "⚠ UNKNOWN DEPLOYMENT VERSION" -ForegroundColor Yellow
        Write-Host "Timestamp: $($response.deployment_timestamp)" -ForegroundColor White
        Write-Host ""
        Write-Host "This might be a different deployment. Check Render logs." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "✗ Failed to check deployment" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Backend might be down or restarting." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
