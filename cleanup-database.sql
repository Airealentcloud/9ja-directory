-- 9jaDirectory - Safe Database Cleanup Script
-- This will remove all directory-related tables while preserving Supabase auth
-- Run this FIRST in Supabase SQL Editor before running database-schema-enhanced.sql

-- Drop tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS listing_activity_logs CASCADE;
DROP TABLE IF EXISTS listing_offers CASCADE;
DROP TABLE IF EXISTS listing_faqs CASCADE;
DROP TABLE IF EXISTS listing_photos CASCADE;
DROP TABLE IF EXISTS review_votes CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS states CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Drop profiles table if it exists (we'll recreate it)
DROP TABLE IF EXISTS profiles CASCADE;

-- Verify cleanup
SELECT
  tablename
FROM
  pg_tables
WHERE
  schemaname = 'public'
  AND tablename IN (
    'categories', 'states', 'cities', 'profiles', 'listings',
    'reviews', 'listing_photos', 'listing_faqs', 'listing_offers',
    'review_votes', 'listing_activity_logs'
  );
-- Should return 0 rows

-- Ready for database-schema-enhanced.sql
SELECT 'Cleanup complete! Now run database-schema-enhanced.sql' as next_step;
