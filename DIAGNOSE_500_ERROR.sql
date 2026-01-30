-- DIAGNOSE 500 ERROR IN PRODUCT CREATION
-- Run this in Supabase to identify the exact issue

-- 1. Check if all model columns exist in database
SELECT 
    'product_id' as field_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'product_id') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
    'manufacturer_id',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'manufacturer_id') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'product_code',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'product_code') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'product_name',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'product_name') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'description',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'industry_type',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'industry_type') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'industry_data',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'industry_data') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'regulatory_registration',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'regulatory_registration') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'brand_name',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand_name') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'country_of_origin',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'country_of_origin') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'category_id',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category_id') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'model_number',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'model_number') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'warranty_period_months',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'warranty_period_months') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'risk_level',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'risk_level') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'verification_complexity',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'verification_complexity') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END
ORDER BY field_name;

-- 2. Check manufacturers table exists and has data
SELECT 
    'manufacturers_table' as check_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'manufacturers') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
    'manufacturers_data',
    CASE WHEN EXISTS (SELECT 1 FROM manufacturers LIMIT 1) 
         THEN '✅ HAS DATA' ELSE '❌ NO DATA' END;

-- 3. Check for constraint violations
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'products';

-- 4. Show actual products table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 5. Test a simple insert to see what fails
-- (Comment this out if you don't want to test)
/*
INSERT INTO products (
    product_code, 
    product_name, 
    manufacturer_id,
    industry_type,
    industry_data,
    risk_level,
    verification_complexity
) VALUES (
    'TEST001',
    'Test Product',
    (SELECT manufacturer_id FROM manufacturers LIMIT 1),
    'Healthcare',
    '{}',
    'medium',
    'standard'
);
*/