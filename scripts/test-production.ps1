# Test Production Deployment Script

Write-Host "🧪 Testing DrugChain Production Deployment..." -ForegroundColor Green

# Test Backend Health
Write-Host "`n1. Testing Backend Health..." -ForegroundColor Blue
try {
    $healthResponse = Invoke-WebRequest -Uri "https://drugchain-backend.onrender.com/health" -Method GET
    Write-Host "✅ Backend Health: $($healthResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($healthResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend Health Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Backend API Docs
Write-Host "`n2. Testing Backend API Docs..." -ForegroundColor Blue
try {
    $docsResponse = Invoke-WebRequest -Uri "https://drugchain-backend.onrender.com/api/docs" -Method GET
    Write-Host "✅ API Docs: $($docsResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ API Docs Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Backend Root
Write-Host "`n3. Testing Backend Root..." -ForegroundColor Blue
try {
    $rootResponse = Invoke-WebRequest -Uri "https://drugchain-backend.onrender.com/" -Method GET
    Write-Host "✅ Backend Root: $($rootResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($rootResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend Root Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Frontend
Write-Host "`n4. Testing Frontend..." -ForegroundColor Blue
try {
    $frontendResponse = Invoke-WebRequest -Uri "https://drug-chain.vercel.app/" -Method GET
    Write-Host "✅ Frontend: $($frontendResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test CORS (simulate frontend request)
Write-Host "`n5. Testing CORS..." -ForegroundColor Blue
try {
    $corsHeaders = @{
        "Origin" = "https://drug-chain.vercel.app"
        "Content-Type" = "application/json"
    }
    $corsResponse = Invoke-WebRequest -Uri "https://drugchain-backend.onrender.com/api/v1/auth/register" -Method OPTIONS -Headers $corsHeaders
    Write-Host "✅ CORS Preflight: $($corsResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ CORS Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "This might be the main issue!" -ForegroundColor Yellow
}

Write-Host "`n📋 Summary:" -ForegroundColor Yellow
Write-Host "- If Backend Health/Root work but CORS fails, update CORS_ORIGINS in Render" -ForegroundColor White
Write-Host "- If Frontend works but API calls fail, update VITE_API_URL in Vercel" -ForegroundColor White
Write-Host "- Check browser dev tools (F12) for actual error messages" -ForegroundColor White

Write-Host "`n🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to Render dashboard → Environment → Add CORS_ORIGINS=https://drug-chain.vercel.app" -ForegroundColor White
Write-Host "2. Go to Vercel dashboard → Settings → Environment Variables → Add VITE_API_URL=https://drugchain-backend.onrender.com/api/v1" -ForegroundColor White
Write-Host "3. Redeploy both services" -ForegroundColor White