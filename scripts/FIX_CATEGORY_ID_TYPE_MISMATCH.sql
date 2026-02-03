-- FIX CATEGORY_ID TYPE MISMATCH - ROOT CAUSE OF 500 ERROR
-- Run this in Supabase SQL Editor to fix the product creation issue

-- The issue: category_id column is UUID type but model expects VARCHAR(100)
-- This causes SQLAlchemy to fail when inserting string values

-- Step 1: Check current type
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'category_id';

-- Step 2: Fix the type mismatch
-- Change category_id from UUID to VARCHAR(100) to match the model
ALTER TABLE products ALTER COLUMN category_id TYPE VARCHAR(100);

-- Step 3: Verify the fix
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'category_id';

-- Step 4: Test that the change worked
-- This should now show: category_id | character varying | 100

-- Optional: Update any existing UUID values to string format
-- (Only run if you have existing data with UUID values)
/*
UPDATE products 
SET category_id = CAST(category_id AS VARCHAR(100))
WHERE category_id IS NOT NULL;
*/

-- Success message
SELECT 'category_id type mismatch fixed - product creation should now work!' as status;