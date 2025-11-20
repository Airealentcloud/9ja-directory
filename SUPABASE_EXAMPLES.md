# Supabase Code Examples for 9jaDirectory

## Quick Reference Guide

### 1. Fetching Data (Server Component)

```typescript
// app/categories/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Fetch all categories
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      {categories.map((category) => (
        <div key={category.id}>
          <h3>{category.name}</h3>
          <p>{category.description}</p>
        </div>
      ))}
    </div>
  )
}
```

### 2. Fetching Data (Client Component)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CategoriesList() {
  const [categories, setCategories] = useState([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
      setCategories(data || [])
    }
    fetchCategories()
  }, [])

  return (
    <ul>
      {categories.map((cat) => (
        <li key={cat.id}>{cat.name}</li>
      ))}
    </ul>
  )
}
```

### 3. Search Listings by Name

```typescript
const { data: listings } = await supabase
  .from('listings')
  .select('*')
  .ilike('business_name', `%${searchTerm}%`)
  .eq('status', 'approved')
  .limit(10)
```

### 4. Filter by State and Category

```typescript
const { data: listings } = await supabase
  .from('listings')
  .select(`
    *,
    categories(name, slug),
    states(name)
  `)
  .eq('state_id', stateId)
  .eq('category_id', categoryId)
  .eq('status', 'approved')
```

### 5. Get Listing with Reviews

```typescript
const { data: listing } = await supabase
  .from('listings')
  .select(`
    *,
    reviews(
      id,
      rating,
      comment,
      created_at,
      profiles(full_name, avatar_url)
    ),
    categories(name, slug),
    states(name),
    cities(name)
  `)
  .eq('slug', listingSlug)
  .single()
```

### 6. Get Listings with Stats

```typescript
const { data: listings } = await supabase
  .from('listing_stats')
  .select('*')
  .order('average_rating', { ascending: false })
  .limit(10)
```

### 7. Insert a New Listing

```typescript
const { data, error } = await supabase
  .from('listings')
  .insert({
    user_id: userId,
    business_name: 'My Business',
    slug: 'my-business',
    description: 'We offer great services',
    category_id: categoryId,
    state_id: stateId,
    phone: '08012345678',
    email: 'contact@mybusiness.com',
    address: '123 Main Street',
    status: 'pending'
  })
  .select()
  .single()
```

### 8. Update a Listing

```typescript
const { error } = await supabase
  .from('listings')
  .update({
    business_name: 'Updated Business Name',
    description: 'New description'
  })
  .eq('id', listingId)
  .eq('user_id', userId) // Ensure user owns this listing
```

### 9. Delete a Listing

```typescript
const { error } = await supabase
  .from('listings')
  .delete()
  .eq('id', listingId)
  .eq('user_id', userId)
```

### 10. Add a Review

```typescript
const { data, error } = await supabase
  .from('reviews')
  .insert({
    listing_id: listingId,
    user_id: userId,
    rating: 5,
    title: 'Great service!',
    comment: 'Highly recommend this business'
  })
```

### 11. Upload an Image

```typescript
const { data, error } = await supabase.storage
  .from('business-images')
  .upload(`logos/${userId}/${Date.now()}.jpg`, file, {
    cacheControl: '3600',
    upsert: false
  })

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('business-images')
  .getPublicUrl(data.path)
```

### 12. Authentication - Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    data: {
      full_name: 'John Doe',
      phone: '08012345678'
    }
  }
})
```

### 13. Authentication - Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
})
```

### 14. Authentication - Sign Out

```typescript
const { error } = await supabase.auth.signOut()
```

### 15. Get Current User

```typescript
// Server component
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

// Client component
const { data: { user } } = await supabase.auth.getUser()
```

### 16. Real-time Subscriptions

```typescript
'use client'

useEffect(() => {
  const channel = supabase
    .channel('listings-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'listings'
      },
      (payload) => {
        console.log('New listing added!', payload.new)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

### 17. Pagination

```typescript
const pageSize = 20
const page = 1

const { data: listings, count } = await supabase
  .from('listings')
  .select('*', { count: 'exact' })
  .range((page - 1) * pageSize, page * pageSize - 1)
```

### 18. Full-Text Search

```typescript
// First, create a text search index in SQL:
// CREATE INDEX listings_search_idx ON listings
// USING gin(to_tsvector('english', business_name || ' ' || description))

const { data } = await supabase
  .from('listings')
  .select('*')
  .textSearch('business_name', searchQuery)
```

### 19. Get Featured Listings

```typescript
const { data: featured } = await supabase
  .from('listings')
  .select('*')
  .eq('featured', true)
  .eq('status', 'approved')
  .gt('featured_until', new Date().toISOString())
  .order('created_at', { ascending: false })
```

### 20. Add to Favorites

```typescript
const { error } = await supabase
  .from('favorites')
  .insert({
    user_id: userId,
    listing_id: listingId
  })
```

### 21. Get User's Favorites

```typescript
const { data: favorites } = await supabase
  .from('favorites')
  .select(`
    *,
    listings(
      id,
      business_name,
      slug,
      logo_url,
      description
    )
  `)
  .eq('user_id', userId)
```

### 22. Increment View Count

```typescript
const { error } = await supabase.rpc('increment_views', {
  listing_id: listingId
})

// First create this function in SQL:
// CREATE OR REPLACE FUNCTION increment_views(listing_id UUID)
// RETURNS void AS $$
// BEGIN
//   UPDATE listings SET views = views + 1 WHERE id = listing_id;
// END;
// $$ LANGUAGE plpgsql;
```

### 23. Get Top Rated Businesses

```typescript
const { data } = await supabase
  .from('listing_stats')
  .select('*')
  .gte('review_count', 5)
  .order('average_rating', { ascending: false })
  .order('review_count', { ascending: false })
  .limit(10)
```

## Common Patterns

### Protected Route (Server Component)

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Welcome, {user.email}</div>
}
```

### Error Handling

```typescript
const { data, error } = await supabase
  .from('listings')
  .select('*')

if (error) {
  console.error('Error fetching listings:', error)
  return { error: error.message }
}

return { data }
```

## Helpful SQL Functions

Add these to your database for common operations:

### Increment View Count
```sql
CREATE OR REPLACE FUNCTION increment_views(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings SET views = views + 1 WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql;
```

### Generate Slug from Name
```sql
CREATE OR REPLACE FUNCTION generate_slug(text_input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(text_input, '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;
```

## Resources

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
