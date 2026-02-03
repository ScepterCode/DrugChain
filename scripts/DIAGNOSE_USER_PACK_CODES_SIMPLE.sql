-- SIMPLE DIAGNOSIS FOR USER'S PACK CODES
-- Run this in Supabase SQL Editor to see exactly where relationships are broken

-- Step 1: Check if your pack codes exist in the database
SELECT 
    'STEP 1: CHECKING IF PACK CODES EXIST' as step,
    pack_id,
    CASE WHEN pack_id IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM packs 
WHERE pack_id IN (
    'PK-1D69V2TF', 'PK-ZE90K5XC', 'PK-3VVN3ZUI', 'PK-ANE7GJNY', 'PK-H21TJWPC',
    'PK-0FWXGYWN', 'PK-Q3ZRI4GH', 'PK-7M0MH2BB', 'PK-A3LUXHVN', 'PK-RK31TNDO',
    'PK-AP38PKN9', 'PK-8FDE742J', 'PK-0GXDH01V', 'PK-MKW65TND', 'PK-6TBFECR3'
)
ORDER BY pack_id;

-- Step 2: For existing packs, check batch relationships
SELECT 
    'STEP 2: CHECKING BATCH RELATIONSHIPS' as step,
    p.pack_id,
    p.batch_id as pack_points_to_batch,
    CASE WHEN b.batch_id IS NOT NULL THEN '✅ BATCH EXISTS' ELSE '❌ BATCH MISSING' END as batch_status
FROM packs p
LEFT JOIN batches b ON p.batch_id = b.batch_id
WHERE p.pack_id IN (
    'PK-1D69V2TF', 'PK-ZE90K5XC', 'PK-3VVN3ZUI', 'PK-ANE7GJNY', 'PK-H21TJWPC',
    'PK-0FWXGYWN', 'PK-Q3ZRI4GH', 'PK-7M0MH2BB', 'PK-A3LUXHVN', 'PK-RK31TNDO',
    'PK-AP38PKN9', 'PK-8FDE742J', 'PK-0GXDH01V', 'PK-MKW65TND', 'PK-6TBFECR3'
)
ORDER BY p.pack_id;

-- Step 3: For existing batches, check product relationships
SELECT 
    'STEP 3: CHECKING PRODUCT RELATIONSHIPS' as step,
    p.pack_id,
    b.product_id as batch_points_to_product,
    CASE WHEN pr.product_id IS NOT NULL THEN '✅ PRODUCT EXISTS' ELSE '❌ PRODUCT MISSING' END as product_status,
    pr.product_name
FROM packs p
INNER JOIN batches b ON p.batch_id = b.batch_id
LEFT JOIN products pr ON b.product_id = pr.product_id
WHERE p.pack_id IN (
    'PK-1D69V2TF', 'PK-ZE90K5XC', 'PK-3VVN3ZUI', 'PK-ANE7GJNY', 'PK-H21TJWPC',
    'PK-0FWXGYWN', 'PK-Q3ZRI4GH', 'PK-7M0MH2BB', 'PK-A3LUXHVN', 'PK-RK31TNDO',
    'PK-AP38PKN9', 'PK-8FDE742J', 'PK-0GXDH01V', 'PK-MKW65TND', 'PK-6TBFECR3'
)
ORDER BY p.pack_id;

-- Step 4: For existing products, check manufacturer relationships
SELECT 
    'STEP 4: CHECKING MANUFACTURER RELATIONSHIPS' as step,
    p.pack_id,
    b.manufacturer_id as batch_points_to_manufacturer,
    CASE WHEN m.manufacturer_id IS NOT NULL THEN '✅ MANUFACTURER EXISTS' ELSE '❌ MANUFACTURER MISSING' END as manufacturer_status
FROM packs p
INNER JOIN batches b ON p.batch_id = b.batch_id
INNER JOIN products pr ON b.product_id = pr.product_id
LEFT JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
WHERE p.pack_id IN (
    'PK-1D69V2TF', 'PK-ZE90K5XC', 'PK-3VVN3ZUI', 'PK-ANE7GJNY', 'PK-H21TJWPC',
    'PK-0FWXGYWN', 'PK-Q3ZRI4GH', 'PK-7M0MH2BB', 'PK-A3LUXHVN', 'PK-RK31TNDO',
    'PK-AP38PKN9', 'PK-8FDE742J', 'PK-0GXDH01V', 'PK-MKW65TND', 'PK-6TBFECR3'
)
ORDER BY p.pack_id;

-- Step 5: For existing manufacturers, check organization relationships
SELECT 
    'STEP 5: CHECKING ORGANIZATION RELATIONSHIPS' as step,
    p.pack_id,
    m.manufacturer_id as manufacturer_id,
    CASE WHEN org.organization_id IS NOT NULL THEN '✅ ORGANIZATION EXISTS' ELSE '❌ ORGANIZATION MISSING' END as organization_status,
    org.organization_name
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
ORDER BY p.pack_id;

-- FINAL SUMMARY: Complete chain analysis
SELECT 
    'FINAL SUMMARY: COMPLETE CHAIN ANALYSIS' as summary,
    p.pack_id,
    CASE 
        WHEN org.organization_id IS NOT NULL AND pr.product_name IS NOT NULL THEN '✅ COMPLETE - SHOULD WORK'
        WHEN m.manufacturer_id IS NULL THEN '🚨 MISSING MANUFACTURER'
        WHEN org.organization_id IS NULL THEN '🚨 MISSING ORGANIZATION'
        WHEN pr.product_id IS NULL THEN '🚨 MISSING PRODUCT'
        WHEN b.batch_id IS NULL THEN '🚨 MISSING BATCH'
        ELSE '🚨 UNKNOWN ISSUE'
    END as diagnosis,
    pr.product_name,
    org.organization_name as manufacturer_name,
    b.expiry_date
FROM packs p
LEFT JOIN batches b ON p.batch_id = b.batch_id
LEFT JOIN products pr ON b.product_id = pr.product_id
LEFT JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
LEFT JOIN organizations org ON m.manufacturer_id = org.organization_id
WHERE p.pack_id IN (
    'PK-1D69V2TF', 'PK-ZE90K5XC', 'PK-3VVN3ZUI', 'PK-ANE7GJNY', 'PK-H21TJWPC',
    'PK-0FWXGYWN', 'PK-Q3ZRI4GH', 'PK-7M0MH2BB', 'PK-A3LUXHVN', 'PK-RK31TNDO',
    'PK-AP38PKN9', 'PK-8FDE742J', 'PK-0GXDH01V', 'PK-MKW65TND', 'PK-6TBFECR3'
)
ORDER BY p.pack_id;

-- Show how many of each issue type
SELECT 
    'ISSUE COUNT SUMMARY' as summary,
    COUNT(*) as total_pack_codes_tested,
    COUNT(CASE WHEN org.organization_id IS NOT NULL AND pr.product_name IS NOT NULL THEN 1 END) as working_chains,
    COUNT(CASE WHEN b.batch_id IS NULL THEN 1 END) as missing_batches,
    COUNT(CASE WHEN pr.product_id IS NULL AND b.batch_id IS NOT NULL THEN 1 END) as missing_products,
    COUNT(CASE WHEN m.manufacturer_id IS NULL AND pr.product_id IS NOT NULL THEN 1 END) as missing_manufacturers,
    COUNT(CASE WHEN org.organization_id IS NULL AND m.manufacturer_id IS NOT NULL THEN 1 END) as missing_organizations
FROM packs p
LEFT JOIN batches b ON p.batch_id = b.batch_id
LEFT JOIN products pr ON b.product_id = pr.product_id
LEFT JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
LEFT JOIN organizations org ON m.manufacturer_id = org.organization_id
WHERE p.pack_id IN (
    'PK-1D69V2TF', 'PK-ZE90K5XC', 'PK-3VVN3ZUI', 'PK-ANE7GJNY', 'PK-H21TJWPC',
    'PK-0FWXGYWN', 'PK-Q3ZRI4GH', 'PK-7M0MH2BB', 'PK-A3LUXHVN', 'PK-RK31TNDO',
    'PK-AP38PKN9', 'PK-8FDE742J', 'PK-0GXDH01V', 'PK-MKW65TND', 'PK-6TBFECR3'
);