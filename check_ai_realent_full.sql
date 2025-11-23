-- Check all fields of A.I Realent listing to see what was updated
SELECT 
    id,
    business_name,
    city,
    neighborhood,
    latitude,
    longitude,
    meta_title,
    meta_description,
    description,
    services_offered,
    keywords,
    year_established,
    updated_at
FROM listings
WHERE business_name ILIKE '%A.I Realent%';
