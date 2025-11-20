-- STEP 1: Simple Cleanup
-- Copy and paste this ENTIRE file into Supabase SQL Editor and click RUN

-- Drop all tables (ignore errors if they don't exist)
DROP TABLE IF EXISTS listing_activity_logs CASCADE;
DROP TABLE IF EXISTS listing_offers CASCADE;
DROP TABLE IF EXISTS listing_faqs CASCADE;
DROP TABLE IF EXISTS listing_photos CASCADE;
DROP TABLE IF EXISTS review_votes CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS states CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Success message
SELECT 'Cleanup complete! Now run 2-create-tables.sql' as status;
