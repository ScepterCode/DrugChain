# Test Deployment Status
Write-Host "Checking PackGuard Deployment Status..." -ForegroundColor Green

# Test Frontend
Write-Host "`nTesting Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://drug-chain.vercel.app" -Method GET
    if ($response.Content -match "PackGuard") {
        Write-Host "✓ Frontend: PackGuard branding detected" -ForegroundColor Green
    } else {
        Write-Host "⚠ Frontend: Still showing old branding" -ForegroundColor Yellow
    }
    
    if ($response.Content -match "Universal Product Authentication") {
        Write-Host "✓ Frontend: Universal messaging detected" -ForegroundColor Green
    } else {
        Write-Host "⚠ Frontend: Universal messaging not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Frontend: Failed to load" -ForegroundColor Red
}

# Test Backend
Write-Host "`nTesting Backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://drugchain-backend.onrender.com/" -Method GET
    if ($response.message -eq "PackGuard API") {
        Write-Host "✓ Backend: PackGuard API detected" -ForegroundColor Green
    } else {
        Write-Host "⚠ Backend: Still showing: $($response.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Backend: Failed to connect" -ForegroundColor Red
}

Write-Host "`nDeployment check complete!" -ForegroundColor Green