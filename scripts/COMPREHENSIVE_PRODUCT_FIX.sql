-- COMPREHENSIVE PRODUCT CREATION/EDITING FIX
-- This script fixes all database schema issues preventing product creation and editing
-- Run this in Supabase SQL Editor

-- ===========================================
-- STEP 1: Add missing product columns from migrations
-- ===========================================

-- Add industry_type and industry_data columns (from 001_packguard_expansion)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS industry_type VARCHAR(50) DEFAULT 'Healthcare',
ADD COLUMN IF NOT EXISTS industry_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS regulatory_registration VARCHAR(100);

-- Add product form fields (from 006_add_product_fields)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS country_of_origin VARCHAR(100),
ADD COLUMN IF NOT EXISTS category_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS model_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS warranty_period_months INTEGER,
ADD COLUMN IF NOT EXISTS risk_level VARCHAR(50) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS verification_complexity VARCHAR(50) DEFAULT 'standard';

-- ===========================================
-- STEP 2: Create product_categories table if missing
-- ===========================================

CREATE TABLE IF NOT EXISTS product_categories (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(100) NOT NULL,
    category_code VARCHAR(20) UNIQUE NOT NULL,
    parent_category_id UUID REFERENCES product_categories(category_id),
    industry_type VARCHAR(50) NOT NULL,
    description TEXT,
    regulatory_requirements JSONB DEFAULT '{}',
    verification_rules JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert base categories if they don't exist
INSERT INTO product_categories (category_name, category_code, industry_type, description) 
VALUES
    ('Pharmaceuticals', 'PHARMA', 'Healthcare', 'Pharmaceutical products and medical devices'),
    ('Electronics', 'ELEC', 'Technology', 'Electronic devices and components'),
    ('Luxury Goods', 'LUXURY', 'Fashion', 'High-end fashion and luxury items'),
    ('Food & Beverages', 'FOOD', 'Consumer Goods', 'Food products and beverages'),
    ('Automotive Parts', 'AUTO', 'Automotive', 'Vehicle parts and accessories'),
    ('Cosmetics', 'COSMETIC', 'Personal Care', 'Beauty and personal care products')
ON CONFLICT (category_code) DO NOTHING;

-- ===========================================
-- STEP 3: Create product_attributes table if missing
-- ===========================================

CREATE TABLE IF NOT EXISTS product_attributes (
    attribute_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value TEXT,
    attribute_type VARCHAR(50) DEFAULT 'text',
    display_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- STEP 4: Create certifications table if missing
-- ===========================================

CREATE TABLE IF NOT EXISTS certifications (
    certification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    certification_name VARCHAR(200) NOT NULL,
    certification_body VARCHAR(200),
    certificate_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    certificate_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- STEP 5: Create industry-specific specification tables if missing
-- ===========================================

-- Electronics specifications
CREATE TABLE IF NOT EXISTS electronics_specifications (
    spec_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    processor VARCHAR(200),
    memory_gb INTEGER,
    storage_gb INTEGER,
    display_size DECIMAL(4,2),
    battery_capacity INTEGER,
    operating_system VARCHAR(100),
    connectivity JSONB DEFAULT '{}',
    dimensions JSONB DEFAULT '{}',
    power_requirements JSONB DEFAULT '{}',
    compatibility_matrix JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Luxury specifications
CREATE TABLE IF NOT EXISTS luxury_specifications (
    spec_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    material VARCHAR(200),
    craftsmanship_level VARCHAR(50),
    limited_edition BOOLEAN DEFAULT FALSE,
    edition_number INTEGER,
    total_edition_size INTEGER,
    designer VARCHAR(200),
    collection_name VARCHAR(200),
    authentication_features JSONB DEFAULT '{}',
    provenance_history JSONB DEFAULT '{}',
    estimated_value DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food specifications
CREATE TABLE IF NOT EXISTS food_specifications (
    spec_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    nutritional_info JSONB DEFAULT '{}',
    allergens JSONB DEFAULT '[]',
    dietary_restrictions JSONB DEFAULT '[]',
    origin_location VARCHAR(200),
    harvest_date TIMESTAMP WITH TIME ZONE,
    processing_date TIMESTAMP WITH TIME ZONE,
    storage_requirements JSONB DEFAULT '{}',
    shelf_life_days INTEGER,
    organic_certified BOOLEAN DEFAULT FALSE,
    fair_trade_certified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automotive specifications
CREATE TABLE IF NOT EXISTS automotive_specifications (
    spec_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    part_category VARCHAR(100),
    oem_part_number VARCHAR(100),
    compatible_vehicles JSONB DEFAULT '{}',
    safety_critical BOOLEAN DEFAULT FALSE,
    installation_complexity VARCHAR(20) DEFAULT 'medium',
    warranty_terms JSONB DEFAULT '{}',
    recall_history JSONB DEFAULT '{}',
    performance_specs JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cosmetics specifications
CREATE TABLE IF NOT EXISTS cosmetics_specifications (
    spec_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    ingredients JSONB DEFAULT '{}',
    skin_type_suitability JSONB DEFAULT '[]',
    usage_instructions VARCHAR(1000),
    safety_warnings VARCHAR(1000),
    dermatologically_tested BOOLEAN DEFAULT FALSE,
    cruelty_free BOOLEAN DEFAULT FALSE,
    natural_percentage DECIMAL(5,2),
    spf_rating INTEGER,
    color_shade VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- STEP 6: Create indexes for performance
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_products_industry_type ON products(industry_type);
CREATE INDEX IF NOT EXISTS idx_products_manufacturer_id ON products(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

CREATE INDEX IF NOT EXISTS idx_product_attributes_product_id ON product_attributes(product_id);
CREATE INDEX IF NOT EXISTS idx_certifications_product_id ON certifications(product_id);

CREATE INDEX IF NOT EXISTS idx_electronics_specifications_product_id ON electronics_specifications(product_id);
CREATE INDEX IF NOT EXISTS idx_luxury_specifications_product_id ON luxury_specifications(product_id);
CREATE INDEX IF NOT EXISTS idx_food_specifications_product_id ON food_specifications(product_id);
CREATE INDEX IF NOT EXISTS idx_automotive_specifications_product_id ON automotive_specifications(product_id);
CREATE INDEX IF NOT EXISTS idx_cosmetics_specifications_product_id ON cosmetics_specifications(product_id);

-- ===========================================
-- STEP 7: Enable Row Level Security on new tables
-- ===========================================

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE electronics_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE luxury_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE automotive_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cosmetics_specifications ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 8: Update alembic version to latest
-- ===========================================

-- Update alembic version to reflect all migrations applied
INSERT INTO alembic_version (version_num) VALUES ('006_add_product_fields')
ON CONFLICT (version_num) DO UPDATE SET version_num = '006_add_product_fields';

-- ===========================================
-- STEP 9: Verify schema is complete
-- ===========================================

-- Check that all required product columns exist
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check that all related tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'products', 'product_categories', 'product_attributes', 'certifications',
    'electronics_specifications', 'luxury_specifications', 'food_specifications',
    'automotive_specifications', 'cosmetics_specifications'
)
ORDER BY table_name;

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
-- Database schema is now complete and ready for product creation/editing!