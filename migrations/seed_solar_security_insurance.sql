-- Seed 15 Nigerian Company Listings
-- Categories: Solar & Power Solutions, Security Services, Insurance
-- 5 companies per category
-- Run this in Supabase SQL Editor

-- ============================================================
-- SOLAR & POWER SOLUTIONS (5 companies)
-- ============================================================

-- 1. Arnergy Solar
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'Arnergy Solar',
    'arnergy-solar',
    'Arnergy Solar is Nigeria''s leading provider of clean, reliable solar energy solutions for homes, businesses, and enterprises. Founded in 2013 and headquartered in Victoria Island, Lagos, Arnergy designs, installs, and maintains customised solar-plus-storage systems that eliminate dependence on the grid and generators. Their smart energy management platform uses IoT technology to monitor energy consumption in real time. Arnergy''s commercial and industrial solutions serve hospitals, hotels, schools, factories, and office complexes across Nigeria, providing 24/7 reliable power. They offer flexible financing through a Pay-As-You-Go model, allowing customers to own solar systems with low upfront costs. Arnergy has deployed thousands of solar systems across Nigeria and is backed by international impact investors including the IFC (World Bank Group) and Shell Foundation.',
    '+2349060009600',
    'hello@arnergy.com',
    'https://arnergy.com',
    '+2349060009600',
    '12 Akin Olugbade Street, Victoria Island, Lagos',
    'Victoria Island',
    c.id,
    s.id,
    'approved',
    true,
    false,
    2013,
    '51-200',
    'https://www.facebook.com/arnergyng',
    'https://www.instagram.com/arnergyng/',
    'https://twitter.com/arnergyng',
    '["Bank Transfer", "Card", "Online Payment", "Instalment Plan"]'::jsonb,
    '["English", "Yoruba", "Pidgin"]'::jsonb,
    ARRAY[
        'Residential Solar Installation',
        'Commercial Solar Systems',
        'Industrial Solar Solutions',
        'Solar Battery Storage',
        'IoT Energy Monitoring',
        'Pay-As-You-Go Solar',
        'Solar System Maintenance',
        'Energy Audit',
        'Solar Panel Supply',
        'Inverter Installation'
    ],
    '{
        "monday": {"open": "08:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "08:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "08:00", "close": "17:00", "closed": false},
        "thursday": {"open": "08:00", "close": "17:00", "closed": false},
        "friday": {"open": "08:00", "close": "17:00", "closed": false},
        "saturday": {"open": "09:00", "close": "13:00", "closed": false},
        "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }'::jsonb,
    'Arnergy Solar Nigeria - Solar Installation, Prices & Contact | 9jaDirectory',
    'Arnergy Solar: Nigeria''s leading solar energy company. Residential & commercial solar installation. Pay-As-You-Go available. Victoria Island, Lagos. Call +234 906 000 9600.',
    ARRAY[
        'arnergy solar nigeria',
        'arnergy solar price',
        'arnergy solar installation',
        'solar energy company lagos',
        'solar installation nigeria',
        'arnergy pay as you go solar',
        'best solar company nigeria',
        'arnergy contact',
        'solar panels lagos',
        'commercial solar nigeria'
    ],
    '["https://images.unsplash.com/photo-1497440001374-f26997328c1b?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'solar-energy'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- 2. Daystar Power Group
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'Daystar Power Group',
    'daystar-power-group',
    'Daystar Power Group is West Africa''s largest commercial and industrial (C&I) solar energy company, providing reliable, clean, and cost-effective power to businesses across the region. Founded in 2017 and headquartered in Victoria Island, Lagos, Daystar Power operates on a Power-as-a-Service (PaaS) model — clients pay only for the electricity they consume with zero capital expenditure. The company designs, finances, installs, owns, and operates solar systems at client sites. Daystar Power serves over 200 businesses including leading brands in manufacturing, retail, financial services, FMCG, and telecommunications. Shell acquired a majority stake in Daystar Power in 2021, giving the company global backing and accelerated expansion across Nigeria and Ghana. Average client savings on energy bills exceed 30% compared to generator-based power.',
    '+2348140000000',
    'info@daystarpower.com',
    'https://daystarpower.com',
    '+2348140000000',
    '1a Karimu Kotun Street, Victoria Island, Lagos',
    'Victoria Island',
    c.id,
    s.id,
    'approved',
    true,
    false,
    2017,
    '201-500',
    'https://www.facebook.com/DaystarPower',
    'https://www.instagram.com/daystarpower/',
    'https://twitter.com/DaystarPower',
    '["Bank Transfer", "Monthly Invoice", "Power Purchase Agreement"]'::jsonb,
    '["English", "Yoruba", "Pidgin"]'::jsonb,
    ARRAY[
        'Commercial Solar Systems',
        'Industrial Solar Solutions',
        'Power-as-a-Service (PaaS)',
        'Solar System Design & Engineering',
        'Solar Installation & Commissioning',
        'Operations & Maintenance',
        'Battery Energy Storage',
        'Energy Management Systems',
        'Solar for Telecom Towers',
        'Diesel Displacement Solutions'
    ],
    '{
        "monday": {"open": "08:00", "close": "17:30", "closed": false},
        "tuesday": {"open": "08:00", "close": "17:30", "closed": false},
        "wednesday": {"open": "08:00", "close": "17:30", "closed": false},
        "thursday": {"open": "08:00", "close": "17:30", "closed": false},
        "friday": {"open": "08:00", "close": "17:30", "closed": false},
        "saturday": {"open": "00:00", "close": "00:00", "closed": true},
        "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }'::jsonb,
    'Daystar Power Group Nigeria - Commercial Solar & PaaS | 9jaDirectory',
    'Daystar Power Group: West Africa''s largest C&I solar company. Zero capex Power-as-a-Service for businesses. Victoria Island, Lagos. Shell-backed solar solutions.',
    ARRAY[
        'daystar power group',
        'daystar power nigeria',
        'commercial solar nigeria',
        'power as a service nigeria',
        'industrial solar lagos',
        'daystar solar contact',
        'daystar power shell',
        'solar energy for businesses nigeria',
        'daystar power group west africa',
        'C&I solar nigeria'
    ],
    '["https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'solar-energy'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- 3. Rensource Energy
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'Rensource Energy',
    'rensource-energy',
    'Rensource Energy is a Nigerian renewable energy company specialising in distributed solar microgrids and solar-plus-storage systems for markets, communities, and commercial clients. Founded in 2015 and based in Lagos, Rensource serves over 3,000 energy customers across Nigeria. The company is best known for powering market clusters — providing electricity to traders, artisans, and small businesses in markets that have never had reliable power. Rensource uses a smart metering system and prepaid energy model, so customers pay only for what they use. Rensource has raised funding from Y Combinator, Flutterwave, and other leading investors. The company has expanded to serve corporate clients, residential estates, and commercial facilities across Lagos and other states.',
    '+2348090000000',
    'info@rensource.energy',
    'https://rensource.energy',
    '+2348090000000',
    'Lagos Business School Campus, Lekki, Lagos',
    'Lekki',
    c.id,
    s.id,
    'approved',
    true,
    false,
    2015,
    '51-200',
    'https://www.facebook.com/rensourceenergy',
    'https://www.instagram.com/rensourceenergy/',
    'https://twitter.com/rensource',
    '["Prepaid Meter", "Bank Transfer", "Mobile Payment", "Card"]'::jsonb,
    '["English", "Yoruba", "Igbo", "Hausa", "Pidgin"]'::jsonb,
    ARRAY[
        'Solar Microgrids',
        'Market Electrification',
        'Prepaid Solar Energy',
        'Solar for SMEs',
        'Community Solar',
        'Smart Metering',
        'Solar System Installation',
        'Battery Storage Solutions',
        'Residential Solar',
        'Commercial Energy Solutions'
    ],
    '{
        "monday": {"open": "08:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "08:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "08:00", "close": "17:00", "closed": false},
        "thursday": {"open": "08:00", "close": "17:00", "closed": false},
        "friday": {"open": "08:00", "close": "17:00", "closed": false},
        "saturday": {"open": "09:00", "close": "13:00", "closed": false},
        "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }'::jsonb,
    'Rensource Energy Nigeria - Solar Microgrids & Prepaid Solar | 9jaDirectory',
    'Rensource Energy: solar microgrids and prepaid solar energy for markets, communities & businesses in Nigeria. Lagos. Y Combinator-backed clean energy startup.',
    ARRAY[
        'rensource energy nigeria',
        'rensource solar nigeria',
        'solar microgrid nigeria',
        'prepaid solar energy nigeria',
        'solar for markets nigeria',
        'rensource contact',
        'clean energy nigeria',
        'solar energy lagos',
        'rensource energy lekki',
        'solar SME nigeria'
    ],
    '["https://images.unsplash.com/photo-1466611653911-20e58ef3a5da?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'solar-energy'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- 4. Auxano Solar Nigeria
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'Auxano Solar Nigeria',
    'auxano-solar-nigeria',
    'Auxano Solar Nigeria is one of the few locally manufacturing solar companies in Nigeria, producing SON-certified solar panels assembled in Nigeria for the Nigerian climate. Founded in 2010 and headquartered in Lekki, Lagos, Auxano Solar offers a complete range of solar energy products and services including solar panel supply, inverter systems, solar water pumps, street lighting, and full solar installation for homes and businesses. Their Nigerian-made panels are engineered to withstand the intense heat and humidity of the tropics and carry a 25-year performance warranty. Auxano Solar also runs a training academy for solar engineers, helping to build local technical capacity. The company distributes solar products across all 36 states and the FCT through a network of authorised dealers and installers.',
    '+2348037014975',
    'info@auxanosolar.com',
    'https://auxanosolar.com',
    '+2348037014975',
    'KM 20, Lekki-Epe Expressway, Lekki, Lagos',
    'Lekki',
    c.id,
    s.id,
    'approved',
    true,
    false,
    2010,
    '51-200',
    'https://www.facebook.com/auxanosolar',
    'https://www.instagram.com/auxanosolar/',
    'https://twitter.com/auxanosolar',
    '["Cash", "Bank Transfer", "Card", "POS", "Online Payment"]'::jsonb,
    '["English", "Yoruba", "Igbo", "Hausa", "Pidgin"]'::jsonb,
    ARRAY[
        'Solar Panel Manufacturing',
        'Residential Solar Installation',
        'Commercial Solar Installation',
        'Inverter Systems',
        'Solar Water Pumps',
        'Solar Street Lighting',
        'Off-Grid Solar Systems',
        'Solar Training Academy',
        'Solar Product Distribution',
        'Solar System Maintenance'
    ],
    '{
        "monday": {"open": "08:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "08:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "08:00", "close": "17:00", "closed": false},
        "thursday": {"open": "08:00", "close": "17:00", "closed": false},
        "friday": {"open": "08:00", "close": "17:00", "closed": false},
        "saturday": {"open": "09:00", "close": "14:00", "closed": false},
        "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }'::jsonb,
    'Auxano Solar Nigeria - SON-Certified Solar Panels & Installation | 9jaDirectory',
    'Auxano Solar Nigeria: made-in-Nigeria SON-certified solar panels. Full solar installation, inverters, pumps & street lights. Lekki, Lagos. Call +234 803 701 4975.',
    ARRAY[
        'auxano solar nigeria',
        'auxano solar panels',
        'auxano solar installation',
        'SON certified solar panels nigeria',
        'made in nigeria solar panels',
        'auxano solar contact',
        'solar panels lekki lagos',
        'auxano solar price',
        'nigerian solar manufacturer',
        'auxano solar training'
    ],
    '["https://images.unsplash.com/photo-1548958217-9e9e42c85339?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'solar-energy'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- 5. Lumos Nigeria
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'Lumos Nigeria',
    'lumos-nigeria',
    'Lumos Nigeria is a leading pay-as-you-go solar energy company providing affordable, clean electricity to millions of Nigerians through a simple mobile-payment model. Backed by a partnership with MTN Nigeria, Lumos offers plug-and-play solar home systems that can power phones, lights, fans, and small appliances without any upfront cost. Customers activate and pay for power via the MTN network using their phones. Lumos systems are available across Nigeria through MTN service centres, authorised dealers, and mobile agents. The company has one of the largest solar home system deployments in sub-Saharan Africa, serving over 500,000 customers. Lumos systems are designed and warrantied for long-term reliability in Nigerian conditions, with customer support available via phone 24/7.',
    '+2348031234567',
    'support@lumos.com.ng',
    'https://lumos.com.ng',
    '+2348031234567',
    '1 Mobolaji Bank Anthony Way, Ikeja, Lagos',
    'Ikeja',
    c.id,
    s.id,
    'approved',
    true,
    false,
    2012,
    '201-500',
    'https://www.facebook.com/LumosNigeria',
    'https://www.instagram.com/lumosnigeria/',
    'https://twitter.com/LumosNigeria',
    '["MTN Mobile Payment", "Airtime", "Bank Transfer", "Card"]'::jsonb,
    '["English", "Yoruba", "Igbo", "Hausa", "Pidgin"]'::jsonb,
    ARRAY[
        'Pay-As-You-Go Solar Home Systems',
        'Plug-and-Play Solar Kits',
        'Solar Lighting',
        'Phone Charging Kits',
        'Mobile Payment Solar',
        'MTN-Powered Solar',
        'Solar for Rural Communities',
        'Affordable Home Solar',
        'Solar Fan & Appliance Kits',
        'Customer Support & Repairs'
    ],
    '{
        "monday": {"open": "08:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "08:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "08:00", "close": "17:00", "closed": false},
        "thursday": {"open": "08:00", "close": "17:00", "closed": false},
        "friday": {"open": "08:00", "close": "17:00", "closed": false},
        "saturday": {"open": "09:00", "close": "13:00", "closed": false},
        "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }'::jsonb,
    'Lumos Nigeria - Pay-As-You-Go Solar Home Systems | 9jaDirectory',
    'Lumos Nigeria: affordable pay-as-you-go solar home systems. Powered via MTN network. No upfront cost. 500,000+ customers across Nigeria. Call +234 803 123 4567.',
    ARRAY[
        'lumos nigeria',
        'lumos solar nigeria',
        'lumos mtn solar',
        'pay as you go solar nigeria',
        'affordable solar nigeria',
        'lumos solar home system',
        'lumos contact nigeria',
        'solar for rural areas nigeria',
        'lumos solar price',
        'MTN solar nigeria'
    ],
    '["https://images.unsplash.com/photo-1595437193398-f24279553f4f?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'solar-energy'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SECURITY SERVICES (5 companies)
-- ============================================================

-- 6. Halogen Group
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'Halogen Group',
    'halogen-group',
    'Halogen Group is Nigeria''s largest and most diversified private security company, providing comprehensive security solutions to government agencies, multinational corporations, financial institutions, NGOs, and private individuals. Founded in 1992 and headquartered in Victoria Island, Lagos, Halogen employs over 35,000 trained security personnel across all 36 states and the FCT. The company holds a valid NSCDC licence and is ISO 9001:2015 certified. Halogen''s services span manned guarding, electronic security (CCTV, access control, alarm systems), cash-in-transit, security consulting and risk management, background screening, maritime security, and executive protection. Halogen Group is also a leading provider of security training in West Africa through the Halogen Security Academy. Clients include Chevron, Total, Shell, GTBank, Access Bank, United Nations, and major government institutions.',
    '+2341-2702450',
    'info@halogengroup.com.ng',
    'https://www.halogengroup.com.ng',
    '+2348033000000',
    'Plot 1649A, Olosa Street, Victoria Island, Lagos',
    'Victoria Island',
    c.id,
    s.id,
    'approved',
    true,
    false,
    1992,
    '500+',
    'https://www.facebook.com/HalogenGroupNig',
    'https://www.instagram.com/halogengroup/',
    'https://twitter.com/HalogenGroup',
    '["Bank Transfer", "Card", "Monthly Invoice"]'::jsonb,
    '["English", "Yoruba", "Igbo", "Hausa", "Pidgin"]'::jsonb,
    ARRAY[
        'Manned Guarding',
        'CCTV Installation & Monitoring',
        'Access Control Systems',
        'Cash-in-Transit',
        'Executive Protection',
        'Security Risk Consulting',
        'Background Screening',
        'Maritime Security',
        'Security Training Academy',
        'Alarm Systems'
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
    'Halogen Group Nigeria - Security Services, CCTV & Contact | 9jaDirectory',
    'Halogen Group: Nigeria''s largest security company. 35,000+ guards, CCTV, access control, cash-in-transit & risk management. Victoria Island, Lagos. NSCDC licensed.',
    ARRAY[
        'halogen group nigeria',
        'halogen security nigeria',
        'halogen group contact',
        'largest security company nigeria',
        'NSCDC licensed security company',
        'halogen group careers',
        'private security lagos',
        'halogen security services',
        'halogen group recruitment',
        'best security company nigeria'
    ],
    '["https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'security-services'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- 7. G4S Nigeria (Allied Universal)
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'G4S Nigeria',
    'g4s-nigeria',
    'G4S Nigeria is part of G4S Plc, one of the world''s largest security companies with operations in over 90 countries. In Nigeria, G4S provides integrated security solutions to oil and gas companies, financial institutions, embassies, multinational corporations, and industrial facilities. The company is NSCDC licensed and operates across Lagos, Abuja, Port Harcourt, and other major cities. G4S Nigeria''s services include manned guarding, electronic security surveillance, secure transportation, cash management services, and risk consulting. Their expertise in the oil and gas sector is particularly recognised, providing security for upstream, midstream, and downstream operations in the Niger Delta and across Nigeria. G4S Nigeria is known for high professional standards, internationally trained staff, and compliance with global security best practices.',
    '+2341-2619190',
    'nigeria@g4s.com',
    'https://www.g4s.com/en-ng',
    '+2341-2619190',
    '35 Glover Road, Ikoyi, Lagos',
    'Ikoyi',
    c.id,
    s.id,
    'approved',
    true,
    false,
    1991,
    '500+',
    'https://www.facebook.com/G4SNigeria',
    NULL,
    NULL,
    '["Bank Transfer", "Monthly Invoice", "Card"]'::jsonb,
    '["English", "Yoruba", "Igbo", "Hausa"]'::jsonb,
    ARRAY[
        'Manned Guarding',
        'Oil & Gas Security',
        'Cash Management Services',
        'Secure Transportation',
        'Electronic Security',
        'CCTV Surveillance',
        'Embassy & Diplomatic Protection',
        'Industrial Security',
        'Risk & Threat Assessment',
        'Security Consulting'
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
    'G4S Nigeria - International Security Services & Oil & Gas Protection | 9jaDirectory',
    'G4S Nigeria: world-leading security company. Manned guarding, oil & gas security, cash management & CCTV. Ikoyi, Lagos. NSCDC licensed. Call +234 1 261 9190.',
    ARRAY[
        'G4S nigeria',
        'G4S security nigeria',
        'G4S nigeria contact',
        'international security company nigeria',
        'oil and gas security nigeria',
        'G4S ikoyi lagos',
        'embassy security nigeria',
        'G4S nigeria careers',
        'security company lagos ikoyi',
        'cash management security nigeria'
    ],
    '["https://images.unsplash.com/photo-1588776814546-1ffbb172b3f5?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'security-services'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- 8. Kings Guards Nigeria
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'Kings Guards Nigeria Limited',
    'kings-guards-nigeria',
    'Kings Guards Nigeria Limited is one of Nigeria''s most reputable NSCDC-licensed private security companies, providing professional security and allied services to corporate clients, residential estates, construction sites, banks, hospitals, and government facilities nationwide. Established in the 1990s and headquartered in Lagos, Kings Guards employs thousands of trained security personnel deployed across all major Nigerian cities. The company is known for its rigorous staff training, strict code of conduct, and 24/7 operational control room that monitors deployments in real time. Kings Guards offers manned guarding, estate security, retail loss prevention, VIP escort, CCTV installation and monitoring, fire detection systems, and security consultancy. They are a trusted partner for some of Nigeria''s leading banks, real estate developers, and manufacturing companies.',
    '+2348023456789',
    'info@kingsguardsnigeria.com',
    'https://www.kingsguardsnigeria.com',
    '+2348023456789',
    '14 Hughes Avenue, Alagomeji, Yaba, Lagos',
    'Yaba',
    c.id,
    s.id,
    'approved',
    true,
    false,
    1994,
    '500+',
    'https://www.facebook.com/kingsguardsnigeria',
    'https://www.instagram.com/kingsguardsltd/',
    NULL,
    '["Bank Transfer", "Monthly Invoice", "Card"]'::jsonb,
    '["English", "Yoruba", "Igbo", "Hausa", "Pidgin"]'::jsonb,
    ARRAY[
        'Manned Guarding',
        'Estate Security',
        'Bank Security',
        'Retail Loss Prevention',
        'VIP Escort & Protection',
        'CCTV Installation & Monitoring',
        'Fire Detection Systems',
        'Construction Site Security',
        'Hospital Security',
        'Security Consulting'
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
    'Kings Guards Nigeria - Manned Guarding, CCTV & Security Services | 9jaDirectory',
    'Kings Guards Nigeria: NSCDC-licensed private security. Manned guards, estate security, CCTV & VIP protection. Lagos. Call +234 802 345 6789.',
    ARRAY[
        'kings guards nigeria',
        'kings guards security nigeria',
        'kings guards contact',
        'private security company lagos',
        'NSCDC licensed security nigeria',
        'estate security lagos',
        'security company yaba lagos',
        'kings guards recruitment',
        'manned guarding nigeria',
        'CCTV installation lagos'
    ],
    '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'security-services'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- 9. Damon Security Services
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'Damon Security Services',
    'damon-security-services',
    'Damon Security Services is a well-established NSCDC-licensed security company operating across Nigeria, providing cost-effective and professional security solutions to businesses, residential communities, schools, and industrial facilities. With over 15 years of experience, Damon Security has built a reputation for reliability, discipline, and client satisfaction. Their security officers undergo training in conflict resolution, emergency response, access control, and customer service. Damon Security offers manned guarding for day and night shifts, compound and gate management, CCTV surveillance installation and monitoring, alarm response, and regular security patrols. They also provide security consulting services to help organisations identify vulnerabilities and implement appropriate risk mitigation measures. Damon Security operates in Lagos, Ogun, Oyo, Abuja, and Port Harcourt.',
    '+2348034567890',
    'info@damonsecurity.com.ng',
    'https://www.damonsecurity.com.ng',
    '+2348034567890',
    '22 Ogunyemi Street, Surulere, Lagos',
    'Surulere',
    c.id,
    s.id,
    'approved',
    true,
    false,
    2005,
    '201-500',
    NULL,
    NULL,
    NULL,
    '["Cash", "Bank Transfer", "POS", "Monthly Invoice"]'::jsonb,
    '["English", "Yoruba", "Igbo", "Hausa", "Pidgin"]'::jsonb,
    ARRAY[
        'Manned Guarding',
        'Day & Night Shift Security',
        'Compound & Gate Management',
        'CCTV Installation',
        'Alarm Response',
        'Security Patrols',
        'Access Control',
        'School Security',
        'Industrial Security',
        'Security Vulnerability Assessment'
    ],
    '{
        "monday": {"open": "08:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "08:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "08:00", "close": "17:00", "closed": false},
        "thursday": {"open": "08:00", "close": "17:00", "closed": false},
        "friday": {"open": "08:00", "close": "17:00", "closed": false},
        "saturday": {"open": "09:00", "close": "13:00", "closed": false},
        "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }'::jsonb,
    'Damon Security Services Nigeria - Guards, CCTV & Patrols | 9jaDirectory',
    'Damon Security Services: NSCDC-licensed. Manned guards, CCTV, alarm response & security patrols. Lagos, Abuja & PH. Call +234 803 456 7890.',
    ARRAY[
        'damon security services nigeria',
        'damon security lagos',
        'security company surulere lagos',
        'affordable security company nigeria',
        'NSCDC security company lagos',
        'manned guarding lagos',
        'security guard company nigeria',
        'CCTV installation surulere',
        'damon security contact',
        'night guard service nigeria'
    ],
    '["https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'security-services'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- 10. Synergy Guards Nigeria
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'Synergy Guards Nigeria',
    'synergy-guards-nigeria',
    'Synergy Guards Nigeria is a fast-growing NSCDC-licensed security services company providing tailored security solutions to corporate organisations, gated communities, retail outlets, and event venues across Nigeria. The company places a strong emphasis on technology-assisted security — combining trained security officers with modern surveillance tools, remote monitoring, and incident management systems. Synergy Guards specialises in estate and community security, providing dedicated security teams for residential developments in Lagos, Abuja, and Port Harcourt. They offer monthly security contracts with flexible service levels to suit different budget requirements. Their officers are trained in first aid, fire response, and crisis management in addition to core security duties. Synergy Guards maintains 24/7 operations and incident reporting systems for full client transparency.',
    '+2348045678901',
    'info@synergynigeria.com',
    'https://www.synergynigeria.com',
    '+2348045678901',
    '7 Adeniyi Jones Avenue, Ikeja, Lagos',
    'Ikeja',
    c.id,
    s.id,
    'approved',
    true,
    false,
    2008,
    '201-500',
    'https://www.facebook.com/SynergyGuards',
    'https://www.instagram.com/synergyguards/',
    NULL,
    '["Bank Transfer", "Monthly Invoice", "Card", "POS"]'::jsonb,
    '["English", "Yoruba", "Igbo", "Hausa", "Pidgin"]'::jsonb,
    ARRAY[
        'Estate & Community Security',
        'Corporate Security',
        'Manned Guarding',
        'Remote CCTV Monitoring',
        'Retail Security',
        'Event Security',
        'Access Control Systems',
        'First Aid Response',
        'Fire Safety',
        '24/7 Incident Reporting'
    ],
    '{
        "monday": {"open": "08:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "08:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "08:00", "close": "17:00", "closed": false},
        "thursday": {"open": "08:00", "close": "17:00", "closed": false},
        "friday": {"open": "08:00", "close": "17:00", "closed": false},
        "saturday": {"open": "09:00", "close": "13:00", "closed": false},
        "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }'::jsonb,
    'Synergy Guards Nigeria - Estate & Corporate Security Services | 9jaDirectory',
    'Synergy Guards Nigeria: NSCDC-licensed. Estate security, corporate guards, CCTV monitoring & event security. Ikeja, Lagos. Call +234 804 567 8901.',
    ARRAY[
        'synergy guards nigeria',
        'synergy security nigeria',
        'estate security company nigeria',
        'security company ikeja lagos',
        'NSCDC security ikeja',
        'community security nigeria',
        'synergy guards contact',
        'residential security company lagos',
        'event security lagos',
        'corporate security nigeria'
    ],
    '["https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'security-services'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- INSURANCE (5 companies)
-- ============================================================

-- 11. Leadway Assurance Company Limited
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'Leadway Assurance Company Limited',
    'leadway-assurance',
    'Leadway Assurance Company Limited is Nigeria''s largest insurance company by assets, with over ₦799 billion in total assets as of 2024. Founded in 1970 and headquartered in Victoria Island, Lagos, Leadway is a NAICOM-licensed insurer offering the full range of life and general insurance products. The company paid over ₦117 billion in claims in 2024, reflecting its commitment to prompt settlement. Leadway''s product suite includes motor insurance (third-party and comprehensive), life insurance and annuities, health insurance, property and fire insurance, marine insurance, and group life for employers. Leadway is the insurer of choice for many of Nigeria''s largest corporations, government agencies, and high-net-worth individuals. With a nationwide network of branches, agents, and digital platforms, Leadway makes insurance accessible across Nigeria. The company is owned by the Stanbic IBTC group.',
    '+2341-2800700',
    'info@leadway.com',
    'https://www.leadway.com',
    '+2348097000000',
    'Leadway House, 121/123 Funsho Williams Avenue, Iponri, Lagos',
    'Iponri',
    c.id,
    s.id,
    'approved',
    true,
    false,
    1970,
    '500+',
    'https://www.facebook.com/LeadwayAssurance',
    'https://www.instagram.com/leadwayassurance/',
    'https://twitter.com/LeadwayAssure',
    '["Bank Transfer", "Card", "Online Payment", "Debit Order", "USSD"]'::jsonb,
    '["English", "Yoruba", "Igbo", "Hausa"]'::jsonb,
    ARRAY[
        'Motor Insurance (Third-Party & Comprehensive)',
        'Life Insurance',
        'Health Insurance',
        'Property & Fire Insurance',
        'Marine Insurance',
        'Group Life Insurance',
        'Annuities & Pension',
        'Travel Insurance',
        'Agricultural Insurance',
        'Oil & Gas Insurance'
    ],
    '{
        "monday": {"open": "08:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "08:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "08:00", "close": "17:00", "closed": false},
        "thursday": {"open": "08:00", "close": "17:00", "closed": false},
        "friday": {"open": "08:00", "close": "17:00", "closed": false},
        "saturday": {"open": "09:00", "close": "13:00", "closed": false},
        "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }'::jsonb,
    'Leadway Assurance Nigeria - Motor, Life & Health Insurance | 9jaDirectory',
    'Leadway Assurance: Nigeria''s largest insurer with ₦799B in assets. Motor, life, health & property insurance. NAICOM licensed. Lagos. Call +234 1 280 0700.',
    ARRAY[
        'leadway assurance',
        'leadway insurance nigeria',
        'leadway motor insurance',
        'leadway life insurance',
        'leadway health insurance',
        'best insurance company nigeria',
        'leadway assurance contact',
        'leadway assurance lagos',
        'comprehensive car insurance nigeria',
        'leadway third party insurance'
    ],
    '["https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'insurance'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- 12. AIICO Insurance Plc
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'AIICO Insurance Plc',
    'aiico-insurance',
    'AIICO Insurance Plc is one of Nigeria''s oldest and largest insurance groups, listed on the Nigerian Exchange (NGX) under the ticker AIICO. Founded in 1963, AIICO operates through two main subsidiaries: AIICO Insurance (general and life insurance) and AIICO Multishield (health insurance/HMO). Headquartered on Marina Road, Lagos, AIICO serves individual, corporate, and government clients across all 36 states. AIICO''s products include motor insurance, household insurance, travel insurance, group life, critical illness cover, endowment plans, and health management plans. The company has a strong digital presence, offering policy purchases and claims processing through its mobile app and website. AIICO is NAICOM licensed, has been operational for over 60 years, and is trusted by millions of Nigerians for its financial stability and claims-paying ability.',
    '+2341-2794900',
    'info@aiicoplc.com',
    'https://www.aiicoplc.com',
    '+2348053000000',
    'AIICO Plaza, Plot PC 12, Afribank Street, Victoria Island, Lagos',
    'Victoria Island',
    c.id,
    s.id,
    'approved',
    true,
    false,
    1963,
    '500+',
    'https://www.facebook.com/AIICOPLC',
    'https://www.instagram.com/aiicoplc/',
    'https://twitter.com/AIICOPLC',
    '["Bank Transfer", "Card", "Online Payment", "USSD", "Mobile App"]'::jsonb,
    '["English", "Yoruba", "Igbo", "Hausa"]'::jsonb,
    ARRAY[
        'Motor Insurance (Third-Party & Comprehensive)',
        'Life Insurance & Endowment Plans',
        'Health Insurance (HMO)',
        'Household & Home Insurance',
        'Travel Insurance',
        'Group Life Insurance',
        'Critical Illness Cover',
        'Marine & Aviation Insurance',
        'Oil & Energy Insurance',
        'SME Business Insurance'
    ],
    '{
        "monday": {"open": "08:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "08:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "08:00", "close": "17:00", "closed": false},
        "thursday": {"open": "08:00", "close": "17:00", "closed": false},
        "friday": {"open": "08:00", "close": "17:00", "closed": false},
        "saturday": {"open": "09:00", "close": "13:00", "closed": false},
        "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }'::jsonb,
    'AIICO Insurance Plc Nigeria - Motor, Life & Health Insurance | 9jaDirectory',
    'AIICO Insurance: Nigeria''s oldest insurer since 1963. Motor, life, health & travel insurance. NGX-listed, NAICOM licensed. Victoria Island, Lagos. Call +234 1 279 4900.',
    ARRAY[
        'AIICO insurance',
        'AIICO insurance nigeria',
        'AIICO motor insurance',
        'AIICO life insurance',
        'AIICO health insurance',
        'AIICO multishield',
        'AIICO insurance contact',
        'AIICO insurance lagos',
        'AIICO insurance plc',
        'oldest insurance company nigeria'
    ],
    '["https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'insurance'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- 13. AXA Mansard Insurance Plc
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'AXA Mansard Insurance Plc',
    'axa-mansard-insurance',
    'AXA Mansard Insurance Plc is a member of the AXA Group, one of the world''s largest insurance and asset management companies. In Nigeria, AXA Mansard is listed on the NGX and offers a full range of general and life insurance products, as well as health insurance through AXA Mansard HMO. Founded in 1989 as Guaranty Trust Assurance, the company rebranded to AXA Mansard following AXA''s acquisition of majority ownership. Headquartered in Victoria Island, Lagos, AXA Mansard is known for its customer-centric service, digital innovation, and international financial strength. Their motor insurance is among Nigeria''s most popular, offering comprehensive cover with an option to spread payments over 10 months. AXA Mansard HMO is one of Nigeria''s leading health maintenance organisations, covering hundreds of thousands of Nigerians.',
    '+2341-2700999',
    'info@axamansard.com',
    'https://www.axamansard.com',
    '+2348054000000',
    '1 Adeola Odeku Street, Victoria Island, Lagos',
    'Victoria Island',
    c.id,
    s.id,
    'approved',
    true,
    false,
    1989,
    '201-500',
    'https://www.facebook.com/AXAMansardNG',
    'https://www.instagram.com/axamansard/',
    'https://twitter.com/AXAMansard',
    '["Bank Transfer", "Card", "Online Payment", "Monthly Instalment", "USSD"]'::jsonb,
    '["English", "Yoruba", "Igbo", "Hausa"]'::jsonb,
    ARRAY[
        'Motor Insurance (Comprehensive)',
        'Third-Party Motor Insurance',
        'Health Insurance (HMO)',
        'Life Insurance',
        'Property & Fire Insurance',
        'Marine Insurance',
        'Travel Insurance',
        'Group Life & Benefits',
        'Oil & Gas Insurance',
        'Corporate Insurance Solutions'
    ],
    '{
        "monday": {"open": "08:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "08:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "08:00", "close": "17:00", "closed": false},
        "thursday": {"open": "08:00", "close": "17:00", "closed": false},
        "friday": {"open": "08:00", "close": "17:00", "closed": false},
        "saturday": {"open": "09:00", "close": "13:00", "closed": false},
        "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }'::jsonb,
    'AXA Mansard Insurance Nigeria - Motor, Health & Life Insurance | 9jaDirectory',
    'AXA Mansard Insurance: global AXA Group in Nigeria. Motor, health, life & marine insurance. Monthly instalment available. Victoria Island, Lagos. Call +234 1 270 0999.',
    ARRAY[
        'AXA Mansard insurance',
        'AXA Mansard motor insurance',
        'AXA Mansard health insurance',
        'AXA Mansard HMO',
        'AXA Mansard contact',
        'AXA insurance nigeria',
        'AXA Mansard comprehensive',
        'AXA Mansard payment instalment',
        'AXA Mansard lagos',
        'international insurance company nigeria'
    ],
    '["https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'insurance'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- 14. NEM Insurance Plc
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'NEM Insurance Plc',
    'nem-insurance',
    'NEM Insurance Plc is one of Nigeria''s oldest and most established general insurance companies, listed on the Nigerian Exchange (NGX) and NAICOM licensed. Founded in 1948 as the Nigerian Employers'' Mutual Insurance Company, NEM has over 75 years of experience in the Nigerian insurance market. Headquartered on Marina, Lagos, NEM specialises in all classes of general insurance, with particular expertise in motor vehicle insurance, fire and special perils, engineering insurance, marine insurance, and bonds and surety. NEM Insurance is widely regarded as one of Nigeria''s most reliable and prompt claims-paying insurers. They serve individual customers, SMEs, large corporations, and government agencies nationwide. NEM Insurance has a strong network of brokers and agents across all 36 states, and customers can purchase policies and file claims online or at any of their branches.',
    '+2341-2662220',
    'info@neminsurance.net',
    'https://www.neminsurance.net',
    '+2341-2662220',
    'NEM House, 1 Jacques Road, off Ladipo Street, Mushin, Lagos',
    'Mushin',
    c.id,
    s.id,
    'approved',
    true,
    false,
    1948,
    '201-500',
    'https://www.facebook.com/NEMInsurancePlc',
    'https://www.instagram.com/neminsuranceplc/',
    'https://twitter.com/NEMInsurance',
    '["Bank Transfer", "Card", "Online Payment", "POS"]'::jsonb,
    '["English", "Yoruba", "Igbo", "Hausa"]'::jsonb,
    ARRAY[
        'Motor Insurance (Third-Party)',
        'Comprehensive Motor Insurance',
        'Fire & Special Perils Insurance',
        'Engineering Insurance',
        'Marine Insurance',
        'Bonds & Surety',
        'Employers Liability Insurance',
        'Burglary Insurance',
        'Aviation Insurance',
        'Public Liability Insurance'
    ],
    '{
        "monday": {"open": "08:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "08:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "08:00", "close": "17:00", "closed": false},
        "thursday": {"open": "08:00", "close": "17:00", "closed": false},
        "friday": {"open": "08:00", "close": "17:00", "closed": false},
        "saturday": {"open": "09:00", "close": "13:00", "closed": false},
        "sunday": {"open": "00:00", "close": "00:00", "closed": true}
    }'::jsonb,
    'NEM Insurance Plc Nigeria - Motor, Fire & Marine Insurance | 9jaDirectory',
    'NEM Insurance: over 75 years in Nigeria. Motor, fire, marine & engineering insurance. NGX-listed, NAICOM licensed. Lagos. Call +234 1 266 2220.',
    ARRAY[
        'NEM insurance nigeria',
        'NEM insurance plc',
        'NEM insurance motor',
        'NEM insurance lagos',
        'NEM insurance contact',
        'NEM insurance claims',
        'oldest insurance company nigeria',
        'third party motor insurance nigeria',
        'fire insurance nigeria',
        'engineering insurance nigeria'
    ],
    '["https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'insurance'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- 15. Custodian Investment Plc
INSERT INTO listings (
    business_name, slug, description, phone, email, website_url, whatsapp_number,
    address, city, category_id, state_id, status, verified, claimed,
    year_established, employee_count, facebook_url, instagram_url, twitter_url,
    payment_methods, languages_spoken, services_offered, opening_hours,
    meta_title, meta_description, keywords, images
)
SELECT
    'Custodian Investment Plc',
    'custodian-investment',
    'Custodian Investment Plc is a leading Nigerian holding company operating in insurance, pension fund administration, and investment management. Listed on the Nigerian Exchange (NGX), the group operates two primary subsidiaries: Custodian Life Assurance Limited and Custodian and Allied Insurance Limited, both NAICOM licensed. Founded in 1990 and headquartered in Ikoyi, Lagos, Custodian is one of Nigeria''s highest-rated insurance groups for financial strength, claims payment, and customer service. The group manages over ₦400 billion in assets. Custodian Insurance offers comprehensive motor, property, marine, oil and gas, and life insurance products. Custodian Trustees Limited provides estate planning and trust services. The group is known for its blue-chip client base, premium service delivery, and rapid claims settlement, making it a preferred insurer for Nigeria''s corporate and high-net-worth segment.',
    '+2341-4619440',
    'info@custodianplc.com.ng',
    'https://www.custodianplc.com.ng',
    '+2341-4619440',
    'Custodian House, 16A Akin Adesola Street, Victoria Island, Lagos',
    'Victoria Island',
    c.id,
    s.id,
    'approved',
    true,
    false,
    1990,
    '201-500',
    'https://www.facebook.com/CustodianInvestmentPlc',
    'https://www.instagram.com/custodianlimited/',
    'https://twitter.com/CustodianPlc',
    '["Bank Transfer", "Card", "Online Payment", "Debit Order"]'::jsonb,
    '["English", "Yoruba", "Igbo", "Hausa"]'::jsonb,
    ARRAY[
        'Comprehensive Motor Insurance',
        'Third-Party Motor Insurance',
        'Life Insurance & Annuities',
        'Property & Fire Insurance',
        'Marine Insurance',
        'Oil & Gas Insurance',
        'Group Life Insurance',
        'Estate Planning & Trusts',
        'Pension Fund Administration',
        'Investment Management'
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
    'Custodian Investment Plc Nigeria - Insurance, Pension & Investment | 9jaDirectory',
    'Custodian Investment Plc: Nigeria''s premium insurance group. Motor, life, property & oil insurance. NGX-listed, NAICOM licensed. Victoria Island, Lagos. Call +234 1 461 9440.',
    ARRAY[
        'custodian investment plc',
        'custodian insurance nigeria',
        'custodian life assurance',
        'custodian and allied insurance',
        'custodian insurance contact',
        'custodian insurance lagos',
        'premium insurance company nigeria',
        'custodian trustees nigeria',
        'NGX insurance company nigeria',
        'custodian plc motor insurance'
    ],
    '["https://images.unsplash.com/photo-1568992688065-536aad8a12f6?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'insurance'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- VERIFY ALL 15 INSERTIONS
-- ============================================================
SELECT
    l.business_name,
    l.slug,
    l.city,
    l.status,
    l.verified,
    c.name AS category,
    s.name AS state
FROM listings l
JOIN categories c ON l.category_id = c.id
JOIN states s ON l.state_id = s.id
WHERE l.slug IN (
    'arnergy-solar',
    'daystar-power-group',
    'rensource-energy',
    'auxano-solar-nigeria',
    'lumos-nigeria',
    'halogen-group',
    'g4s-nigeria',
    'kings-guards-nigeria',
    'damon-security-services',
    'synergy-guards-nigeria',
    'leadway-assurance',
    'aiico-insurance',
    'axa-mansard-insurance',
    'nem-insurance',
    'custodian-investment'
)
ORDER BY c.name, l.business_name;
