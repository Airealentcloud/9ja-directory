-- Import Listings for 9jaDirectory
-- Run this AFTER running the enhanced database schema

-- First, ensure we have the required categories and states
-- Get Lagos state ID and category IDs for mapping

-- Import sample listings from CSV data
INSERT INTO listings (
  business_name,
  slug,
  description,
  category_id,
  state_id,
  city_id,
  address,
  phone,
  established_year,
  status,
  verified,
  created_at,
  updated_at
) VALUES
-- Row 1
(
  'Macmed Integrated Farms',
  'macmed-integrated-farms-1',
  'Sustainable farming and livestock solutions with comprehensive planning services.',
  (SELECT id FROM categories WHERE slug = 'agriculture' LIMIT 1),
  (SELECT id FROM states WHERE slug = 'lagos' LIMIT 1),
  NULL,
  '1, Gani Street, Ijegun Imore. Satellite Town, Lagos, Lagos, Nigeria',
  '+2348033316905',
  2013,
  'approved',
  false,
  NOW(),
  NOW()
),
-- Row 2
(
  'Aerologistics and Travels Ltd',
  'aerologistics-and-travels-ltd-2',
  'Global travel solutions: tickets, tours, logistics, training services.',
  (SELECT id FROM categories WHERE slug = 'transportation' LIMIT 1),
  (SELECT id FROM states WHERE slug = 'lagos' LIMIT 1),
  NULL,
  'Suite C247 Ikota Business Complex, Lagos, Lagos, Nigeria',
  '+2344610300',
  2006,
  'approved',
  false,
  NOW(),
  NOW()
),
-- Row 3
(
  'Jacio International Company Ltd',
  'jacio-international-company-ltd-3',
  'Distributors of premium automotive products in Nigeria.',
  (SELECT id FROM categories WHERE slug = 'auto-services' LIMIT 1),
  (SELECT id FROM states WHERE slug = 'lagos' LIMIT 1),
  NULL,
  'Zone B, Block 9, Shop 15, Aspamda Trade Fair Complex Lagos, Nigeria',
  '08185587222',
  2008,
  'approved',
  false,
  NOW(),
  NOW()
),
-- Row 4
(
  'Maldini Granites and Marble Imports Limited',
  'maldini-granites-and-marble-imports-limited-4',
  'Quality granite and marble slabs, nationwide distribution in Nigeria.',
  (SELECT id FROM categories WHERE slug = 'real-estate' LIMIT 1),
  (SELECT id FROM states WHERE slug = 'lagos' LIMIT 1),
  (SELECT id FROM cities WHERE slug = 'surulere' AND state_id = (SELECT id FROM states WHERE slug = 'lagos') LIMIT 1),
  '41A Alhaji Tokan street, Alaka Estate, Surulere, Lagos, Lagos, Nigeria',
  '+2348033079719',
  1997,
  'approved',
  false,
  NOW(),
  NOW()
),
-- Row 5
(
  'COHBS International',
  'cohbs-international-5',
  'Your trusted source for chemical materials and supplies.',
  (SELECT id FROM categories WHERE slug = 'professional-services' LIMIT 1),
  (SELECT id FROM states WHERE slug = 'lagos' LIMIT 1),
  (SELECT id FROM cities WHERE slug = 'ikeja' AND state_id = (SELECT id FROM states WHERE slug = 'lagos') LIMIT 1),
  '14, Fadeyi Aladura Street, Off Awolowo Way, Ikeja Lagos Nigeria',
  '08170417114',
  2017,
  'approved',
  false,
  NOW(),
  NOW()
),
-- Row 6
(
  'Auto Auction Mall',
  'auto-auction-mall-6',
  'Access U.S. dealer auctions for affordable vehicles made easy.',
  (SELECT id FROM categories WHERE slug = 'auto-services' LIMIT 1),
  (SELECT id FROM states WHERE slug = 'lagos' LIMIT 1),
  (SELECT id FROM cities WHERE slug = 'yaba' AND state_id = (SELECT id FROM states WHERE slug = 'lagos') LIMIT 1),
  '268, Herbert Macaulay Way, Alagomeji, Yaba, Lagos, Lagos, Nigeria',
  '+2349015362533',
  2016,
  'approved',
  false,
  NOW(),
  NOW()
),
-- Row 7
(
  'Royal Xtasy Spa',
  'royal-xtasy-spa-7',
  '24-hour massage and wellness spa in Lagos, Nigeria.',
  (SELECT id FROM categories WHERE slug = 'beauty-spa' LIMIT 1),
  (SELECT id FROM states WHERE slug = 'lagos' LIMIT 1),
  (SELECT id FROM cities WHERE slug = 'victoria-island' AND state_id = (SELECT id FROM states WHERE slug = 'lagos') LIMIT 1),
  'House 17, Transit Village, Adetokunbo Ademola Street, Victoria Island , Lagos, Lagos, Nigeria',
  '+2349043094708',
  2021,
  'approved',
  false,
  NOW(),
  NOW()
),
-- Row 8
(
  'CompareForexBrokers.ng',
  'compareforexbrokers-ng-8',
  'Your trusted guide for comparing Forex and CFDs brokers.',
  (SELECT id FROM categories WHERE slug = 'finance' LIMIT 1),
  (SELECT id FROM states WHERE slug = 'lagos' LIMIT 1),
  NULL,
  '196B Awolowo Rd, Lagos, Nigeria',
  '+2348115028665',
  2023,
  'approved',
  false,
  NOW(),
  NOW()
),
-- Row 9
(
  'Favoured Pearls School',
  'favoured-pearls-school-9',
  'Nurturing young minds with quality education and care.',
  (SELECT id FROM categories WHERE slug = 'education' LIMIT 1),
  (SELECT id FROM states WHERE slug = 'lagos' LIMIT 1),
  NULL,
  '4, Dapo Adeoye Street, Off Deeper Life Church, Soluyi, Gbagada, Lagos, Abia, Nigeria',
  '+2348035534097',
  NULL,
  'approved',
  false,
  NOW(),
  NOW()
),
-- Row 10
(
  'EB World',
  'eb-world-10',
  'Power tools and accessories for every building project.',
  (SELECT id FROM categories WHERE slug = 'construction' LIMIT 1),
  (SELECT id FROM states WHERE slug = 'lagos' LIMIT 1),
  NULL,
  '497, Ikorodu Road, Ile-Ile Bus Stop, Ketu, Lagos, Lagos, Nigeria',
  '+2347030070996',
  2018,
  'approved',
  false,
  NOW(),
  NOW()
);

-- Verify the import
SELECT COUNT(*) as total_listings FROM listings WHERE status = 'approved';
SELECT business_name, address, phone FROM listings ORDER BY created_at DESC LIMIT 10;
