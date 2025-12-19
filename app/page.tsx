import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SearchHero from '@/components/search-hero'

export const metadata: Metadata = {
  title: 'Nigeria Business Directory | Find Local Businesses & Services | 9jaDirectory',
  description: 'Discover trusted businesses and services across Nigeria. Search 10,000+ verified listings in Lagos, Abuja, and all 36 states. Find restaurants, hotels, healthcare, shops and more.',
  keywords: ['Nigeria business directory', 'Nigerian businesses', 'find businesses in Nigeria', 'Lagos directory', 'Abuja businesses', 'Nigerian services', '9ja directory', 'business listings Nigeria'],
  openGraph: {
    title: 'Nigeria Business Directory - Find Services in Lagos, Abuja & All States',
    description: 'Find and connect with verified businesses across all 36 Nigerian states',
    url: 'https://9jadirectory.org',
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
    title: '9jaDirectory - Find Businesses in Nigeria',
    description: 'Discover trusted businesses across Nigeria',
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: 'https://9jadirectory.org',
  },
}

export default async function Home() {
  const supabase = await createClient()

  // Fetch featured categories (show up to 8 most popular)
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .order('name', { ascending: true })
    .limit(8)

  // Fetch all states for location dropdown
  const { data: states } = await supabase
    .from('states')
    .select('name, slug')
    .order('name', { ascending: true })

  // Fetch featured listings (show approved listings, prioritize featured ones)
  const { data: featuredListings } = await supabase
    .from('listings')
    .select('id, business_name, slug, category_id, categories(name), state_id, states(name), image_url, description, featured')
    .eq('status', 'approved')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6)

  const { count: totalListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { count: totalCategories } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })

  // Organization Schema - Identifies 9jaDirectory as an organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '9jaDirectory',
    alternateName: '9ja Directory',
    url: 'https://9jadirectory.org',
    logo: 'https://9jadirectory.org/logo.svg',
    description: 'Nigeria\'s premier online business directory connecting customers with trusted local businesses across all 36 states.',
    foundingDate: '2024',
    areaServed: {
      '@type': 'Country',
      name: 'Nigeria',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@9jadirectory.org',
      areaServed: 'NG',
      availableLanguage: ['English']
    },
    sameAs: [
      // Add your actual social media profiles here
      'https://twitter.com/9jadirectory',
      'https://facebook.com/9jadirectory',
      'https://instagram.com/9jadirectory',
    ]
  }

  // WebSite Schema with Sitelinks Searchbox
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '9jaDirectory',
    description: 'Nigeria Premier Business Directory',
    url: 'https://9jadirectory.org',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://9jadirectory.org/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Nigeria',
    },
  }

  return (
    <>
      {/* Multiple Schema Markup for Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <div>
        {/* Hero Section with Search */}
        <SearchHero states={states || []} />

        {/* Featured Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-4">Explore by Category</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Find businesses in key sectors across Nigeria
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(categories || []).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all text-center border border-gray-200 hover:border-green-500 group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform" aria-hidden="true">
                  {category.icon || '🏢'}
                </div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/categories"
              className="inline-block px-6 py-3 text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold"
            >
              View All Categories
            </Link>
          </div>
        </section>

        {/* Featured Listings */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-4">Featured Businesses</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              High-quality businesses trusted by thousands of Nigerians
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuredListings || []).slice(0, 6).map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.slug}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
                >
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {listing.image_url ? (
                      <img
                        src={listing.image_url}
                        alt={listing.business_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                        🏢
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                      Featured
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 text-gray-900">{listing.business_name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {Array.isArray(listing.categories) && listing.categories.length > 0
                        ? listing.categories[0].name
                        : 'Business'}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <span className="mr-1">📍</span>
                      {Array.isArray(listing.states) && listing.states.length > 0
                        ? listing.states[0].name
                        : 'Nigeria'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Find and connect with businesses in three simple steps
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Search</h3>
              <p className="text-gray-600">
                Enter what you're looking for and select your location
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Select</h3>
              <p className="text-gray-600">
                Browse results and choose the business that fits your needs
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Contact</h3>
              <p className="text-gray-600">
                Get contact details and connect directly with the business
              </p>
            </div>
          </div>
        </section>

        {/* AI Assistant CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="text-3xl font-bold mb-4">Need Help Finding Something?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Ask our AI assistant to help you find the perfect business
            </p>
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 text-lg transition-colors">
              Chat with Our Assistant
            </button>
          </div>
        </section>

        {/* Testimonials */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-4">What Our Users Say</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Hear from business owners and customers who trust 9jaDirectory
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="text-yellow-500 mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-700 mb-4 italic">
                "Listing my restaurant on 9jaDirectory increased our visibility significantly. We now get more customers every week!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <div className="font-semibold">Chioma Okafor</div>
                  <div className="text-sm text-gray-500">Restaurant Owner, Lagos</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="text-yellow-500 mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-700 mb-4 italic">
                "I found a reliable plumber in my area within minutes. The directory is easy to use and has accurate contact information."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <div className="font-semibold">Tunde Adebayo</div>
                  <div className="text-sm text-gray-500">Customer, Abuja</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="text-yellow-500 mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-700 mb-4 italic">
                "Best platform for discovering local services. The categories are well-organized and the search is very fast."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <div className="font-semibold">Amaka Nwosu</div>
                  <div className="text-sm text-gray-500">Business Consultant, Port Harcourt</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Use Us */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Use 9jaDirectory?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Your trusted partner for finding and growing businesses in Nigeria
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="text-5xl mb-4">🇳🇬</div>
                <h3 className="text-xl font-bold mb-2">Local Focus</h3>
                <p className="text-gray-600">
                  Dedicated to Nigerian businesses across all 36 states and FCT
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="text-5xl mb-4">🔄</div>
                <h3 className="text-xl font-bold mb-2">Always Up-to-Date</h3>
                <p className="text-gray-600">
                  Regularly updated listings with accurate contact information
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="text-5xl mb-4">⭐</div>
                <h3 className="text-xl font-bold mb-2">Verified Reviews</h3>
                <p className="text-gray-600">
                  Real reviews from real customers to help you decide
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-green-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
            <p className="text-xl mb-8 text-green-100">
              Join thousands of businesses already listed on 9jaDirectory
            </p>
            <Link
              href="/add-business"
              className="inline-block px-8 py-4 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 text-lg transition-colors"
            >
              List Your Business - It's Free!
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
