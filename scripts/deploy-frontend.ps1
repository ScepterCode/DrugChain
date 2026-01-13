# DrugChain Frontend Deployment Script for Vercel (PowerShell)

Write-Host "🚀 Deploying DrugChain Frontend to Vercel..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the frontend directory." -ForegroundColor Red
    exit 1
}

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Login to Vercel (if not already logged in)
Write-Host "🔐 Checking Vercel authentication..." -ForegroundColor Blue
try {
    vercel whoami | Out-Null
    Write-Host "✅ Already logged in to Vercel" -ForegroundColor Green
} catch {
    Write-Host "Please log in to Vercel..." -ForegroundColor Yellow
    vercel login
}

# Set production environment
Write-Host "🔧 Setting up production environment..." -ForegroundColor Blue
$env:NODE_ENV = "production"

# Build the project
Write-Host "🏗️  Building the project..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Blue
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
    Write-Host "📝 Don't forget to:" -ForegroundColor Yellow
    Write-Host "   1. Update your backend CORS_ORIGINS with the new Vercel URL" -ForegroundColor Yellow
    Write-Host "   2. Test all functionality on the deployed site" -ForegroundColor Yellow
    Write-Host "   3. Update any documentation with the new URLs" -ForegroundColor Yellow
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}