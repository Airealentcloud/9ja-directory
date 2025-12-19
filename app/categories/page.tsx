import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CategoryCard } from '@/components/category-card'

export const metadata: Metadata = {
  title: 'Browse Business Categories in Nigeria | 9jaDirectory',
  description: 'Explore business categories across Nigeria. Browse verified listings by category and discover top services in all 36 states + FCT.',
  keywords: [
    'business categories Nigeria',
    'Nigeria business directory categories',
    'find services by category Nigeria',
    'browse business listings Nigeria',
    '9jaDirectory categories',
  ],
  alternates: {
    canonical: 'https://9jadirectory.org/categories',
  },
  openGraph: {
    title: 'Browse Business Categories in Nigeria | 9jaDirectory',
    description: 'Explore business categories across Nigeria and discover verified listings by category.',
    url: 'https://9jadirectory.org/categories',
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
    title: 'Browse Categories | 9jaDirectory',
    description: 'Explore business categories across Nigeria and discover verified listings by category.',
    images: ['/opengraph-image'],
  },
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, icon')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
  }

  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('status', 'approved')

      return {
        ...category,
        listing_count: count || 0
      }
    })
  )

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://9jadirectory.org' },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://9jadirectory.org/categories' },
    ],
  }

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://9jadirectory.org/categories#page',
    name: 'Business Categories in Nigeria',
    description:
      'Explore business categories across Nigeria. Browse verified listings by category and discover top services in all 36 states + FCT.',
    url: 'https://9jadirectory.org/categories',
    inLanguage: 'en-NG',
    isPartOf: { '@type': 'WebSite', '@id': 'https://9jadirectory.org#website' },
    numberOfItems: categoriesWithCounts.length,
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Business Categories',
    itemListElement: categoriesWithCounts.slice(0, 50).map((category, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Thing',
        name: category.name,
        url: `https://9jadirectory.org/categories/${category.slug}`,
      },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Browse All Categories
          </h1>
          <p className="text-xl text-green-100 max-w-2xl">
            Discover businesses across Nigeria organized by industry and service type
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-8 justify-center text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">
                {categoriesWithCounts.length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">
                {categoriesWithCounts.reduce((sum, cat) => sum + (cat.listing_count || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Listings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">37</div>
              <div className="text-sm text-gray-600">States Covered</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="text-red-800 font-semibold mb-2">
              Error Loading Categories
            </h3>
            <p className="text-red-600">
              We are having trouble loading categories. Please try again later.
            </p>
          </div>
        )}

        {!error && categoriesWithCounts.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">Category</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Categories Yet
            </h3>
            <p className="text-gray-600">
              Categories will appear here once they are added to the database.
            </p>
          </div>
        )}

        {categoriesWithCounts.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              All Categories ({categoriesWithCounts.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categoriesWithCounts.map((category) => (
                <CategoryCard
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  slug={category.slug}
                  description={category.description || undefined}
                  icon={category.icon || undefined}
                  listingCount={category.listing_count}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Cannot Find Your Category?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            We are always expanding our directory. List your business and help us grow!
          </p>
          <button className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg">
            Add Your Business
          </button>
        </div>
      </section>
      </div>
    </>
  )
}
