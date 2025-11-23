# Admin Listings & Email Notifications Setup Guide

## Overview
This guide will help you:
1. Fix admin listing visibility (so pending listings show up)
2. Enable email notifications for business submissions and approvals

## Step 1: Run the SQL Script

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/txupvudwbroyxfyccdhw/sql/new)
2. Copy and paste the entire contents of `fix-admin-and-emails.sql`
3. Click **"Run"**
4. You should see: "Setup complete! Admin can now see all listings..."

## Step 2: Test Admin Listing Visibility

1. **Create a test listing** (as a regular user):
   - Sign out from admin account
   - Sign up with a different email (e.g., `test@example.com`)
   - Go to `/add-business` and submit a business
   
2. **Check admin panel**:
   - Sign back in as `israelakhas@gmail.com`
   - Go to `/admin/listings`
   - You should now see the pending listing!

3. **Approve the listing**:
   - Click "Approve" button
   - Listing should disappear from pending list
   - Check that it appears on the public site

## Step 3: Email Notifications (Optional)

The SQL script creates email notifications in a database table. To actually send emails, you have two options:

### Option A: Manual Email Sending (Simple)
- Email notifications are logged in the `email_notifications` table
- You can view them in Supabase Dashboard
- Manually email users based on these records

### Option B: Automated Email Sending (Advanced)
I've created an API route at `/api/send-emails` that processes the queue.

**To use it:**
1. Make sure `SUPABASE_SERVICE_ROLE_KEY` is in your `.env.local`
2. Call the endpoint manually: `POST http://localhost:3000/api/send-emails`
3. Or set up a cron job to call it periodically

**Note:** The current implementation uses Supabase Auth's invite system. For production, you should integrate a proper email service like:
- Resend
- SendGrid
- AWS SES
- Postmark

## Troubleshooting

### Admin can't see pending listings
- Make sure you ran `fix-admin-and-emails.sql`
- Verify admin role: Check `profiles` table, `role` should be `'admin'`
- Check browser console for errors

### Listings not appearing at all
- Check if listing was actually created (view `listings` table in Supabase)
- Verify `user_id` is set on the listing
- Check `status` is `'pending'`

### Emails not sending
- Check `email_notifications` table to see if records are being created
- If using the API route, check server logs for errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly

## What Was Fixed

### RLS Policies
- **Before**: Only listing owners could see their own listings
- **After**: Admins can see ALL listings (pending, approved, rejected)

### Email System
- **Submission**: When a user submits a business, a notification is created
- **Approval**: When admin approves, an approval notification is created
- **Rejection**: When admin rejects, a rejection notification with reason is created

All notifications are stored in `email_notifications` table for processing.
