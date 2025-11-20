# 9jaDirectory Setup Checklist

## 🚨 IMPORTANT: Complete These Steps in Order

### ✅ Step 1: Clean Up Existing Database
Copy and paste this into your **Supabase SQL Editor** first:

```sql
-- Drop all existing tables and related objects
DROP VIEW IF EXISTS popular_listings CASCADE;
DROP VIEW IF EXISTS listing_stats CASCADE;

DROP TABLE IF EXISTS listing_activity_logs CASCADE;
DROP TABLE IF EXISTS listing_updates CASCADE;
DROP TABLE IF EXISTS listing_hours_exceptions CASCADE;
DROP TABLE IF EXISTS listing_offers CASCADE;
DROP TABLE IF EXISTS listing_faqs CASCADE;
DROP TABLE IF EXISTS listing_photos CASCADE;
DROP TABLE IF EXISTS review_votes CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS listing_claims CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS states CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_nearby_listings(DECIMAL, DECIMAL, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS calculate_distance(DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS increment_listing_clicks(UUID, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS increment_listing_views(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

Click **"Run"** and wait for it to complete.

---

### ✅ Step 2: Create Enhanced Database Schema
After Step 1 completes, copy the ENTIRE contents of `database-schema-enhanced.sql` into the SQL Editor and run it.

**Expected Output:**
- ✅ 15 tables created
- ✅ 37 states inserted
- ✅ 20 categories inserted
- ✅ Sample cities inserted

---

### ✅ Step 3: Verify Database Setup
Run this query to verify:

```sql
-- Check if tables exist
SELECT
  (SELECT COUNT(*) FROM categories) as category_count,
  (SELECT COUNT(*) FROM states) as state_count,
  (SELECT COUNT(*) FROM cities) as city_count,
  (SELECT COUNT(*) FROM listings) as listing_count;
```

**Expected Result:**
- category_count: 20
- state_count: 37
- city_count: ~15
- listing_count: 0 (empty at this stage)

---

### ✅ Step 4: Import Sample Listings
Copy the contents of `import-listings.sql` and run it.

**Expected Output:**
- ✅ 10 listings inserted
- ✅ Query returns listing count = 10

---

### ✅ Step 5: Verify Frontend
1. Visit http://localhost:3000
2. You should see:
   - Homepage shows "10+ Businesses"
   - Categories page lists 20 categories
   - Click any category to see listings

---

## 🐛 Troubleshooting

### Error: "relation 'categories' does not exist"
**Solution:** You haven't run Step 2. Go back and run the database schema.

### Error: "Error fetching categories: {}"
**Solution:** Check your Supabase credentials in `.env.local`

### No listings showing on website
**Solution:**
1. Run the verification query from Step 3
2. Ensure `status = 'approved'` in the listings table
3. Check browser console for errors

### Categories showing 0 listings
**Solution:** Make sure you ran Step 4 (import-listings.sql)

---

## 📊 Current Status Check

Run this in Supabase SQL Editor to see current status:

```sql
-- Complete system check
SELECT
  'Categories' as table_name, COUNT(*) as records FROM categories
UNION ALL
SELECT 'States', COUNT(*) FROM states
UNION ALL
SELECT 'Cities', COUNT(*) FROM cities
UNION ALL
SELECT 'Listings', COUNT(*) FROM listings
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'Approved Listings', COUNT(*) FROM listings WHERE status = 'approved'
ORDER BY table_name;
```

---

## ✅ Success Criteria

Your setup is complete when:
- [x] All tables exist in Supabase
- [x] 37 states are populated
- [x] 20 categories are populated
- [x] At least 10 listings exist
- [x] Homepage shows correct counts
- [x] Categories page displays all categories
- [x] Clicking a category shows its listings
- [x] No console errors in browser
