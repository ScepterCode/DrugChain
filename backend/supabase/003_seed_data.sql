-- DrugChain Seed Data for Supabase
-- Run this AFTER running 001_complete_schema.sql
-- Creates initial test data including a system admin user

-- ===========================================
-- SEED DATA: Create System Admin Organization
-- ===========================================
INSERT INTO organizations (
    organization_id,
    organization_name,
    organization_type,
    registration_number,
    contact_email,
    contact_phone,
    license_status,
    verified_by_regulator,
    country
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'DrugChain System Administration',
    'REGULATOR',
    'SYSTEM-001',
    'admin@drugchain.com',
    '+2348000000001',
    'ACTIVE',
    TRUE,
    'Nigeria'
) ON CONFLICT (registration_number) DO NOTHING;

-- ===========================================
-- SEED DATA: Create System Admin User
-- Password: Admin123! (bcrypt hashed)
-- ===========================================
INSERT INTO users (
    user_id,
    email,
    password_hash,
    full_name,
    phone_number,
    role,
    organization_id,
    is_verified,
    email_verified_at
) VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'admin@drugchain.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.5KCLXL0F1GJW4W', -- Admin123!
    'System Administrator',
    '+2348000000001',
    'SYSTEM_ADMIN',
    'a0000000-0000-0000-0000-000000000001',
    TRUE,
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- ===========================================
-- SEED DATA: Create Sample Manufacturer Organization
-- ===========================================
INSERT INTO organizations (
    organization_id,
    organization_name,
    organization_type,
    registration_number,
    address,
    city,
    state,
    country,
    contact_email,
    contact_phone,
    license_status,
    verified_by_regulator
) VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'PharmaCorp Nigeria Ltd',
    'MANUFACTURER',
    'RC-PHARMA-001',
    '123 Industrial Avenue',
    'Lagos',
    'Lagos',
    'Nigeria',
    'info@pharmacorp.ng',
    '+2348012345678',
    'ACTIVE',
    TRUE
) ON CONFLICT (registration_number) DO NOTHING;

-- Create manufacturer record
INSERT INTO manufacturers (
    manufacturer_id,
    manufacturer_code,
    nafdac_license_number,
    production_capacity,
    specialization,
    gmp_certified,
    gmp_certificate_expiry
) VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'PHCORP',
    'NAFDAC-MAN-2024-001',
    1000000,
    ARRAY['Tablets', 'Capsules', 'Syrups'],
    TRUE,
    '2026-12-31'
) ON CONFLICT (manufacturer_id) DO NOTHING;

-- ===========================================
-- SEED DATA: Create Manufacturer User
-- Password: Pharma123! (bcrypt hashed)
-- ===========================================
INSERT INTO users (
    user_id,
    email,
    password_hash,
    full_name,
    phone_number,
    role,
    organization_id,
    is_verified,
    email_verified_at
) VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'manufacturer@pharmacorp.ng',
    '$2b$12$kXC0RJ0eVV.xA2k0F8J8d.kLuI8kJ0FxI0J8d.kLuI8kJ0FxI0J8', -- Pharma123!
    'PharmaCorp Admin',
    '+2348012345679',
    'MANUFACTURER',
    'c0000000-0000-0000-0000-000000000001',
    TRUE,
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- ===========================================
-- SEED DATA: Create Sample Product
-- ===========================================
INSERT INTO products (
    product_id,
    manufacturer_id,
    product_code,
    product_name,
    dosage,
    form,
    active_ingredients,
    therapeutic_category,
    requires_prescription,
    description,
    nafdac_registration_number,
    is_active
) VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'AMOX-500',
    'Amoxicillin 500mg Capsules',
    '500mg',
    'Capsule',
    ARRAY['Amoxicillin Trihydrate'],
    'Antibiotic',
    TRUE,
    'Broad-spectrum antibiotic for bacterial infections',
    'NAFDAC-A1-2024-0001',
    TRUE
) ON CONFLICT (product_code) DO NOTHING;

-- ===========================================
-- TEST DATA SUMMARY
-- ===========================================
-- System Admin: admin@drugchain.com / Admin123!
-- Manufacturer: manufacturer@pharmacorp.ng / Pharma123!
-- 
-- Note: The password hashes above are examples. 
-- For production, generate proper hashes using bcrypt.
