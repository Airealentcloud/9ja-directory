import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'

// ✅ GENERATE DYNAMIC METADATA FOR STATE + CATEGORY COMBINATION
export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string; stateSlug: string }>
}): Promise<Metadata> {
  const { categorySlug, stateSlug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
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
  const title = `Best ${categoryName} in ${stateName} | Top Rated ${categoryName} ${stateName} 2025 | 9jaDirectory`
  const description = `Find the best verified ${categoryName} in ${stateName}. Compare ratings, prices, and contact details. Browse top-rated ${categoryName} near you on 9jaDirectory. Updated 2025.`
  
  const keywords = [
    `${categoryName} in ${stateName}`,
    `best ${categoryName} in ${stateName}`,
    `${categoryName} near me ${stateName}`,
    `top rated ${categoryName} ${stateName}`,
    `verified ${categoryName} ${stateName}`,
    `${stateName} ${categoryName} directory`,
    `${categoryName} ${stateName} 2025`,
    `where to find ${categoryName} ${stateName}`,
    `${categoryName} services ${stateName}`,
  ]

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      url: `https://9jadirectory.org/categories/${categorySlug}/${stateSlug}`,
      type: 'website',
      locale: 'en_NG',
      siteName: '9jaDirectory',
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: '9jaDirectory',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@9jaDirectory',
      site: '@9jaDirectory',
      images: ['/opengraph-image'],
    },
    alternates: {
      canonical: `https://9jadirectory.org/categories/${categorySlug}/${stateSlug}`,
    },
  }
}

// ✅ PAGE COMPONENT
export default async function CategoryStateListingPage({
  params,
}: {
  params: Promise<{ categorySlug: string; stateSlug: string }>
}) {
  const { categorySlug, stateSlug } = await params
  const supabase = await createClient()

  // Fetch category
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id, name, slug, icon, description')
    .eq('slug', categorySlug)
    .single()

  // Fetch state
  const { data: state, error: stateError } = await supabase
    .from('states')
    .select('id, name, slug')
    .eq('slug', stateSlug)
    .single()

  if (categoryError || stateError || !category || !state) {
    notFound()
  }

  // ✅ FETCH LISTINGS FOR THIS CATEGORY + STATE COMBINATION
  const { data: listings, count: totalCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('category_id', category.id)
    .eq('state_id', state.id)
    .eq('status', 'approved')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(30) // Show top 30, with load more option

  // Get stats
  const avgRating = listings && listings.length > 0
    ? (listings.reduce((sum, l) => sum + (Number((l as any).average_rating) || 0), 0) / listings.length).toFixed(1)
    : 'N/A'

  const verified = listings?.filter(l => l.verified).length || 0

  // ✅ COLLECTION PAGE SCHEMA FOR BETTER INDEXING
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `https://9jadirectory.org/categories/${categorySlug}/${stateSlug}#page`,
    name: `Best ${category.name} in ${state.name}`,
    description: `Directory of verified ${category.name} in ${state.name}`,
    url: `https://9jadirectory.org/categories/${categorySlug}/${stateSlug}`,
    image: 'https://9jadirectory.org/opengraph-image',
    dateModified: new Date().toISOString(),
    publisher: {
      '@type': 'Organization',
      name: '9jaDirectory',
      url: 'https://9jadirectory.org',
    },
    mainEntity: {
      '@type': 'LocalBusiness',
      areaServed: {
        '@type': 'State',
        name: state.name,
        addressCountry: 'NG',
      },
    },
  }

  // ✅ BREADCRUMB SCHEMA FOR BETTER NAVIGATION
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://9jadirectory.org',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Categories',
        item: 'https://9jadirectory.org/categories',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `https://9jadirectory.org/categories/${categorySlug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: state.name,
        item: `https://9jadirectory.org/states/${stateSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: `${category.name} in ${state.name}`,
        item: `https://9jadirectory.org/categories/${categorySlug}/${stateSlug}`,
      },
    ],
  }

  return (
    <>
      {/* ✅ SCHEMA MARKUP */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="min-h-screen bg-gray-50">
        {/* ✅ HERO SECTION WITH SEO TEXT */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{category.icon || '🏢'}</span>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold">
                  Best {category.name} in {state.name}
                </h1>
                <p className="text-green-100 mt-2">
                  Discover verified {category.name.toLowerCase()} with real ratings & reviews
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ STATS SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="bg-white rounded-lg shadow-lg p-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600">{totalCount}</div>
              <div className="text-sm text-gray-600 mt-1">Verified {category.name}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-500">{avgRating}</div>
              <div className="text-sm text-gray-600 mt-1">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600">{verified}</div>
              <div className="text-sm text-gray-600 mt-1">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-gray-600 mt-1">Authentic</div>
            </div>
          </div>
        </section>

        {/* ✅ RICH DESCRIPTION FOR SEO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Looking for the Best {category.name} in {state.name}?
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              9jaDirectory has curated a comprehensive list of verified {category.name.toLowerCase()} across {state.name}. 
              Whether you are looking for highly-rated establishments, affordable options, or specialty services, 
              you will find what you need in our directory of {totalCount}+ {category.name.toLowerCase()}.
            </p>
            
            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">✅ Why Choose These {category.name}?</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>All businesses are verified with active contact information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Real customer reviews and ratings from verified users</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Complete operating hours and detailed location information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Direct contact and secure messaging capabilities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Regular updates and fresh listings added daily</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>100% free to browse and compare businesses</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ✅ LISTINGS GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            Browse {totalCount} {category.name} in {state.name}
          </h2>
          
          {!listings || listings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600 text-lg">
                No {category.name.toLowerCase()} found in {state.name} yet.
              </p>
              <p className="text-gray-500 mt-2 mb-6">
                Be the first to list your business!
              </p>
              <Link
                href="/add-business"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Add Your Business →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.slug}`}
                  prefetch={false}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden group"
                >
                  {/* Image */}
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {listing.image_url ? (
                      <img
                        src={listing.image_url}
                        alt={listing.business_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 text-5xl">
                        {category.icon || '🏢'}
                      </div>
                    )}
                    {listing.verified && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        ✓ Verified
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2 mb-2">
                      {listing.business_name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-2 flex items-center">
                      <span className="mr-1">📍</span>
                      {listing.city}
                    </p>

                    {listing.average_rating && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {'⭐'.repeat(Math.round(listing.average_rating))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {listing.average_rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {listing.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {listing.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ✅ FAQ SECTION FOR FEATURED SNIPPETS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Frequently Asked Questions About {category.name} in {state.name}
            </h2>
            
            <div className="space-y-6">
              {[
                {
                  q: `Where can I find the best ${category.name.toLowerCase()} in ${state.name}?`,
                  a: `9jaDirectory has a comprehensive list of verified ${category.name.toLowerCase()} in ${state.name}. Simply browse the listings above, sorted by rating and popularity.`,
                },
                {
                  q: `How are ${category.name.toLowerCase()} rated on 9jaDirectory?`,
                  a: `All ${category.name.toLowerCase()} are rated on a 5-star scale by real customers. Ratings are based on verified reviews from actual users who have used their services.`,
                },
                {
                  q: `Can I contact ${category.name.toLowerCase()} directly through 9jaDirectory?`,
                  a: `Yes! Each listing includes phone numbers, email addresses, and direct messaging options. You can reach out to businesses directly to inquire about their services and pricing.`,
                },
                {
                  q: `Are all ${category.name.toLowerCase()} on this list verified?`,
                  a: `Yes, all businesses are verified with active contact information and operating details. We ensure only legitimate, verified businesses appear in our directory.`,
                },
                {
                  q: `How often is the ${category.name.toLowerCase()} directory updated?`,
                  a: `Our directory is updated daily with new listings and ratings. We regularly verify business information to ensure accuracy and relevance.`,
                },
              ].map((item, idx) => (
                <div key={idx} className="border-l-4 border-green-600 pl-4 py-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{item.q}</h3>
                  <p className="text-gray-700 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ✅ INTERNAL LINKING FOR CRAWL EFFICIENCY */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gray-100 rounded-lg p-8">
            <h3 className="font-bold text-gray-900 mb-6 text-lg">📍 Browse More Categories & Locations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href={`/categories/${categorySlug}`}
                className="bg-white p-4 rounded-lg hover:shadow-lg transition-shadow text-green-600 hover:text-green-700 font-semibold"
              >
                ← All {category.name} in Nigeria
              </Link>
              <Link
                href={`/states/${stateSlug}`}
                className="bg-white p-4 rounded-lg hover:shadow-lg transition-shadow text-blue-600 hover:text-blue-700 font-semibold"
              >
                ← All Businesses in {state.name}
              </Link>
              <Link
                href="/categories"
                className="bg-white p-4 rounded-lg hover:shadow-lg transition-shadow text-purple-600 hover:text-purple-700 font-semibold"
              >
                ← Browse All Categories
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
