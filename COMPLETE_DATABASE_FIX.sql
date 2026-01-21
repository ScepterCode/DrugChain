-- COMPLETE DATABASE FIX FOR DRUGCHAIN
-- Run this entire script in Supabase SQL Editor
-- This fixes ALL database issues at once

BEGIN;

-- ============================================================================
-- PART 1: Add missing columns to products table
-- ============================================================================

-- Add industry_type column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'industry_type'
    ) THEN
        ALTER TABLE products ADD COLUMN industry_type VARCHAR(50) DEFAULT 'Healthcare';
        RAISE NOTICE '✅ Added industry_type column to products';
    ELSE
        RAISE NOTICE 'ℹ️  industry_type already exists in products';
    END IF;
END $$;

-- Add industry_data column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'industry_data'
    ) THEN
        ALTER TABLE products ADD COLUMN industry_data JSONB DEFAULT '{}';
        RAISE NOTICE '✅ Added industry_data column to products';
    ELSE
        RAISE NOTICE 'ℹ️  industry_data already exists in products';
    END IF;
END $$;

-- Add regulatory_registration column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'regulatory_registration'
    ) THEN
        ALTER TABLE products ADD COLUMN regulatory_registration VARCHAR(100);
        RAISE NOTICE '✅ Added regulatory_registration column to products';
    ELSE
        RAISE NOTICE 'ℹ️  regulatory_registration already exists in products';
    END IF;
END $$;

-- Add updated_at column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        RAISE NOTICE '✅ Added updated_at column to products';
    ELSE
        RAISE NOTICE 'ℹ️  updated_at already exists in products';
    END IF;
END $$;

-- ============================================================================
-- PART 2: Verify products table columns
-- ============================================================================

SELECT 
    '✅ Products table columns verified' as status,
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
    AND column_name IN (
        'industry_type', 
        'industry_data', 
        'regulatory_registration',
        'updated_at'
    )
ORDER BY column_name;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

SELECT '🎉 DATABASE FIX COMPLETE!' as message;
SELECT 'All products table columns have been added successfully' as details;
SELECT 'You can now redeploy your backend on Render' as next_step;
