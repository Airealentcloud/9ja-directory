import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Find Businesses by Location - All Nigerian States | 9jaDirectory',
  description: 'Browse businesses and services in all 36 Nigerian states + FCT Abuja. Find local businesses in Lagos, Kano, Rivers, Abuja, Kaduna, Oyo, Delta, Anambra and every state in Nigeria.',
  keywords: 'Nigerian states, business locations Nigeria, find businesses by state, Lagos businesses, Abuja businesses, Port Harcourt businesses, Kano businesses, state directory Nigeria',
  openGraph: {
    title: 'Browse Businesses by State | All 37 Nigerian States',
    description: 'Find trusted businesses across every Nigerian state - from Lagos to Sokoto',
    url: 'https://9jadirectory.com/states',
    siteName: '9jaDirectory',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nigerian States Business Directory',
    description: 'Find businesses in all 36 states + FCT',
  },
  alternates: {
    canonical: 'https://9jadirectory.com/states',
  },
}

export default async function StatesPage() {
  const supabase = await createClient()

  const { data: states, error } = await supabase
    .from('states')
    .select('id, name, slug')
    .order('name', { ascending: true })

  const statesWithCounts = await Promise.all(
    (states || []).map(async (state) => {
      const { count } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('state_id', state.id)
        .eq('status', 'approved')

      return {
        ...state,
        listing_count: count || 0
      }
    })
  )

  const { count: totalListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const nigerianRegions = [
    {
      name: 'South West',
      states: ['Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti']
    },
    {
      name: 'South East',
      states: ['Anambra', 'Enugu', 'Imo', 'Abia', 'Ebonyi']
    },
    {
      name: 'South South',
      states: ['Rivers', 'Delta', 'Akwa Ibom', 'Cross River', 'Bayelsa', 'Edo']
    },
    {
      name: 'North Central',
      states: ['FCT', 'Niger', 'Kwara', 'Kogi', 'Benue', 'Plateau', 'Nasarawa']
    },
    {
      name: 'North West',
      states: ['Kano', 'Kaduna', 'Katsina', 'Sokoto', 'Zamfara', 'Jigawa', 'Kebbi']
    },
    {
      name: 'North East',
      states: ['Borno', 'Adamawa', 'Yobe', 'Bauchi', 'Gombe', 'Taraba']
    }
  ]

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://9jadirectory.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'States',
        item: 'https://9jadirectory.com/states',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center text-sm mb-4 text-green-100">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">States</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Businesses by Location
            </h1>
            <p className="text-xl text-green-100 max-w-3xl">
              Browse verified businesses and services across all 36 Nigerian states plus FCT Abuja
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-md p-6 mb-12">
            <div className="flex flex-wrap gap-8 justify-center text-center">
              <div>
                <div className="text-3xl font-bold text-green-600">37</div>
                <div className="text-sm text-gray-600">States & Territories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {(totalListings || 0).toLocaleString()}+
                </div>
                <div className="text-sm text-gray-600">Total Businesses</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">6</div>
                <div className="text-sm text-gray-600">Geopolitical Zones</div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Browse by Geopolitical Zone
            </h2>
            <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
              Find businesses organized by Nigeria six geopolitical zones for easier regional search
            </p>

            {nigerianRegions.map((region) => {
              const regionStates = statesWithCounts.filter(state =>
                region.states.some(rs =>
                  state.name.toLowerCase().includes(rs.toLowerCase()) ||
                  rs.toLowerCase().includes(state.name.toLowerCase())
                )
              )

              return (
                <div key={region.name} className="mb-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                      {region.name}
                    </span>
                    <span className="ml-4 text-lg text-gray-600 font-normal">
                      {regionStates.reduce((sum, s) => sum + s.listing_count, 0).toLocaleString()} businesses
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {regionStates.map((state) => (
                      <Link
                        key={state.slug}
                        href={`/states/${state.slug}`}
                        className="group bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-green-500 hover:-translate-y-1"
                      >
                        <h4 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors mb-2">
                          {state.name}
                        </h4>
                        <div className="text-sm text-gray-500">
                          {state.listing_count.toLocaleString()} {state.listing_count === 1 ? 'business' : 'businesses'}
                        </div>
                        <div className="mt-3 flex items-center text-green-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="font-medium">Browse</span>
                          <svg
                            className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <h3 className="text-red-800 font-semibold mb-2">
                Error Loading States
              </h3>
              <p className="text-red-600">
                We are having trouble loading state information. Please try again later.
              </p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              All Nigerian States Alphabetically
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {statesWithCounts
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((state) => (
                  <Link
                    key={state.slug}
                    href={`/states/${state.slug}`}
                    className="group bg-gray-50 p-4 rounded-lg hover:bg-green-50 transition-colors border border-gray-200 hover:border-green-500"
                  >
                    <div className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                      {state.name}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {state.listing_count.toLocaleString()} listings
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>

        <section className="bg-white border-t border-gray-200 py-16 mt-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Why Search by State?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Local Business Discovery
                </h3>
                <p className="text-gray-700">
                  Find businesses near you by browsing your state. Support local entrepreneurs and get faster service from nearby providers.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Regional Specialization
                </h3>
                <p className="text-gray-700">
                  Each state has unique businesses and services. Discover regional specialties and local expertise across Nigeria.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Comprehensive Coverage
                </h3>
                <p className="text-gray-700">
                  From Lagos megacity to smaller state capitals, find verified businesses everywhere in Nigeria.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Verified Listings
                </h3>
                <p className="text-gray-700">
                  All state listings include verified businesses with accurate contact information and genuine reviews.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-green-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Is Your Business Listed in Your State?
            </h2>
            <p className="text-xl mb-8 text-green-100">
              Reach customers in your local area by listing your business today
            </p>
            <Link
              href="/add-business"
              className="inline-block px-8 py-4 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 text-lg transition-colors"
            >
              Add Your Business - Free
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
