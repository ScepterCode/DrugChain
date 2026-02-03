-- DIAGNOSE SPECIFIC PACK CODES
-- This script will analyze the exact database relationships for your pack codes
-- Run this in Supabase SQL Editor with your specific pack codes

-- USER'S ACTUAL PACK CODES THAT SHOW "Unknown" VALUES
WITH pack_codes AS (
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

-- COMPREHENSIVE RELATIONSHIP ANALYSIS
SELECT 
    pc.pack_id,
    
    -- Step 1: Pack exists?
    CASE WHEN p.pack_id IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as pack_status,
    
    -- Step 2: Batch relationship
    p.batch_id as pack_batch_id,
    CASE WHEN b.batch_id IS NOT NULL THEN '✅ EXISTS' ELSE '❌ BROKEN' END as batch_status,
    
    -- Step 3: Product relationship  
    b.product_id as batch_product_id,
    CASE WHEN pr.product_id IS NOT NULL THEN '✅ EXISTS' ELSE '❌ BROKEN' END as product_status,
    pr.product_name,
    pr.brand_name,
    
    -- Step 4: Manufacturer relationship
    b.manufacturer_id as batch_manufacturer_id,
    CASE WHEN m.manufacturer_id IS NOT NULL THEN '✅ EXISTS' ELSE '❌ BROKEN' END as manufacturer_status,
    
    -- Step 5: Organization relationship
    CASE WHEN org.organization_id IS NOT NULL THEN '✅ EXISTS' ELSE '❌ BROKEN' END as organization_status,
    org.organization_name,
    
    -- Dates for context
    b.production_date,
    b.expiry_date,
    
    -- Detailed diagnosis
    CASE 
        WHEN p.pack_id IS NULL THEN 'INVALID_PACK_ID'
        WHEN b.batch_id IS NULL THEN 'MISSING_BATCH'
        WHEN pr.product_id IS NULL THEN 'MISSING_PRODUCT'
        WHEN m.manufacturer_id IS NULL THEN 'MISSING_MANUFACTURER'
        WHEN org.organization_id IS NULL THEN 'MISSING_ORGANIZATION'
        ELSE 'COMPLETE_CHAIN'
    END as diagnosis

FROM pack_codes pc
LEFT JOIN packs p ON pc.pack_id = p.pack_id
LEFT JOIN batches b ON p.batch_id = b.batch_id
LEFT JOIN products pr ON b.product_id = pr.product_id
LEFT JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
LEFT JOIN organizations org ON m.manufacturer_id = org.organization_id

ORDER BY pc.pack_id;

-- SUMMARY OF ISSUES
SELECT 
    'RELATIONSHIP SUMMARY' as analysis,
    COUNT(*) as total_pack_codes_tested,
    COUNT(CASE WHEN p.pack_id IS NOT NULL THEN 1 END) as valid_packs,
    COUNT(CASE WHEN b.batch_id IS NOT NULL THEN 1 END) as packs_with_batches,
    COUNT(CASE WHEN pr.product_id IS NOT NULL THEN 1 END) as packs_with_products,
    COUNT(CASE WHEN m.manufacturer_id IS NOT NULL THEN 1 END) as packs_with_manufacturers,
    COUNT(CASE WHEN org.organization_id IS NOT NULL THEN 1 END) as packs_with_organizations,
    COUNT(CASE WHEN org.organization_id IS NOT NULL AND pr.product_name IS NOT NULL THEN 1 END) as complete_chains
FROM pack_codes pc
LEFT JOIN packs p ON pc.pack_id = p.pack_id
LEFT JOIN batches b ON p.batch_id = b.batch_id
LEFT JOIN products pr ON b.product_id = pr.product_id
LEFT JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
LEFT JOIN organizations org ON m.manufacturer_id = org.organization_id;

-- SHOW WHAT DATA EXISTS IN DATABASE
SELECT 'AVAILABLE DATA IN DATABASE' as info;

SELECT 'Total Packs' as table_name, COUNT(*) as count FROM packs
UNION ALL
SELECT 'Total Batches', COUNT(*) FROM batches
UNION ALL  
SELECT 'Total Products', COUNT(*) FROM products
UNION ALL
SELECT 'Total Manufacturers', COUNT(*) FROM manufacturers
UNION ALL
SELECT 'Total Organizations', COUNT(*) FROM organizations;

-- SHOW SAMPLE VALID PACK IDS (if any exist)
SELECT 'SAMPLE VALID PACK IDS' as info, string_agg(p.pack_id, ', ') as sample_pack_ids
FROM packs p
INNER JOIN batches b ON p.batch_id = b.batch_id
INNER JOIN products pr ON b.product_id = pr.product_id
INNER JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
INNER JOIN organizations org ON m.manufacturer_id = org.organization_id
WHERE pr.product_name IS NOT NULL 
AND org.organization_name IS NOT NULL
LIMIT 5;