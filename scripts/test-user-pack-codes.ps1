# Test User's Specific Pack Codes
# This script will test the pack codes you provide and show exactly where relationships are broken

param(
    [Parameter(Mandatory=$true)]
    [string[]]$PackCodes
)

Write-Host "=== TESTING USER'S PACK CODES ===" -ForegroundColor Green
Write-Host "Pack codes to test: $($PackCodes -join ', ')" -ForegroundColor Yellow

foreach ($packCode in $PackCodes) {
    Write-Host "`n--- Testing Pack Code: $packCode ---" -ForegroundColor Cyan
    
    # Test via API to see what the verification service returns
    try {
        $body = @{
            pack_id = $packCode
            location = "Test Location"
            phone_number = "+1234567890"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "https://drugchain-1.onrender.com/api/v1/verification/pack" -Method POST -Body $body -ContentType "application/json"
        
        Write-Host "API Response:" -ForegroundColor Yellow
        Write-Host "Success: $($response.success)" -ForegroundColor $(if($response.success) {"Green"} else {"Red"})
        Write-Host "Result: $($response.verification_result)" -ForegroundColor $(if($response.verification_result -eq "GENUINE") {"Green"} else {"Red"})
        Write-Host "Message: $($response.message)" -ForegroundColor White
        
        if ($response.data) {
            Write-Host "Data returned:" -ForegroundColor Yellow
            if ($response.data.error_type) {
                Write-Host "ERROR TYPE: $($response.data.error_type)" -ForegroundColor Red
                Write-Host "DEBUG INFO: $($response.data.debug_info)" -ForegroundColor Yellow
                Write-Host "MISSING ID: $($response.data.missing_batch_id)$($response.data.missing_product_id)$($response.data.missing_manufacturer_id)" -ForegroundColor Red
            } else {
                Write-Host "Product: $($response.data.product_name)" -ForegroundColor Green
                Write-Host "Manufacturer: $($response.data.manufacturer)" -ForegroundColor Green
                Write-Host "Expiry: $($response.data.expiry_date)" -ForegroundColor Green
            }
        }
        
    } catch {
        Write-Host "API Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n=== DIAGNOSIS COMPLETE ===" -ForegroundColor Green
Write-Host "Based on the results above:" -ForegroundColor Yellow
Write-Host "- If you see 'MISSING_BATCH', 'MISSING_PRODUCT', etc., those are the broken relationships" -ForegroundColor White
Write-Host "- If you see 'Unknown' values, the relationships exist but data is incomplete" -ForegroundColor White
Write-Host "- Run FIX_BROKEN_RELATIONSHIPS.sql in Supabase to repair all issues" -ForegroundColor Green