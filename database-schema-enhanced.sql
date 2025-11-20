-- 9jaDirectory Enhanced Database Schema
-- Best Practices for Nigerian Business Directory
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For advanced geolocation features

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Categories table with hierarchical support
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- States table (Nigerian states)
CREATE TABLE states (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(10) UNIQUE,
  capital VARCHAR(100),
  region VARCHAR(50), -- South West, South East, South South, North Central, North West, North East
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cities/LGAs table
CREATE TABLE cities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  state_id UUID REFERENCES states(id) ON DELETE CASCADE,
  population INTEGER,
  is_capital BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, state_id)
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255),
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'business_owner', 'admin', 'moderator')),
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- LISTINGS TABLE - Enhanced with Nigerian Business Features
-- ============================================================

CREATE TABLE listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  state_id UUID REFERENCES states(id) ON DELETE SET NULL,
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,

  -- Basic Business Info
  business_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  tagline VARCHAR(255),
  business_type VARCHAR(50), -- 'sole_proprietorship', 'partnership', 'llc', 'plc', 'ngo', 'government'

  -- Contact Information
  phone VARCHAR(20),
  phone_secondary VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  whatsapp VARCHAR(20), -- Important for Nigerian businesses

  -- Social Media (Critical for Nigerian market)
  facebook_url VARCHAR(255),
  instagram_url VARCHAR(255),
  twitter_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  youtube_url VARCHAR(255),
  tiktok_url VARCHAR(255),

  -- Location Details
  address TEXT,
  landmark TEXT, -- Important for Nigerian addresses
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_url TEXT,

  -- Media
  logo_url TEXT,
  cover_image_url TEXT,
  images TEXT[], -- Array of image URLs
  video_url TEXT,

  -- Business Hours (JSONB for flexibility)
  business_hours JSONB,
  /* Example format:
  {
    "monday": {"open": "09:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
    "thursday": {"open": "09:00", "close": "18:00", "closed": false},
    "friday": {"open": "09:00", "close": "18:00", "closed": false},
    "saturday": {"open": "10:00", "close": "16:00", "closed": false},
    "sunday": {"open": null, "close": null, "closed": true}
  }
  */

  -- Business Details
  established_year INTEGER,
  price_range VARCHAR(10), -- '$', '$$', '$$$', '$$$$' or 'budget', 'moderate', 'expensive', 'luxury'
  employee_count_range VARCHAR(50), -- '1-10', '11-50', '51-200', '201-500', '500+'

  -- Payment Methods (Important for Nigerian businesses)
  payment_methods TEXT[], -- ['cash', 'bank_transfer', 'pos', 'ussd', 'mobile_money', 'paystack', 'flutterwave', 'cryptocurrency']

  -- Services & Amenities
  services_offered TEXT[], -- Array of services
  amenities TEXT[], -- ['parking', 'wifi', 'wheelchair_accessible', 'air_conditioning', 'generator', 'security', 'cctv']

  -- Languages Spoken (Important for Nigeria's multilingual environment)
  languages TEXT[], -- ['english', 'yoruba', 'igbo', 'hausa', 'pidgin', 'french']

  -- Certifications & Licenses
  registration_number VARCHAR(100), -- CAC registration number
  tax_id VARCHAR(100), -- TIN
  certifications TEXT[], -- Array of certification names
  licenses TEXT[], -- Array of license types

  -- Status & Features
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended', 'archived')),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMP WITH TIME ZONE,
  premium_tier VARCHAR(50) CHECK (premium_tier IN ('free', 'basic', 'premium', 'enterprise')),

  -- SEO & Marketing
  meta_title VARCHAR(255),
  meta_description TEXT,
  keywords TEXT[], -- Array of keywords for search

  -- Analytics
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  phone_clicks INTEGER DEFAULT 0,
  website_clicks INTEGER DEFAULT 0,
  direction_clicks INTEGER DEFAULT 0,

  -- Additional Info
  tags TEXT[], -- Array of tags for better categorization
  awards TEXT[], -- Array of awards/recognitions
  additional_info JSONB, -- For any custom fields

  -- Timestamps
  last_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- SUPPORTING TABLES
-- ============================================================

-- Reviews table with helpful/unhelpful voting
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT NOT NULL,
  pros TEXT, -- What user liked
  cons TEXT, -- What user didn't like
  images TEXT[], -- Review images
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  response TEXT, -- Business owner response
  response_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, user_id) -- One review per user per listing
);

-- Review votes (helpful/unhelpful)
CREATE TABLE review_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type VARCHAR(50) CHECK (vote_type IN ('helpful', 'unhelpful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Business claims
CREATE TABLE listing_claims (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'verified')),
  verification_documents TEXT[], -- URLs to uploaded documents (CAC, tax cert, etc.)
  business_email VARCHAR(255),
  business_phone VARCHAR(20),
  notes TEXT,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites/Bookmarks
CREATE TABLE favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Business photos/gallery
CREATE TABLE listing_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQs for listings
CREATE TABLE listing_faqs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Special offers/promotions
CREATE TABLE listing_offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  promo_code VARCHAR(50),
  terms_conditions TEXT,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Working hours exceptions (holidays, special days)
CREATE TABLE listing_hours_exceptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason VARCHAR(255), -- 'Public Holiday', 'Special Event', etc.
  is_closed BOOLEAN DEFAULT TRUE,
  special_hours JSONB, -- {"open": "10:00", "close": "14:00"}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business updates/announcements
CREATE TABLE listing_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs (for admin/moderation)
CREATE TABLE listing_activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'verified', 'featured', etc.
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Listings indexes
CREATE INDEX idx_listings_category ON listings(category_id) WHERE status = 'approved';
CREATE INDEX idx_listings_state ON listings(state_id) WHERE status = 'approved';
CREATE INDEX idx_listings_city ON listings(city_id) WHERE status = 'approved';
CREATE INDEX idx_listings_slug ON listings(slug);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_verified ON listings(verified) WHERE verified = TRUE;
CREATE INDEX idx_listings_featured ON listings(featured, featured_until) WHERE featured = TRUE;
CREATE INDEX idx_listings_user ON listings(user_id);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_location ON listings USING GIST(geography(ST_MakePoint(longitude, latitude)));

-- Full-text search indexes
CREATE INDEX idx_listings_search ON listings USING gin(to_tsvector('english',
  coalesce(business_name, '') || ' ' ||
  coalesce(description, '') || ' ' ||
  coalesce(tagline, '')
));

-- Reviews indexes
CREATE INDEX idx_reviews_listing ON reviews(listing_id) WHERE status = 'approved';
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Other indexes
CREATE INDEX idx_cities_state ON cities(state_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_listing ON favorites(listing_id);
CREATE INDEX idx_listing_photos_listing ON listing_photos(listing_id);

-- ============================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================

-- Comprehensive listing stats view
CREATE VIEW listing_stats AS
SELECT
  l.id,
  l.business_name,
  l.slug,
  l.status,
  l.verified,
  l.featured,
  COUNT(DISTINCT r.id) as review_count,
  COALESCE(AVG(r.rating), 0)::NUMERIC(3,2) as average_rating,
  COUNT(DISTINCT f.id) as favorite_count,
  l.views,
  l.clicks,
  l.phone_clicks,
  l.website_clicks,
  l.direction_clicks,
  l.created_at,
  l.updated_at
FROM listings l
LEFT JOIN reviews r ON l.id = r.listing_id AND r.status = 'approved'
LEFT JOIN favorites f ON l.id = f.listing_id
GROUP BY l.id, l.business_name, l.slug, l.status, l.verified, l.featured, l.views, l.clicks,
         l.phone_clicks, l.website_clicks, l.direction_clicks, l.created_at, l.updated_at;

-- Popular listings view
CREATE VIEW popular_listings AS
SELECT
  l.*,
  ls.average_rating,
  ls.review_count,
  ls.favorite_count
FROM listings l
JOIN listing_stats ls ON l.id = ls.id
WHERE l.status = 'approved'
ORDER BY (ls.review_count * 0.3 + ls.favorite_count * 0.2 + l.views * 0.5) DESC;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_listing_views(listing_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET views = views + 1
  WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment click counters
CREATE OR REPLACE FUNCTION increment_listing_clicks(
  listing_uuid UUID,
  click_type VARCHAR(50) -- 'general', 'phone', 'website', 'direction'
)
RETURNS void AS $$
BEGIN
  CASE click_type
    WHEN 'phone' THEN
      UPDATE listings SET phone_clicks = phone_clicks + 1 WHERE id = listing_uuid;
    WHEN 'website' THEN
      UPDATE listings SET website_clicks = website_clicks + 1 WHERE id = listing_uuid;
    WHEN 'direction' THEN
      UPDATE listings SET direction_clicks = direction_clicks + 1 WHERE id = listing_uuid;
    ELSE
      UPDATE listings SET clicks = clicks + 1 WHERE id = listing_uuid;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL, lon1 DECIMAL,
  lat2 DECIMAL, lon2 DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN ST_Distance(
    ST_MakePoint(lon1, lat1)::geography,
    ST_MakePoint(lon2, lat2)::geography
  ) / 1000; -- Return in kilometers
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get nearby listings
CREATE OR REPLACE FUNCTION get_nearby_listings(
  user_lat DECIMAL,
  user_lon DECIMAL,
  radius_km INTEGER DEFAULT 10,
  max_results INTEGER DEFAULT 20
)
RETURNS TABLE (
  listing_id UUID,
  business_name VARCHAR,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.business_name,
    calculate_distance(user_lat, user_lon, l.latitude, l.longitude) as distance_km
  FROM listings l
  WHERE l.latitude IS NOT NULL
    AND l.longitude IS NOT NULL
    AND l.status = 'approved'
    AND calculate_distance(user_lat, user_lon, l.latitude, l.longitude) <= radius_km
  ORDER BY distance_km
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listing_claims_updated_at BEFORE UPDATE ON listing_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listing_faqs_updated_at BEFORE UPDATE ON listing_faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listing_offers_updated_at BEFORE UPDATE ON listing_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_updates ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Listings policies
CREATE POLICY "Approved listings are viewable by everyone"
  ON listings FOR SELECT
  USING (status = 'approved' OR user_id = auth.uid());

CREATE POLICY "Authenticated users can insert listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (status = 'approved' OR user_id = auth.uid());

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Review votes policies
CREATE POLICY "Anyone can view review votes"
  ON review_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote on reviews"
  ON review_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON review_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON review_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Listing claims policies
CREATE POLICY "Users can view own claims"
  ON listing_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can claim listings"
  ON listing_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Listing photos policies
CREATE POLICY "Approved photos are viewable by everyone"
  ON listing_photos FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can add photos to own listings"
  ON listing_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Listing FAQs policies
CREATE POLICY "Active FAQs are viewable by everyone"
  ON listing_faqs FOR SELECT
  USING (is_active = true);

-- Listing offers policies
CREATE POLICY "Active offers are viewable by everyone"
  ON listing_offers FOR SELECT
  USING (is_active = true AND valid_from <= NOW() AND valid_until >= NOW());

-- Listing updates policies
CREATE POLICY "Published updates are viewable by everyone"
  ON listing_updates FOR SELECT
  USING (is_published = true);

-- ============================================================
-- SEED DATA - Nigerian States with Regions
-- ============================================================

INSERT INTO states (name, slug, code, capital, region) VALUES
('Abia', 'abia', 'AB', 'Umuahia', 'South East'),
('Adamawa', 'adamawa', 'AD', 'Yola', 'North East'),
('Akwa Ibom', 'akwa-ibom', 'AK', 'Uyo', 'South South'),
('Anambra', 'anambra', 'AN', 'Awka', 'South East'),
('Bauchi', 'bauchi', 'BA', 'Bauchi', 'North East'),
('Bayelsa', 'bayelsa', 'BY', 'Yenagoa', 'South South'),
('Benue', 'benue', 'BE', 'Makurdi', 'North Central'),
('Borno', 'borno', 'BO', 'Maiduguri', 'North East'),
('Cross River', 'cross-river', 'CR', 'Calabar', 'South South'),
('Delta', 'delta', 'DE', 'Asaba', 'South South'),
('Ebonyi', 'ebonyi', 'EB', 'Abakaliki', 'South East'),
('Edo', 'edo', 'ED', 'Benin City', 'South South'),
('Ekiti', 'ekiti', 'EK', 'Ado-Ekiti', 'South West'),
('Enugu', 'enugu', 'EN', 'Enugu', 'South East'),
('FCT', 'fct', 'FC', 'Abuja', 'North Central'),
('Gombe', 'gombe', 'GO', 'Gombe', 'North East'),
('Imo', 'imo', 'IM', 'Owerri', 'South East'),
('Jigawa', 'jigawa', 'JI', 'Dutse', 'North West'),
('Kaduna', 'kaduna', 'KD', 'Kaduna', 'North West'),
('Kano', 'kano', 'KN', 'Kano', 'North West'),
('Katsina', 'katsina', 'KT', 'Katsina', 'North West'),
('Kebbi', 'kebbi', 'KE', 'Birnin Kebbi', 'North West'),
('Kogi', 'kogi', 'KO', 'Lokoja', 'North Central'),
('Kwara', 'kwara', 'KW', 'Ilorin', 'North Central'),
('Lagos', 'lagos', 'LA', 'Ikeja', 'South West'),
('Nasarawa', 'nasarawa', 'NA', 'Lafia', 'North Central'),
('Niger', 'niger', 'NI', 'Minna', 'North Central'),
('Ogun', 'ogun', 'OG', 'Abeokuta', 'South West'),
('Ondo', 'ondo', 'ON', 'Akure', 'South West'),
('Osun', 'osun', 'OS', 'Osogbo', 'South West'),
('Oyo', 'oyo', 'OY', 'Ibadan', 'South West'),
('Plateau', 'plateau', 'PL', 'Jos', 'North Central'),
('Rivers', 'rivers', 'RI', 'Port Harcourt', 'South South'),
('Sokoto', 'sokoto', 'SO', 'Sokoto', 'North West'),
('Taraba', 'taraba', 'TA', 'Jalingo', 'North East'),
('Yobe', 'yobe', 'YO', 'Damaturu', 'North East'),
('Zamfara', 'zamfara', 'ZA', 'Gusau', 'North West')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA - Popular Business Categories
-- ============================================================

INSERT INTO categories (name, slug, icon, description, display_order) VALUES
('Restaurants & Food', 'restaurants', '🍽️', 'Find the best restaurants, eateries, and food services', 1),
('Hotels & Lodging', 'hotels', '🏨', 'Discover hotels, guest houses, and accommodation', 2),
('Healthcare', 'healthcare', '🏥', 'Hospitals, clinics, pharmacies, and health services', 3),
('Education', 'education', '🎓', 'Schools, universities, training centers, and educational services', 4),
('Shopping & Retail', 'shopping', '🛍️', 'Shops, supermarkets, markets, and retail stores', 5),
('Auto Services', 'auto-services', '🚗', 'Car repair, mechanics, auto parts, and vehicle services', 6),
('Real Estate', 'real-estate', '🏠', 'Property agents, rentals, sales, and real estate services', 7),
('Beauty & Spa', 'beauty-spa', '💅', 'Salons, spas, barbers, and beauty services', 8),
('Technology & IT', 'technology', '💻', 'IT services, computer repair, software, and tech solutions', 9),
('Legal Services', 'legal', '⚖️', 'Lawyers, law firms, and legal consultancy', 10),
('Financial Services', 'finance', '💰', 'Banks, insurance, accounting, and financial services', 11),
('Entertainment', 'entertainment', '🎭', 'Cinemas, event centers, clubs, and entertainment venues', 12),
('Home Services', 'home-services', '🔧', 'Plumbing, electrical, cleaning, and home maintenance', 13),
('Professional Services', 'professional-services', '💼', 'Consulting, business services, and professional help', 14),
('Sports & Fitness', 'sports-fitness', '⚽', 'Gyms, sports facilities, and fitness centers', 15),
('Transportation', 'transportation', '🚌', 'Taxi, logistics, delivery, and transport services', 16),
('Construction', 'construction', '🏗️', 'Builders, contractors, and construction services', 17),
('Fashion & Clothing', 'fashion', '👔', 'Boutiques, tailors, and fashion stores', 18),
('Events & Catering', 'events-catering', '🎉', 'Event planners, caterers, and party services', 19),
('Pets & Animals', 'pets', '🐕', 'Veterinary services, pet shops, and animal care', 20)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SAMPLE MAJOR CITIES FOR POPULAR STATES
-- ============================================================

-- Lagos State Cities
INSERT INTO cities (name, slug, state_id, is_capital) VALUES
('Ikeja', 'ikeja', (SELECT id FROM states WHERE slug = 'lagos'), TRUE),
('Victoria Island', 'victoria-island', (SELECT id FROM states WHERE slug = 'lagos'), FALSE),
('Lekki', 'lekki', (SELECT id FROM states WHERE slug = 'lagos'), FALSE),
('Ikoyi', 'ikoyi', (SELECT id FROM states WHERE slug = 'lagos'), FALSE),
('Surulere', 'surulere', (SELECT id FROM states WHERE slug = 'lagos'), FALSE),
('Yaba', 'yaba', (SELECT id FROM states WHERE slug = 'lagos'), FALSE),
('Maryland', 'maryland', (SELECT id FROM states WHERE slug = 'lagos'), FALSE),
('Ajah', 'ajah', (SELECT id FROM states WHERE slug = 'lagos'), FALSE)
ON CONFLICT (name, state_id) DO NOTHING;

-- Abuja (FCT) Areas
INSERT INTO cities (name, slug, state_id, is_capital) VALUES
('Central Business District', 'central-business-district', (SELECT id FROM states WHERE slug = 'fct'), FALSE),
('Garki', 'garki', (SELECT id FROM states WHERE slug = 'fct'), FALSE),
('Wuse', 'wuse', (SELECT id FROM states WHERE slug = 'fct'), FALSE),
('Maitama', 'maitama', (SELECT id FROM states WHERE slug = 'fct'), FALSE),
('Asokoro', 'asokoro', (SELECT id FROM states WHERE slug = 'fct'), FALSE),
('Gwarinpa', 'gwarinpa', (SELECT id FROM states WHERE slug = 'fct'), FALSE),
('Kubwa', 'kubwa', (SELECT id FROM states WHERE slug = 'fct'), FALSE)
ON CONFLICT (name, state_id) DO NOTHING;

-- Rivers State Cities
INSERT INTO cities (name, slug, state_id, is_capital) VALUES
('Port Harcourt', 'port-harcourt', (SELECT id FROM states WHERE slug = 'rivers'), TRUE),
('Obio-Akpor', 'obio-akpor', (SELECT id FROM states WHERE slug = 'rivers'), FALSE),
('Eleme', 'eleme', (SELECT id FROM states WHERE slug = 'rivers'), FALSE)
ON CONFLICT (name, state_id) DO NOTHING;

-- Kano State Cities
INSERT INTO cities (name, slug, state_id, is_capital) VALUES
('Kano', 'kano', (SELECT id FROM states WHERE slug = 'kano'), TRUE),
('Fagge', 'fagge', (SELECT id FROM states WHERE slug = 'kano'), FALSE)
ON CONFLICT (name, state_id) DO NOTHING;

-- ============================================================
-- COMPLETION MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE '9jaDirectory Database Schema Created Successfully!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Tables created: % tables', (
    SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
  );
  RAISE NOTICE 'States inserted: %', (SELECT COUNT(*) FROM states);
  RAISE NOTICE 'Categories inserted: %', (SELECT COUNT(*) FROM categories);
  RAISE NOTICE 'Cities inserted: %', (SELECT COUNT(*) FROM cities);
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Enable PostGIS extension for advanced geolocation';
  RAISE NOTICE '2. Add more cities/LGAs as needed';
  RAISE NOTICE '3. Configure storage bucket for images in Supabase';
  RAISE NOTICE '4. Test the RLS policies';
  RAISE NOTICE '============================================================';
END $$;
