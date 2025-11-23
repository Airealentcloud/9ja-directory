-- Check listings table columns
SELECT 
    column_name, 
    data_type, 
    udt_name
FROM information_schema.columns 
WHERE table_name = 'listings'
ORDER BY column_name;
