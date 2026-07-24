import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { SITE_URL } from '@/lib/seo/site-url'
import { createPublicClient } from '@/lib/supabase/public'
import {
  MIN_INDEXABLE_CATEGORY_STATE_LISTINGS,
  isIndexableListing,
} from '@/lib/seo/listing-quality'

const siteUrl = SITE_URL

function getListingImage(listing: { logo_url?: unknown; images?: unknown }): string | null {
  if (typeof listing.logo_url === 'string' && listing.logo_url.trim()) {
    return listing.logo_url.trim()
  }

  let images = listing.images
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images)
    } catch {
      images = []
    }
  }

  if (!Array.isArray(images)) return null
  return images.find((image): image is string => typeof image === 'string' && image.trim().length > 0) || null
}

function buildMetaTitle(primaryTitle: string): string {
  const brandedTitle = `${primaryTitle} | 9jaDirectory`
  return brandedTitle.length <= 60 ? brandedTitle : primaryTitle
}

// ✅ GENERATE DYNAMIC METADATA FOR STATE + CATEGORY COMBINATION
export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string; stateSlug: string }>
}): Promise<Metadata> {
  const { categorySlug, stateSlug } = await params
  const isRealEstate = categorySlug === 'real-estate'
  const supabase = createPublicClient()

  const { data: category } = await supabase
    .from('categories')
    .select('id, name, description')
    .eq('slug', categorySlug)
    .single()

  const { data: state } = await supabase
    .from('states')
    .select('id, name')
    .eq('slug', stateSlug)
    .single()

  if (!category || !state) {
    return { title: 'Page Not Found', description: 'The page you are looking for does not exist.' }
  }

  const categoryName = category.name
  const stateDisplayName = stateSlug === 'fct' ? 'Abuja' : state.name
  const stateLongName = stateSlug === 'fct' ? 'Abuja (FCT)' : state.name

  // ✅ OPTIMIZED FOR LOCAL KEYWORDS WITH MODIFIERS
  const currentYear = new Date().getFullYear()
  const title = isRealEstate
    ? buildMetaTitle(`Real Estate Companies in ${stateDisplayName}`)
    : buildMetaTitle(`${categoryName} in ${stateDisplayName}`)
  const description = isRealEstate
    ? `Find approved real estate companies, agencies, and developers in ${stateLongName}. Compare listings, contact details, locations, and Verified badges where shown.`
    : `Find approved ${categoryName.toLowerCase()} in ${stateLongName}. Compare listings, contact details, locations, and Verified badges where shown.`

  const keywords = isRealEstate
    ? [
        `real estate companies in ${stateDisplayName}`,
        `best real estate company in ${stateDisplayName}`,
        `real estate agencies in ${stateDisplayName}`,
        `property developers in ${stateDisplayName}`,
        `real estate directory ${stateDisplayName}`,
        `real estate ${stateDisplayName} ${currentYear}`,
        `top real estate ${stateDisplayName}`,
        `real estate agents ${stateDisplayName}`,
      ]
    : [
        `${categoryName} in ${stateDisplayName}`,
        `best ${categoryName} in ${stateDisplayName}`,
        `${categoryName} near me ${stateDisplayName}`,
        `top rated ${categoryName} ${stateDisplayName}`,
        `verified ${categoryName} ${stateDisplayName}`,
        `${stateDisplayName} ${categoryName} directory`,
        `${categoryName} ${stateDisplayName} ${currentYear}`,
        `where to find ${categoryName} ${stateDisplayName}`,
        `${categoryName} services ${stateDisplayName}`,
      ]

  // Count only strong listings for indexability. One weak imported business is
  // not enough value for an AdSense-facing local category page.
  const { data: qualityCheckListings } = await supabase
    .from('listings')
    .select(`
      description,
      phone,
      email,
      website,
      website_url,
      address,
      logo_url,
      images,
      opening_hours,
      services_offered,
      verified,
      claimed
    `)
    .eq('category_id', category.id ?? '')
    .eq('state_id', state.id ?? '')
    .eq('status', 'approved')
    .limit(50)

  const indexableListingCount = (qualityCheckListings || [])
    .filter((listing) => isIndexableListing(listing)).length

  const robotsDirective =
    indexableListingCount >= MIN_INDEXABLE_CATEGORY_STATE_LISTINGS
      ? { index: true, follow: true }
      : { index: false, follow: true }

  return {
    title,
    description,
    keywords: keywords.join(', '),
    robots: robotsDirective,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/categories/${categorySlug}/${stateSlug}`,
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
      canonical: `${siteUrl}/categories/${categorySlug}/${stateSlug}`,
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
  const isRealEstate = categorySlug === 'real-estate'
  const supabase = createPublicClient()

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

  const stateDisplayName = state.slug === 'fct' ? 'Abuja' : state.name
  const stateLongName = state.slug === 'fct' ? 'Abuja (FCT)' : state.name
  const categoryLabel = isRealEstate ? 'Real Estate Companies' : category.name
  const categoryLabelLower = isRealEstate ? 'real estate companies' : category.name.toLowerCase()



  // Fetch listings for this category + state combination. Active featured
  // placements lead, followed by Verified listings and then recent listings.
  let { data: listings, count: totalCount, error: listingsError } = await supabase
    .from('listings')
    .select('id, business_name, slug, description, tagline, logo_url, images, address, phone, plan_tier, verified, featured, featured_until, average_rating, city', { count: 'exact' })
    .eq('category_id', category.id)
    .eq('state_id', state.id)
    .eq('status', 'approved')
    .order('featured', { ascending: false })
    .order('featured_until', { ascending: false, nullsFirst: false })
    .order('verified', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(30)

  // If the first query errored (e.g. missing column), fall back to minimal safe query
  if (listingsError) {
    const fallback = await supabase
      .from('listings')
      .select('id, business_name, slug, description, tagline, logo_url, images, address, phone, verified', { count: 'exact' })
      .eq('category_id', category.id)
      .eq('state_id', state.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(30)
    listings = fallback.data as typeof listings
    totalCount = fallback.count
    listingsError = fallback.error
  }

  // Get stats
  const avgRating = listings && listings.length > 0
    ? (listings.reduce((sum, l) => sum + (Number((l as any).average_rating) || 0), 0) / listings.length).toFixed(1)
    : 'N/A'

  const verified = listings?.filter(l => l.verified).length || 0
  const topListing = listings && listings.length > 0 ? listings[0] : null
  const topRating = topListing ? Number((topListing as any).average_rating) : Number.NaN

  // ✅ COLLECTION PAGE SCHEMA FOR BETTER INDEXING
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteUrl}/categories/${categorySlug}/${stateSlug}#page`,
    name: `Best ${categoryLabel} in ${stateDisplayName}`,
    description: `Directory of approved ${categoryLabelLower} in ${stateLongName}`,
    url: `${siteUrl}/categories/${categorySlug}/${stateSlug}`,
    image: `${siteUrl}/opengraph-image`,
    publisher: {
      '@type': 'Organization',
      name: '9jaDirectory',
      url: siteUrl,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: listings?.length || 0,
      itemListElement: (listings || []).map((listing, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'LocalBusiness',
          name: listing.business_name,
          url: `${siteUrl}/listings/${listing.slug}`,
          ...(listing.city ? { address: { '@type': 'PostalAddress', addressLocality: listing.city, addressCountry: 'NG' } } : {}),
        },
      })),
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
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Categories',
        item: `${siteUrl}/categories`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryLabel,
        item: `${siteUrl}/categories/${categorySlug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: stateDisplayName,
        item: `${siteUrl}/states/${stateSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: `${categoryLabel} in ${stateDisplayName}`,
        item: `${siteUrl}/categories/${categorySlug}/${stateSlug}`,
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
                  Best {categoryLabel} in {stateDisplayName}
                </h1>
                <p className="text-green-100 mt-2">
                  Browse approved listings, customer ratings where available, and Verified badges where shown
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
              <div className="text-sm text-gray-600 mt-1">Approved {categoryLabel}</div>
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
              <div className="text-sm text-gray-600 mt-1">Free to Browse</div>
            </div>
          </div>
        </section>

        {isRealEstate && topListing && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-green-600 font-semibold">
                    Directory Highlight in {stateDisplayName}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                    Explore a Real Estate Company in {stateDisplayName}
                  </h2>
                  <p className="text-gray-700 mt-3">
                    {topListing.business_name}
                    {topListing.description ? ` - ${topListing.description}` : '.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topListing.featured &&
                    topListing.featured_until &&
                    new Date(topListing.featured_until) > new Date() && (
                      <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 text-xs px-3 py-1 rounded-full font-semibold">
                        Featured
                      </span>
                    )}
                  {topListing.verified && (
                    <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                      Verified
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-600">
                {Number.isFinite(topRating) && (
                  <div>Rating: {topRating.toFixed(1)} / 5</div>
                )}
                {topListing.city && <div>City: {topListing.city}</div>}
              </div>
              <div className="mt-6">
                <Link
                  href={`/listings/${topListing.slug}`}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  View {topListing.business_name}
                </Link>
              </div>
            </div>
          </section>
        )}


        {/* ✅ RICH DESCRIPTION FOR SEO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Looking for the Best {categoryLabel} in {stateDisplayName}?
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Browse {totalCount} approved {categoryLabelLower} across {stateLongName}. Compare the information
              supplied by each business, check ratings where reviews are available, and look for a Verified badge
              where shown before deciding which provider fits your needs.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">✅ Why Choose These {categoryLabel}?</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Approved listings are grouped by business category and location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Verified badges are shown only on eligible approved listings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Customer ratings appear where moderated reviews are available</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Available contact methods are supplied by each business</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Business owners can submit updates to their listing details</span>
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
            Browse {totalCount} {categoryLabel} in {stateDisplayName}
          </h2>

          {listingsError ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500 text-base">
                Listings are temporarily unavailable. Please check back shortly.
              </p>
            </div>
          ) : !listings || listings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600 text-lg">
                No {categoryLabelLower} found in {stateDisplayName} yet.
              </p>
              <p className="text-gray-500 mt-2 mb-6">
                Be the first to list your business!
              </p>
              <Link
                href="/pricing"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Add Your Business →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => {
                const imageUrl = getListingImage(listing)
                const featuredUntil = listing.featured_until
                  ? new Date(listing.featured_until)
                  : null
                const hasActiveFeaturedPlacement = Boolean(
                  listing.featured &&
                  featuredUntil &&
                  !Number.isNaN(featuredUntil.getTime()) &&
                  featuredUntil > new Date()
                )
                return (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.slug}`}
                  prefetch={false}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden group"
                >
                  {/* Image */}
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={listing.business_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 text-5xl">
                        {category.icon || '🏢'}
                      </div>
                    )}
                    {hasActiveFeaturedPlacement && (
                      <div className="absolute top-3 right-3 bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs font-bold">
                        Featured
                      </div>
                    )}
                    {listing.verified && (
                      <div className={`absolute ${hasActiveFeaturedPlacement ? 'top-12' : 'top-3'} right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
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
                )
              })}
            </div>
          )}
        </section>

        {/* ✅ FAQ SECTION FOR FEATURED SNIPPETS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Frequently Asked Questions About {categoryLabel} in {stateDisplayName}
            </h2>

            <div className="space-y-6">
              {[
                {
                  q: `Where can I find the best ${categoryLabelLower} in ${stateDisplayName}?`,
                  a: `Browse approved ${categoryLabelLower} in ${stateDisplayName} above and compare their supplied details, ratings where available, and Verified badges where shown.`,
                },
                {
                  q: `How are ${categoryLabelLower} rated on 9jaDirectory?`,
                  a: `Listings show a 5-star customer rating only where moderated reviews are available. Some businesses may not have reviews yet.`,
                },
                {
                  q: `Can I contact ${categoryLabelLower} directly through 9jaDirectory?`,
                  a: `Listings display the contact methods supplied by the business, which may include phone, email, WhatsApp, address, or a website.`,
                },
                {
                  q: `Are all ${categoryLabelLower} on this list verified?`,
                  a: `No. Every public listing is reviewed before publication, but only eligible Premium and Lifetime listings display a Verified badge after approval.`,
                },
                {
                  q: `How often is the ${categoryLabelLower} directory updated?`,
                  a: `New listings and owner-submitted updates appear after moderation. Contact details are supplied by each business, so confirm important details directly before paying or visiting.`,
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
                ← All {categoryLabel} in Nigeria
              </Link>
              <Link
                href={`/states/${stateSlug}`}
                className="bg-white p-4 rounded-lg hover:shadow-lg transition-shadow text-blue-600 hover:text-blue-700 font-semibold"
              >
                ← All Businesses in {stateDisplayName}
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
