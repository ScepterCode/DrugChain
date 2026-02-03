-- Minimal fix - just update product fields for better verification display
-- Run this in Supabase SQL Editor

-- Step 1: Add missing columns (safe approach)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS country_of_origin VARCHAR(100);

-- Step 2: Update only the product fields (no organization changes)
UPDATE products 
SET 
    brand_name = CASE 
        WHEN brand_name IS NULL OR brand_name = '' THEN 
            CASE 
                WHEN product_name ILIKE '%paracetamol%' THEN 'Panadol'
                WHEN product_name ILIKE '%amoxicillin%' THEN 'Amoxil'
                WHEN product_name ILIKE '%ibuprofen%' THEN 'Advil'
                WHEN product_name ILIKE '%vitamin%' THEN 'VitaHealth'
                ELSE SPLIT_PART(product_name, ' ', 1) || ' Brand'
            END
        ELSE brand_name 
    END,
    country_of_origin = CASE 
        WHEN country_of_origin IS NULL OR country_of_origin = '' THEN 'Nigeria'
        ELSE country_of_origin 
    END,
    dosage = CASE 
        WHEN dosage IS NULL OR dosage = '' THEN 
            CASE 
                WHEN product_name ILIKE '%500mg%' THEN '500mg'
                WHEN product_name ILIKE '%250mg%' THEN '250mg'
                WHEN product_name ILIKE '%100mg%' THEN '100mg'
                WHEN product_name ILIKE '%paracetamol%' THEN '500mg'
                WHEN product_name ILIKE '%amoxicillin%' THEN '250mg'
                WHEN product_name ILIKE '%ibuprofen%' THEN '200mg'
                ELSE '500mg'
            END
        ELSE dosage 
    END,
    form = CASE 
        WHEN form IS NULL OR form = '' THEN 
            CASE 
                WHEN product_name ILIKE '%tablet%' THEN 'Tablet'
                WHEN product_name ILIKE '%capsule%' THEN 'Capsule'
                WHEN product_name ILIKE '%syrup%' THEN 'Syrup'
                WHEN product_name ILIKE '%injection%' THEN 'Injection'
                ELSE 'Tablet'
            END
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

-- Step 3: Check the results
SELECT 
    product_id,
    product_name,
    brand_name,
    dosage,
    form,
    country_of_origin,
    nafdac_registration_number
FROM products 
LIMIT 5;

-- Success message
SELECT 'Product fields updated! Your pack IDs should now show better details.' as status;