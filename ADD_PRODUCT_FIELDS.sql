-- Add missing product fields to fix N/A display issue
-- Run this in Supabase SQL Editor

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS country_of_origin VARCHAR(100),
ADD COLUMN IF NOT EXISTS category_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS model_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS warranty_period_months INTEGER,
ADD COLUMN IF NOT EXISTS risk_level VARCHAR(50) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS verification_complexity VARCHAR(50) DEFAULT 'standard';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('brand_name', 'country_of_origin', 'category_id', 'model_number', 'warranty_period_months', 'risk_level', 'verification_complexity')
ORDER BY column_name;