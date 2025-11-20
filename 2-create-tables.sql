-- STEP 2: Create All Tables
-- Copy and paste this ENTIRE file into Supabase SQL Editor and click RUN

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. States table
CREATE TABLE states (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(10),
  capital VARCHAR(100),
  region VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Cities table
CREATE TABLE cities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  state_id UUID REFERENCES states(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, state_id)
);

-- 4. Listings table
CREATE TABLE listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  state_id UUID REFERENCES states(id) ON DELETE SET NULL,
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  whatsapp VARCHAR(20),
  established_year INTEGER,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Categories
INSERT INTO categories (name, slug, description) VALUES
('Agriculture', 'agriculture', 'Farming, livestock, and agricultural services'),
('Transportation', 'transportation', 'Travel, logistics, and transport services'),
('Professional Services', 'professional-services', 'Consulting, legal, and business services'),
('Real Estate', 'real-estate', 'Property, construction, and real estate services'),
('Education', 'education', 'Schools, training centers, and educational services'),
('Auto Services', 'auto-services', 'Vehicle sales, repairs, and automotive services'),
('Beauty & Spa', 'beauty-spa', 'Salons, spas, and beauty services'),
('Finance', 'finance', 'Banking, insurance, and financial services'),
('Construction', 'construction', 'Building, renovation, and construction services'),
('Restaurants & Food', 'restaurants', 'Restaurants, cafes, and food services'),
('Hotels & Lodging', 'hotels', 'Hotels, guest houses, and accommodation'),
('Health & Medical', 'health', 'Hospitals, clinics, and medical services'),
('Entertainment', 'entertainment', 'Events, recreation, and entertainment'),
('Technology', 'technology', 'IT services, software, and tech solutions'),
('Shopping & Retail', 'shopping', 'Stores, markets, and retail businesses'),
('Home Services', 'home-services', 'Cleaning, repairs, and home maintenance'),
('Legal Services', 'legal', 'Lawyers, law firms, and legal consulting'),
('Manufacturing', 'manufacturing', 'Production, factories, and manufacturing'),
('Sports & Fitness', 'sports', 'Gyms, sports centers, and fitness services'),
('Religion', 'religion', 'Churches, mosques, and religious organizations');

-- Insert all 37 Nigerian States
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
('Ekiti', 'ekiti', 'EK', 'Ado Ekiti', 'South West'),
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
('Zamfara', 'zamfara', 'ZA', 'Gusau', 'North West');

-- Insert Lagos cities
INSERT INTO cities (name, slug, state_id) VALUES
('Ikeja', 'ikeja', (SELECT id FROM states WHERE slug = 'lagos')),
('Lekki', 'lekki', (SELECT id FROM states WHERE slug = 'lagos')),
('Victoria Island', 'victoria-island', (SELECT id FROM states WHERE slug = 'lagos')),
('Yaba', 'yaba', (SELECT id FROM states WHERE slug = 'lagos')),
('Surulere', 'surulere', (SELECT id FROM states WHERE slug = 'lagos')),
('Ikoyi', 'ikoyi', (SELECT id FROM states WHERE slug = 'lagos')),
('Maryland', 'maryland', (SELECT id FROM states WHERE slug = 'lagos')),
('Ajah', 'ajah', (SELECT id FROM states WHERE slug = 'lagos'));

-- Create indexes for better performance
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_state ON listings(state_id);
CREATE INDEX idx_listings_city ON listings(city_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_slug ON listings(slug);

-- Success message
SELECT 'Tables created successfully! Now run 3-import-listings.sql' as status;
SELECT COUNT(*) as categories_count FROM categories;
SELECT COUNT(*) as states_count FROM states;
SELECT COUNT(*) as cities_count FROM cities;
