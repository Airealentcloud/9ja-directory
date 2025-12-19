import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

// ✅ GENERATE DYNAMIC METADATA FOR SEARCH RESULTS PAGE
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string; state?: string }> }): Promise<Metadata> {
  const { q, state } = await searchParams
  const query = q || ''
  const stateSlug = state || ''
  
  // Get state name from slug for better SEO
  let stateName = stateSlug?.replace(/-/g, ' ') || 'Nigeria'
  
  if (stateSlug && stateSlug !== '') {
    const supabase = await createClient()
    const { data: stateData } = await supabase
      .from('states')
      .select('name')
      .eq('slug', stateSlug)
      .single()
    
    if (stateData) {
      stateName = stateData.name
    }
  }
  
  // ✅ DYNAMIC TITLE WITH KEYWORDS
  const title = query && stateSlug
    ? `${query} in ${stateName} | Search Results | 9jaDirectory`
    : query
      ? `${query} | Nigeria Business Search Results | 9jaDirectory`
      : stateSlug
        ? `Businesses in ${stateName} | Search Results | 9jaDirectory`
        : 'Search Businesses | 9jaDirectory'
  
  // ✅ DYNAMIC DESCRIPTION WITH CALL-TO-ACTION
  const description = query && stateSlug
    ? `Find verified ${query} businesses in ${stateName}. Browse ratings, contact details, and customer reviews on 9jaDirectory. Trusted Nigerian business directory.`
    : query
      ? `Search results for "${query}" across Nigeria. Discover verified businesses with ratings and reviews on 9jaDirectory. Nigeria's most trusted business directory.`
      : `Search verified businesses across Nigeria on 9jaDirectory. Filter by location, category, and ratings. Trusted by millions of Nigerians.`
  
  // ✅ DYNAMIC KEYWORDS
  const keywords = query && stateSlug
    ? `${query} ${stateName}, ${query} near me, ${query} in ${stateName}, best ${query} ${stateName}, verify ${query} ${stateName}, 9jaDirectory`
    : query
      ? `${query} Nigeria, ${query} directory, find ${query} Nigeria, verified ${query}, best ${query} in Nigeria`
      : 'business directory Nigeria, find businesses Nigeria, Nigerian businesses, business search Nigeria'
  
  return {
    title,
    description,
    keywords,
    robots: { index: false, follow: true },
    
    openGraph: {
      title,
      description,
      url: `https://9jadirectory.org/search?q=${encodeURIComponent(query)}${stateSlug ? `&state=${stateSlug}` : ''}`,
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
      card: 'summary',
      title,
      description,
      creator: '@9jaDirectory',
      site: '@9jaDirectory',
      images: ['/opengraph-image'],
    },
    
    alternates: {
      canonical: `https://9jadirectory.org/search?q=${encodeURIComponent(query)}${stateSlug ? `&state=${stateSlug}` : ''}`,
    },
  }
}

// ✅ FAQ SCHEMA FOR FEATURED SNIPPETS
function generateFAQSchema(query: string, stateName: string) {
  const faqs = [
    {
      question: `Where can I find ${query} in ${stateName}?`,
      answer: `9jaDirectory has verified listings for ${query} in ${stateName}. Search our directory to find trusted businesses with ratings, contact information, and customer reviews.`,
    },
    {
      question: `Are ${query} results on 9jaDirectory verified?`,
      answer: `Yes, all businesses on 9jaDirectory are verified with active contact information and customer reviews. Each listing is reviewed before being published.`,
    },
    {
      question: `How do I contact ${query} on 9jaDirectory?`,
      answer: `Each business listing includes phone numbers, email addresses, and direct messaging options. You can reach businesses directly through our platform.`,
    },
    {
      question: `Can I read reviews for ${query} on 9jaDirectory?`,
      answer: `Yes, each business has customer reviews and ratings. You can read authentic reviews from other users to help make your decision.`,
    },
    {
      question: `What is 9jaDirectory?`,
      answer: `9jaDirectory is Nigeria's most trusted business directory. We help you find verified businesses, compare ratings, and connect with services across all Nigerian states.`,
    },
  ]
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  }
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; state?: string }>
}) {
    const { q, state } = await searchParams
    const query = q || ''
    const stateSlug = state || ''

    if (!query && !stateSlug) {
        redirect('/')
    }

    const supabase = await createClient()
    
    // Get state name for FAQ schema
    let stateName = stateSlug?.replace(/-/g, ' ') || 'Nigeria'
    if (stateSlug && stateSlug !== '') {
        const { data: stateData } = await supabase
          .from('states')
          .select('name')
          .eq('slug', stateSlug)
          .single()
        
        if (stateData) {
          stateName = stateData.name
        }
    }
    
    // Generate FAQ schema for this search
    const faqSchema = generateFAQSchema(query || 'business', stateName)

    // Build the search query - simplified to avoid relation errors
    let searchQuery = supabase
        .from('listings')
        .select('*')
        .eq('status', 'approved')

    // Filter by search term if provided
    if (query) {
        searchQuery = searchQuery.or(
            `business_name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`
        )
    }

    // Filter by state if provided
    if (stateSlug && stateSlug !== '') {
        const { data: stateData } = await supabase
            .from('states')
            .select('id')
            .eq('slug', stateSlug)
            .single()

        if (stateData) {
            searchQuery = searchQuery.eq('state_id', stateData.id)
        }
    }

    const { data: results, error } = await searchQuery.order('created_at', {
        ascending: false,
    })

    // Debug logging with full error details
    console.log('Search params:', { query, stateSlug })
    console.log('Search results:', { count: results?.length, error: error ? JSON.stringify(error) : null })
    if (error) {
        console.error('Full search error:', error)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ✅ FAQ SCHEMA FOR FEATURED SNIPPETS */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            
            {/* Header */}
            <div className="bg-green-600 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="text-sm hover:underline mb-2 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold">Search Results</h1>
                    <p className="text-green-100 mt-2">
                        {query && `Showing results for "${query}"`}
                        {query && stateSlug && ' in '}
                        {stateSlug && stateSlug !== '' && `${stateSlug.replace('-', ' ')}`}
                    </p>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        Error loading results. Please try again.
                    </div>
                )}

                {!error && results && results.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            No results found
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Try adjusting your search terms or browse by category
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Back to Home
                        </Link>
                    </div>
                )}

                {!error && results && results.length > 0 && (
                    <>
                        <div className="mb-6">
                            <p className="text-gray-600">
                                Found <strong>{results.length}</strong> business
                                {results.length !== 1 ? 'es' : ''}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.map((listing) => (
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
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-lg text-gray-900 flex-1">
                                                {listing.business_name}
                                            </h3>
                                            {listing.status && listing.status !== 'approved' && (
                                                <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    {listing.status}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Business
                                        </p>
                                        <p className="text-sm text-gray-500 flex items-center mb-2">
                                            <span className="mr-1">📍</span>
                                            {listing.city || 'Nigeria'}
                                        </p>
                                        {listing.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {listing.description}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
                
                {/* ✅ FREQUENTLY ASKED QUESTIONS FOR FEATURED SNIPPETS */}
                {!error && results && (
                    <div className="mt-16 bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">
                            Frequently Asked Questions
                        </h2>
                        
                        <div className="space-y-6">
                            {[
                              {
                                q: `Where can I find ${query || 'businesses'} in ${stateName}?`,
                                a: `9jaDirectory has verified listings for ${query || 'businesses'} in ${stateName}. Search our directory to find trusted businesses with ratings, contact information, and customer reviews.`,
                              },
                              {
                                q: 'Are all businesses on 9jaDirectory verified?',
                                a: 'Yes, all businesses on 9jaDirectory are verified with active contact information and customer reviews. Each listing is reviewed before being published.',
                              },
                              {
                                q: 'How do I contact a business on 9jaDirectory?',
                                a: 'Each business listing includes phone numbers, email addresses, and direct messaging options. You can reach businesses directly through our platform.',
                              },
                              {
                                q: 'Can I read reviews before contacting a business?',
                                a: 'Yes, each business has customer reviews and ratings. You can read authentic reviews from other users to help make your decision.',
                              },
                            ].map((item, idx) => (
                              <div key={idx} className="border-l-4 border-green-600 pl-4 py-4">
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                  {item.q}
                                </h3>
                                <p className="text-gray-700">
                                  {item.a}
                                </p>
                              </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
