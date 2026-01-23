-- Query to list all existing cartons in the database
-- Run this directly in your database to see what carton IDs actually exist

-- Check if any cartons exist at all
SELECT 
    'Total cartons in database:' as info,
    COUNT(*) as count
FROM cartons;

-- List all carton IDs with their batch information
SELECT 
    c.carton_id,
    c.batch_id,
    c.packs_per_carton,
    b.batch_size,
    p.product_name,
    b.created_at
FROM cartons c
JOIN batches b ON c.batch_id = b.batch_id
JOIN products p ON b.product_id = p.product_id
ORDER BY c.created_at DESC
LIMIT 20;

-- If no cartons exist, show what batches exist
SELECT 
    'Batches without cartons:' as info,
    b.batch_id,
    b.batch_size,
    b.number_of_cartons,
    p.product_name,
    b.created_at
FROM batches b
JOIN products p ON b.product_id = p.product_id
LEFT JOIN cartons c ON b.batch_id = c.batch_id
WHERE c.carton_id IS NULL
ORDER BY b.created_at DESC;
