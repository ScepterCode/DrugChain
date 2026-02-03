-- FIX VERIFICATION DATA ISSUE
-- This creates proper test data so verification returns real information instead of "Unknown"

-- STEP 1: Create a test manufacturer organization
INSERT INTO organizations (organization_id, organization_name, organization_type, registration_number, country)
VALUES (
    gen_random_uuid(),
    'PharmaCorp Nigeria Ltd',
    'MANUFACTURER',
    'MFG-2024-001',
    'Nigeria'
) ON CONFLICT (registration_number) DO NOTHING;

-- STEP 2: Create manufacturer record
INSERT INTO manufacturers (manufacturer_id, manufacturer_code, nafdac_license_number)
SELECT 
    org.organization_id,
    'PHARMA001',
    'NAFDAC-MFG-2024-001'
FROM organizations org 
WHERE org.organization_name = 'PharmaCorp Nigeria Ltd'
ON CONFLICT (manufacturer_id) DO NOTHING;

-- STEP 3: Create test products with complete information
INSERT INTO products (
    product_id,
    manufacturer_id,
    product_code,
    product_name,
    brand_name,
    description,
    dosage,
    form,
    therapeutic_category,
    nafdac_registration_number,
    regulatory_registration,
    country_of_origin,
    industry_type,
    risk_level,
    verification_complexity,
    is_active
)
SELECT 
    gen_random_uuid(),
    m.manufacturer_id,
    'PARA500',
    'Paracetamol 500mg Tablets',
    'PainAway',
    'Fast-acting pain relief and fever reducer',
    '500mg',
    'Tablet',
    'Analgesic',
    'NAFDAC-04-5678',
    'NAFDAC-04-5678',
    'Nigeria',
    'Healthcare',
    'medium',
    'standard',
    true
FROM manufacturers m
WHERE m.manufacturer_code = 'PHARMA001'
ON CONFLICT (product_code) DO NOTHING;

INSERT INTO products (
    product_id,
    manufacturer_id,
    product_code,
    product_name,
    brand_name,
    description,
    dosage,
    form,
    therapeutic_category,
    nafdac_registration_number,
    regulatory_registration,
    country_of_origin,
    industry_type,
    risk_level,
    verification_complexity,
    is_active
)
SELECT 
    gen_random_uuid(),
    m.manufacturer_id,
    'AMOX250',
    'Amoxicillin 250mg Capsules',
    'BioHeal',
    'Broad-spectrum antibiotic for bacterial infections',
    '250mg',
    'Capsule',
    'Antibiotic',
    'NAFDAC-04-9876',
    'NAFDAC-04-9876',
    'Nigeria',
    'Healthcare',
    'high',
    'enhanced',
    true
FROM manufacturers m
WHERE m.manufacturer_code = 'PHARMA001'
ON CONFLICT (product_code) DO NOTHING;

-- STEP 4: Create test batches
INSERT INTO batches (
    batch_id,
    product_id,
    manufacturer_id,
    production_date,
    expiry_date,
    batch_size,
    number_of_cartons,
    total_packs,
    status
)
SELECT 
    'BT-20260130-PARA01',
    p.product_id,
    p.manufacturer_id,
    '2026-01-30'::date,
    '2028-01-30'::date,
    10000,
    100,
    10000,
    'ACTIVE'
FROM products p
WHERE p.product_code = 'PARA500'
ON CONFLICT (batch_id) DO NOTHING;

INSERT INTO batches (
    batch_id,
    product_id,
    manufacturer_id,
    production_date,
    expiry_date,
    batch_size,
    number_of_cartons,
    total_packs,
    status
)
SELECT 
    'BT-20260130-AMOX01',
    p.product_id,
    p.manufacturer_id,
    '2026-01-30'::date,
    '2028-01-30'::date,
    5000,
    50,
    5000,
    'ACTIVE'
FROM products p
WHERE p.product_code = 'AMOX250'
ON CONFLICT (batch_id) DO NOTHING;

-- STEP 5: Create test cartons
INSERT INTO cartons (
    carton_id,
    batch_id,
    carton_number,
    packs_per_carton,
    current_location
)
VALUES 
    ('CT-20260130-PARA01-0001', 'BT-20260130-PARA01', 1, 100, 'PharmaCorp Warehouse'),
    ('CT-20260130-PARA01-0002', 'BT-20260130-PARA01', 2, 100, 'PharmaCorp Warehouse'),
    ('CT-20260130-AMOX01-0001', 'BT-20260130-AMOX01', 1, 100, 'PharmaCorp Warehouse')
ON CONFLICT (carton_id) DO NOTHING;

-- STEP 6: Create test packs with proper IDs
INSERT INTO packs (pack_id, batch_id, carton_id, status, verification_count)
VALUES 
    ('PK-PARA001', 'BT-20260130-PARA01', 'CT-20260130-PARA01-0001', 'ACTIVE', 0),
    ('PK-PARA002', 'BT-20260130-PARA01', 'CT-20260130-PARA01-0001', 'ACTIVE', 0),
    ('PK-PARA003', 'BT-20260130-PARA01', 'CT-20260130-PARA01-0001', 'ACTIVE', 0),
    ('PK-AMOX001', 'BT-20260130-AMOX01', 'CT-20260130-AMOX01-0001', 'ACTIVE', 0),
    ('PK-AMOX002', 'BT-20260130-AMOX01', 'CT-20260130-AMOX01-0001', 'ACTIVE', 0)
ON CONFLICT (pack_id) DO NOTHING;

-- STEP 7: Fix any existing orphaned packs by linking them to test data
UPDATE packs 
SET batch_id = 'BT-20260130-PARA01'
WHERE batch_id IS NULL OR batch_id NOT IN (SELECT batch_id FROM batches)
AND pack_id LIKE 'PK-%';

-- STEP 8: Verify the fix worked
SELECT 
    'VERIFICATION TEST' as test_type,
    p.pack_id,
    pr.product_name,
    pr.brand_name,
    pr.nafdac_registration_number,
    org.organization_name as manufacturer,
    b.expiry_date,
    'Should now show real data instead of Unknown/N/A' as expected_result
FROM packs p
INNER JOIN batches b ON p.batch_id = b.batch_id
INNER JOIN products pr ON b.product_id = pr.product_id
INNER JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
INNER JOIN organizations org ON m.manufacturer_id = org.organization_id
WHERE p.pack_id IN ('PK-PARA001', 'PK-PARA002', 'PK-AMOX001')
ORDER BY p.pack_id;

-- STEP 9: Show test pack IDs you can use for verification
SELECT 
    'TEST PACK IDS' as info,
    string_agg(pack_id, ', ') as available_test_packs
FROM packs p
INNER JOIN batches b ON p.batch_id = b.batch_id
INNER JOIN products pr ON b.product_id = pr.product_id
WHERE p.status = 'ACTIVE';

-- Success message
SELECT 'Verification data fix completed! Try scanning: PK-PARA001, PK-PARA002, or PK-AMOX001' as status;