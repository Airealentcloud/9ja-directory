-- Check images column for recent listings
SELECT 
    id, 
    business_name, 
    slug, 
    images, 
    updated_at 
FROM listings 
ORDER BY updated_at DESC 
LIMIT 5;
