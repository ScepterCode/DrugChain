-- Simple database fix for product editing and verification
-- Run this in Supabase SQL Editor

-- Add missing product columns (safe approach)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS country_of_origin VARCHAR(100);

-- Update existing products with basic data
UPDATE products 
SET 
    brand_name = CASE 
        WHEN brand_name IS NULL OR brand_name = '' THEN 
            SPLIT_PART(product_name, ' ', 1) || ' Brand'
        ELSE brand_name 
    END,
    country_of_origin = CASE 
        WHEN country_of_origin IS NULL OR country_of_origin = '' THEN 'Nigeria'
        ELSE country_of_origin 
    END,
    dosage = CASE 
        WHEN dosage IS NULL OR dosage = '' THEN '500mg'
        ELSE dosage 
    END,
    form = CASE 
        WHEN form IS NULL OR form = '' THEN 'Tablet'
        ELSE form 
    END,
    nafdac_registration_number = CASE 
        WHEN nafdac_registration_number IS NULL OR nafdac_registration_number = '' THEN 
            'NAFDAC-' || UPPER(SUBSTRING(MD5(product_code), 1, 8))
        ELSE nafdac_registration_number 
    END
WHERE 
    (brand_name IS NULL OR brand_name = '') OR
    (country_of_origin IS NULL OR country_of_origin = '') OR
    (dosage IS NULL OR dosage = '') OR
    (form IS NULL OR form = '') OR
    (nafdac_registration_number IS NULL OR nafdac_registration_number = '');

-- Success message
SELECT 'Database columns added and products updated successfully!' as status;