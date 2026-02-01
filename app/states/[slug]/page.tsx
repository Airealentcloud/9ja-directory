import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org'

interface StatePageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: state } = await supabase
    .from('states')
    .select('name')
    .eq('slug', slug)
    .single()

  if (!state) {
    return {
      title: 'State Not Found | 9jaDirectory'
    }
  }

  return {
    title: `Find Businesses in ${state.name} State | 9jaDirectory`,
    description: `Discover verified businesses, services, and companies in ${state.name} State, Nigeria. Browse local restaurants, hotels, healthcare, shopping, professional services and more in ${state.name}.`,
    keywords: `${state.name} businesses, ${state.name} directory, businesses in ${state.name}, ${state.name} services, ${state.name} companies, find businesses ${state.name} Nigeria`,
    openGraph: {
      title: `${state.name} State Business Directory | 9jaDirectory`,
      description: `Find trusted businesses and services in ${state.name} State`,
      url: `${siteUrl}/states/${slug}`,
      siteName: '9jaDirectory',
      locale: 'en_NG',
      type: 'website',
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
      title: `${state.name} State Business Directory | 9jaDirectory`,
      description: `Find trusted businesses and services in ${state.name} State`,
      images: ['/opengraph-image'],
    },
    alternates: {
      canonical: `${siteUrl}/states/${slug}`,
    },
  }
}

export default async function StatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: state, error: stateError } = await supabase
    .from('states')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (stateError || !state) {
    notFound()
  }

  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select(`
      id,
      business_name,
      slug,
      description,
      tagline,
      logo_url,
      address,
      phone,
      verified,
      categories (
        name,
        slug,
        icon
      ),
      cities (
        name
      )
    `)
    .eq('state_id', state.id)
    .eq('status', 'approved')
    .order('verified', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  const { count: totalCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('state_id', state.id)
    .eq('status', 'approved')

  const { data: cities } = await supabase
    .from('cities')
    .select('name, slug')
    .eq('state_id', state.id)
    .order('name', { ascending: true })
    .limit(20)

  const { data: popularCategories } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .limit(6)

  const breadcrumbJsonLd = {
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
        name: 'States',
        item: `${siteUrl}/states`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: state.name,
        item: `${siteUrl}/states/${slug}`,
      },
    ],
  }

  const placeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `${state.name} State`,
    '@id': `${siteUrl}/states/${slug}`,
    containedInPlace: {
      '@type': 'Country',
      name: 'Nigeria',
    },
    description: `Find verified businesses and services in ${state.name} State, Nigeria`,
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Businesses in ${state.name} State`,
    url: `${siteUrl}/states/${slug}`,
    numberOfItems: totalCount || 0,
    itemListElement: (listings || []).slice(0, 10).map((listing: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LocalBusiness',
        name: listing.business_name,
        url: `${siteUrl}/listings/${listing.slug}`,
        description: listing.description,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center text-sm mb-4 text-green-100">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link href="/states" className="hover:text-white">
                States
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">{state.name}</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-6xl">Map Pin</div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                  Businesses in {state.name} State
                </h1>
                <p className="text-xl text-green-100 max-w-3xl">
                  Discover trusted businesses and services across {state.name} State
                </p>
                <div className="mt-4 text-green-100">
                  <span className="font-semibold">{totalCount || 0}</span> {totalCount === 1 ? 'business' : 'businesses'} found
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="font-bold text-lg mb-4">Filter by City</h3>
                {cities && cities.length > 0 ? (
                  <div className="space-y-2 mb-6">
                    {cities.map((city) => (
                      <Link
                        key={city.slug}
                        href={`/states/${slug}?city=${city.slug}`}
                        className="block text-gray-700 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded transition-colors"
                      >
                        {city.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mb-6">No cities available</p>
                )}

                <h3 className="font-bold text-lg mb-4 mt-6">Browse Categories</h3>
                {popularCategories && popularCategories.length > 0 ? (
                  <div className="space-y-2 mb-6">
                    {popularCategories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/categories/${category.slug}?state=${slug}`}
                        className="flex items-center text-gray-700 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded transition-colors"
                      >
                        <span className="mr-2">{category.icon || 'Icon'}</span>
                        <span className="text-sm">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                ) : null}

                <Link
                  href="/states"
                  className="block text-center w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium mt-6"
                >
                  Back Arrow All States
                </Link>
              </div>
            </aside>

            <div className="flex-1">
              {listingsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                  <h3 className="text-red-800 font-semibold mb-2">
                    Error Loading Listings
                  </h3>
                  <p className="text-red-600">
                    We are having trouble loading listings. Please try again later.
                  </p>
                </div>
              )}

              {!listingsError && (!listings || listings.length === 0) && (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">Building</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    No Listings in {state.name} Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Be the first to add your business in {state.name} State!
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Add Your Business
                  </Link>
                </div>
              )}

              {listings && listings.length > 0 && (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      All Businesses in {state.name}
                    </h2>
                    <div className="text-gray-600">
                      Showing {listings.length} of {totalCount || 0}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {listings.map((listing) => (
                      <Link
                        key={listing.id}
                        href={`/listings/${listing.slug}`}
                        className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                      >
                        <div className="flex flex-col sm:flex-row">
                          <div className="w-full sm:w-48 h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0">
                            {listing.logo_url ? (
                              <img
                                src={listing.logo_url}
                                alt={listing.business_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-5xl">{(listing.categories as any)?.icon || 'Building'}</div>
                            )}
                          </div>

                          <div className="flex-1 p-6">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 hover:text-green-600">
                                  {listing.business_name}
                                </h3>
                                {listing.tagline && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {listing.tagline}
                                  </p>
                                )}
                              </div>
                              {listing.verified && (
                                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 flex-shrink-0 ml-4">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Verified
                                </span>
                              )}
                            </div>

                            {listing.description && (
                              <p className="text-gray-600 mt-3 line-clamp-2">
                                {listing.description}
                              </p>
                            )}

                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                              {listing.categories && (
                                <div className="flex items-center">
                                  <span className="mr-1">{(listing.categories as any).icon || 'Tag'}</span>
                                  {(listing.categories as any).name}
                                </div>
                              )}
                              {listing.cities && (
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {(listing.cities as any).name}, {state.name}
                                </div>
                              )}
                              {listing.phone && (
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {listing.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {listings.length >= 50 && (
                    <div className="mt-8 text-center">
                      <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                        Load More Businesses
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white border-t border-gray-200 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              About {state.name} State Business Directory
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="mb-4">
                Welcome to the comprehensive business directory for <strong>{state.name} State</strong>, Nigeria.
                Our platform connects you with {totalCount || 0}+ verified businesses and service providers across {state.name}.
              </p>
              <p className="mb-4">
                Whether you are looking for restaurants, hotels, healthcare services, professional services,
                shopping, entertainment, or any other business category, 9jaDirectory makes it easy to find
                trusted local businesses in {state.name} State.
              </p>
              <p className="mb-4">
                All businesses listed on 9jaDirectory are verified to ensure accuracy and reliability.
                Search by city, browse by category, or explore featured businesses to find exactly what you need in {state.name}.
              </p>
              {cities && cities.length > 0 && (
                <p>
                  <strong>Popular cities in {state.name}:</strong> {cities.map(c => c.name).join(', ')}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="bg-green-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Own a Business in {state.name}?
            </h2>
            <p className="text-xl mb-8 text-green-100">
              List your business and reach thousands of potential customers in {state.name} State
            </p>
            <Link
              href="/pricing"
              className="inline-block px-8 py-4 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 text-lg transition-colors"
            >
              Add Your {state.name} Business - Free
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
