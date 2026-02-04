-- Quick check for pack_id length issues
-- Run this FIRST in Supabase SQL Editor to understand the problem

SELECT 
    'Pack ID Length Analysis' as analysis_type,
    MAX(LENGTH(pack_id)) as max_pack_id_length,
    MIN(LENGTH(pack_id)) as min_pack_id_length,
    AVG(LENGTH(pack_id))::numeric(5,2) as avg_pack_id_length,
    COUNT(*) as total_records
FROM verification_events 
WHERE pack_id IS NOT NULL;

-- Show the longest pack_id values
SELECT 
    'Longest Pack IDs' as info,
    pack_id,
    LENGTH(pack_id) as length,
    created_at
FROM verification_events 
WHERE pack_id IS NOT NULL
ORDER BY LENGTH(pack_id) DESC
LIMIT 5;