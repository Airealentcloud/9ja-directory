-- Get ALL categories with listing counts (including those with 0 listings)
-- This will show us what other categories exist beyond the top 10

SELECT 
    c.name,
    c.slug,
    COUNT(l.id) as total_listings
FROM categories c
LEFT JOIN listings l ON l.category_id = c.id AND l.status = 'approved'
GROUP BY c.id, c.name, c.slug
ORDER BY total_listings DESC;
