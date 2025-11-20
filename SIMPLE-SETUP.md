# Simple Database Setup - 3 Easy Steps

## Your Current Error

```
ERROR: 42P01: relation "listings" does not exist
```

This means the database tables were never created. Follow these 3 steps in order:

---

## STEP 1: Clean Up (30 seconds)

Open Supabase Dashboard → SQL Editor

Copy **ALL** contents of `1-simple-cleanup.sql` and click **RUN**

You should see: ✅ "Cleanup complete! Now run 2-create-tables.sql"

---

## STEP 2: Create Tables (1 minute)

In the same SQL Editor, copy **ALL** contents of `2-create-tables.sql` and click **RUN**

**Wait for it to finish!** This creates:
- 20 categories (Agriculture, Travel, Services, etc.)
- 37 Nigerian states
- 8 Lagos cities
- All table structures

You should see at the end:
- ✅ "Tables created successfully!"
- ✅ categories_count: 20
- ✅ states_count: 37
- ✅ cities_count: 8

---

## STEP 3: Import Your Listings

You have TWO options:

### Option A: Import the 1200+ Listings (RECOMMENDED)

1. **First, save your CSV file** in the `9ja-directory` folder with a simple name like `my-data.csv`

2. **Generate the SQL import file** by running:
   ```bash
   node generate-sql.js my-data.csv 3-import-listings.sql
   ```

3. **Copy the generated SQL file** (`3-import-listings.sql`) contents into Supabase SQL Editor and click **RUN**

You should see:
- ✅ total_listings: 1200+ (or however many valid listings you have)
- ✅ Category breakdown showing listing counts

### Option B: Import the Original 90 Listings

In the same SQL Editor, copy **ALL** contents of `import-all-100-listings.sql` and click **RUN**

This imports your original 90 Nigerian businesses.

You should see:
- ✅ total_listings: 90
- ✅ Category breakdown showing listing counts

---

## Verify It Worked

Run this quick check:

```sql
SELECT COUNT(*) FROM listings;
```

Should return: **90**

---

## Check Your Website

Visit: http://localhost:3000/

You should now see:
- "1200+ Businesses" on homepage (or "90+ Businesses" if you used Option B)
- All categories listed
- Clicking categories shows businesses
- Businesses grouped by state (Lagos, Abuja, Port Harcourt, Ibadan)

---

## Files to Run (IN ORDER!)

1. **1-simple-cleanup.sql** ← Start here
2. **2-create-tables.sql** ← Then this
3. **3-import-listings.sql** ← Finally this

## Important Notes

- ✅ Copy the **ENTIRE** file each time
- ✅ Don't skip steps
- ✅ Wait for each step to complete before moving to the next
- ✅ Look for green success messages

## Still Having Issues?

If you get ANY error, stop and paste the error message. Don't proceed to the next step.

The most common issue is not copying the entire file or not waiting for completion.

---

## About the CSV Import Script

The `generate-sql.js` script supports TWO CSV formats:

### Format 1: Original 100-record CSV
Headers: Name, Description, Address, Phone, Email, Website, Year_Established, Category, etc.

### Format 2: New 1200+ record CSV (RECOMMENDED)
Headers: business_name, description, address, phone, location, category

**The script automatically detects which format you're using!**

### Supported Categories:
Your CSV categories are automatically mapped:
- Accommodation → Hotels & Lodging
- Business → Professional Services
- Arts, Recreation, News and Media → Entertainment
- Sports → Sports & Fitness
- Automotive → Auto Services
- Transportation, Travel → Transportation
- Computers → Technology
- Agriculture → Agriculture
- Education → Education
- Health → Health & Medical
- Employment, Government → Professional Services
- Shopping → Shopping & Retail

### Supported Locations:
- Lagos → Lagos State
- Abuja → FCT (Federal Capital Territory)
- Port-Harcourt / Port Harcourt → Rivers State
- Ibadan → Oyo State

Any unknown location defaults to Lagos.
