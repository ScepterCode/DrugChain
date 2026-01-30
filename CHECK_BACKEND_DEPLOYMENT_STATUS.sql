-- CHECK WHAT DATA SHOULD BE RETURNED FOR YOUR PACK CODES
-- This shows the REAL data that should appear instead of "Unknown"

SELECT 
    'REAL DATA FOR YOUR PACK CODES' as info,
    p.pack_id,
    pr.product_name as should_show_product,
    pr.brand_name as should_show_brand,
    org.organization_name as should_show_manufacturer,
    pr.dosage as should_show_dosage,
    pr.form as should_show_form,
    b.expiry_date as should_show_expiry,
    pr.nafdac_registration_number as should_show_nafdac,
    pr.country_of_origin as should_show_country
FROM packs p
INNER JOIN batches b ON p.batch_id = b.batch_id
INNER JOIN products pr ON b.product_id = pr.product_id
INNER JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
INNER JOIN organizations org ON m.manufacturer_id = org.organization_id
WHERE p.pack_id IN (
    'PK-1D69V2TF', 'PK-ZE90K5XC', 'PK-3VVN3ZUI'
)
ORDER BY p.pack_id
LIMIT 3;