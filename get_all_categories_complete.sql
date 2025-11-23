-- Get all categories with listing counts to see what needs optimization
SELECT 
    c.id,
    c.name,
    c.slug,
    COUNT(l.id) as listing_count
FROM categories c
LEFT JOIN listings l ON l.category_id = c.id AND l.status = 'approved'
GROUP BY c.id, c.name, c.slug
ORDER BY listing_count DESC;
