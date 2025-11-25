-- SEO Schema Enhancements Migration
-- This migration adds SEO-related fields to improve search engine optimization
-- Date: 2025-11-25
-- SAFE TO RUN: This migration only ADDS columns, does not delete or modify existing data

-- ============================================================================
-- 1. CATEGORIES TABLE - Add SEO Fields
-- ============================================================================
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS seo_content TEXT,
ADD COLUMN IF NOT EXISTS intro_text TEXT;

COMMENT ON COLUMN categories.meta_title IS 'SEO meta title for category pages (max 60 chars recommended)';
COMMENT ON COLUMN categories.meta_description IS 'SEO meta description for category pages (max 160 chars recommended)';
COMMENT ON COLUMN categories.seo_content IS 'Rich SEO content displayed on category pages (300-500 words recommended)';
COMMENT ON COLUMN categories.intro_text IS 'Short intro text displayed at top of category page (100-150 words)';

-- ============================================================================
-- 2. STATES TABLE - Add SEO Fields
-- ============================================================================
ALTER TABLE states
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS capital VARCHAR(100),
ADD COLUMN IF NOT EXISTS region VARCHAR(50),
ADD COLUMN IF NOT EXISTS population INTEGER,
ADD COLUMN IF NOT EXISTS seo_content TEXT,
ADD COLUMN IF NOT EXISTS intro_text TEXT;

COMMENT ON COLUMN states.meta_title IS 'SEO meta title for state pages';
COMMENT ON COLUMN states.meta_description IS 'SEO meta description for state pages';
COMMENT ON COLUMN states.capital IS 'State capital city';
COMMENT ON COLUMN states.region IS 'Geopolitical zone (e.g., South West, North Central)';
COMMENT ON COLUMN states.population IS 'Estimated population';
COMMENT ON COLUMN states.seo_content IS 'Rich SEO content for state pages';
COMMENT ON COLUMN states.intro_text IS 'Short intro for state page';

-- ============================================================================
-- 3. CITIES TABLE - Add SEO Fields
-- ============================================================================
ALTER TABLE cities
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN cities.meta_title IS 'SEO meta title for city pages';
COMMENT ON COLUMN cities.meta_description IS 'SEO meta description for city pages';
COMMENT ON COLUMN cities.description IS 'Description of the city/LGA';

-- ============================================================================
-- 4. LISTINGS TABLE - Add Open Graph and Advanced SEO Fields
-- ============================================================================
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS og_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS og_description TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT,
ADD COLUMN IF NOT EXISTS schema_markup JSONB,
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS image_alt_texts TEXT[];

COMMENT ON COLUMN listings.og_title IS 'Open Graph title for social sharing';
COMMENT ON COLUMN listings.og_description IS 'Open Graph description for social sharing';
COMMENT ON COLUMN listings.og_image IS 'Open Graph image URL for social sharing';
COMMENT ON COLUMN listings.schema_markup IS 'Custom schema.org JSON-LD markup';
COMMENT ON COLUMN listings.canonical_url IS 'Canonical URL if different from default';
COMMENT ON COLUMN listings.image_alt_texts IS 'Alt text for each image in images array (same order)';

-- ============================================================================
-- 5. LISTINGS TABLE - Add Analytics Tracking Fields
-- ============================================================================
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS last_crawled TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS google_indexed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS search_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS search_impressions INTEGER DEFAULT 0;

COMMENT ON COLUMN listings.last_crawled IS 'Last time Googlebot crawled this listing';
COMMENT ON COLUMN listings.google_indexed IS 'Whether the listing is indexed in Google';
COMMENT ON COLUMN listings.search_clicks IS 'Total clicks from Google Search (from GSC API)';
COMMENT ON COLUMN listings.search_impressions IS 'Total impressions in Google Search (from GSC API)';

-- ============================================================================
-- 6. CREATE INDEXES FOR NEW FIELDS (Performance Optimization)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_listings_google_indexed ON listings(google_indexed) WHERE google_indexed = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_last_crawled ON listings(last_crawled);

-- ============================================================================
-- 7. POPULATE DEFAULT VALUES FOR EXISTING RECORDS
-- ============================================================================

-- Generate meta titles for existing categories (fallback to name)
UPDATE categories 
SET meta_title = name || ' Businesses in Nigeria | 9jaDirectory'
WHERE meta_title IS NULL;

-- Generate meta descriptions for existing categories
UPDATE categories
SET meta_description = 'Find the best ' || LOWER(name) || ' businesses in Nigeria. Browse verified listings, read reviews, and connect with top-rated service providers on 9jaDirectory.'
WHERE meta_description IS NULL;

-- Generate meta titles for existing states
UPDATE states
SET meta_title = 'Top Businesses in ' || name || ' State | 9jaDirectory'
WHERE meta_title IS NULL;

-- Generate meta descriptions for existing states
UPDATE states
SET meta_description = 'Discover the best businesses in ' || name || ' State, Nigeria. Browse local listings, read reviews, and find trusted service providers near you.'
WHERE meta_description IS NULL;

-- Generate Open Graph titles for existing listings (if meta_title exists)
UPDATE listings
SET og_title = COALESCE(meta_title, business_name || ' - 9jaDirectory')
WHERE og_title IS NULL;

-- Generate Open Graph descriptions for existing listings
UPDATE listings
SET og_description = COALESCE(meta_description, description, tagline, business_name || ' on 9jaDirectory')
WHERE og_description IS NULL;

-- Set og_image to logo_url or cover_image_url as fallback
UPDATE listings
SET og_image = COALESCE(cover_image_url, logo_url)
WHERE og_image IS NULL AND (cover_image_url IS NOT NULL OR logo_url IS NOT NULL);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify the changes
DO $$
BEGIN
    RAISE NOTICE '✅ SEO Schema Enhancement Migration Complete!';
    RAISE NOTICE 'New columns added to: categories, states, cities, listings';
    RAISE NOTICE 'Run: SELECT * FROM categories LIMIT 1; to verify changes';
END $$;
