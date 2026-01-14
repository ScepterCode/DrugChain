#!/usr/bin/env pwsh

# Deploy backend to Render
# This script helps trigger a deployment by making a commit

Write-Host "Deploying backend to Render..." -ForegroundColor Green

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Error: Not in a git repository" -ForegroundColor Red
    exit 1
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "Found uncommitted changes. Committing..." -ForegroundColor Yellow
    git add .
    git commit -m "Fix: Update products endpoint permissions and error handling"
}

# Push to trigger deployment
Write-Host "Pushing to trigger deployment..." -ForegroundColor Yellow
git push origin main

Write-Host "Deployment triggered! Check Render dashboard for progress." -ForegroundColor Green
Write-Host "Backend URL: https://drugchain-backend.onrender.com" -ForegroundColor Cyan

# Wait a bit and test the endpoint
Write-Host "Waiting 30 seconds before testing..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "Testing backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://drugchain-backend.onrender.com/health" -Method GET
    Write-Host "✓ Backend is healthy: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Deployment script completed!" -ForegroundColor Green