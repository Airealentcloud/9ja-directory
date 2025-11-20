# 9jaDirectory CSV Import Guide

## 📋 Overview
This guide will help you import your Nigerian business listings into Supabase safely and efficiently.

## 🎯 Best Practices for CSV Import

### 1. **Data Validation Before Import**
- ✅ Clean phone numbers (remove special characters)
- ✅ Validate email addresses
- ✅ Ensure category mappings exist
- ✅ Verify state/city associations
- ✅ Generate unique slugs

### 2. **Batch Processing**
- Import in batches of 50-100 records to avoid timeouts
- Add small delays between batches to prevent rate limiting
- Log successes and failures separately

### 3. **Transaction Safety**
- Use database transactions where possible
- Keep backups before major imports
- Test with small sample first (5-10 records)

### 4. **Error Handling**
- Log all errors with row numbers
- Continue processing even if some records fail
- Review and fix failed records separately

## 🚀 Import Methods

### **Method 1: Direct SQL Import (Recommended)**

This is the SAFEST method. Use the provided `import-listings.sql` file.

**Steps:**
1. Go to your Supabase Dashboard → SQL Editor
2. Copy the contents of `import-listings.sql`
3. Paste and click "Run"
4. Review the output to confirm import success

**Advantages:**
- ✅ No rate limiting
- ✅ Fast batch inserts
- ✅ Database-side validation
- ✅ Easy to verify

### **Method 2: TypeScript Import Script**

Use this for programmatic imports with custom logic.

**Steps:**
1. Ensure your CSV file is in the project root
2. Run: `npm run import:listings`
3. Monitor the console for progress
4. Review the import summary

**File:** `scripts/import-listings.ts`

### **Method 3: Supabase CSV Import (UI)**

**Steps:**
1. Go to Supabase Dashboard → Table Editor
2. Select the `listings` table
3. Click "Insert" → "Import data from CSV"
4. Map CSV columns to database columns
5. Import

**Note:** This method requires manual column mapping.

## 📊 CSV Column Mapping

| CSV Column | Database Column | Transform | Required |
|------------|----------------|-----------|----------|
| Name | business_name | None | Yes |
| Name (slugified) | slug | Generate from name | Yes |
| Address | address | None | No |
| Phone | phone | Clean special chars | No |
| Email | email | Lowercase | No |
| Website | website | None | No |
| Year_Established | established_year | Parse int | No |
| Category | category_id | Map to category slug | Yes |
| Description | description | None | No |
| Image | logo_url | Add path prefix | No |

## 🗺️ Category Mapping

The CSV uses these categories - they map to our database as:

| CSV Category | Database Slug |
|--------------|---------------|
| Agriculture | agriculture |
| Travel | transportation |
| Services | professional-services |
| RealEstate | real-estate |
| Education | education |

## 🌍 State/City Extraction

The import script automatically extracts state and city from addresses:

**Lagos Keywords:** lagos, ikeja, lekki, yaba, surulere, victoria island
**Abuja Keywords:** abuja, fct, garki, wuse, maitama

## 📝 Sample SQL Insert

```sql
INSERT INTO listings (
  business_name,
  slug,
  description,
  category_id,
  state_id,
  address,
  phone,
  established_year,
  status
) VALUES (
  'Business Name',
  'business-name-unique-slug',
  'Business description',
  (SELECT id FROM categories WHERE slug = 'professional-services' LIMIT 1),
  (SELECT id FROM states WHERE slug = 'lagos' LIMIT 1),
  'Full address',
  '+2341234567890',
  2020,
  'approved'
);
```

## ✅ Verification Checklist

After importing, verify:

- [ ] Total record count matches CSV rows
- [ ] All categories are properly assigned
- [ ] Lagos state is correctly set for all records
- [ ] Phone numbers are properly formatted
- [ ] Slugs are unique
- [ ] Status is set to 'approved' for visibility
- [ ] Listings appear on the frontend

## 🧪 Testing After Import

### 1. Check Database
```sql
-- Count total listings
SELECT COUNT(*) FROM listings;

-- Check by category
SELECT c.name, COUNT(l.id) as count
FROM listings l
JOIN categories c ON l.category_id = c.id
GROUP BY c.name;

-- Check by state
SELECT s.name, COUNT(l.id) as count
FROM listings l
JOIN states s ON l.state_id = s.id
GROUP BY s.name;

-- View recent listings
SELECT business_name, address, phone, created_at
FROM listings
ORDER BY created_at DESC
LIMIT 10;
```

### 2. Test Frontend
- Visit `http://localhost:3000/`
- Check homepage displays listing count
- Visit `http://localhost:3000/categories`
- Click on a category to see listings
- Verify listings display correctly

### 3. Test Search
- Use search functionality on homepage
- Search by business name
- Search by location

## 🐛 Common Issues & Solutions

### Issue 1: "relation listings does not exist"
**Solution:** Run the database schema first (`database-schema-enhanced.sql`)

### Issue 2: "category_id violates foreign key constraint"
**Solution:** Ensure categories table is populated before importing listings

### Issue 3: "duplicate key value violates unique constraint listings_slug_key"
**Solution:** Ensure each slug is unique, append a number if needed

### Issue 4: "null value in column business_name violates not-null constraint"
**Solution:** All listings must have a business_name

### Issue 5: No listings showing on frontend
**Solution:** Ensure status is set to 'approved' in the database

## 📈 Performance Tips

1. **Indexing:** The schema includes indexes on commonly queried columns
2. **Batch Size:** Import 50-100 records at a time
3. **Rate Limiting:** Add 100ms delay between batches
4. **Connection Pooling:** Supabase handles this automatically

## 🔒 Security Considerations

- Never commit CSV files with sensitive data to git
- Use environment variables for Supabase credentials
- Validate all input data before inserting
- Set appropriate RLS policies

## 📞 Need Help?

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Review the import script console output
3. Verify your database schema is up to date
4. Test with a single record first

## 🎉 Success Metrics

A successful import should show:
- ✅ 100+ listings imported
- ✅ 0 duplicate slugs
- ✅ All required fields populated
- ✅ Listings visible on frontend
- ✅ Categories properly distributed
- ✅ Search functionality working
