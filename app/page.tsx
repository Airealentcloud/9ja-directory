import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SearchHero from '@/components/search-hero'
import PricingCheckoutClient from '@/components/pricing/pricing-checkout-client'
import { HomeCategoryCard } from '@/components/home-category-card'
import { blogPosts } from '@/lib/blog-data'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org'

export const metadata: Metadata = {
  title: 'Nigeria Business Directory | Find Local Businesses & Services | 9jaDirectory',
  description: 'Discover trusted businesses and services across Nigeria. Search 10,000+ verified listings in Lagos, Abuja, and all 36 states. Find restaurants, hotels, healthcare, shops and more.',
  keywords: ['Nigeria business directory', 'Nigerian businesses', 'find businesses in Nigeria', 'Lagos directory', 'Abuja businesses', 'Nigerian services', '9ja directory', 'business listings Nigeria'],
  openGraph: {
    title: 'Nigeria Business Directory - Find Services in Lagos, Abuja & All States',
    description: 'Find and connect with verified businesses across all 36 Nigerian states',
    url: siteUrl,
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
    canonical: siteUrl,
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

  // Fetch featured/promoted listings (businesses that paid for promotion)
  const { data: promotedListings } = await supabase
    .from('listings')
    .select('id, business_name, slug, category_id, categories(name), state_id, states(name), image_url, description, featured')
    .eq('status', 'approved')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch recently added listings (newest first)
  const { data: recentListings } = await supabase
    .from('listings')
    .select('id, business_name, slug, category_id, categories(name), state_id, states(name), image_url, description, featured, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(8)

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
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
    description: 'Nigeria\'s premier online business directory connecting customers with trusted local businesses across all 36 states.',
    foundingDate: '2025',
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
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Nigeria',
    },
  }

  // FAQ Schema for rich results
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is 9jaDirectory?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '9jaDirectory is Nigeria\'s leading online business directory that helps customers find verified businesses and services across all 36 states and the FCT. We connect millions of Nigerians with trusted local businesses in categories like restaurants, real estate, healthcare, technology, and more.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I list my business on 9jaDirectory?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Listing your business is simple: Choose a plan that fits your needs, fill in your business details including name, category, location, and contact information, complete the payment, and your listing will be live after a quick review. Premium plans include featured placement and enhanced visibility.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is 9jaDirectory free to use for customers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, searching and browsing the directory is completely free for customers. You can search for businesses by category, location, or keyword, view contact details, and read reviews without creating an account or paying any fees.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which Nigerian states does 9jaDirectory cover?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '9jaDirectory covers all 36 Nigerian states plus the Federal Capital Territory (FCT). Whether you\'re looking for businesses in Lagos, Abuja, Kano, Rivers, or any other state, you\'ll find verified listings in our directory.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can I contact a business listed on 9jaDirectory?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Each business listing includes contact information such as phone numbers, email addresses, WhatsApp numbers, and physical addresses. Simply click on a listing to view all available contact methods and reach out directly to the business.',
        },
      },
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div>
        {/* Hero Section with Search */}
        <SearchHero states={states || []} />

        {/* SEO Intro Section - Keyword Rich Content */}
        <section className="bg-white py-12 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Nigeria&apos;s Leading Business Directory
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to <strong>9jaDirectory</strong>, the most comprehensive <strong>business directory in Nigeria</strong>.
              Whether you&apos;re searching for restaurants in Lagos, real estate agents in Abuja, or healthcare services
              in Port Harcourt, our directory connects you with verified businesses across all 36 states and the FCT.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Finding trusted <strong>Nigerian businesses</strong> has never been easier. Our platform features thousands
              of listings organized by category and location, complete with contact details, reviews, and business
              information. From small local shops to large enterprises, 9jaDirectory helps customers discover services
              and helps business owners reach new customers throughout Nigeria.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Business owners:</strong> List your company today and get discovered by millions of Nigerians
              searching for products and services like yours. Our affordable plans include premium features like
              featured listings, enhanced visibility, and analytics to help grow your business.
            </p>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-4">Browse Business Categories in Nigeria</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Find businesses in key sectors across Nigeria
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(categories || []).map((category) => (
              <HomeCategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                slug={category.slug}
                icon={category.icon || undefined}
              />
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

        {/* Promoted Businesses Spotlight */}
        {promotedListings && promotedListings.length > 0 && (
          <section className="bg-gradient-to-r from-amber-50 to-orange-50 py-16 border-y border-amber-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl" aria-hidden="true">⭐</span>
                <h2 className="text-3xl font-bold text-center">Featured Nigerian Businesses</h2>
                <span className="text-2xl" aria-hidden="true">⭐</span>
              </div>
              <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                Top-rated businesses trusted by thousands of customers across Nigeria
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotedListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.slug}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group border-2 border-amber-300"
                  >
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      {listing.image_url ? (
                        <Image
                          src={listing.image_url}
                          alt={`${listing.business_name} - Business in Nigeria`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl" aria-label="Business placeholder">
                          🏢
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <span aria-hidden="true">⭐</span> Promoted
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
              <div className="text-center mt-8">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-semibold"
                >
                  <span>⭐</span> Promote Your Business
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Recently Added Listings */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl" aria-hidden="true">🆕</span>
              <h2 className="text-3xl font-bold text-center">New Business Listings in Nigeria</h2>
            </div>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Discover the newest businesses added to our Nigerian directory
            </p>

            {/* Show listings or fallback message */}
            {recentListings && recentListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.slug}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
                  >
                    <div className="h-40 bg-gray-200 relative overflow-hidden">
                      {listing.image_url ? (
                        <Image
                          src={listing.image_url}
                          alt={`${listing.business_name} - Business in Nigeria`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl" aria-label="Business placeholder">
                          🏢
                        </div>
                      )}
                      {listing.featured && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                          <span aria-hidden="true">⭐</span> Promoted
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                        New
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-base mb-1 text-gray-900 truncate">{listing.business_name}</h3>
                      <p className="text-xs text-gray-600 mb-1">
                        {Array.isArray(listing.categories) && listing.categories.length > 0
                          ? listing.categories[0].name
                          : 'Business'}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <span className="mr-1" aria-hidden="true">📍</span>
                        {Array.isArray(listing.states) && listing.states.length > 0
                          ? listing.states[0].name
                          : 'Nigeria'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Fallback when no recent listings */
              <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
                <div className="text-5xl mb-4" aria-hidden="true">🏢</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Be the First to List Your Business</h3>
                <p className="text-gray-600 mb-6">
                  Join 9jaDirectory and get discovered by thousands of customers across Nigeria.
                  List your business today and start growing your customer base.
                </p>
                <Link
                  href="/pricing"
                  className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Get Listed Now
                </Link>
              </div>
            )}

            <div className="text-center mt-10">
              <Link
                href="/search"
                className="inline-block px-6 py-3 text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold"
              >
                Browse All Businesses
              </Link>
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

        {/* Search CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-3xl font-bold mb-4">Need Help Finding Something?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Search thousands of verified Nigerian businesses by name, category, or location
            </p>
            <Link href="/search" className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 text-lg transition-colors">
              Search Businesses
            </Link>
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
              <div className="flex text-yellow-400 mb-3">{'★★★★★'.split('').map((s,i) => <span key={i}>{s}</span>)}</div>
              <p className="text-gray-700 mb-4 italic">
                &ldquo;Listing my restaurant on 9jaDirectory increased our visibility significantly. We now get more customers every week!&rdquo;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3 text-white font-bold text-sm">CO</div>
                <div>
                  <div className="font-semibold">Chioma Okafor</div>
                  <div className="text-sm text-gray-500">Restaurant Owner, Lagos</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex text-yellow-400 mb-3">{'★★★★★'.split('').map((s,i) => <span key={i}>{s}</span>)}</div>
              <p className="text-gray-700 mb-4 italic">
                &ldquo;I found a reliable plumber in my area within minutes. The directory is easy to use and has accurate contact information.&rdquo;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3 text-white font-bold text-sm">TA</div>
                <div>
                  <div className="font-semibold">Tunde Adebayo</div>
                  <div className="text-sm text-gray-500">Customer, Abuja</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex text-yellow-400 mb-3">{'★★★★★'.split('').map((s,i) => <span key={i}>{s}</span>)}</div>
              <p className="text-gray-700 mb-4 italic">
                &ldquo;Best platform for discovering local services. The categories are well-organized and the search is very fast.&rdquo;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3 text-white font-bold text-sm">AN</div>
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
              <h2 className="text-3xl font-bold mb-4">Why Choose Our Nigeria Business Directory?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                The trusted platform for finding and growing businesses across Nigeria
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

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-4">
              Frequently Asked Questions About Our Nigeria Business Directory
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Everything you need to know about finding and listing businesses on 9jaDirectory
            </p>
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">What is 9jaDirectory?</h3>
                <p className="text-gray-700">
                  9jaDirectory is Nigeria&apos;s leading online business directory that helps customers find verified
                  businesses and services across all 36 states and the FCT. We connect millions of Nigerians with
                  trusted local businesses in categories like restaurants, real estate, healthcare, technology, and more.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">How do I list my business on 9jaDirectory?</h3>
                <p className="text-gray-700">
                  Listing your business is simple: Choose a plan that fits your needs, fill in your business details
                  including name, category, location, and contact information, complete the payment, and your listing
                  will be live after a quick review. Premium plans include featured placement and enhanced visibility.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">Is 9jaDirectory free to use for customers?</h3>
                <p className="text-gray-700">
                  Yes, searching and browsing the directory is completely free for customers. You can search for
                  businesses by category, location, or keyword, view contact details, and read reviews without
                  creating an account or paying any fees.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">Which Nigerian states does 9jaDirectory cover?</h3>
                <p className="text-gray-700">
                  9jaDirectory covers all 36 Nigerian states plus the Federal Capital Territory (FCT). Whether
                  you&apos;re looking for businesses in Lagos, Abuja, Kano, Rivers, or any other state, you&apos;ll find
                  verified listings in our directory.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">How can I contact a business listed on 9jaDirectory?</h3>
                <p className="text-gray-700">
                  Each business listing includes contact information such as phone numbers, email addresses,
                  WhatsApp numbers, and physical addresses. Simply click on a listing to view all available
                  contact methods and reach out directly to the business.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Get Listed */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">List Your Business in Nigeria&apos;s Top Directory</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pick a plan, enter your details, and complete payment to start your listing.
            </p>
          </div>
          <PricingCheckoutClient />
        </section>

        {/* Latest Blog Posts */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-4">Business Guides & Resources</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Free guides to help Nigerian businesses grow, register, and succeed
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.slice(0, 3).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all">
                <div className="h-48 relative overflow-hidden bg-gray-100">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">{post.category}</span>
                  <h3 className="mt-1 font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-green-700">{post.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{post.readTime} &middot; {post.date}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/blog" className="inline-block px-6 py-3 text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold">
              View All Business Guides
            </Link>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-green-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
            <p className="text-xl mb-8 text-green-100">
              Join {totalListings && totalListings > 0 ? `${totalListings.toLocaleString()}+` : 'Nigerian'} businesses already listed on 9jaDirectory
            </p>
            <Link
              href="/pricing"
              className="inline-block px-8 py-4 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 text-lg transition-colors"
            >
              Get Listed Today
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
