-- Verify that all new columns were added to listings table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'listings'
AND column_name IN (
    'email', 'website_url', 'whatsapp_number', 
    'facebook_url', 'instagram_url', 'twitter_url',
    'latitude', 'longitude', 'neighborhood', 'landmark',
    'opening_hours', 'images', 'video_url', 'logo_url',
    'year_established', 'employee_count', 'payment_methods', 
    'languages_spoken', 'services_offered',
    'meta_title', 'meta_description', 'keywords',
    'verified', 'claimed', 'claimed_by', 'claimed_at',
    'view_count', 'click_count', 'last_updated'
)
ORDER BY column_name;
