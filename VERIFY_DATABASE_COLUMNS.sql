-- Check if the new product columns exist in the database
-- Run this in Supabase SQL Editor to verify the migration was applied

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Specifically check for the new columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN (
    'brand_name', 
    'country_of_origin', 
    'category_id', 
    'model_number', 
    'warranty_period_months', 
    'risk_level', 
    'verification_complexity'
)
ORDER BY column_name;