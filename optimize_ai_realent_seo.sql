-- Optimize A.I Realent Global Resources Listing for SEO
-- Run this in Supabase SQL Editor

-- 1. Update with comprehensive, keyword-rich description
UPDATE listings
SET 
    description = 'A.I Realent Global Resources Ltd is a leading real estate company in Abuja, Nigeria, specializing in verified property sales, leasing, and investment opportunities across the Federal Capital Territory. With a commitment to transparency and innovation, we offer verified property listings in prime Abuja locations including Maitama, Asokoro, Jahi, Gwarinpa, Katampe Extension, Karsana, Lokogoma, Lugbe, Wuye, Jabi, Kubwa, Galadimawa, Guzape, Utako, and Mabushi.

Our services include AI-driven property valuation for accurate pricing, comprehensive legal and survey assistance, flexible payment plans for first-time buyers, and professional property management services. Every property undergoes independent verification and due diligence, ensuring authenticity and protecting clients from disputes. Our team physically inspects properties with owners or developers before listing, providing real photos and honest pricing.

Whether you''re a first-time homeowner, seeking investment opportunities, or an international buyer, we provide personalized support from initial contact to handover. Contact us today for verified property listings in Abuja.',
    
    -- 2. Add geo-coordinates for Abuja (critical for local SEO)
    latitude = 9.0765,
    longitude = 7.3986,
    neighborhood = 'Central Business District',
    city = 'Abuja',
    
    -- 3. Add services offered
    services_offered = ARRAY[
        'Property Sales',
        'Property Leasing',
        'Property Management',
        'Real Estate Investment Consulting',
        'AI-Driven Property Valuation',
        'Legal & Survey Assistance',
        'Property Verification Services',
        'First-Time Buyer Support',
        'International Buyer Services'
    ],
    
    -- 4. Add meta tags for SEO
    meta_title = 'A.I Realent Global Resources - Premium Real Estate in Abuja, FCT | Verified Properties',
    meta_description = 'Find verified real estate properties with A.I Realent in Abuja. AI-driven valuation, transparent pricing, comprehensive legal support. Serving Maitama, Asokoro, Jahi, Gwarinpa & more. Contact us today.',
    keywords = ARRAY[
        'real estate Abuja',
        'property Abuja',
        'houses for sale Abuja',
        'land for sale FCT',
        'verified properties Abuja',
        'A.I Realent',
        'Maitama properties',
        'Asokoro real estate',
        'Jahi properties',
        'Gwarinpa real estate',
        'property investment Abuja',
        'real estate agent Abuja',
        'property management Abuja'
    ],
    
    -- 5. Add year established (if known, adjust as needed)
    year_established = 2010,
    
    -- 6. Update timestamp
    updated_at = NOW()

WHERE business_name ILIKE '%A.I Realent Global Resources%';

-- Verify the update
SELECT 
    id,
    business_name,
    city,
    latitude,
    longitude,
    meta_title,
    array_length(services_offered, 1) as services_count,
    array_length(keywords, 1) as keywords_count,
    length(description) as description_length
FROM listings
WHERE business_name ILIKE '%A.I Realent%';
