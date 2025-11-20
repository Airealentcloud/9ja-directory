-- Add Missing Categories for 9jaDirectory
-- Run this in Supabase SQL Editor before importing listings

INSERT INTO categories (name, slug, icon, description) VALUES
('Agriculture & Farming', 'agriculture', '🌾', 'Farms, agricultural services, livestock, and farming supplies')
ON CONFLICT (slug) DO NOTHING;

-- Verify the category was added
SELECT id, name, slug FROM categories WHERE slug IN ('agriculture', 'education', 'professional-services', 'real-estate', 'transportation');
