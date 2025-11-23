-- Phase 7: Enhanced Listing Columns
-- Run this in Supabase SQL Editor

ALTER TABLE listings
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS images JSONB, -- Array of image URLs
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS opening_hours JSONB; -- Structured JSON for hours

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listings'
AND column_name IN ('logo_url', 'images', 'facebook_url', 'opening_hours');
