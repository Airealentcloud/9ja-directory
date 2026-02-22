-- Seed FairMoney Microfinance Bank listing
-- Run this in Supabase SQL Editor

-- Insert FairMoney listing
INSERT INTO listings (
    business_name,
    slug,
    description,
    phone,
    email,
    website_url,
    whatsapp_number,
    address,
    city,
    category_id,
    state_id,
    status,
    verified,
    claimed,
    year_established,
    employee_count,
    facebook_url,
    instagram_url,
    twitter_url,
    payment_methods,
    languages_spoken,
    services_offered,
    opening_hours,
    meta_title,
    meta_description,
    keywords,
    images
)
SELECT
    'FairMoney Microfinance Bank',
    'fairmoney-microfinance-bank',
    'FairMoney Microfinance Bank is Nigeria''s #1 digital bank and most downloaded fintech app with over 10 million downloads. Licensed by the Central Bank of Nigeria (CBN), FairMoney provides instant loans up to ₦3 million with no paperwork or collateral required. Their comprehensive financial services include personal and business loans, high-yield savings accounts (FairLock at 30% interest, FairSave at 17% p.a., FairTarget at 20% p.a.), debit cards for ATM/POS/online transactions, POS services for businesses, fixed deposits, and bills payment. Founded in 2017, FairMoney has grown to over 1,000 employees across 5 continents, serving millions of Nigerians with fast, accessible, and affordable digital banking solutions. Their AI-powered credit scoring enables loan approvals in minutes, disbursed directly to any Nigerian bank account. FairMoney customer care is available via phone (01-700-1276), email (help@fairmoney.io), WhatsApp (+234 810 108 4635), and in-app chat support.',
    '017001276',
    'help@fairmoney.io',
    'https://fairmoney.io',
    '+2348101084635',
    '28 Pade Odanye Close, Off Adeniyi Jones, Ikeja, Lagos',
    'Ikeja',
    c.id,
    s.id,
    'approved',
    true,
    false,
    2017,
    '500+',
    'https://www.facebook.com/FairMoneyng',
    'https://www.instagram.com/fairmoney_ng/',
    'https://twitter.com/fairmoney_ng',
    '["Bank Transfer", "Card", "USSD", "Mobile App"]'::jsonb,
    '["English", "Yoruba", "Igbo", "Hausa", "Pidgin"]'::jsonb,
    ARRAY[
        'Instant Personal Loans',
        'Business Loans',
        'Savings Accounts (FairLock, FairSave, FairTarget)',
        'Debit Cards',
        'POS Services',
        'Fixed Deposits',
        'Bills Payment',
        'Bank Accounts',
        'Mobile Banking',
        'Fund Transfers'
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
    'FairMoney Customer Care Number, Loans & Services | 9jaDirectory',
    'FairMoney Microfinance Bank customer care: 01-700-1276, WhatsApp +234 810 108 4635. Get instant loans up to ₦3M, savings at 30% interest, debit cards & more.',
    ARRAY[
        'fairmoney customer care number',
        'fairmoney loan app',
        'fairmoney microfinance bank',
        'fairmoney contact number',
        'fairmoney nigeria',
        'fairmoney savings interest rate',
        'fairmoney loan limit',
        'fairmoney whatsapp number',
        'digital bank nigeria',
        'instant loan nigeria'
    ],
    '["https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop"]'::jsonb
FROM categories c, states s
WHERE c.slug = 'finance'
AND s.slug = 'lagos'
ON CONFLICT (slug) DO NOTHING;

-- Verify insertion
SELECT id, business_name, slug, status, verified, city
FROM listings
WHERE slug = 'fairmoney-microfinance-bank';
