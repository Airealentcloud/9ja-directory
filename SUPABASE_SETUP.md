# Supabase Setup Guide for 9jaDirectory

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign Up"
3. Sign up with GitHub, Google, or email

## Step 2: Create a New Project

1. After logging in, click "New Project"
2. Fill in the project details:
   - **Name:** `9jaDirectory` (or any name you prefer)
   - **Database Password:** Choose a strong password (save this!)
   - **Region:** Choose closest to Nigeria (e.g., `eu-west-1` or `ap-southeast-1`)
   - **Pricing Plan:** Free tier is perfect to start
3. Click "Create new project"
4. Wait 2-3 minutes for the project to be set up

## Step 3: Get Your API Credentials

1. Once your project is ready, go to **Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll see:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 4: Configure Environment Variables

1. Open the `.env.local` file in your 9ja-directory project
2. Replace the placeholder values with your actual credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save the file

## Step 5: Set Up the Database

1. In your Supabase dashboard, click **SQL Editor** (in the sidebar)
2. Click **New query**
3. Open the `database-schema.sql` file in your project
4. Copy ALL the SQL code from that file
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. Wait for the query to complete (should take 10-30 seconds)

You should see success messages. This creates all the tables, indexes, and sample data.

## Step 6: Enable Email Authentication (Optional)

1. Go to **Authentication** > **Providers** in Supabase dashboard
2. Make sure **Email** is enabled (it should be by default)
3. Configure email settings:
   - For development: Use Supabase's built-in email (limited to 3 emails/hour)
   - For production: Set up a custom SMTP provider (SendGrid, Resend, etc.)

## Step 7: Set Up Storage (for business logos and images)

1. Go to **Storage** in the Supabase dashboard
2. Click **Create a new bucket**
3. Create a bucket named `business-images`
4. Set it to **Public** (so images can be displayed on your site)
5. Click **Save**

### Set up Storage Policies:

Run this in the SQL Editor:

```sql
-- Allow public read access to business images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-images'
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (auth.uid()::text = owner);
```

## Step 8: Verify Everything Works

1. Restart your development server (if it's running):
   - Stop the server (Ctrl+C in the terminal)
   - Run `npm run dev` again
2. The app should now connect to Supabase without errors

## Step 9: View Your Data

You can view and edit your database data directly in Supabase:

1. Click **Table Editor** in the sidebar
2. You'll see all your tables:
   - `categories` - Already has 15 sample categories
   - `states` - Already has all 37 Nigerian states
   - `listings` - Empty (you'll add data here)
   - `profiles` - Empty (populated when users sign up)
   - `reviews` - Empty
   - etc.

## Next Steps

### Testing the Database Connection

Create a test page to verify Supabase is working:

**app/test-db/page.tsx:**
```tsx
import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .limit(5)

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test</h1>
      <pre>{JSON.stringify(categories, null, 2)}</pre>
    </div>
  )
}
```

Visit `http://localhost:3000/test-db` to see if it works!

### Common Issues

**Issue 1: "Failed to fetch"**
- Check that your `.env.local` file has the correct URL and key
- Restart your dev server after changing `.env.local`

**Issue 2: "relation does not exist"**
- You haven't run the database schema SQL yet
- Go to SQL Editor and run the `database-schema.sql` file

**Issue 3: "Invalid API key"**
- Double-check you copied the **anon key** (not the service role key)
- Make sure there are no extra spaces in the `.env.local` file

## Useful Supabase Features

### Real-time subscriptions
Get live updates when data changes:
```typescript
const channel = supabase
  .channel('listings-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'listings'
  }, (payload) => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

### Authentication
Easy user signup/login:
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})
```

### File uploads
Upload business logos:
```typescript
const { data, error } = await supabase.storage
  .from('business-images')
  .upload('logos/business-123.png', file)
```

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## Need Help?

If you run into issues:
1. Check the [Supabase Discord](https://discord.supabase.com/)
2. Search [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)
3. Check the Supabase [GitHub Discussions](https://github.com/supabase/supabase/discussions)
