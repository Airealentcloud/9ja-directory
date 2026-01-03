import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCategoryContent } from '@/lib/content/category-content'
import { getCategorySEOContent } from '@/lib/content/category-seo-content'
import Breadcrumbs from '@/components/ui/breadcrumbs'
import {
  generateCategoryItemListSchema,
  generateCategoryBreadcrumbSchema,
  generateCategoryCollectionSchema,
} from '@/lib/schema/category-page'

interface CategoryPageProps {
  params: Promise<{
    categorySlug: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}

const LISTINGS_PER_PAGE = 12

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ categorySlug: string }> }): Promise<Metadata> {
  const { categorySlug: slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!category) {
    return {
      title: 'Category Not Found | 9jaDirectory'
    }
  }

  const seoContent = getCategorySEOContent(slug)

  const isRealEstate = slug === 'real-estate'
  const title = isRealEstate
    ? 'Real Estate Companies in Nigeria | 9jaDirectory'
    : `${category.name} in Nigeria | 9jaDirectory`
  const description = isRealEstate
    ? 'Find verified real estate agencies, property developers, and agents across Nigeria. Compare top real estate companies in Lagos, Abuja (FCT), and major cities.'
    : seoContent?.introText ||
      category.description ||
      `Find the best ${category.name} businesses across Nigeria. Browse verified listings in all 36 states + FCT.`

  const canonical = `https://9jadirectory.org/categories/${slug}`

  return {
    title,
    description,
    keywords: isRealEstate
      ? [
          'real estate companies in Nigeria',
          'real estate agencies in Nigeria',
          'property developers in Nigeria',
          'real estate company Lagos',
          'real estate company Abuja',
          'real estate directory Nigeria',
          'real estate agents Nigeria',
          '9jaDirectory',
        ]
      : [
          `${category.name} in Nigeria`,
          `best ${category.name} in Nigeria`,
          `${category.name} directory Nigeria`,
          `verified ${category.name} Nigeria`,
          'Nigeria business directory',
          '9jaDirectory',
        ],
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
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
      title,
      description,
      images: ['/opengraph-image'],
    },
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { categorySlug: slug } = await params
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10))
  const supabase = await createClient()

  // Fetch category details
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id, name, slug, description, icon')
    .eq('slug', slug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // Get total count for pagination
  const { count: totalCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', category.id)
    .eq('status', 'approved')

  const totalPages = Math.ceil((totalCount || 0) / LISTINGS_PER_PAGE)
  const offset = (currentPage - 1) * LISTINGS_PER_PAGE

  // Fetch paginated listings for this category
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select(
      `
      id,
      category_id,
      business_name,
      slug,
      description,
      phone,
      verified,
      categories(id, name, slug),
      states(id, name, slug)
    `
    )
    .eq('category_id', category.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(offset, offset + LISTINGS_PER_PAGE - 1)

  // Defensive filter to prevent accidental cross-category bleed
  const filteredListings =
    (listings || []).filter((listing) => listing.category_id === category.id)

  // Get category content
  const categoryContent = getCategoryContent(slug)
  const seoContent = getCategorySEOContent(slug)
  const isRealEstate = slug === 'real-estate'
  const headerTitle = isRealEstate ? 'Real Estate Companies in Nigeria' : category.name
  const headerDescription = isRealEstate
    ? 'Verified real estate agencies, developers, and agents across Nigeria.'
    : category.description

  // Generate schema markup
  const itemListSchema = generateCategoryItemListSchema(category, filteredListings, totalCount || 0)
  const breadcrumbSchema = generateCategoryBreadcrumbSchema(category)
  const collectionSchema = generateCategoryCollectionSchema(category, totalCount || 0)
  const faqSchema = seoContent?.faqs
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: seoContent.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }
    : null

  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <Breadcrumbs
              items={[
                { label: 'Categories', href: '/categories' },
                { label: category.name, href: `/categories/${category.slug}` },
              ]}
              className="text-green-100 mb-4"
            />

            {/* Category Header */}
            <div className="flex items-start gap-4">
              {category.icon && (
                <div className="text-6xl">{category.icon}</div>
              )}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                  {headerTitle}
                </h1>
                {headerDescription && (
                  <p className="text-xl text-green-100 max-w-3xl">
                    {headerDescription}
                  </p>
                )}
                <div className="mt-4 text-green-100">
                  <span className="font-semibold">{totalCount || 0}</span> {(totalCount || 0) === 1 ? 'business' : 'businesses'} found
                  {totalPages > 1 && (
                    <span className="ml-2">• Page {currentPage} of {totalPages}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <p className="text-gray-800 leading-relaxed">
              {seoContent?.introText ||
                category.description ||
                `Explore verified ${category.name.toLowerCase()} providers across Nigeria. Compare services, read details, and reach out directly to find the right partner.`}
            </p>
            {seoContent?.tips && seoContent.tips.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick tips</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {seoContent.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {isRealEstate && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Best Real Estate Companies by City</h2>
              <p className="text-gray-700 mb-4">
                Looking for the best real estate company in Lagos or Abuja? Start with the top city pages below to compare
                verified agencies, developers, and agents.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/categories/real-estate/lagos"
                  className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-green-700 font-semibold hover:bg-green-50 transition-colors"
                >
                  Best Real Estate Companies in Lagos
                </Link>
                <Link
                  href="/categories/real-estate/fct"
                  className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-green-700 font-semibold hover:bg-green-50 transition-colors"
                >
                  Best Real Estate Companies in Abuja (FCT)
                </Link>
                <Link
                  href="/categories/real-estate/rivers"
                  className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-green-700 font-semibold hover:bg-green-50 transition-colors"
                >
                  Real Estate in Port Harcourt
                </Link>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Filters */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="font-bold text-lg mb-4">Filter Results</h3>

                {/* State Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">All States</option>
                    <option value="lagos">Lagos</option>
                    <option value="abuja">Abuja</option>
                    <option value="rivers">Rivers</option>
                  </select>
                </div>

                {/* Verified Filter */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Verified Only</span>
                  </label>
                </div>

                {/* Back to Categories */}
                <Link
                  href="/categories"
                  className="block text-center w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  &larr; All Categories
                </Link>
              </div>
            </aside>

            {/* Listings Grid */}
            <div className="flex-1">
              {/* LISTINGS APPEAR FIRST FOR QUICK ACCESS */}
              {/* Error State */}
              {listingsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                  <h3 className="text-red-800 font-semibold mb-2">
                    Error Loading Listings
                  </h3>
                  <p className="text-red-600">
                    We are having trouble loading listings. Please try again later.
                  </p>
                </div>
              )}

              {/* Empty State */}
              {!listingsError && (!listings || listings.length === 0) && (
                <div className="bg-white rounded-lg shadow-md p-12 text-center mb-8">
                  {category.icon && (
                    <div className="text-6xl mb-4">{category.icon}</div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    No Listings Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Be the first to add your business in this category!
                  </p>
                  <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                    Add Your Business
                  </button>
                </div>
              )}

              {/* Trust Signals Box */}
              {listings && listings.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {/* Verified Stats */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <h3 className="font-semibold text-gray-800">Verified Listings</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{listings.filter((l) => l.verified).length}</p>
                    <p className="text-sm text-gray-600 mt-1">Out of {listings.length} total</p>
                  </div>

                  {/* Geographic Coverage */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <h3 className="font-semibold text-gray-800">Coverage</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">36+</p>
                    <p className="text-sm text-gray-600 mt-1">States & FCT</p>
                  </div>

                  {/* Quality Assurance */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <h3 className="font-semibold text-gray-800">Quality</h3>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">4.8ƒ~.</p>
                    <p className="text-sm text-gray-600 mt-1">Avg. Rating</p>
                  </div>
                </div>
              )}

              {/* Pro Tip Callout */}
              {listings && listings.length > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4 mb-8">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-amber-800">
                        dY'­ <strong>Pro Tip:</strong> Filter by verified listings to ensure reliability, or search by state to find businesses near you.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Listings Grid */}
              {listings && listings.length > 0 && (
                <div className="space-y-6 mb-12">
                  <h2 className="text-2xl font-bold text-gray-900">Browse {category.name} Listings</h2>
              {filteredListings.map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/listings/${listing.slug}`}
                      prefetch={false}
                      className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                    >
                      <div className="flex flex-col sm:flex-row">
                        {/* Logo */}
                        <div className="w-full sm:w-48 h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0 group-hover:from-green-200 group-hover:to-green-300 transition-colors">
                          {category.icon ? (
                            <div className="text-5xl">{category.icon}</div>
                          ) : (
                            <div className="text-2xl font-bold text-green-600">
                              {listing.business_name.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                  {listing.business_name}
                                </h3>
                              </div>
                              {listing.verified && (
                                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 flex-shrink-0">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  ƒo" Verified
                                </span>
                              )}
                            </div>

                            {listing.description && (
                              <p className="text-gray-600 mt-3 line-clamp-2">
                                {listing.description}
                              </p>
                            )}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                            {listing.states && (
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {(listing as any).cities?.name ? `${(listing as any).cities.name}, ` : ''}{(listing.states as any)?.name}
                              </div>
                            )}
                            {listing.phone && (
                              <div className="flex items-center hover:text-green-600 transition-colors cursor-pointer">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {listing.phone}
                              </div>
                            )}
                          </div>

                          {/* CTA Button */}
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm font-semibold text-green-600">View Details ƒ+'</span>
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors hidden sm:inline-block">
                              Contact
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {/* Previous Page */}
                  {currentPage > 1 ? (
                    <Link
                      href={`/categories/${category.slug}${currentPage > 2 ? `?page=${currentPage - 1}` : ''}`}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </Link>
                  ) : (
                    <span className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg font-medium text-gray-400 flex items-center gap-1 cursor-not-allowed">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </span>
                  )}

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Link
                          key={pageNum}
                          href={`/categories/${category.slug}${pageNum > 1 ? `?page=${pageNum}` : ''}`}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-green-600 text-white'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </Link>
                      )
                    })}
                  </div>

                  {/* Next Page */}
                  {currentPage < totalPages ? (
                    <Link
                      href={`/categories/${category.slug}?page=${currentPage + 1}`}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      Next
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ) : (
                    <span className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg font-medium text-gray-400 flex items-center gap-1 cursor-not-allowed">
                      Next
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </div>
              )}

              {seoContent?.faqs && seoContent.faqs.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-8 mt-12 mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Frequently Asked Questions about {category.name}
                  </h3>
                  <div className="space-y-4">
                    {seoContent.faqs.map((faq, index) => (
                      <details key={index} className="group">
                        <summary className="cursor-pointer font-semibold text-gray-900 hover:text-green-600 transition-colors list-none flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <span>{faq.question}</span>
                          <svg
                            className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="mt-2 p-4 text-gray-700 leading-relaxed">
                          {faq.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
