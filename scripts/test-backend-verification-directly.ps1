# Test Backend Verification Service Directly
# This will test if the backend is using the new strict verification or old fallback logic

Write-Host "=== TESTING BACKEND VERIFICATION SERVICE ===" -ForegroundColor Green

# Test a few pack codes to see what the backend actually returns
$testCodes = @("PK-1D69V2TF", "PK-ZE90K5XC", "PK-3VVN3ZUI")

foreach ($packCode in $testCodes) {
    Write-Host "`n--- Testing $packCode ---" -ForegroundColor Cyan
    
    try {
        # Try the correct POST endpoint
        $body = @{
            pack_id = $packCode
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "https://drugchain-1.onrender.com/api/v1/verification/" -Method POST -Body $body -ContentType "application/json"
        
        Write-Host "SUCCESS: API responded" -ForegroundColor Green
        Write-Host "Verification Result: $($response.verification_result)" -ForegroundColor Yellow
        Write-Host "Message: $($response.message)" -ForegroundColor White
        
        if ($response.data) {
            Write-Host "`nData returned:" -ForegroundColor Yellow
            Write-Host "Product: $($response.data.product_name)" -ForegroundColor $(if($response.data.product_name -and $response.data.product_name -ne "Unknown") {"Green"} else {"Red"})
            Write-Host "Brand: $($response.data.brand_name)" -ForegroundColor $(if($response.data.brand_name) {"Green"} else {"Red"})
            Write-Host "Manufacturer: $($response.data.manufacturer)" -ForegroundColor $(if($response.data.manufacturer -and $response.data.manufacturer -ne "Licensed Manufacturer") {"Green"} else {"Red"})
            Write-Host "Expiry: $($response.data.expiry_date)" -ForegroundColor $(if($response.data.expiry_date -and $response.data.expiry_date -ne "N/A") {"Green"} else {"Red"})
            Write-Host "NAFDAC: $($response.data.nafdac_reg)" -ForegroundColor $(if($response.data.nafdac_reg -and $response.data.nafdac_reg -ne "Registered") {"Green"} else {"Red"})
            
            # Check if we're getting fallback values (indicates old code is running)
            $fallbackDetected = $false
            if ($response.data.product_name -eq "Unknown" -or $response.data.manufacturer -eq "Licensed Manufacturer" -or $response.data.nafdac_reg -eq "Registered") {
                $fallbackDetected = $true
                Write-Host "`n🚨 FALLBACK LOGIC DETECTED!" -ForegroundColor Red
                Write-Host "The backend is still using OLD CODE with fallback values" -ForegroundColor Red
            } else {
                Write-Host "`n✅ REAL DATA DETECTED!" -ForegroundColor Green
                Write-Host "The backend is using NEW CODE with strict verification" -ForegroundColor Green
            }
        }
        
    } catch {
        Write-Host "API Error: $($_.Exception.Message)" -ForegroundColor Red
        
        # Try alternative endpoints
        Write-Host "Trying alternative endpoint..." -ForegroundColor Yellow
        try {
            $response2 = Invoke-RestMethod -Uri "https://drugchain-1.onrender.com/api/v1/verification/pack" -Method POST -Body $body -ContentType "application/json"
            Write-Host "Alternative endpoint worked!" -ForegroundColor Green
        } catch {
            Write-Host "Alternative endpoint also failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== DIAGNOSIS ===" -ForegroundColor Green
Write-Host "If you see 'FALLBACK LOGIC DETECTED', the backend needs to be redeployed with the latest code" -ForegroundColor Yellow
Write-Host "If you see 'REAL DATA DETECTED', the verification should work correctly" -ForegroundColor Yellow