-- Verification Script - Run this to check what tables exist
-- This will show you exactly what's in your database

-- Check what tables exist in your database
SELECT
  tablename,
  schemaname
FROM
  pg_tables
WHERE
  schemaname = 'public'
ORDER BY
  tablename;

-- If you see listings, categories, states tables above, run these checks:

-- Check if categories table has data
SELECT 'Categories Count:' as check_name, COUNT(*)::text as result FROM categories
UNION ALL
SELECT 'States Count:', COUNT(*)::text FROM states
UNION ALL
SELECT 'Cities Count:', COUNT(*)::text FROM cities
UNION ALL
SELECT 'Listings Count:', COUNT(*)::text FROM listings;

-- If you get errors above, it means those tables don't exist yet
-- You need to run database-schema-enhanced.sql first
