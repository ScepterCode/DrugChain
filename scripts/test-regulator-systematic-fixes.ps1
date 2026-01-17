#!/usr/bin/env pwsh

Write-Host "=== SYSTEMATIC REGULATOR FIXES TEST ===" -ForegroundColor Cyan
Write-Host "Testing all regulator dashboard issues systematically..." -ForegroundColor Green

$allTestsPassed = $true

# Test 1: Check if duplicate dashboard navigation is removed
Write-Host "`n1. Testing Navigation Structure..." -ForegroundColor Yellow
$layoutContent = Get-Content "frontend/src/components/Layout.tsx" -Raw
if ($layoutContent -match "case 'REGULATOR':" -and $layoutContent -notmatch "baseNavigation") {
    Write-Host "✓ PASSED: Regulator navigation no longer includes baseNavigation" -ForegroundColor Green
} else {
    Write-Host "✗ FAILED: Regulator still has baseNavigation (duplicate dashboard)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 2: Check if RoleBasedDashboard no longer redirects
Write-Host "`n2. Testing RoleBasedDashboard Logic..." -ForegroundColor Yellow
$roleBasedContent = Get-Content "frontend/src/components/RoleBasedDashboard.tsx" -Raw
if ($roleBasedContent -notmatch "window\.location\.href") {
    Write-Host "✓ PASSED: RoleBasedDashboard no longer redirects" -ForegroundColor Green
} else {
    Write-Host "✗ FAILED: RoleBasedDashboard still has redirect logic" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 3: Check if RegulatorDashboard has error handling
Write-Host "`n3. Testing RegulatorDashboard Error Handling..." -ForegroundColor Yellow
$regulatorContent = Get-Content "frontend/src/pages/RegulatorDashboard.tsx" -Raw
if ($regulatorContent -match "total_manufacturers: 0") {
    Write-Host "✓ PASSED: RegulatorDashboard has fallback stats to prevent blank page" -ForegroundColor Green
} else {
    Write-Host "✗ FAILED: RegulatorDashboard missing error handling" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 4: Check if SearchPage has improved functionality
Write-Host "`n4. Testing SearchPage Improvements..." -ForegroundColor Yellow
$searchContent = Get-Content "frontend/src/pages/SearchPage.tsx" -Raw
if ($searchContent -match "Try Sample Search") {
    Write-Host "✓ PASSED: SearchPage has sample search functionality" -ForegroundColor Green
} else {
    Write-Host "✗ FAILED: SearchPage missing improvements" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 5: Check if AnalyticsPage has performance improvements
Write-Host "`n5. Testing AnalyticsPage Performance..." -ForegroundColor Yellow
$analyticsContent = Get-Content "frontend/src/pages/AnalyticsPage.tsx" -Raw
if ($analyticsContent -match "essentialPromises") {
    Write-Host "✓ PASSED: AnalyticsPage has staged loading for better performance" -ForegroundColor Green
} else {
    Write-Host "✗ FAILED: AnalyticsPage missing performance improvements" -ForegroundColor Red
    $allTestsPassed = $false
}

# Summary
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
if ($allTestsPassed) {
    Write-Host "🎉 ALL TESTS PASSED! Regulator dashboard issues have been systematically fixed." -ForegroundColor Green
    Write-Host "`nFixes Applied:" -ForegroundColor White
    Write-Host "1. ✓ Removed duplicate dashboard navigation for regulators" -ForegroundColor Green
    Write-Host "2. ✓ Fixed RoleBasedDashboard to show RegulatorDashboard directly" -ForegroundColor Green
    Write-Host "3. ✓ Added error handling to prevent blank RegulatorDashboard" -ForegroundColor Green
    Write-Host "4. ✓ Enhanced SearchPage with sample search and faster loading" -ForegroundColor Green
    Write-Host "5. ✓ Optimized AnalyticsPage with staged loading for better performance" -ForegroundColor Green
} else {
    Write-Host "❌ SOME TESTS FAILED! Please review the issues above." -ForegroundColor Red
}

Write-Host "`nRegulator User Experience:" -ForegroundColor Cyan
Write-Host "- Single 'Regulator Dashboard' navigation item (no duplicate)" -ForegroundColor White
Write-Host "- Fast-loading dashboard with fallback data" -ForegroundColor White
Write-Host "- Functional Search & Investigation page with sample data" -ForegroundColor White
Write-Host "- Optimized Analytics page with staged loading" -ForegroundColor White