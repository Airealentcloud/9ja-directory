-- Add missing Nigerian states for the directory
-- Run this in Supabase SQL Editor

INSERT INTO states (name, slug) VALUES
('Abuja', 'abuja'),
('Port Harcourt', 'port-harcourt'),
('Ibadan', 'ibadan')
ON CONFLICT (slug) DO NOTHING;
