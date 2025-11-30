# 🛠️ SEO Implementation Guide - 9jaDirectory
## Step-by-Step Code Examples & Technical Setup

---

## TABLE OF CONTENTS
1. Dynamic Metadata for Listings
2. Enhanced Schema Markup
3. Location-Based Page Generation
4. Internal Linking Strategy
5. Content Hub Structure
6. Performance Optimization

---

## 1. DYNAMIC METADATA FOR LISTING PAGES

### Current Issue
Listing pages have generic titles & descriptions. Need to be dynamic with location + category.

### Solution Implementation

**File: `app/listings/[slug]/page.tsx`**

```typescript
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

// GENERATE DYNAMIC METADATA FOR EACH LISTING
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      categories (name, slug),
      states (name, slug)
    `)
    .eq('slug', slug)
    .eq('status', 'approved')
    .single()

  if (error || !listing) {
    return { title: 'Business Not Found', description: 'The business you are looking for does not exist.' }
  }

  // CONSTRUCT DYNAMIC TITLE WITH LOCATION + CATEGORY + KEYWORD
  const title = `${listing.business_name} | ${listing.categories?.name || 'Business'} in ${listing.city}, ${listing.states?.name || 'Nigeria'}`
  
  // CONSTRUCT COMPELLING DESCRIPTION WITH NATURAL KEYWORDS
  const description = `${listing.business_name} is a ${listing.categories?.name?.toLowerCase()} in ${listing.city}, ${listing.states?.name}. ${listing.description?.substring(0, 100) || 'A verified business on 9jaDirectory'}... ✓ Verified | 📍 ${listing.city} | ⭐ ${listing.average_rating?.toFixed(1) || 'New'}`
  
  // DYNAMIC KEYWORDS TARGETING MULTIPLE INTENT LEVELS
  const keywords = [
    listing.business_name, // Brand
    `${listing.business_name} ${listing.city}`, // Local brand search
    `${listing.categories?.name} in ${listing.city}`, // Local category search
    `${listing.categories?.name} in ${listing.states?.name}`, // State-level search
    `${listing.categories?.name} ${listing.city} ${listing.states?.name}`, // Hyper-local
    `best ${listing.categories?.name?.toLowerCase()} in ${listing.city}`, // Review-intent
    `${listing.categories?.name?.toLowerCase()} near me ${listing.city}`, // Voice search
    '9jaDirectory', // Brand
  ]

  return {
    title,
    description,
    keywords,
    
    // STRUCTURED DATA MARKUP
    openGraph: {
      title,
      description,
      url: `https://9jadirectory.org/listings/${slug}`,
      type: 'business.business',
      siteName: '9jaDirectory',
      locale: 'en_NG',
      images: [
        {
          url: listing.image_url || 'https://9jadirectory.org/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${listing.business_name} - ${listing.categories?.name}`,
        },
      ],
    },
    
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [listing.image_url || 'https://9jadirectory.org/og-image.jpg'],
      creator: '@9jaDirectory',
    },
    
    // CANONICAL TAG - IMPORTANT FOR DUPLICATE CONTENT
    alternates: {
      canonical: `https://9jadirectory.org/listings/${slug}`,
    },
    
    // JSON-LD WILL BE ADDED IN COMPONENT BELOW
  }
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // ... rest of component
}
```

---

## 2. ENHANCED SCHEMA MARKUP WITH GEO DATA

### File: `lib/schema/enhanced-local-business.ts`

```typescript
// ENHANCED LOCAL BUSINESS SCHEMA WITH GEO COORDINATES
export function generateEnhancedLocalBusinessSchema(listing: any, reviews?: any[], averageRating?: number) {
  // Parse geolocation (assuming format: "latitude,longitude")
  const [latitude, longitude] = listing.geolocation 
    ? listing.geolocation.split(',').map(Number) 
    : [null, null]

  // Parse operating hours - convert to ISO format if needed
  const operatingHoursSpec = listing.operating_hours 
    ? parseOperatingHours(listing.operating_hours) 
    : null

  // DETERMINE BUSINESS TYPE FROM CATEGORY
  const businessTypeMap: { [key: string]: string } = {
    'restaurant': 'Restaurant',
    'hotel': 'Hotel',
    'clinic': 'MedicalBusiness',
    'salon': 'HealthAndBeautyBusiness',
    'real estate': 'RealEstateProperty',
    'store': 'Store',
    'bank': 'FinancialService',
    'education': 'EducationalOrganization',
  }
  
  const businessType = businessTypeMap[listing.categories?.name?.toLowerCase()] || 'LocalBusiness'

  // MAIN SCHEMA
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', businessType],
    '@id': `https://9jadirectory.org/listings/${listing.slug}#business`,
    
    'name': listing.business_name,
    'url': `https://9jadirectory.org/listings/${listing.slug}`,
    'description': listing.description,
    'image': [
      listing.image_url,
      ...(listing.images || [])
    ].filter(Boolean),
    
    // ✅ GEO COORDINATES - CRITICAL FOR LOCAL PACK
    ...(latitude && longitude ? {
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': latitude,
        'longitude': longitude,
        'name': listing.business_name
      }
    } : {}),
    
    // ADDRESS INFORMATION
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': listing.address || '',
      'addressLocality': listing.city,
      'addressRegion': listing.states?.name,
      'postalCode': listing.postal_code || '',
      'addressCountry': 'NG'
    },
    
    // CONTACT INFORMATION
    'telephone': listing.phone || '',
    'email': listing.email || '',
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'Customer Service',
      'telephone': listing.phone || '',
      'email': listing.email || '',
      'areaServed': [
        listing.city,
        listing.states?.name,
        'Nigeria'
      ]
    },
    
    // ✅ SERVICE AREA - FOR MULTI-LOCATION SERVICES
    'areaServed': [
      {
        '@type': 'City',
        'name': listing.city
      },
      {
        '@type': 'State',
        'name': listing.states?.name
      },
      {
        '@type': 'Country',
        'name': 'Nigeria'
      }
    ],
    
    // ✅ OPENING HOURS - STANDARDIZED FORMAT
    ...(operatingHoursSpec ? { 'openingHoursSpecification': operatingHoursSpec } : {}),
    
    // ✅ SOCIAL PROFILES - FOR KNOWLEDGE PANEL
    'sameAs': [
      listing.website,
      listing.facebook_url,
      listing.instagram_url,
      listing.twitter_url,
      listing.linkedin_url,
      `https://9jadirectory.org/listings/${listing.slug}` // Self-reference
    ].filter(Boolean),
    
    // ✅ AGGREGATE RATING - CRITICAL FOR RICH SNIPPETS
    ...(reviews && reviews.length > 0 && averageRating ? {
      'aggregateRating': {
        '@type': 'AggregateRating',
        '@id': `https://9jadirectory.org/listings/${listing.slug}#rating`,
        'ratingValue': averageRating.toFixed(1),
        'reviewCount': reviews.length,
        'bestRating': '5',
        'worstRating': '1',
        'ratingCount': reviews.length
      }
    } : {}),
    
    // INDIVIDUAL REVIEWS
    'review': reviews?.slice(0, 10).map((review: any) => ({
      '@type': 'Review',
      '@id': `https://9jadirectory.org/listings/${listing.slug}#review-${review.id}`,
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': review.rating,
        'bestRating': '5',
        'worstRating': '1'
      },
      'author': {
        '@type': 'Person',
        'name': review.reviewer_name || 'Anonymous'
      },
      'reviewBody': review.comment,
      'datePublished': review.created_at?.split('T')[0]
    })) || [],
    
    // ✅ PRICE RANGE FOR RETAIL/RESTAURANTS
    ...(listing.average_price ? {
      'priceRange': listing.average_price
    } : {}),
    
    // ✅ MENU/CATALOG FOR RESTAURANTS
    ...(businessType === 'Restaurant' && listing.menu_url ? {
      'menu': listing.menu_url
    } : {}),
    
    // ✅ ORGANIZATION INFORMATION
    'parentOrganization': {
      '@type': 'Organization',
      '@id': 'https://9jadirectory.org#organization',
      'name': '9jaDirectory',
      'url': 'https://9jadirectory.org',
      'logo': 'https://9jadirectory.org/logo.png'
    }
  }

  return schema
}

// PARSE OPERATING HOURS INTO ISO SCHEMA FORMAT
function parseOperatingHours(hoursString: string): any[] {
  // Assuming format: "Mon-Fri: 9:00-17:00, Sat: 10:00-15:00, Sun: Closed"
  const lines = hoursString.split(',')
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const dayShorts: { [key: string]: number } = {
    'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4, 'Sat': 5, 'Sun': 6
  }

  const specs: any[] = []

  lines.forEach((line: string) => {
    const [dayRange, time] = line.trim().split(':')
    
    if (time?.toLowerCase() === 'closed') return

    const [startTime, endTime] = time.trim().split('-')
    const [startDay, endDay] = dayRange.split('-').map((d: string) => d.trim())

    const startDayNum = dayShorts[startDay]
    const endDayNum = endDay ? dayShorts[endDay] : startDayNum

    for (let i = startDayNum; i <= endDayNum; i++) {
      specs.push({
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': days[i],
        'opens': startTime.trim(),
        'closes': endTime.trim()
      })
    }
  })

  return specs
}

// ADDITIONAL SCHEMA TYPES FOR SPECIFIC BUSINESS TYPES

export function generateRestaurantSchema(listing: any, reviews?: any[]) {
  const baseSchema = generateEnhancedLocalBusinessSchema(listing, reviews)
  
  return {
    ...baseSchema,
    '@type': ['Restaurant', 'LocalBusiness'],
    'servesCuisine': listing.cuisine_types || [],
    'acceptsReservations': listing.accepts_reservations ? 'https://schema.org/True' : 'https://schema.org/False',
    'hasMenu': listing.menu_url,
    'telephone': listing.phone,
  }
}

export function generateRealEstateSchema(listing: any) {
  const baseSchema = generateEnhancedLocalBusinessSchema(listing)
  
  return {
    ...baseSchema,
    '@type': 'RealEstateProperty',
    'price': listing.price,
    'priceCurrency': 'NGN',
    'numberOfBedrooms': listing.bedrooms,
    'numberOfBatrooms': listing.bathrooms,
    'floorSize': listing.square_meters,
  }
}

export function generateProductSchema(listing: any, reviews?: any[]) {
  const baseSchema = generateEnhancedLocalBusinessSchema(listing, reviews)
  
  return {
    ...baseSchema,
    '@type': 'Product',
    'offers': {
      '@type': 'Offer',
      'price': listing.average_price,
      'priceCurrency': 'NGN',
      'availability': 'https://schema.org/InStock',
      'seller': {
        '@type': 'Organization',
        'name': listing.business_name
      }
    },
    'aggregateRating': baseSchema.aggregateRating,
  }
}
```

---

## 3. LOCATION-BASED LANDING PAGE GENERATION

### Create Dynamic Category + State Pages

**File: `app/categories/[categorySlug]/[stateSlug]/page.tsx`** (NEW FILE)

```typescript
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ListingCard from '@/components/listing-card'

// GENERATE DYNAMIC METADATA FOR CATEGORY + STATE COMBINATION
export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string; stateSlug: string }>
}): Promise<Metadata> {
  const { categorySlug, stateSlug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('slug', categorySlug)
    .single()

  const { data: state } = await supabase
    .from('states')
    .select('name')
    .eq('slug', stateSlug)
    .single()

  if (!category || !state) {
    return { title: 'Page Not Found', description: 'The page you are looking for does not exist.' }
  }

  const categoryName = category.name
  const stateName = state.name

  // ✅ OPTIMIZED FOR LOCAL KEYWORDS WITH MODIFIERS
  const title = `Best ${categoryName} in ${stateName} | Top Rated ${categoryName} in ${stateName} 2025 | 9jaDirectory`
  const description = `Find the best verified ${categoryName} in ${stateName}. Compare ratings, prices, and contact details. Browse top-rated ${categoryName} near you. Updated ${new Date().toLocaleDateString()}.`
  
  const keywords = [
    `${categoryName} in ${stateName}`,
    `best ${categoryName} in ${stateName}`,
    `${categoryName} near me ${stateName}`,
    `top rated ${categoryName} ${stateName}`,
    `verified ${categoryName} ${stateName}`,
    `${stateName} ${categoryName} directory`,
    `${categoryName} ${stateName} 2025`,
  ]

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `https://9jadirectory.org/categories/${categorySlug}/${stateSlug}`,
      type: 'website',
      locale: 'en_NG',
      siteName: '9jaDirectory',
    },
    alternates: {
      canonical: `https://9jadirectory.org/categories/${categorySlug}/${stateSlug}`,
    },
  }
}

export default async function CategoryStatePage({
  params,
}: {
  params: Promise<{ categorySlug: string; stateSlug: string }>
}) {
  const { categorySlug, stateSlug } = await params
  const supabase = await createClient()

  // Fetch category
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single()

  // Fetch state
  const { data: state, error: stateError } = await supabase
    .from('states')
    .select('*')
    .eq('slug', stateSlug)
    .single()

  if (categoryError || stateError || !category || !state) {
    return <div className="text-center py-12">Not found</div>
  }

  // Fetch listings for this category + state combination
  const { data: listings, count: totalCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('category_id', category.id)
    .eq('state_id', state.id)
    .eq('status', 'approved')
    .order('featured', { ascending: false })
    .order('average_rating', { ascending: false })
    .order('created_at', { ascending: false })

  // Get stats
  const avgRating = listings?.length 
    ? (listings.reduce((sum, l) => sum + (l.average_rating || 0), 0) / listings.length).toFixed(1)
    : 0

  // JSON-LD Schema for this page
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': `Best ${category.name} in ${state.name}`,
    'description': `Directory of verified ${category.name} in ${state.name}`,
    'url': `https://9jadirectory.org/categories/${categorySlug}/${stateSlug}`,
    'image': 'https://9jadirectory.org/og-image.jpg',
    'publisher': {
      '@type': 'Organization',
      'name': '9jaDirectory'
    },
    'mainEntity': {
      '@type': 'LocalBusiness',
      'areaServed': {
        '@type': 'State',
        'name': state.name
      }
    }
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      
      <div className="min-h-screen bg-gray-50">
        {/* HERO SECTION WITH SEO TEXT */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Best {category.name} in {state.name}
            </h1>
            <p className="text-lg text-green-100 max-w-2xl mb-2">
              Discover {totalCount} verified {category.name?.toLowerCase()} in {state.name} with ratings, contact details, and customer reviews.
            </p>
            <p className="text-sm text-green-200">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </section>

        {/* STATS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-green-600">{totalCount}</div>
              <div className="text-gray-600">Verified {category.name}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{avgRating}⭐</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{state.name}</div>
              <div className="text-gray-600">State Coverage</div>
            </div>
          </div>
        </section>

        {/* RICH DESCRIPTION FOR SEO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">
              Looking for the Best {category.name} in {state.name}?
            </h2>
            <p className="text-gray-700 mb-4">
              9jaDirectory has curated a comprehensive list of verified {category.name?.toLowerCase()} across {state.name}. 
              Whether you are looking for highly-rated establishments, affordable options, or specialty services, 
              you will find what you need in our directory of {totalCount}+ {category.name?.toLowerCase()}.
            </p>
            
            <h3 className="text-xl font-bold mt-6 mb-3">Why Choose These {category.name}?</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>✅ All businesses are verified with active contact information</li>
              <li>✅ Real customer reviews and ratings</li>
              <li>✅ Operating hours and location details</li>
              <li>✅ Direct contact and messaging capabilities</li>
              <li>✅ Regular updates and fresh listings</li>
            </ul>
          </div>
        </section>

        {/* LISTINGS GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold mb-8">
            Browse {totalCount} {category.name} in {state.name}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings?.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {!listings || listings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No {category.name?.toLowerCase()} found in {state.name} yet.
              </p>
              <p className="text-gray-500 mt-2">
                Be the first to list your business!
              </p>
            </div>
          )}
        </section>

        {/* FAQ SECTION FOR SERP FEATURES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white rounded-lg shadow-md my-8">
          <h2 className="text-2xl font-bold mb-8">
            Frequently Asked Questions About {category.name} in {state.name}
          </h2>
          
          {/* FAQ SCHEMA WILL BE GENERATED BY COMPONENT */}
          <FAQSection categoryName={category.name} stateName={state.name} />
        </section>
      </div>
    </>
  )
}

// FAQSection Component
function FAQSection({ categoryName, stateName }: any) {
  const faqs = [
    {
      q: `Where can I find the best ${categoryName?.toLowerCase()} in ${stateName}?`,
      a: `9jaDirectory has a comprehensive list of verified ${categoryName?.toLowerCase()} in ${stateName}. Browse the listings above, sorted by rating and popularity.`
    },
    {
      q: `How are ${categoryName?.toLowerCase()} rated on 9jaDirectory?`,
      a: `All ${categoryName?.toLowerCase()} are rated by real customers on a 5-star scale. Ratings are based on verified reviews from actual users.`
    },
    {
      q: `Can I contact ${categoryName?.toLowerCase()} directly?`,
      a: `Yes! Each listing includes phone numbers, email addresses, and direct messaging options. You can reach out to businesses directly to inquire about their services.`
    },
    {
      q: `Are all ${categoryName?.toLowerCase()} on this list verified?`,
      a: `Yes, all businesses are verified with active contact information and operating details. We ensure only legitimate, verified businesses are listed.`
    }
  ]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map((item) => ({
      '@type': 'Question',
      'name': item.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.a
      }
    }))
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      
      <div className="space-y-6">
        {faqs.map((item, i) => (
          <div key={i} className="border-l-4 border-green-600 pl-4">
            <h3 className="font-bold text-lg mb-2">{item.q}</h3>
            <p className="text-gray-700">{item.a}</p>
          </div>
        ))}
      </div>
    </>
  )
}
```

---

## 4. INTERNAL LINKING STRATEGY

### File: `components/related-and-suggestions.tsx` (NEW COMPONENT)

```typescript
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export async function RelatedListings({ listing }: { listing: any }) {
  const supabase = await createClient()

  // Related by category
  const { data: sameCategory } = await supabase
    .from('listings')
    .select('*')
    .eq('category_id', listing.category_id)
    .neq('id', listing.id)
    .eq('status', 'approved')
    .order('average_rating', { ascending: false })
    .limit(3)

  // Related by city
  const { data: sameCity } = await supabase
    .from('listings')
    .select('*')
    .eq('city', listing.city)
    .neq('category_id', listing.category_id)
    .neq('id', listing.id)
    .eq('status', 'approved')
    .order('average_rating', { ascending: false })
    .limit(3)

  // Related by state but different category
  const { data: sameState } = await supabase
    .from('listings')
    .select('*')
    .eq('state_id', listing.state_id)
    .neq('city', listing.city)
    .neq('category_id', listing.category_id)
    .neq('id', listing.id)
    .eq('status', 'approved')
    .order('average_rating', { ascending: false })
    .limit(4)

  return (
    <div className="mt-12 space-y-8">
      {/* RELATED IN SAME CATEGORY */}
      {sameCategory && sameCategory.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold mb-6">
            More {listing.categories?.name} in {listing.city}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sameCategory.map((item) => (
              <Link
                key={item.id}
                href={`/listings/${item.slug}`}
                className="group bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 border-l-4 border-green-600"
              >
                <h4 className="font-semibold group-hover:text-green-600 transition-colors">
                  {item.business_name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  📍 {item.city}
                </p>
                <p className="text-sm text-yellow-500 mt-2">
                  {'⭐'.repeat(Math.round(item.average_rating || 3))}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* RELATED IN SAME CITY, DIFFERENT CATEGORY */}
      {sameCity && sameCity.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold mb-6">
            Other Services in {listing.city}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sameCity.map((item) => (
              <Link
                key={item.id}
                href={`/listings/${item.slug}`}
                className="group bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 border-l-4 border-blue-600"
              >
                <h4 className="font-semibold group-hover:text-blue-600 transition-colors">
                  {item.business_name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {item.categories?.name}
                </p>
                <p className="text-sm text-yellow-500 mt-2">
                  {'⭐'.repeat(Math.round(item.average_rating || 3))}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* BREADCRUMB ALTERNATIVES - HELP WITH NAVIGATION */}
      <section className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-bold mb-4">Explore More</h3>
        <div className="space-y-2 text-sm">
          <Link
            href={`/categories/${listing.categories?.slug}`}
            className="text-green-600 hover:underline block"
          >
            ← All {listing.categories?.name} in Nigeria
          </Link>
          <Link
            href={`/states/${listing.states?.slug}`}
            className="text-green-600 hover:underline block"
          >
            ← All Businesses in {listing.states?.name}
          </Link>
          <Link
            href={`/categories/${listing.categories?.slug}/${listing.states?.slug}`}
            className="text-green-600 hover:underline block"
          >
            ← Best {listing.categories?.name} in {listing.states?.name}
          </Link>
        </div>
      </section>
    </div>
  )
}
```

---

## 5. SITEMAP OPTIMIZATION

**File: `app/sitemap.ts`** (ENHANCED VERSION)

```typescript
import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { blogPosts } from '@/lib/blog-data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://9jadirectory.org'
  const supabase = await createClient()

  // 1. STATIC ROUTES - HIGH PRIORITY
  const staticRoutes = [
    { path: '', priority: 1.0, frequency: 'daily' as const },
    { path: '/search', priority: 0.9, frequency: 'daily' as const },
    { path: '/blog', priority: 0.8, frequency: 'weekly' as const },
    { path: '/categories', priority: 0.9, frequency: 'weekly' as const },
    { path: '/states', priority: 0.9, frequency: 'weekly' as const },
    { path: '/add-business', priority: 0.7, frequency: 'weekly' as const },
    { path: '/about', priority: 0.6, frequency: 'monthly' as const },
    { path: '/contact', priority: 0.6, frequency: 'monthly' as const },
    { path: '/faq', priority: 0.7, frequency: 'monthly' as const },
  ]

  const routes = staticRoutes.map(({ path, priority, frequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: frequency,
    priority,
  }))

  // 2. BLOG POSTS
  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // 3. CATEGORIES - FETCH ALL
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')

  const categoryUrls = (categories || []).map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: new Date(cat.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // 4. STATES
  const { data: states } = await supabase
    .from('states')
    .select('slug, updated_at')

  const stateUrls = (states || []).map((state) => ({
    url: `${baseUrl}/states/${state.slug}`,
    lastModified: new Date(state.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  // 5. ✅ NEW: CATEGORY + STATE COMBINATION PAGES
  // This is the BIG traffic driver!
  const categoryStateUrls: any[] = []
  
  categories?.forEach((category) => {
    states?.forEach((state) => {
      categoryStateUrls.push({
        url: `${baseUrl}/categories/${category.slug}/${state.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8, // High priority for these money pages
      })
    })
  })

  // 6. LISTINGS - ONLY APPROVED ONES
  const { data: listings } = await supabase
    .from('listings')
    .select('slug, updated_at')
    .eq('status', 'approved')
    .limit(10000)

  const listingUrls = (listings || []).map((listing) => ({
    url: `${baseUrl}/listings/${listing.slug}`,
    lastModified: new Date(listing.updated_at || new Date()),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // COMBINE ALL - IMPORTANT TO KEEP UNDER 50,000 URLS
  return [
    ...routes,
    ...blogUrls,
    ...categoryUrls,
    ...stateUrls,
    ...categoryStateUrls, // ✅ THE NEW HIGH-IMPACT PAGES
    ...listingUrls,
  ]
}
```

---

## 6. robots.txt OPTIMIZATION

**File: `app/robots.ts`** (ENHANCED)

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/blog/',
        '/categories/',
        '/states/',
        '/listings/',
        '/search',
      ],
      disallow: [
        '/api/',
        '/admin/',
        '/dashboard/',
        '/auth/',
        '/debug/',
        '/*.json',
        '/*?*sort=', // Avoid duplicate content from sorting
        '/*?*page=1', // Avoid duplicate content from pagination
      ],
      crawlDelay: 0.5, // Be respectful to servers
    },
    sitemap: [
      'https://9jadirectory.org/sitemap.xml',
      'https://9jadirectory.org/sitemap-listings.xml', // If you split into multiple sitemaps
    ],
  }
}
```

---

## IMPLEMENTATION CHECKLIST

- [ ] Implement dynamic metadata for listing pages
- [ ] Enhance local business schema with geo coordinates
- [ ] Create location-based category + state pages
- [ ] Implement related listings internal linking
- [ ] Update sitemap with new pages
- [ ] Add FAQ schema to search page
- [ ] Create breadcrumb navigation
- [ ] Optimize images with Next.js Image component
- [ ] Set up Google Search Console
- [ ] Monitor rankings with SEMrush/Ahrefs

---

**Next Steps:** Run these implementations in order, test thoroughly, then monitor Google Search Console for indexing progress.

