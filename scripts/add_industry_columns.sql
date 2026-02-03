-- Add missing industry columns to products table
-- Run this in Supabase SQL Editor

-- Add industry_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'industry_type'
    ) THEN
        ALTER TABLE products ADD COLUMN industry_type VARCHAR(50) DEFAULT 'Healthcare';
        RAISE NOTICE 'Added industry_type column';
    ELSE
        RAISE NOTICE 'industry_type column already exists';
    END IF;
END $$;

-- Add industry_data column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'industry_data'
    ) THEN
        ALTER TABLE products ADD COLUMN industry_data JSONB DEFAULT '{}';
        RAISE NOTICE 'Added industry_data column';
    ELSE
        RAISE NOTICE 'industry_data column already exists';
    END IF;
END $$;

-- Add regulatory_registration column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'regulatory_registration'
    ) THEN
        ALTER TABLE products ADD COLUMN regulatory_registration VARCHAR(100);
        RAISE NOTICE 'Added regulatory_registration column';
    ELSE
        RAISE NOTICE 'regulatory_registration column already exists';
    END IF;
END $$;

-- Add category_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE products ADD COLUMN category_id UUID;
        RAISE NOTICE 'Added category_id column';
    ELSE
        RAISE NOTICE 'category_id column already exists';
    END IF;
END $$;

-- Add brand_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'brand_name'
    ) THEN
        ALTER TABLE products ADD COLUMN brand_name VARCHAR(200);
        RAISE NOTICE 'Added brand_name column';
    ELSE
        RAISE NOTICE 'brand_name column already exists';
    END IF;
END $$;

-- Add model_number column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'model_number'
    ) THEN
        ALTER TABLE products ADD COLUMN model_number VARCHAR(100);
        RAISE NOTICE 'Added model_number column';
    ELSE
        RAISE NOTICE 'model_number column already exists';
    END IF;
END $$;

-- Add warranty_period_months column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'warranty_period_months'
    ) THEN
        ALTER TABLE products ADD COLUMN warranty_period_months INTEGER;
        RAISE NOTICE 'Added warranty_period_months column';
    ELSE
        RAISE NOTICE 'warranty_period_months column already exists';
    END IF;
END $$;

-- Add country_of_origin column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'country_of_origin'
    ) THEN
        ALTER TABLE products ADD COLUMN country_of_origin VARCHAR(100);
        RAISE NOTICE 'Added country_of_origin column';
    ELSE
        RAISE NOTICE 'country_of_origin column already exists';
    END IF;
END $$;

-- Add risk_level column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'risk_level'
    ) THEN
        ALTER TABLE products ADD COLUMN risk_level VARCHAR(20) DEFAULT 'medium';
        RAISE NOTICE 'Added risk_level column';
    ELSE
        RAISE NOTICE 'risk_level column already exists';
    END IF;
END $$;

-- Add verification_complexity column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'verification_complexity'
    ) THEN
        ALTER TABLE products ADD COLUMN verification_complexity VARCHAR(20) DEFAULT 'standard';
        RAISE NOTICE 'Added verification_complexity column';
    ELSE
        RAISE NOTICE 'verification_complexity column already exists';
    END IF;
END $$;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
    AND column_name IN (
        'industry_type', 
        'industry_data', 
        'regulatory_registration',
        'category_id',
        'brand_name',
        'model_number',
        'warranty_period_months',
        'country_of_origin',
        'risk_level',
        'verification_complexity'
    )
ORDER BY column_name;
