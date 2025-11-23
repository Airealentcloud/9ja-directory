-- Force update image for A.I Realent to test frontend
UPDATE listings
SET 
    images = '["https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"]'::jsonb,
    updated_at = NOW()
WHERE business_name ILIKE '%Realent Global Resources%';

-- Verify the update
SELECT id, business_name, images, updated_at 
FROM listings 
WHERE business_name ILIKE '%Realent Global Resources%';
