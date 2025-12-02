# 🔒 Fix Production Database - RLS Security Issues

## Problem Summary
Your production database has **6 critical RLS (Row Level Security) errors** that are likely blocking your application from accessing data. This is why **9jadirectory.org is not working**.

## Quick Fix (5 minutes)

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your **9ja-directory** project
3. Click **SQL Editor** on the left sidebar

### Step 2: Run the Fix Script
1. Click **"New Query"**
2. Copy the ENTIRE content from: `fix-rls-security.sql` (in your project root)
3. Paste it into the SQL editor
4. Click **"Run"** (green button)

### Step 3: Verify Success
You should see output like:
```
✓ ALTER TABLE states ENABLE ROW LEVEL SECURITY;
✓ ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
...
```

At the bottom, you'll see a table showing RLS is enabled on all tables (rowsecurity = true).

### Step 4: Test Your Application
1. **Local**: Visit http://localhost:3000/categories/accommodation
2. **Production**: Visit https://9jadirectory.org

---

## What This Script Fixes

### 🔴 Critical (Blocks Your App)
- ✅ Enables RLS on `states` table
- ✅ Enables RLS on `cities` table  
- ✅ Enables RLS on `categories` table
- ✅ Enables RLS on `listing_hours_exceptions` table
- ✅ Enables RLS on `email_notifications` table

### 🟡 Important (Security Best Practices)
- ✅ Fixes function search_path settings (11 functions)
- ✅ Adds security wrapper (`SECURITY DEFINER`) to functions
- ✅ Creates proper read/write policies

### 🟢 Optional (Dashboard Only)
- Leaked password protection (Supabase Dashboard → Auth → Passwords)
- MFA options (Supabase Dashboard → Auth → MFA)

---

## If Still Not Working After Running Script

### Check 1: Verify RLS is Enabled
Run this in SQL Editor:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('states', 'cities', 'categories');
```

Should show `rowsecurity = true` for all tables.

### Check 2: Verify Environment Variables
Make sure your production `.env` has correct Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Check 3: Restart Production
If using PM2:
```bash
pm2 restart all
```

If using systemd:
```bash
systemctl restart node-app
```

### Check 4: Check Application Logs
Look for errors like:
- `PGRST301` - RLS policy violation
- `42P01` - Table not found
- Connection timeout

---

## Success Indicators

✅ After fix, you should see:
1. Local site loads: http://localhost:3000
2. Categories page shows listings: http://localhost:3000/categories/accommodation
3. Production site responds: https://9jadirectory.org (may take 1-2 min to restart)
4. No database errors in browser console

---

## Questions?

If the site still doesn't work after running this:
1. Take a screenshot of the SQL output
2. Check Supabase database logs
3. Verify all environment variables are correct
4. Make sure the production server has the latest code deployed

The local version at localhost:3000 should work immediately after running the script.
