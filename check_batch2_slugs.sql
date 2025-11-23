-- Check actual slugs for Batch 2 categories
SELECT slug, name, 
       (SELECT COUNT(*) FROM listings WHERE category_id = categories.id AND status = 'approved') as listing_count
FROM categories 
WHERE name ILIKE '%transport%' 
   OR name ILIKE '%business%' 
   OR name ILIKE '%health%' 
   OR name ILIKE '%medical%'
   OR name ILIKE '%entertainment%'
   OR name ILIKE '%hotel%'
   OR name ILIKE '%lodging%'
ORDER BY listing_count DESC;
