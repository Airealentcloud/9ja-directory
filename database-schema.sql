-- 9jaDirectory Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- States table (Nigerian states)
CREATE TABLE states (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(10) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cities/LGAs table
CREATE TABLE cities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  state_id UUID REFERENCES states(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, state_id)
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255),
  full_name VARCHAR(255),
  phone VARCHAR(50),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'business_owner', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings table
CREATE TABLE listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  state_id UUID REFERENCES states(id) ON DELETE SET NULL,
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,

  -- Business Info
  business_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  tagline VARCHAR(255),

  -- Contact
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  whatsapp VARCHAR(50),

  -- Location
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Media
  logo_url TEXT,
  cover_image_url TEXT,
  images TEXT[], -- Array of image URLs

  -- Business Details
  business_hours JSONB, -- Store opening hours
  established_year INTEGER,
  price_range VARCHAR(10), -- '$', '$$', '$$$', '$$$$'

  -- Status & Features
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  verified BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMP WITH TIME ZONE,

  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,

  -- Stats
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, user_id) -- One review per user per listing
);

-- Listing claims table
CREATE TABLE listing_claims (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verification_documents TEXT[], -- URLs to uploaded documents
  notes TEXT,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites/Bookmarks table
CREATE TABLE favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Create indexes for better performance
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_state ON listings(state_id);
CREATE INDEX idx_listings_city ON listings(city_id);
CREATE INDEX idx_listings_slug ON listings(slug);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_verified ON listings(verified);
CREATE INDEX idx_listings_featured ON listings(featured);
CREATE INDEX idx_reviews_listing ON reviews(listing_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_cities_state ON cities(state_id);

-- Create view for listing stats
CREATE VIEW listing_stats AS
SELECT
  l.id,
  l.business_name,
  COUNT(DISTINCT r.id) as review_count,
  AVG(r.rating)::NUMERIC(3,2) as average_rating,
  l.views,
  l.clicks
FROM listings l
LEFT JOIN reviews r ON l.id = r.listing_id AND r.status = 'approved'
GROUP BY l.id, l.business_name, l.views, l.clicks;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_claims ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can insert own listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
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

-- Insert Nigerian states
INSERT INTO states (name, slug, code) VALUES
('Abia', 'abia', 'AB'),
('Adamawa', 'adamawa', 'AD'),
('Akwa Ibom', 'akwa-ibom', 'AK'),
('Anambra', 'anambra', 'AN'),
('Bauchi', 'bauchi', 'BA'),
('Bayelsa', 'bayelsa', 'BY'),
('Benue', 'benue', 'BE'),
('Borno', 'borno', 'BO'),
('Cross River', 'cross-river', 'CR'),
('Delta', 'delta', 'DE'),
('Ebonyi', 'ebonyi', 'EB'),
('Edo', 'edo', 'ED'),
('Ekiti', 'ekiti', 'EK'),
('Enugu', 'enugu', 'EN'),
('FCT', 'fct', 'FC'),
('Gombe', 'gombe', 'GO'),
('Imo', 'imo', 'IM'),
('Jigawa', 'jigawa', 'JI'),
('Kaduna', 'kaduna', 'KD'),
('Kano', 'kano', 'KN'),
('Katsina', 'katsina', 'KT'),
('Kebbi', 'kebbi', 'KE'),
('Kogi', 'kogi', 'KO'),
('Kwara', 'kwara', 'KW'),
('Lagos', 'lagos', 'LA'),
('Nasarawa', 'nasarawa', 'NA'),
('Niger', 'niger', 'NI'),
('Ogun', 'ogun', 'OG'),
('Ondo', 'ondo', 'ON'),
('Osun', 'osun', 'OS'),
('Oyo', 'oyo', 'OY'),
('Plateau', 'plateau', 'PL'),
('Rivers', 'rivers', 'RI'),
('Sokoto', 'sokoto', 'SO'),
('Taraba', 'taraba', 'TA'),
('Yobe', 'yobe', 'YO'),
('Zamfara', 'zamfara', 'ZA');

-- Insert sample categories
INSERT INTO categories (name, slug, icon) VALUES
('Restaurants & Food', 'restaurants', '🍽️'),
('Hotels & Lodging', 'hotels', '🏨'),
('Healthcare', 'healthcare', '🏥'),
('Education', 'education', '🎓'),
('Shopping & Retail', 'shopping', '🛍️'),
('Auto Services', 'auto-services', '🚗'),
('Real Estate', 'real-estate', '🏠'),
('Beauty & Spa', 'beauty-spa', '💅'),
('Technology & IT', 'technology', '💻'),
('Legal Services', 'legal', '⚖️'),
('Financial Services', 'finance', '💰'),
('Entertainment', 'entertainment', '🎭'),
('Home Services', 'home-services', '🔧'),
('Professional Services', 'professional-services', '💼'),
('Sports & Fitness', 'sports-fitness', '⚽');
