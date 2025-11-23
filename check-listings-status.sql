-- Check what listings exist in the database and their status
SELECT 
    id,
    business_name,
    status,
    created_at,
    city
FROM listings
ORDER BY created_at DESC
LIMIT 20;

-- Count by status
SELECT 
    status,
    COUNT(*) as count
FROM listings
GROUP BY status;
