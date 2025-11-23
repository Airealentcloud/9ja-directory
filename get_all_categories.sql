-- Fetch all categories with listing counts for SEO optimization
SELECT 
    c.id,
    c.name,
    c.slug,
    c.description,
    c.icon,
    COUNT(l.id) as listing_count,
    COUNT(CASE WHEN l.verified = true THEN 1 END) as verified_count
FROM categories c
LEFT JOIN listings l ON l.category_id = c.id AND l.status = 'approved'
GROUP BY c.id, c.name, c.slug, c.description, c.icon
ORDER BY listing_count DESC;

-- Get top 10 categories by listing count
SELECT 
    c.name,
    c.slug,
    COUNT(l.id) as total_listings
FROM categories c
LEFT JOIN listings l ON l.category_id = c.id AND l.status = 'approved'
GROUP BY c.id, c.name, c.slug
ORDER BY total_listings DESC
LIMIT 10;
