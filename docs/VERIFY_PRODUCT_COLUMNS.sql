-- Verify that all required product columns exist
-- Run this in Supabase SQL Editor to confirm the schema is complete

SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Also check specifically for the new columns we added
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand_name') 
        THEN '✅ brand_name exists' 
        ELSE '❌ brand_name missing' 
    END as brand_name_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'country_of_origin') 
        THEN '✅ country_of_origin exists' 
        ELSE '❌ country_of_origin missing' 
    END as country_of_origin_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category_id') 
        THEN '✅ category_id exists' 
        ELSE '❌ category_id missing' 
    END as category_id_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'model_number') 
        THEN '✅ model_number exists' 
        ELSE '❌ model_number missing' 
    END as model_number_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'warranty_period_months') 
        THEN '✅ warranty_period_months exists' 
        ELSE '❌ warranty_period_months missing' 
    END as warranty_period_months_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'risk_level') 
        THEN '✅ risk_level exists' 
        ELSE '❌ risk_level missing' 
    END as risk_level_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'verification_complexity') 
        THEN '✅ verification_complexity exists' 
        ELSE '❌ verification_complexity missing' 
    END as verification_complexity_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'industry_type') 
        THEN '✅ industry_type exists' 
        ELSE '❌ industry_type missing' 
    END as industry_type_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'industry_data') 
        THEN '✅ industry_data exists' 
        ELSE '❌ industry_data missing' 
    END as industry_data_status;

-- Check alembic version
SELECT version_num FROM alembic_version;