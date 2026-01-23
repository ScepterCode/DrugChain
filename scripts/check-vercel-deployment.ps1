# Check what's actually deployed on Vercel

$FRONTEND_URL = "https://pack-guard.vercel.app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL DEPLOYMENT CHECK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[INFO] Checking Vercel deployment..." -ForegroundColor Yellow
Write-Host "URL: $FRONTEND_URL" -ForegroundColor Gray
Write-Host ""

Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Go to https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Find your 'pack-guard' project" -ForegroundColor White
Write-Host "3. Click on the latest deployment" -ForegroundColor White
Write-Host "4. Check the deployment status and logs" -ForegroundColor White
Write-Host "5. If needed, click 'Redeploy' to force a fresh build" -ForegroundColor White
Write-Host ""

Write-Host "TROUBLESHOOTING:" -ForegroundColor Yellow
Write-Host "If the verification widget is still missing:" -ForegroundColor White
Write-Host "  - Clear Vercel build cache (Redeploy > Clear cache and redeploy)" -ForegroundColor White
Write-Host "  - Hard refresh browser (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "  - Check browser console for errors" -ForegroundColor White
Write-Host ""

Write-Host "VERIFICATION:" -ForegroundColor Yellow
Write-Host "The manufacturer dashboard should show:" -ForegroundColor White
Write-Host "  ✅ 'Product Verification' section (NOT 'Verification Trends')" -ForegroundColor Green
Write-Host "  ✅ QR Scanner button" -ForegroundColor Green
Write-Host "  ✅ Pack ID input field" -ForegroundColor Green
Write-Host "  ✅ 'Verify Now' button" -ForegroundColor Green
Write-Host ""

Write-Host "Latest commits pushed:" -ForegroundColor Cyan
git log --oneline -5
Write-Host ""
