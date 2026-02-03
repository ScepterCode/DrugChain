-- DIRECT DATABASE DIAGNOSIS FOR USER'S PACK CODES
-- This will show exactly where the relationships are broken for your specific pack codes

-- USER'S PACK CODES THAT SHOW "Unknown" VALUES
WITH user_pack_codes AS (
    SELECT unnest(ARRAY[
        'PK-1D69V2TF',
        'PK-ZE90K5XC', 
        'PK-3VVN3ZUI',
        'PK-ANE7GJNY',
        'PK-H21TJWPC',
        'PK-0FWXGYWN',
        'PK-Q3ZRI4GH',
        'PK-7M0MH2BB',
        'PK-A3LUXHVN',
        'PK-RK31TNDO',
        'PK-AP38PKN9',
        'PK-8FDE742J',
        'PK-0GXDH01V',
        'PK-MKW65TND',
        'PK-6TBFECR3'
    ]) AS pack_id
)

-- STEP-BY-STEP RELATIONSHIP ANALYSIS
SELECT 
    '=== RELATIONSHIP DIAGNOSIS FOR USER PACK CODES ===' as analysis_header;

-- Check each step of the relationship chain
SELECT 
    upc.pack_id,
    
    -- Step 1: Pack exists?
    CASE WHEN p.pack_id IS NOT NULL THEN '✅ PACK EXISTS' ELSE '❌ PACK MISSING' END as step_1_pack,
    
    -- Step 2: Batch relationship
    p.batch_id as pack_points_to_batch,
    CASE WHEN b.batch_id IS NOT NULL THEN '✅ BATCH EXISTS' ELSE '❌ BATCH MISSING' END as step_2_batch,
    
    -- Step 3: Product relationship  
    b.product_id as batch_points_to_product,
    CASE WHEN pr.product_id IS NOT NULL THEN '✅ PRODUCT EXISTS' ELSE '❌ PRODUCT MISSING' END as step_3_product,
    
    -- Step 4: Manufacturer relationship
    b.manufacturer_id as batch_points_to_manufacturer,
    CASE WHEN m.manufacturer_id IS NOT NULL THEN '✅ MANUFACTURER EXISTS' ELSE '❌ MANUFACTURER MISSING' END as step_4_manufacturer,
    
    -- Step 5: Organization relationship
    CASE WHEN org.organization_id IS NOT NULL THEN '✅ ORGANIZATION EXISTS' ELSE '❌ ORGANIZATION MISSING' END as step_5_organization,
    
    -- FINAL DIAGNOSIS
    CASE 
        WHEN p.pack_id IS NULL THEN '🚨 INVALID_PACK_ID'
        WHEN b.batch_id IS NULL THEN '🚨 MISSING_BATCH'
        WHEN pr.product_id IS NULL THEN '🚨 MISSING_PRODUCT'
        WHEN m.manufacturer_id IS NULL THEN '🚨 MISSING_MANUFACTURER'
        WHEN org.organization_id IS NULL THEN '🚨 MISSING_ORGANIZATION'
        ELSE '✅ COMPLETE_CHAIN'
    END as final_diagnosis,
    
    -- Show what data would be returned (if complete)
    pr.product_name,
    pr.brand_name,
    org.organization_name as manufacturer_name,
    b.expiry_date,
    pr.nafdac_registration_number

FROM user_pack_codes upc
LEFT JOIN packs p ON upc.pack_id = p.pack_id
LEFT JOIN batches b ON p.batch_id = b.batch_id
LEFT JOIN products pr ON b.product_id = pr.product_id
LEFT JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
LEFT JOIN organizations org ON m.manufacturer_id = org.organization_id

ORDER BY upc.pack_id;

-- SUMMARY OF ISSUES FOUND
SELECT 
    '=== SUMMARY OF ISSUES ===' as summary_header;

SELECT 
    COUNT(*) as total_pack_codes_tested,
    COUNT(CASE WHEN p.pack_id IS NOT NULL THEN 1 END) as valid_pack_ids,
    COUNT(CASE WHEN b.batch_id IS NOT NULL THEN 1 END) as packs_with_valid_batches,
    COUNT(CASE WHEN pr.product_id IS NOT NULL THEN 1 END) as packs_with_valid_products,
    COUNT(CASE WHEN m.manufacturer_id IS NOT NULL THEN 1 END) as packs_with_valid_manufacturers,
    COUNT(CASE WHEN org.organization_id IS NOT NULL THEN 1 END) as packs_with_valid_organizations,
    COUNT(CASE WHEN org.organization_id IS NOT NULL AND pr.product_name IS NOT NULL THEN 1 END) as complete_working_chains
FROM user_pack_codes upc
LEFT JOIN packs p ON upc.pack_id = p.pack_id
LEFT JOIN batches b ON p.batch_id = b.batch_id
LEFT JOIN products pr ON b.product_id = pr.product_id
LEFT JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
LEFT JOIN organizations org ON m.manufacturer_id = org.organization_id;

-- SHOW BROKEN RELATIONSHIP DETAILS
SELECT 
    '=== BROKEN RELATIONSHIP DETAILS ===' as details_header;

-- Show packs that exist but have broken batch relationships
SELECT 
    'PACKS WITH BROKEN BATCH RELATIONSHIPS' as issue_type,
    p.pack_id,
    p.batch_id as broken_batch_id,
    'Pack exists but points to non-existent batch' as problem
FROM packs p
LEFT JOIN batches b ON p.batch_id = b.batch_id
WHERE p.pack_id IN (
    'PK-1D69V2TF', 'PK-ZE90K5XC', 'PK-3VVN3ZUI', 'PK-ANE7GJNY', 'PK-H21TJWPC',
    'PK-0FWXGYWN', 'PK-Q3ZRI4GH', 'PK-7M0MH2BB', 'PK-A3LUXHVN', 'PK-RK31TNDO',
    'PK-AP38PKN9', 'PK-8FDE742J', 'PK-0GXDH01V', 'PK-MKW65TND', 'PK-6TBFECR3'
)
AND b.batch_id IS NULL

UNION ALL

-- Show batches that exist but have broken product relationships
SELECT 
    'BATCHES WITH BROKEN PRODUCT RELATIONSHIPS' as issue_type,
    p.pack_id,
    b.product_id as broken_product_id,
    'Batch exists but points to non-existent product' as problem
FROM packs p
INNER JOIN batches b ON p.batch_id = b.batch_id
LEFT JOIN products pr ON b.product_id = pr.product_id
WHERE p.pack_id IN (
    'PK-1D69V2TF', 'PK-ZE90K5XC', 'PK-3VVN3ZUI', 'PK-ANE7GJNY', 'PK-H21TJWPC',
    'PK-0FWXGYWN', 'PK-Q3ZRI4GH', 'PK-7M0MH2BB', 'PK-A3LUXHVN', 'PK-RK31TNDO',
    'PK-AP38PKN9', 'PK-8FDE742J', 'PK-0GXDH01V', 'PK-MKW65TND', 'PK-6TBFECR3'
)
AND pr.product_id IS NULL

UNION ALL

-- Show batches that exist but have broken manufacturer relationships
SELECT 
    'BATCHES WITH BROKEN MANUFACTURER RELATIONSHIPS' as issue_type,
    p.pack_id,
    b.manufacturer_id as broken_manufacturer_id,
    'Batch exists but points to non-existent manufacturer' as problem
FROM packs p
INNER JOIN batches b ON p.batch_id = b.batch_id
INNER JOIN products pr ON b.product_id = pr.product_id
LEFT JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
WHERE p.pack_id IN (
    'PK-1D69V2TF', 'PK-ZE90K5XC', 'PK-3VVN3ZUI', 'PK-ANE7GJNY', 'PK-H21TJWPC',
    'PK-0FWXGYWN', 'PK-Q3ZRI4GH', 'PK-7M0MH2BB', 'PK-A3LUXHVN', 'PK-RK31TNDO',
    'PK-AP38PKN9', 'PK-8FDE742J', 'PK-0GXDH01V', 'PK-MKW65TND', 'PK-6TBFECR3'
)
AND m.manufacturer_id IS NULL

UNION ALL

-- Show manufacturers that exist but have broken organization relationships
SELECT 
    'MANUFACTURERS WITH BROKEN ORGANIZATION RELATIONSHIPS' as issue_type,
    p.pack_id,
    m.manufacturer_id as broken_organization_id,
    'Manufacturer exists but has no organization record' as problem
FROM packs p
INNER JOIN batches b ON p.batch_id = b.batch_id
INNER JOIN products pr ON b.product_id = pr.product_id
INNER JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
LEFT JOIN organizations org ON m.manufacturer_id = org.organization_id
WHERE p.pack_id IN (
    'PK-1D69V2TF', 'PK-ZE90K5XC', 'PK-3VVN3ZUI', 'PK-ANE7GJNY', 'PK-H21TJWPC',
    'PK-0FWXGYWN', 'PK-Q3ZRI4GH', 'PK-7M0MH2BB', 'PK-A3LUXHVN', 'PK-RK31TNDO',
    'PK-AP38PKN9', 'PK-8FDE742J', 'PK-0GXDH01V', 'PK-MKW65TND', 'PK-6TBFECR3'
)
AND org.organization_id IS NULL;

-- SHOW WHAT VALID DATA LOOKS LIKE (for comparison)
SELECT 
    '=== EXAMPLE OF WORKING PACK (for comparison) ===' as example_header;

SELECT 
    p.pack_id,
    b.batch_id,
    pr.product_name,
    pr.brand_name,
    org.organization_name,
    b.expiry_date,
    'This is what your pack codes should return' as note
FROM packs p
INNER JOIN batches b ON p.batch_id = b.batch_id
INNER JOIN products pr ON b.product_id = pr.product_id
INNER JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
INNER JOIN organizations org ON m.manufacturer_id = org.organization_id
WHERE pr.product_name IS NOT NULL 
AND org.organization_name IS NOT NULL
LIMIT 3;

-- FINAL RECOMMENDATION
SELECT 
    '=== RECOMMENDED ACTION ===' as action_header,
    'Run FIX_BROKEN_RELATIONSHIPS.sql to repair all broken relationships' as recommendation,
    'This will create missing records and link orphaned data properly' as explanation;