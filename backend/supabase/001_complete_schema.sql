-- DrugChain Database Schema for Supabase
-- Complete migration script to create all tables in Supabase PostgreSQL
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ===========================================
-- STEP 1: Enable UUID Extension (usually already enabled in Supabase)
-- ===========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- STEP 2: Create Custom Enum Types
-- ===========================================

-- Organization Types
DO $$ BEGIN
    CREATE TYPE organizationtype AS ENUM ('MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY', 'REGULATOR');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- License Status
DO $$ BEGIN
    CREATE TYPE licensestatus AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REVOKED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- User Roles
DO $$ BEGIN
    CREATE TYPE userrole AS ENUM ('MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY', 'REGULATOR', 'SYSTEM_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Batch Status
DO $$ BEGIN
    CREATE TYPE batchstatus AS ENUM ('ACTIVE', 'RECALLED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Pack Status
DO $$ BEGIN
    CREATE TYPE packstatus AS ENUM ('ACTIVE', 'USED', 'RECALLED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ===========================================
-- STEP 3: Create Organizations Table
-- ===========================================
CREATE TABLE IF NOT EXISTS organizations (
    organization_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_name VARCHAR(255) NOT NULL,
    organization_type organizationtype NOT NULL,
    registration_number VARCHAR(100) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Nigeria',
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    license_status licensestatus DEFAULT 'PENDING',
    verified_by_regulator BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 4: Create Manufacturers Table
-- ===========================================
CREATE TABLE IF NOT EXISTS manufacturers (
    manufacturer_id UUID PRIMARY KEY REFERENCES organizations(organization_id) ON DELETE CASCADE,
    manufacturer_code VARCHAR(10) UNIQUE NOT NULL,
    nafdac_license_number VARCHAR(100),
    production_capacity INTEGER,
    specialization TEXT[],
    gmp_certified BOOLEAN DEFAULT FALSE,
    gmp_certificate_expiry DATE
);

-- Enable Row Level Security
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 5: Create Users Table
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role userrole NOT NULL,
    organization_id UUID REFERENCES organizations(organization_id) ON DELETE CASCADE,
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 6: Create Products Table
-- ===========================================
CREATE TABLE IF NOT EXISTS products (
    product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(manufacturer_id) ON DELETE CASCADE,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    form VARCHAR(50),
    active_ingredients TEXT[],
    therapeutic_category VARCHAR(100),
    requires_prescription BOOLEAN DEFAULT FALSE,
    description TEXT,
    nafdac_registration_number VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 7: Create Batches Table
-- ===========================================
CREATE TABLE IF NOT EXISTS batches (
    batch_id VARCHAR(50) PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(manufacturer_id) ON DELETE CASCADE,
    production_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    batch_size INTEGER NOT NULL,
    number_of_cartons INTEGER,
    total_packs INTEGER,
    quality_certificate_url TEXT,
    status batchstatus DEFAULT 'ACTIVE',
    created_by UUID REFERENCES users(user_id),
    blockchain_tx_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS ix_batches_manufacturer ON batches(manufacturer_id);
CREATE INDEX IF NOT EXISTS ix_batches_product ON batches(product_id);

-- Enable Row Level Security
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 8: Create Cartons Table
-- ===========================================
CREATE TABLE IF NOT EXISTS cartons (
    carton_id VARCHAR(50) PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
    carton_number INTEGER NOT NULL,
    packs_per_carton INTEGER NOT NULL,
    current_location VARCHAR(255),
    current_holder_id UUID REFERENCES organizations(organization_id),
    blockchain_tx_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE cartons ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 9: Create Packs Table
-- ===========================================
CREATE TABLE IF NOT EXISTS packs (
    pack_id VARCHAR(16) PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
    carton_id VARCHAR(50) REFERENCES cartons(carton_id),
    qr_code_url TEXT,
    barcode VARCHAR(50),
    status packstatus DEFAULT 'ACTIVE',
    blockchain_tx_id VARCHAR(255),
    verification_count INTEGER DEFAULT 0,
    first_verified_at TIMESTAMP WITH TIME ZONE,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS ix_packs_batch ON packs(batch_id);
CREATE INDEX IF NOT EXISTS ix_packs_status ON packs(status);

-- Enable Row Level Security
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 10: Create Verification Events Table (for audit trail)
-- ===========================================
CREATE TABLE IF NOT EXISTS verification_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pack_id VARCHAR(16) REFERENCES packs(pack_id),
    verified_by_phone VARCHAR(20),
    verified_by_user_id UUID REFERENCES users(user_id),
    verification_result VARCHAR(50) NOT NULL, -- 'AUTHENTIC', 'COUNTERFEIT', 'EXPIRED', 'RECALLED'
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    location_address TEXT,
    device_info TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster pack lookups
CREATE INDEX IF NOT EXISTS ix_verification_events_pack ON verification_events(pack_id);

-- Enable Row Level Security
ALTER TABLE verification_events ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 11: Create Supply Chain Events Table
-- ===========================================
CREATE TABLE IF NOT EXISTS supply_chain_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL, -- 'MANUFACTURED', 'SHIPPED', 'RECEIVED', 'SOLD'
    batch_id VARCHAR(50) REFERENCES batches(batch_id),
    carton_id VARCHAR(50) REFERENCES cartons(carton_id),
    pack_id VARCHAR(16) REFERENCES packs(pack_id),
    from_organization_id UUID REFERENCES organizations(organization_id),
    to_organization_id UUID REFERENCES organizations(organization_id),
    performed_by UUID REFERENCES users(user_id),
    location_address TEXT,
    notes TEXT,
    blockchain_tx_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE supply_chain_events ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 12: Create Updated At Trigger Function
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at column
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cartons_updated_at BEFORE UPDATE ON cartons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- STEP 13: Create Alembic Version Table (for migration tracking)
-- ===========================================
CREATE TABLE IF NOT EXISTS alembic_version (
    version_num VARCHAR(32) NOT NULL,
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Insert initial migration version
INSERT INTO alembic_version (version_num) VALUES ('001')
ON CONFLICT (version_num) DO NOTHING;

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
-- If you see this, all tables were created successfully!
-- You can verify by running: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
