# Fix Admin Listing Visibility - Troubleshooting Guide

## The Problem
Listings submitted by customers are not showing up in the admin panel at `/admin/listings`.

## Solution Steps

### Step 1: Run the Quick Fix SQL
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/txupvudwbroyxfyccdhw/sql/new)
2. Copy and paste **ALL** of `quick-fix-admin.sql`
3. Click **"Run"**
4. You should see a list of recent listings and your admin email with role='admin'

### Step 2: Refresh the Admin Panel
1. Go to `http://localhost:3000/admin/listings`
2. **Hard refresh** the page (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
3. **Open browser console** (F12 or right-click > Inspect > Console tab)
4. Look for console logs that say:
   - `"Admin listings query result: ..."`
   - `"Found X pending listings"`

### Step 3: Check What You See

#### ✅ If you see listings:
Great! It's working. The RLS policies are now correct.

#### ❌ If you see "No pending listings found":
This means there are no pending listings in the database. To test:
1. Sign out from admin account
2. Sign up with a new email (e.g., `test2@example.com`)
3. Go to `/add-business` and submit a test business
4. Sign back in as admin
5. Go to `/admin/listings` - you should see it now

#### ❌ If you see an error in the console:
Check the error message:
- **"permission denied"** or **"RLS policy"**: The SQL script didn't run correctly. Run `quick-fix-admin.sql` again.
- **"relation does not exist"**: Database tables are missing. This shouldn't happen.
- Other errors: Share the error message for help.

### Step 4: Verify Your Admin Role
Run this in Supabase SQL Editor:
```sql
SELECT 
  auth.users.email,
  profiles.role
FROM profiles
JOIN auth.users ON profiles.id = auth.users.id
WHERE auth.users.email = 'israelakhas@gmail.com';
```

You should see:
- email: `israelakhas@gmail.com`
- role: `admin`

If role is NOT `admin`, run:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'israelakhas@gmail.com'
);
```

## Common Issues

### Issue: "I ran the SQL but still don't see listings"
**Solution**: 
1. Make sure you're logged in as `israelakhas@gmail.com`
2. Hard refresh the browser (Ctrl+Shift+R)
3. Check browser console for errors
4. Verify there are actually pending listings in the database

### Issue: "The console shows 'Found 0 pending listings'"
**Solution**: 
This means the query worked, but there are no pending listings. Create a test listing:
1. Sign up as a different user
2. Submit a business
3. Check admin panel again

### Issue: "I see 'Error loading listings: permission denied'"
**Solution**: 
The RLS policies aren't correct. Run `quick-fix-admin.sql` again and make sure it completes without errors.

## What the Fix Does

The `quick-fix-admin.sql` script:
1. **Removes old policies** that only allowed users to see their own listings
2. **Creates new policies** that allow:
   - Everyone to see approved listings
   - Users to see their own listings (any status)
   - **Admins to see ALL listings** (this is the key fix!)
3. **Verifies** your admin role and shows recent listings

## Next Steps After Fix

Once you can see pending listings:
1. Click "Approve" to test approval
2. Check that the listing disappears from pending
3. Verify it appears on the public site
4. Test rejection with a reason

For email notifications, see `ADMIN_EMAIL_SETUP.md`.
