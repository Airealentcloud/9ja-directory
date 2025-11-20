# Database Setup - Step by Step

## The Problem You're Facing

You have these errors:
1. `ERROR: 42P01: relation "listings" does not exist` - Tables aren't created yet
2. `ERROR: 42P07: relation "profiles" already exists` - Old table conflicts

## The Solution - 3 Simple Steps

### STEP 1: Cleanup (30 seconds)

Open your Supabase Dashboard → SQL Editor

Copy and paste the **entire contents** of `cleanup-database.sql` and click **Run**

This removes old tables safely.

### STEP 2: Create Schema (1 minute)

In the same SQL Editor, copy and paste the **entire contents** of `database-schema-enhanced.sql` and click **Run**

This creates:
- ✅ All 37 Nigerian states
- ✅ 20 business categories
- ✅ Cities/LGAs table
- ✅ Listings table with 50+ fields
- ✅ Reviews, photos, FAQs tables
- ✅ All indexes and constraints

### STEP 3: Import Listings (30 seconds)

In the same SQL Editor, copy and paste the **entire contents** of `import-all-100-listings.sql` and click **Run**

This imports your 90 Nigerian business listings.

## Verification

Run this query to confirm everything worked:

```sql
-- Check tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Count listings
SELECT COUNT(*) as total_listings FROM listings;

-- Count by category
SELECT c.name, COUNT(l.id) as count
FROM listings l
JOIN categories c ON l.category_id = c.id
GROUP BY c.name
ORDER BY count DESC;
```

You should see:
- 90 total listings
- Multiple categories with listings

## Check Frontend

Visit: http://localhost:3000/

You should see:
- "90+ Businesses" on homepage
- Categories page shows all categories with counts
- Clicking any category shows listings

## Troubleshooting

### Still getting "relation does not exist"?
- Make sure you ran STEP 2 (database-schema-enhanced.sql) completely
- Check for error messages in the SQL Editor output
- Try running the verification query above

### Import failed?
- Make sure STEP 1 and STEP 2 completed successfully first
- Check that categories table has 20 rows: `SELECT COUNT(*) FROM categories;`
- Check that states table has 37 rows: `SELECT COUNT(*) FROM states;`

## Files You Need

1. `cleanup-database.sql` - Removes old tables
2. `database-schema-enhanced.sql` - Creates all tables
3. `import-all-100-listings.sql` - Imports your 90 listings

**Run them in this exact order!**
