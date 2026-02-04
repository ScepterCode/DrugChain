# Force Vercel Redeploy Script
# This script forces a clean deployment by updating a trigger file

Write-Host "🚀 Forcing Vercel Redeploy..." -ForegroundColor Green

# Update the trigger file with current timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$triggerContent = @"
# Vercel Deployment Trigger
# Last updated: $timestamp
# This file is used to force Vercel redeployments

DEPLOYMENT_TRIGGER=$timestamp
BUILD_OPTIMIZATION=true
NODE_ENV=production
"@

Set-Content -Path "frontend/.vercel-rebuild" -Value $triggerContent

Write-Host "✅ Updated deployment trigger file" -ForegroundColor Green

# Commit and push the changes
git add frontend/.vercel-rebuild frontend/.vercelignore frontend/vercel.json
git commit -m "🚀 Force Vercel redeploy with optimized build config

- Updated .vercel-rebuild trigger file
- Added .vercelignore to reduce deployment size  
- Optimized vercel.json with npm ci and memory settings
- Fixed npm audit vulnerabilities
- Timestamp: $timestamp"

git push origin master

Write-Host "🎯 Deployment triggered! Check Vercel dashboard for progress." -ForegroundColor Green
Write-Host "📊 Monitor at: https://vercel.com/dashboard" -ForegroundColor Yellow