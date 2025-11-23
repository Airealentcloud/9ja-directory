-- Check listing ownership
SELECT 
    l.id, 
    l.business_name, 
    l.user_id, 
    p.email as owner_email,
    l.updated_at
FROM listings l
LEFT JOIN profiles p ON l.user_id = p.id
WHERE l.business_name ILIKE '%realent%' OR l.business_name ILIKE '%a.i%';
