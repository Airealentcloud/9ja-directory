-- Seed 6 Nigerian company listings
-- Run this in Supabase SQL Editor

-- 1. Reiz Continental Hotel Abuja
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'Reiz Continental Hotel Abuja',
    'reiz-continental-hotel-abuja',
    'Reiz Continental Hotel is a premier 3-star hotel located in the heart of Abuja''s Central Business District (CBD). Situated on Plot 779, Garki, the hotel offers 209 elegantly furnished rooms and suites designed for both business and leisure travelers. Facilities include a rooftop swimming pool, fully equipped gym and fitness center, spa and wellness center, multiple restaurants and bars, conference and banquet halls, complimentary Wi-Fi, 24-hour room service, and secure parking. The hotel is known for its warm Nigerian hospitality, modern amenities, and strategic location near major government offices, embassies, and Abuja''s top attractions. Reiz Continental Hotel is ideal for corporate events, weddings, conferences, and relaxing getaways in Nigeria''s capital city.',
    '+2348137873855',
    'reservations@reizcontinentalhotels.com',
    'https://reizcontinentalhotels.com',
    '+2348137873855',
    'Plot 779, Central Business District, Garki, Abuja',
    'Garki',
    c.id,
    s.id,
    'approved',
    true,
    false,
    2006,
    '201-500',
    'https://www.facebook.com/RCHAbuja',
    'https://www.instagram.com/reizcontinentalhotelsabuja/',
    'https://twitter.com/RCHAbuja',
    '["Cash", "Card", "Bank Transfer", "POS"]'::jsonb,
    '["English", "Hausa", "Yoruba", "Igbo", "French"]'::jsonb,
    ARRAY[
        'Hotel Accommodation',
        'Conference & Banquet Halls',
        'Restaurant & Bar',
        'Rooftop Swimming Pool',
        'Gym & Fitness Center',
        'Spa & Wellness',
        '24-Hour Room Service',
        'Airport Shuttle',
        'Laundry & Dry Cleaning',
        'Event Hosting'
    ],
    '{
        "monday": {"open": "00:00", "close": "23:59", "closed": false},
        "tuesday": {"open": "00:00", "close": "23:59", "closed": false},
        "wednesday": {"open": "00:00", "close": "23:59", "closed": false},
        "thursday": {"open": "00:00", "close": "23:59", "closed": false},
        "friday": {"open": "00:00", "close": "23:59", "closed": false},
        "saturday": {"open": "00:00", "close": "23:59", "closed": false},
        "sunday": {"open": "00:00", "close": "23:59", "closed": false}
    }'::jsonb,
    'Reiz Continental Hotel Abuja - Rooms, Prices & Contact | 9jaDirectory',
    'Reiz Continental Hotel Abuja: 209-room 3-star hotel in CBD Garki. Book rooms, conference halls & events. Call +234 813 787 3855. Pool, gym, spa & restaurant.',
    ARRAY[
        'reiz continental hotel abuja',
        'hotels in abuja cbd',
        'abuja hotel booking',
        'reiz hotel abuja contact',
        'hotels in garki abuja',
        'abuja conference hotel',
        'best hotels in abuja',
        'reiz continental hotel rooms',
        'abuja hotel with pool',
        'hotel abuja central district'
    ],
    '["https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'accommodation'
AND s.slug = 'fct'
ON CONFLICT (slug) DO NOTHING;

-- 2. BUA Group
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'BUA Group',
    'bua-group',
    'BUA Group is one of Africa''s largest conglomerates, founded in 1988 by billionaire industrialist Abdul Samad Rabiu. Headquartered at BUA Towers on Victoria Island, Lagos, the group operates across multiple sectors including cement manufacturing, sugar refining, flour milling, oil and gas, real estate, construction, ports and terminals, and logistics. BUA Cement Plc is one of Nigeria''s top cement producers with plants in Sokoto and Edo states, producing over 11 million metric tonnes annually. BUA Sugar Refinery in Lagos is one of Africa''s largest, while BUA Foods (listed on the Nigerian Stock Exchange) encompasses sugar, flour, pasta, and edible oils. The group employs over 10,000 people across Nigeria and is recognized as a major contributor to Nigeria''s industrial growth, food security, and infrastructure development.',
    '+234-1-4610669',
    'info@buagroup.com',
    'https://www.buagroup.com',
    NULL,
    'BUA Towers, PC 32, Churchgate Street, Victoria Island, Lagos',
    'Victoria Island',
    c.id,
    s.id,
    'approved',
    true,
    false,
    1988,
    '500+',
    'https://www.facebook.com/BUAGroupNG',
    'https://www.instagram.com/buagroup_ng/',
    'https://twitter.com/aborabiu',
    '["Bank Transfer", "Card"]'::jsonb,
    '["English", "Hausa", "Yoruba"]'::jsonb,
    ARRAY[
        'Cement Manufacturing',
        'Sugar Refining',
        'Flour Milling',
        'Oil & Gas',
        'Real Estate Development',
        'Construction',
        'Port & Terminal Operations',
        'Logistics & Shipping',
        'Edible Oils & Pasta Production',
        'Infrastructure Development'
    ],
    '{
        "monday": {"open": "08:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "08:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "08:00", "close": "17:00", "closed": false},
        "thursday": {"open": "08:00", "close": "17:00", "closed": false},
        "friday": {"open": "08:00", "close": "17:00", "closed": false},
        "saturday": {"open": "00:00", "close": "00:00", "closed": true},
        "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }'::jsonb,
    'BUA Group Nigeria - Cement, Sugar, Foods & Contact | 9jaDirectory',
    'BUA Group: Africa''s leading conglomerate. Cement, sugar, flour, oil & gas, real estate. HQ: Victoria Island, Lagos. Contact: +234-1-4610669.',
    ARRAY[
        'bua group nigeria',
        'bua cement',
        'bua foods',
        'bua sugar refinery',
        'abdul samad rabiu',
        'bua group contact',
        'bua cement price',
        'bua group headquarters',
        'nigerian conglomerate',
        'bua group careers'
    ],
    '["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'manufacturing'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- 3. Circa Lagos
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'Circa Lagos',
    'circa-lagos',
    'Circa Lagos is a contemporary fine-dining restaurant located in the upscale Lekki Phase 1 area of Lagos. Part of The Borough Lagos group, Circa offers a sophisticated dining experience featuring a carefully curated menu of international classics with a modern twist, signature cocktails, and an extensive wine list. The restaurant is known for its elegant ambiance, stylish interiors, and rooftop terrace perfect for date nights, business dinners, and social gatherings. Circa Lagos serves breakfast, lunch, and dinner with dishes ranging from Mediterranean-inspired plates to contemporary Nigerian cuisine. The restaurant also features live DJ sets on weekends and is a popular destination for Lagos''s vibrant social scene. Reservations are recommended, especially for weekend dining.',
    '08093133330',
    'booking@theboroughlagos.com',
    'https://theboroughlagos.com/restaurant/',
    '08097208445',
    '2 Kola Adeyina Close, off Jerry Iriabe Street, Lekki Phase 1, Lagos',
    'Lekki',
    c.id,
    s.id,
    'approved',
    true,
    false,
    2020,
    '51-200',
    'https://www.facebook.com/circalagos',
    'https://www.instagram.com/circa_lagos/',
    'https://twitter.com/circa_lagos',
    '["Cash", "Card", "Bank Transfer", "POS"]'::jsonb,
    '["English", "Yoruba", "Pidgin"]'::jsonb,
    ARRAY[
        'Fine Dining',
        'Breakfast & Brunch',
        'Lunch & Dinner',
        'Cocktail Bar',
        'Wine & Drinks',
        'Private Dining',
        'Event Hosting',
        'Rooftop Terrace',
        'Live DJ Entertainment',
        'Reservations'
    ],
    '{
        "monday": {"open": "07:00", "close": "01:00", "closed": false},
        "tuesday": {"open": "07:00", "close": "01:00", "closed": false},
        "wednesday": {"open": "07:00", "close": "01:00", "closed": false},
        "thursday": {"open": "07:00", "close": "01:00", "closed": false},
        "friday": {"open": "07:00", "close": "02:00", "closed": false},
        "saturday": {"open": "07:00", "close": "02:00", "closed": false},
        "sunday": {"open": "07:00", "close": "01:00", "closed": false}
    }'::jsonb,
    'Circa Lagos Restaurant - Menu, Reservations & Contact | 9jaDirectory',
    'Circa Lagos: fine dining in Lekki Phase 1. Contemporary cuisine, cocktails & rooftop terrace. Book now: 08093133330. Open 7am-1am daily.',
    ARRAY[
        'circa lagos',
        'circa lagos menu',
        'circa lagos reservation',
        'restaurants in lekki phase 1',
        'fine dining lagos',
        'best restaurants in lagos',
        'circa lagos contact',
        'the borough lagos restaurant',
        'rooftop restaurant lagos',
        'lekki restaurant booking'
    ],
    '["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'restaurants'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- 4. Chisco Transport
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'Chisco Transport',
    'chisco-transport',
    'Chisco Transport Nigeria Limited is one of Nigeria''s premier interstate and international luxury bus transport companies. Founded in 1978 by Chief Dr. Chidi Anyaegbu (OON), the company has grown from a single bus operation to a fleet of over 500 modern, air-conditioned luxury coaches. Chisco Transport operates routes across Nigeria connecting major cities including Lagos, Abuja, Port Harcourt, Owerri, Enugu, Benin, Warri, Calabar, Uyo, Onitsha, and Aba. The company also offers international routes to Ghana (Accra, Kumasi) and other West African destinations. Known for safety, comfort, and reliability, Chisco Transport features online booking, GPS-tracked vehicles, on-board entertainment, professional drivers, and terminal facilities across Nigeria. Their headquarters is located at 104 Funsho Williams Avenue, Iponri, Costain, Lagos.',
    '+2348106517669',
    'booking@chiscotransport.com.ng',
    'https://www.chiscotransport.com.ng',
    '+2348106517669',
    '104 Funsho Williams Avenue, Iponri, Costain, Lagos',
    'Costain',
    c.id,
    s.id,
    'approved',
    true,
    false,
    1978,
    '500+',
    'https://www.facebook.com/chiscotransport',
    'https://www.instagram.com/chiscotransport/',
    'https://twitter.com/chiscotransport',
    '["Cash", "Card", "Bank Transfer", "POS", "Online Payment"]'::jsonb,
    '["English", "Igbo", "Yoruba", "Pidgin"]'::jsonb,
    ARRAY[
        'Interstate Bus Transport',
        'International Bus Transport',
        'Online Ticket Booking',
        'Luxury Coach Hire',
        'Airport Shuttle Services',
        'Parcel & Cargo Delivery',
        'Charter Services',
        'Terminal Facilities',
        'Lagos to Abuja Routes',
        'Ghana International Routes'
    ],
    '{
        "monday": {"open": "05:00", "close": "22:00", "closed": false},
        "tuesday": {"open": "05:00", "close": "22:00", "closed": false},
        "wednesday": {"open": "05:00", "close": "22:00", "closed": false},
        "thursday": {"open": "05:00", "close": "22:00", "closed": false},
        "friday": {"open": "05:00", "close": "22:00", "closed": false},
        "saturday": {"open": "05:00", "close": "22:00", "closed": false},
        "sunday": {"open": "05:00", "close": "22:00", "closed": false}
    }'::jsonb,
    'Chisco Transport - Online Booking, Routes & Contact | 9jaDirectory',
    'Chisco Transport: Nigeria''s luxury bus service since 1978. Book tickets online, 500+ coaches. Lagos, Abuja, PH & Ghana routes. Call +234 810 651 7669.',
    ARRAY[
        'chisco transport',
        'chisco transport online booking',
        'chisco transport lagos',
        'chisco bus booking',
        'chisco transport price list',
        'chisco transport terminal',
        'lagos to abuja bus',
        'chisco transport contact number',
        'interstate transport nigeria',
        'chisco transport ghana'
    ],
    '["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'transportation'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- 5. Food Concepts PLC (Chicken Republic)
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'Food Concepts PLC',
    'food-concepts-plc',
    'Food Concepts PLC is Nigeria''s largest quick-service restaurant (QSR) group and the parent company of Chicken Republic, PieXpress, and The Chop Box restaurant chains. Incorporated in 1999 and operational since 2000, the company has grown to over 190 Chicken Republic outlets across Nigeria, Ghana, and other African markets, making it the continent''s largest indigenous QSR chain. Headquartered at 2 Ilupeju Bye Pass, Lagos, Food Concepts PLC employs over 5,000 staff and is known for its commitment to quality, affordable meals, and Nigerian-inspired flavours. Chicken Republic''s menu features flame-grilled chicken, jollof rice, fried rice, meat pies, burgers, wraps, and a variety of Nigerian and continental dishes. The company also offers catering services, franchise opportunities, and is a major employer of youth across Nigeria.',
    '+2348090160597',
    'info@foodconceptsplc.com',
    'https://www.foodconceptsplc.com',
    NULL,
    '2 Ilupeju Bye Pass, Ilupeju, Lagos',
    'Ilupeju',
    c.id,
    s.id,
    'approved',
    true,
    false,
    1999,
    '500+',
    'https://www.facebook.com/ChickenRepublicNG',
    'https://www.instagram.com/chickenrepublicng/',
    'https://twitter.com/ChickenRepublic',
    '["Cash", "Card", "Bank Transfer", "POS", "Mobile Payment"]'::jsonb,
    '["English", "Yoruba", "Pidgin"]'::jsonb,
    ARRAY[
        'Quick-Service Restaurants',
        'Chicken Republic Outlets',
        'PieXpress Bakeries',
        'Catering Services',
        'Delivery & Takeaway',
        'Franchise Opportunities',
        'Corporate Catering',
        'Event Catering',
        'The Chop Box Restaurant',
        'Bulk & Party Orders'
    ],
    '{
        "monday": {"open": "08:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "08:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "08:00", "close": "17:00", "closed": false},
        "thursday": {"open": "08:00", "close": "17:00", "closed": false},
        "friday": {"open": "08:00", "close": "17:00", "closed": false},
        "saturday": {"open": "00:00", "close": "00:00", "closed": true},
        "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }'::jsonb,
    'Food Concepts PLC - Chicken Republic, Careers & Contact | 9jaDirectory',
    'Food Concepts PLC: parent company of Chicken Republic (190+ outlets). Nigeria''s largest QSR chain. HQ: Ilupeju, Lagos. Call +234 809 016 0597.',
    ARRAY[
        'food concepts plc',
        'chicken republic nigeria',
        'food concepts plc careers',
        'chicken republic menu',
        'chicken republic near me',
        'food concepts plc contact',
        'chicken republic delivery',
        'piexpress nigeria',
        'food concepts franchise',
        'chicken republic headquarters'
    ],
    '["https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'restaurants'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- 6. ICS Outsourcing
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'ICS Outsourcing Limited',
    'ics-outsourcing',
    'ICS Outsourcing Limited is Nigeria''s leading human resource outsourcing and business support services company. Founded in 1994, the company has grown to become one of West Africa''s most trusted HR solutions providers, managing over 20,000 outsourced employees across various industries. Headquartered at 6 Olusoji Idowu Street, Ilupeju, Lagos, ICS Outsourcing offers comprehensive services including staff outsourcing, recruitment and headhunting, payroll management, HR consulting, fleet management, driver outsourcing, training and development, background verification, and industrial cleaning services. The company serves clients across banking, telecommunications, oil and gas, FMCG, healthcare, manufacturing, and government sectors. ICS Outsourcing is ISO-certified and has received multiple awards for excellence in HR outsourcing. They operate offices in Lagos, Abuja, Port Harcourt, and other major Nigerian cities.',
    '+2348090202323',
    'enquiries@icsoutsourcing.com',
    'https://www.icsoutsourcing.com',
    '+2348090202323',
    '6 Olusoji Idowu Street, Ilupeju 100261, Lagos',
    'Ilupeju',
    c.id,
    s.id,
    'approved',
    true,
    false,
    1994,
    '500+',
    'https://www.facebook.com/aboraboricsoutsourcing',
    'https://www.instagram.com/icsoutsourcinglimited/',
    'https://twitter.com/aboraborICS',
    '["Bank Transfer", "Card"]'::jsonb,
    '["English", "Yoruba", "Igbo", "Hausa", "Pidgin"]'::jsonb,
    ARRAY[
        'Staff Outsourcing',
        'Recruitment & Headhunting',
        'Payroll Management',
        'HR Consulting',
        'Fleet Management',
        'Driver Outsourcing',
        'Training & Development',
        'Background Verification',
        'Industrial Cleaning',
        'Facility Management'
    ],
    '{
        "monday": {"open": "08:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "08:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "08:00", "close": "17:00", "closed": false},
        "thursday": {"open": "08:00", "close": "17:00", "closed": false},
        "friday": {"open": "08:00", "close": "17:00", "closed": false},
        "saturday": {"open": "00:00", "close": "00:00", "closed": true},
        "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }'::jsonb,
    'ICS Outsourcing - HR Solutions, Recruitment & Contact | 9jaDirectory',
    'ICS Outsourcing: Nigeria''s #1 HR outsourcing company since 1994. Staff outsourcing, recruitment, payroll & fleet management. Call +234 809 020 2323.',
    ARRAY[
        'ics outsourcing',
        'ics outsourcing lagos',
        'ics outsourcing recruitment',
        'hr outsourcing nigeria',
        'ics outsourcing careers',
        'ics outsourcing contact',
        'staff outsourcing nigeria',
        'ics outsourcing salary',
        'payroll outsourcing lagos',
        'ics outsourcing limited'
    ],
    '["https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'employment'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- Verify all insertions
SELECT id, business_name, slug, status, verified, city
FROM listings
WHERE slug IN (
    'reiz-continental-hotel-abuja',
    'bua-group',
    'circa-lagos',
    'chisco-transport',
    'food-concepts-plc',
    'ics-outsourcing'
)
ORDER BY business_name;
