-- ============================================================================
-- FIX SUPABASE RLS SECURITY ISSUES
-- ============================================================================
-- This script enables Row Level Security (RLS) on all public tables
-- and creates appropriate read/write policies
-- ============================================================================

-- Step 1: Enable RLS on tables with public read access
-- ============================================================================

ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_hours_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Step 2: Create read policies for publicly accessible tables
-- ============================================================================

-- States - Public Read
DROP POLICY IF EXISTS "Public read access" ON states;
CREATE POLICY "Public read access" ON states
  FOR SELECT
  USING (true);

-- Cities - Public Read
DROP POLICY IF EXISTS "Public read access" ON cities;
CREATE POLICY "Public read access" ON cities
  FOR SELECT
  USING (true);

-- Categories - Public Read
DROP POLICY IF EXISTS "Public read access" ON categories;
CREATE POLICY "Public read access" ON categories
  FOR SELECT
  USING (true);

-- Listing Hours Exceptions - Public Read (for listings display)
DROP POLICY IF EXISTS "Public read access" ON listing_hours_exceptions;
CREATE POLICY "Public read access" ON listing_hours_exceptions
  FOR SELECT
  USING (true);

-- Email Notifications - Authenticated users only (more restrictive)
DROP POLICY IF EXISTS "Users can read own notifications" ON email_notifications;
CREATE POLICY "Users can read own notifications" ON email_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON email_notifications;
CREATE POLICY "Users can insert own notifications" ON email_notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Step 3: Fix function search_path (add security wrapper)
-- ============================================================================

-- Drop existing functions first (if they exist)
DROP FUNCTION IF EXISTS update_listings_timestamp() CASCADE;
DROP FUNCTION IF EXISTS calculate_distance(float, float, float, float) CASCADE;
DROP FUNCTION IF EXISTS update_review_helpful_counts() CASCADE;
DROP FUNCTION IF EXISTS notify_listing_status_changed() CASCADE;
DROP FUNCTION IF EXISTS increment_listing_views() CASCADE;
DROP FUNCTION IF EXISTS is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS notify_listing_submitted() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_nearby_listings(float, float, int) CASCADE;
DROP FUNCTION IF EXISTS calculate_listing_rating(uuid) CASCADE;
DROP FUNCTION IF EXISTS increment_listing_clicks() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Update functions to have immutable search path
CREATE OR REPLACE FUNCTION update_listings_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) *
      cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION update_review_helpful_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE reviews
  SET helpful_count = (SELECT COUNT(*) FROM review_helpful WHERE review_id = NEW.review_id)
  WHERE id = NEW.review_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION notify_listing_status_changed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM net.http_post(
    url:='https://9jadirectory.org/api/notifications',
    headers:='{"Content-Type":"application/json"}'::jsonb,
    body:=jsonb_build_object(
      'listing_id', NEW.id,
      'status', NEW.status,
      'user_id', NEW.user_id
    )
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION increment_listing_views()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE listings SET views = views + 1 WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = user_id AND active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION notify_listing_submitted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM net.http_post(
    url:='https://9jadirectory.org/api/notifications',
    headers:='{"Content-Type":"application/json"}'::jsonb,
    body:=jsonb_build_object(
      'type', 'listing_submitted',
      'listing_id', NEW.id
    )
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION get_nearby_listings(lat float, lon float, radius_km int DEFAULT 10)
RETURNS TABLE (
  id uuid,
  business_name text,
  distance float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.business_name, calculate_distance(lat, lon, l.latitude, l.longitude)
  FROM listings l
  WHERE calculate_distance(lat, lon, l.latitude, l.longitude) <= radius_km
  ORDER BY calculate_distance(lat, lon, l.latitude, l.longitude);
END;
$$;

CREATE OR REPLACE FUNCTION calculate_listing_rating(listing_id uuid)
RETURNS float
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avg_rating float;
BEGIN
  SELECT AVG(rating) INTO avg_rating
  FROM reviews
  WHERE reviews.listing_id = calculate_listing_rating.listing_id;
  RETURN COALESCE(avg_rating, 0);
END;
$$;

CREATE OR REPLACE FUNCTION increment_listing_clicks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE listings SET clicks = clicks + 1 WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, created_at)
  VALUES (NEW.id, NEW.email, now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Step 4: Enable Auth MFA and password protection (optional, via Supabase dashboard)
-- ============================================================================
-- Note: These settings must be configured in Supabase dashboard:
-- 1. Authentication → Passwords → Enable "Verify password from Have I Been Pwned"
-- 2. Authentication → MFA → Enable "Phone" and "TOTP" options

-- Step 5: Verify RLS is enabled
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('states', 'cities', 'categories', 'listing_hours_exceptions', 'email_notifications')
ORDER BY tablename;

-- Step 6: List all RLS policies
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- DEPLOYMENT INSTRUCTIONS
-- ============================================================================
/*

1. Copy this entire SQL script

2. Go to Supabase Dashboard:
   - Navigate to your project
   - Go to SQL Editor
   - Create new query
   - Paste this entire script
   - Click "Run"

3. Verify execution:
   - Check the output at the bottom
   - Should see confirmation that all RLS is enabled
   - Check the policy listing at the end

4. Test your application:
   - Restart your Next.js application
   - Try accessing localhost:3000/categories/accommodation
   - Test the production site: https://9jadirectory.org

5. If issues persist:
   - Check Supabase logs for errors
   - Verify environment variables in production
   - Make sure database connection strings are correct

*/
