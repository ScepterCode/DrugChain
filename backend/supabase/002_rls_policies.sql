-- DrugChain Row Level Security (RLS) Policies for Supabase
-- Run this AFTER running 001_complete_schema.sql
-- These policies control access to data based on user authentication

-- ===========================================
-- RLS POLICIES FOR ORGANIZATIONS
-- ===========================================

-- Allow authenticated users to view all organizations
CREATE POLICY "Allow authenticated users to view organizations"
ON organizations FOR SELECT
TO authenticated
USING (true);

-- Allow organization members to update their own organization
CREATE POLICY "Allow organization members to update their organization"
ON organizations FOR UPDATE
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE user_id = auth.uid()
    )
);

-- ===========================================
-- RLS POLICIES FOR USERS
-- ===========================================

-- Allow users to view their own profile
CREATE POLICY "Allow users to view their own profile"
ON users FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR 
       organization_id IN (SELECT organization_id FROM users WHERE user_id = auth.uid()));

-- Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile"
ON users FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- ===========================================
-- RLS POLICIES FOR PRODUCTS
-- ===========================================

-- Allow anyone to view active products
CREATE POLICY "Allow anyone to view products"
ON products FOR SELECT
USING (is_active = true);

-- Allow manufacturers to manage their products
CREATE POLICY "Allow manufacturers to insert products"
ON products FOR INSERT
TO authenticated
WITH CHECK (
    manufacturer_id IN (
        SELECT u.organization_id 
        FROM users u 
        WHERE u.user_id = auth.uid() AND u.role = 'MANUFACTURER'
    )
);

CREATE POLICY "Allow manufacturers to update their products"
ON products FOR UPDATE
TO authenticated
USING (
    manufacturer_id IN (
        SELECT u.organization_id 
        FROM users u 
        WHERE u.user_id = auth.uid() AND u.role = 'MANUFACTURER'
    )
);

-- ===========================================
-- RLS POLICIES FOR BATCHES
-- ===========================================

-- Allow authenticated users to view batches
CREATE POLICY "Allow authenticated users to view batches"
ON batches FOR SELECT
TO authenticated
USING (true);

-- Allow manufacturers to create batches
CREATE POLICY "Allow manufacturers to create batches"
ON batches FOR INSERT
TO authenticated
WITH CHECK (
    manufacturer_id IN (
        SELECT u.organization_id 
        FROM users u 
        WHERE u.user_id = auth.uid() AND u.role = 'MANUFACTURER'
    )
);

-- ===========================================
-- RLS POLICIES FOR PACKS
-- ===========================================

-- Allow anyone to view packs (for verification)
CREATE POLICY "Allow anyone to view packs"
ON packs FOR SELECT
USING (true);

-- Allow manufacturers to create packs
CREATE POLICY "Allow manufacturers to create packs"
ON packs FOR INSERT
TO authenticated
WITH CHECK (
    batch_id IN (
        SELECT b.batch_id 
        FROM batches b 
        WHERE b.manufacturer_id IN (
            SELECT u.organization_id 
            FROM users u 
            WHERE u.user_id = auth.uid() AND u.role = 'MANUFACTURER'
        )
    )
);

-- ===========================================
-- RLS POLICIES FOR VERIFICATION EVENTS
-- ===========================================

-- Allow anyone to insert verification events (public verification)
CREATE POLICY "Allow anyone to create verification events"
ON verification_events FOR INSERT
WITH CHECK (true);

-- Allow authenticated users to view verification events
CREATE POLICY "Allow authenticated users to view verification events"
ON verification_events FOR SELECT
TO authenticated
USING (true);

-- ===========================================
-- RLS POLICIES FOR SUPPLY CHAIN EVENTS  
-- ===========================================

-- Allow authenticated users to view supply chain events
CREATE POLICY "Allow authenticated users to view supply chain events"
ON supply_chain_events FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to create supply chain events
CREATE POLICY "Allow authenticated users to create supply chain events"
ON supply_chain_events FOR INSERT
TO authenticated
WITH CHECK (performed_by = auth.uid());
