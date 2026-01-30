-- DIAGNOSE VERIFICATION DATA ISSUE
-- This checks why verification returns "Unknown" and "N/A" instead of real data

-- 1. Check if packs exist and their relationships
SELECT 
    p.pack_id,
    p.batch_id,
    p.status,
    p.verification_count,
    CASE WHEN b.batch_id IS NOT NULL THEN '✅ Batch exists' ELSE '❌ Batch missing' END as batch_status,
    CASE WHEN pr.product_id IS NOT NULL THEN '✅ Product exists' ELSE '❌ Product missing' END as product_status,
    CASE WHEN m.manufacturer_id IS NOT NULL THEN '✅ Manufacturer exists' ELSE '❌ Manufacturer missing' END as manufacturer_status
FROM packs p
LEFT JOIN batches b ON p.batch_id = b.batch_id
LEFT JOIN products pr ON b.product_id = pr.product_id
LEFT JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
ORDER BY p.created_at DESC
LIMIT 10;

-- 2. Check specific pack data completeness
SELECT 
    p.pack_id,
    p.batch_id,
    b.batch_id as batch_exists,
    b.product_id,
    pr.product_name,
    pr.product_code,
    pr.brand_name,
    pr.nafdac_registration_number,
    pr.regulatory_registration,
    b.production_date,
    b.expiry_date,
    m.manufacturer_code,
    org.organization_name as manufacturer_name
FROM packs p
LEFT JOIN batches b ON p.batch_id = b.batch_id
LEFT JOIN products pr ON b.product_id = pr.product_id
LEFT JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
LEFT JOIN organizations org ON m.manufacturer_id = org.organization_id
WHERE p.pack_id LIKE 'PK-%'
ORDER BY p.created_at DESC
LIMIT 5;

-- 3. Check for orphaned packs (packs without valid batches)
SELECT 
    COUNT(*) as total_packs,
    COUNT(b.batch_id) as packs_with_batches,
    COUNT(*) - COUNT(b.batch_id) as orphaned_packs
FROM packs p
LEFT JOIN batches b ON p.batch_id = b.batch_id;

-- 4. Check for batches without products
SELECT 
    COUNT(*) as total_batches,
    COUNT(pr.product_id) as batches_with_products,
    COUNT(*) - COUNT(pr.product_id) as orphaned_batches
FROM batches b
LEFT JOIN products pr ON b.product_id = pr.product_id;

-- 5. Check for manufacturers without organizations
SELECT 
    COUNT(*) as total_manufacturers,
    COUNT(org.organization_id) as manufacturers_with_orgs,
    COUNT(*) - COUNT(org.organization_id) as orphaned_manufacturers
FROM manufacturers m
LEFT JOIN organizations org ON m.manufacturer_id = org.organization_id;

-- 6. Sample verification data to see what's actually returned
SELECT 
    'Sample Pack Data' as check_type,
    p.pack_id,
    COALESCE(pr.product_name, 'NULL/MISSING') as product_name,
    COALESCE(pr.product_code, 'NULL/MISSING') as product_code,
    COALESCE(pr.brand_name, 'NULL/MISSING') as brand_name,
    COALESCE(pr.nafdac_registration_number, pr.regulatory_registration, 'NULL/MISSING') as nafdac_reg,
    COALESCE(org.organization_name, 'NULL/MISSING') as manufacturer_name,
    COALESCE(b.expiry_date::text, 'NULL/MISSING') as expiry_date
FROM packs p
LEFT JOIN batches b ON p.batch_id = b.batch_id
LEFT JOIN products pr ON b.product_id = pr.product_id
LEFT JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
LEFT JOIN organizations org ON m.manufacturer_id = org.organization_id
WHERE p.pack_id LIKE 'PK-%'
LIMIT 3;

-- 7. Check if we have any complete data chains
SELECT 
    'Complete Data Chain Check' as status,
    COUNT(*) as complete_chains
FROM packs p
INNER JOIN batches b ON p.batch_id = b.batch_id
INNER JOIN products pr ON b.product_id = pr.product_id
INNER JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
INNER JOIN organizations org ON m.manufacturer_id = org.organization_id
WHERE pr.product_name IS NOT NULL 
AND org.organization_name IS NOT NULL;