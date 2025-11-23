import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCategoryContent } from '@/lib/content/category-content'
import {
  generateCategoryItemListSchema,
  generateCategoryBreadcrumbSchema,
  generateCategoryCollectionSchema,
} from '@/lib/schema/category-page'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!category) {
    return {
      title: 'Category Not Found | 9ja Directory'
    }
  }

  return {
    title: `${category.name} in Nigeria | 9ja Directory`,
    description: category.description || `Find the best ${category.name} businesses across Nigeria. Browse verified listings in all 36 states + FCT.`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
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

  // Fetch listings in this category
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select(`
      id,
      business_name,
      slug,
      description,
      address,
      phone,
      verified,
      states (
        name,
        slug
      ),
      cities (
        name
      )
    `)
    .eq('category_id', category.id)
    .eq('status', 'approved')
    .order('verified', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  // Get total count
  const { count: totalCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', category.id)
    .eq('status', 'approved')

  // Generate schemas
  const itemListSchema = generateCategoryItemListSchema(category, listings || [], totalCount || 0)
  const breadcrumbSchema = generateCategoryBreadcrumbSchema(category)
  const collectionSchema = generateCategoryCollectionSchema(category, totalCount || 0)

  // Get category-specific SEO content
  const categoryContent = getCategoryContent(slug)

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

      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm mb-4 text-green-100">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link href="/categories" className="hover:text-white">
                Categories
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">{category.name}</span>
            </div>

            {/* Category Header */}
            <div className="flex items-start gap-4">
              {category.icon && (
                <div className="text-6xl">{category.icon}</div>
              )}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-xl text-green-100 max-w-3xl">
                    {category.description}
                  </p>
                )}
                <div className="mt-4 text-green-100">
                  <span className="font-semibold">{totalCount || 0}</span> {totalCount === 1 ? 'business' : 'businesses'} found
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              {/* SEO Intro Content */}
              {categoryContent && (
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {categoryContent.intro.title}
                  </h2>
                  <div className="prose prose-green max-w-none text-gray-700 space-y-4">
                    <p>{categoryContent.intro.description}</p>

                    <div className="grid md:grid-cols-2 gap-6 my-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">🏘️ Popular Services</h3>
                        <ul className="space-y-1 text-sm">
                          {categoryContent.intro.services.map((service, idx) => (
                            <li key={idx}>• {service}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">📍 Top Locations</h3>
                        <ul className="space-y-1 text-sm">
                          {categoryContent.intro.locations.map((location, idx) => (
                            <li key={idx} dangerouslySetInnerHTML={{ __html: location }} />
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
                      <p className="text-sm" dangerouslySetInnerHTML={{ __html: categoryContent.intro.featuredCompanies }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {listingsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
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
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
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

              {/* Listings Grid */}
              {listings && listings.length > 0 && (
                <div className="space-y-6">
                  {listings.map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/listings/${listing.slug}`}
                      className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row">
                        {/* Logo */}
                        <div className="w-full sm:w-48 h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0">
                          {category.icon ? (
                            <div className="text-5xl">{category.icon}</div>
                          ) : (
                            <div className="text-2xl font-bold text-green-600">
                              {listing.business_name.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 hover:text-green-600">
                                {listing.business_name}
                              </h3>
                            </div>
                            {listing.verified && (
                              <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
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
                            {listing.states && (
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {(listing.cities as any)?.name ? `${(listing.cities as any).name}, ` : ''}{(listing.states as any)?.name}
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
              )}

              {/* Pagination placeholder */}
              {listings && listings.length >= 50 && (
                <div className="mt-8 text-center">
                  <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Load More
                  </button>
                </div>
              )}

              {/* Bottom SEO Content - FAQs and How to Choose */}
              {categoryContent && (
                <>
                  {/* How to Choose Section */}
                  <div className="bg-white rounded-lg shadow-md p-8 mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      How to Choose the Right {category.name} Provider
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {categoryContent.howToChoose.map((item, idx) => (
                        <div key={idx} className="border-l-4 border-green-500 pl-4">
                          <h3 className="font-semibold text-lg mb-2">
                            {idx + 1}. {item.title}
                          </h3>
                          <p className="text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: item.description }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FAQ Section */}
                  <div className="bg-white rounded-lg shadow-md p-8 mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-6">
                      {categoryContent.faqs.map((faq, idx) => (
                        <div key={idx} className="border-b border-gray-200 pb-6 last:border-0">
                          <h3 className="font-semibold text-lg mb-3 text-gray-900">
                            {faq.question}
                          </h3>
                          <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Industry Insights (if available) */}
                  {categoryContent.insights && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-8 mt-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {categoryContent.insights.title}
                      </h2>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {categoryContent.insights.stats.map((stat, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-4 text-center shadow">
                            <div className="text-3xl font-bold text-green-600">{stat.value}</div>
                            <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                      <ul className="space-y-2">
                        {categoryContent.insights.highlights.map((highlight, idx) => (
                          <li key={idx} className="text-gray-700" dangerouslySetInnerHTML={{ __html: highlight }} />
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
