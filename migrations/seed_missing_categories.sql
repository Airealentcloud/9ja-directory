-- Add 3 High-Value Missing Categories
-- Solar & Power Solutions, Security Services, Insurance
-- Run in Supabase SQL Editor

INSERT INTO categories (name, slug, icon, description) VALUES
(
    'Solar & Power Solutions',
    'solar-energy',
    '☀️',
    'Solar panel installation, inverter systems, generator sales & repair, and renewable energy solutions in Nigeria'
),
(
    'Security Services',
    'security-services',
    '🔒',
    'Private security companies, guard services, CCTV installation, access control, and surveillance systems'
),
(
    'Insurance',
    'insurance',
    '🛡️',
    'Insurance brokers, motor insurance, health insurance, life insurance, and property insurance companies in Nigeria'
)
ON CONFLICT (slug) DO NOTHING;

-- Verify all 3 were inserted
SELECT id, name, slug, icon
FROM categories
WHERE slug IN ('solar-energy', 'security-services', 'insurance')
ORDER BY name;
