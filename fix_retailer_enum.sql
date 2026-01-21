-- ============================================
-- COMPLETE DATABASE FIX FOR PRODUCTION
-- ============================================
-- This script fixes all three database issues:
-- 1. Adds RETAILER to enums
-- 2. Adds missing columns to manufacturers table
-- 3. Migrates existing data
--
-- Run this in Supabase SQL Editor
-- ============================================

BEGIN;

-- ============================================
-- PART 1: Add RETAILER to OrganizationType enum
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'RETAILER' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'organizationtype')
    ) THEN
        ALTER TYPE organizationtype ADD VALUE 'RETAILER';
        RAISE NOTICE '✅ Added RETAILER to organizationtype enum';
    ELSE
        RAISE NOTICE 'ℹ️  RETAILER already exists in organizationtype enum';
    END IF;
END $$;

-- ============================================
-- PART 2: Add RETAILER to UserRole enum
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'RETAILER' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'userrole')
    ) THEN
        ALTER TYPE userrole ADD VALUE 'RETAILER';
        RAISE NOTICE '✅ Added RETAILER to userrole enum';
    ELSE
        RAISE NOTICE 'ℹ️  RETAILER already exists in userrole enum';
    END IF;
END $$;

-- ============================================
-- PART 3: Add missing columns to manufacturers table
-- ============================================

-- Add regulatory_license_number column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'manufacturers' 
        AND column_name = 'regulatory_license_number'
    ) THEN
        ALTER TABLE manufacturers 
        ADD COLUMN regulatory_license_number VARCHAR(100);
        RAISE NOTICE '✅ Added regulatory_license_number column';
    ELSE
        RAISE NOTICE 'ℹ️  regulatory_license_number column already exists';
    END IF;
END $$;

-- Add regulatory_body column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'manufacturers' 
        AND column_name = 'regulatory_body'
    ) THEN
        ALTER TABLE manufacturers 
        ADD COLUMN regulatory_body VARCHAR(100);
        RAISE NOTICE '✅ Added regulatory_body column';
    ELSE
        RAISE NOTICE 'ℹ️  regulatory_body column already exists';
    END IF;
END $$;

-- Add primary_certification_type column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'manufacturers' 
        AND column_name = 'primary_certification_type'
    ) THEN
        ALTER TABLE manufacturers 
        ADD COLUMN primary_certification_type VARCHAR(50);
        RAISE NOTICE '✅ Added primary_certification_type column';
    ELSE
        RAISE NOTICE 'ℹ️  primary_certification_type column already exists';
    END IF;
END $$;

-- Add primary_certification_expiry column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'manufacturers' 
        AND column_name = 'primary_certification_expiry'
    ) THEN
        ALTER TABLE manufacturers 
        ADD COLUMN primary_certification_expiry DATE;
        RAISE NOTICE '✅ Added primary_certification_expiry column';
    ELSE
        RAISE NOTICE 'ℹ️  primary_certification_expiry column already exists';
    END IF;
END $$;

-- ============================================
-- PART 4: Migrate existing data
-- ============================================

-- Migrate NAFDAC license data to generic regulatory fields
UPDATE manufacturers 
SET regulatory_license_number = nafdac_license_number,
    regulatory_body = 'NAFDAC'
WHERE nafdac_license_number IS NOT NULL
  AND regulatory_license_number IS NULL;

-- Migrate GMP certification data
UPDATE manufacturers
SET primary_certification_type = 'GMP',
    primary_certification_expiry = gmp_certificate_expiry
WHERE gmp_certified = TRUE
  AND primary_certification_type IS NULL;

RAISE NOTICE '✅ Migrated existing regulatory data';

-- ============================================
-- PART 5: Verify all changes
-- ============================================

-- Show organizationtype enum values
SELECT '=== OrganizationType Enum Values ===' as info;
SELECT enumlabel as value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'organizationtype')
ORDER BY enumlabel;

-- Show userrole enum values
SELECT '=== UserRole Enum Values ===' as info;
SELECT enumlabel as value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'userrole')
ORDER BY enumlabel;

-- Show manufacturers table columns
SELECT '=== Manufacturers Table Columns ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'manufacturers'
ORDER BY ordinal_position;

COMMIT;

-- ============================================
-- Success message
-- ============================================
SELECT '✅ ALL MIGRATIONS COMPLETE!' as status,
       'Database is now ready for production use' as message;
