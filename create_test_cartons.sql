-- Create test cartons in the database
-- This will create a test batch with cartons that can be verified

-- First, let's check if we have any manufacturers
-- If not, we need to create test data

-- Create a test batch with cartons
-- Note: You'll need to replace the UUIDs with actual values from your database

-- Step 1: Get a manufacturer_id and product_id from existing data
-- Run this first to see what exists:
-- SELECT manufacturer_id, organization_name FROM manufacturers LIMIT 1;
-- SELECT product_id, product_name, manufacturer_id FROM products LIMIT 1;

-- Step 2: Create a test batch (replace the UUIDs with actual values)
-- Example batch creation:
INSERT INTO batches (
    batch_id,
    product_id,
    manufacturer_id,
    production_date,
    expiry_date,
    batch_size,
    number_of_cartons,
    total_packs,
    status,
    created_at,
    updated_at
) VALUES (
    'BT-20260121-TEST01',
    (SELECT product_id FROM products LIMIT 1),  -- Use first available product
    (SELECT manufacturer_id FROM products LIMIT 1),  -- Use manufacturer from that product
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '2 years',
    1000,  -- 1000 packs total
    20,    -- 20 cartons
    1000,
    'ACTIVE',
    NOW(),
    NOW()
) ON CONFLICT (batch_id) DO NOTHING;

-- Step 3: Create cartons for this batch
INSERT INTO cartons (carton_id, batch_id, carton_number, packs_per_carton, current_holder_id, created_at, updated_at)
SELECT 
    'CT-20260121-TEST01-' || LPAD(n::text, 4, '0'),  -- CT-20260121-TEST01-0001, 0002, etc.
    'BT-20260121-TEST01',
    n,
    50,  -- 50 packs per carton
    (SELECT manufacturer_id FROM products LIMIT 1),  -- Manufacturer holds the cartons initially
    NOW(),
    NOW()
FROM generate_series(1, 20) AS n
ON CONFLICT (carton_id) DO NOTHING;

-- Step 4: Create packs for the cartons
INSERT INTO packs (pack_id, batch_id, carton_id, status, created_at)
SELECT 
    'PK-TEST' || LPAD((carton_num * 50 + pack_num)::text, 4, '0'),  -- PK-TEST0001, PK-TEST0002, etc.
    'BT-20260121-TEST01',
    'CT-20260121-TEST01-' || LPAD(carton_num::text, 4, '0'),
    'ACTIVE',
    NOW()
FROM generate_series(1, 20) AS carton_num,
     generate_series(1, 50) AS pack_num
ON CONFLICT (pack_id) DO NOTHING;

-- Verify the data was created
SELECT 'Batch created:' as status, batch_id, batch_size, number_of_cartons 
FROM batches 
WHERE batch_id = 'BT-20260121-TEST01';

SELECT 'Cartons created:' as status, COUNT(*) as count 
FROM cartons 
WHERE batch_id = 'BT-20260121-TEST01';

SELECT 'Sample carton IDs:' as status, carton_id 
FROM cartons 
WHERE batch_id = 'BT-20260121-TEST01' 
LIMIT 5;

SELECT 'Packs created:' as status, COUNT(*) as count 
FROM packs 
WHERE batch_id = 'BT-20260121-TEST01';
