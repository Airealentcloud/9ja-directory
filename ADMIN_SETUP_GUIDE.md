# Admin Setup & Testing Guide

## Steps to Enable Admin Functionality

### 1. Sign Up
1. Go to `http://localhost:3000/signup`
2. Create account with:
   - **Email**: `israelakhas@gmail.com`
   - **Password**: `@Y0unGs123`
   - **Full Name**: (your choice)

### 2. Run SQL Script
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/txupvudwbroyxfyccdhw/sql/new)
2. Copy and paste the contents of `setup-admin.sql`
3. Click **"Run"**
4. You should see a success message showing your email with role = 'admin'

### 3. Test Admin Features
1. **Login** at `http://localhost:3000/login` with your credentials
2. Navigate to **Admin Dashboard**:
   - Click "Dashboard" in the header
   - You should see an "Admin" section in the sidebar
   - Click "Manage Listings" under Admin
3. **Approve a Listing**:
   - If there are pending listings, click "Approve"
   - If no pending listings exist, create one first:
     - Sign out
     - Sign up with a different email
     - Add a business (it will be pending by default)
     - Sign back in as admin
     - Approve the listing

### 4. Verify It Works
- After approving, the listing should:
  - Disappear from the pending list
  - Appear on the public site at `http://localhost:3000`
  - Be visible at `/listings/[slug]`

## Troubleshooting
- **Can't see Admin menu?** Make sure you ran the SQL script after signing up.
- **Can't approve listings?** Check that the RLS policies were created (run the SQL again).
- **No pending listings?** Create a test listing with a different user account.
