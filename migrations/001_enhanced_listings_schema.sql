-- PHASE 1: Enhanced Listings Schema Migration
-- This adds all new fields needed for SEO-optimized listing pages
-- Run this in Supabase SQL Editor

-- Add new columns to listings table
ALTER TABLE listings

-- Contact & Social Media
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,

-- Location Details
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100),
ADD COLUMN IF NOT EXISTS landmark TEXT,

-- Operating Hours (stored as JSON)
-- Format: {"monday": {"open": "08:00", "close": "18:00", "closed": false}, ...}
ADD COLUMN IF NOT EXISTS opening_hours JSONB,

-- Media
ADD COLUMN IF NOT EXISTS images JSONB,  -- Array of image URLs
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,

-- Business Details
ADD COLUMN IF NOT EXISTS year_established INTEGER,
ADD COLUMN IF NOT EXISTS employee_count VARCHAR(50),  -- "1-10", "11-50", "51-200", "201-500", "500+"
ADD COLUMN IF NOT EXISTS payment_methods JSONB,  -- ["Cash", "Card", "Transfer", "POS", "Crypto"]
ADD COLUMN IF NOT EXISTS languages_spoken JSONB,  -- ["English", "Yoruba", "Igbo", "Hausa", "Pidgin"]
ADD COLUMN IF NOT EXISTS services_offered TEXT[],  -- Array of services

-- SEO Fields
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS keywords TEXT[],

-- Verification & Claims
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS claimed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE,

-- Analytics
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_latitude_longitude ON listings(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_listings_verified ON listings(verified);
CREATE INDEX IF NOT EXISTS idx_listings_claimed ON listings(claimed);
CREATE INDEX IF NOT EXISTS idx_listings_view_count ON listings(view_count DESC);

-- Add comments for documentation
COMMENT ON COLUMN listings.opening_hours IS 'JSON object with weekly schedule: {"monday": {"open": "08:00", "close": "18:00", "closed": false}}';
COMMENT ON COLUMN listings.images IS 'Array of image URLs in JSON format';
COMMENT ON COLUMN listings.payment_methods IS 'Array of accepted payment methods';
COMMENT ON COLUMN listings.languages_spoken IS 'Array of languages spoken at business';

-- Create a function to auto-update last_updated timestamp
CREATE OR REPLACE FUNCTION update_listings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp on any update
DROP TRIGGER IF EXISTS listings_update_timestamp ON listings;
CREATE TRIGGER listings_update_timestamp
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_listings_timestamp();

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'listings'
AND column_name IN (
    'email', 'website_url', 'latitude', 'longitude', 
    'opening_hours', 'images', 'verified', 'claimed'
)
ORDER BY column_name;
