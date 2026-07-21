import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo/site-url'
import { createPublicClient } from '@/lib/supabase/public'

const siteUrl = SITE_URL

export const revalidate = 300

function getListingImage(listing: { logo_url?: string | null; images?: unknown }) {
    if (listing.logo_url) return listing.logo_url
    if (Array.isArray(listing.images)) {
        return listing.images.find((image): image is string => typeof image === 'string' && image.length > 0) || null
    }
    return null
}

export const metadata: Metadata = {
    title: 'Featured Businesses in Nigeria | 9jaDirectory',
    description: 'Browse current paid featured placements and eligible Lifetime business listings across Nigeria on 9jaDirectory.',
    keywords: [
        'featured businesses Nigeria',
        'promoted businesses Nigeria',
        'business advertising Nigeria',
        'Lifetime listings Nigeria',
        '9jaDirectory featured',
    ],
    alternates: {
        canonical: `${siteUrl}/featured`,
    },
    openGraph: {
        title: 'Featured Businesses in Nigeria | 9jaDirectory',
        description: 'Browse current promoted and featured business listings across Nigeria.',
        url: `${siteUrl}/featured`,
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
        title: 'Featured Businesses | 9jaDirectory',
        description: 'Browse current promoted and featured business listings across Nigeria.',
        images: ['/opengraph-image'],
    },
}

export default async function FeaturedPage() {
    const supabase = createPublicClient()

    // Featured is a paid placement flag, not an editorial ranking or endorsement.
    const nowIso = new Date().toISOString()
    const { data: listings } = await supabase
        .from('listings')
        .select(`
      id,
      business_name,
      slug,
      description,
      logo_url,
      images,
      categories (
        name,
        slug,
        icon
      ),
      states (
        name,
        slug
      )
    `)
        .eq('status', 'approved')
        .eq('featured', true)
        .gt('featured_until', nowIso)
        .order('created_at', { ascending: false })
        .limit(20)

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Featured', item: `${siteUrl}/featured` },
        ],
    }

    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Promoted Businesses in Nigeria',
        url: `${siteUrl}/featured`,
        numberOfItems: listings?.length || 0,
        itemListElement: (listings || []).slice(0, 20).map((listing: any, index: number) => ({
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
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

            <div className="min-h-screen bg-gray-50">
            <section className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">Featured Businesses</h1>
                    <p className="text-xl text-yellow-100 max-w-2xl mx-auto">
                        Browse paid promotional placements and eligible Lifetime listings. Featured does not mean editorial endorsement.
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {listings && listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {listings.map((listing) => (
                            <Link
                                key={listing.id}
                                href={`/listings/${listing.slug}`}
                                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group flex flex-col h-full"
                            >
                                <div className="h-48 bg-gray-200 relative overflow-hidden">
                                    {getListingImage(listing) ? (
                                        <img
                                            src={getListingImage(listing) || '/logo.svg'}
                                            alt={listing.business_name + " promoted business in Nigeria"}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl bg-gradient-to-br from-gray-100 to-gray-200">
                                            {(listing.categories as any)?.icon || '🏢'}
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center">
                                        <span className="mr-1">★</span> Promoted
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-green-600 transition-colors">
                                            {listing.business_name}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 text-sm">
                                            <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                                                {(listing.categories as any)?.name}
                                            </span>
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                {(listing.states as any)?.name}
                                            </span>
                                        </div>
                                    </div>

                                    {listing.description && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                                            {listing.description}
                                        </p>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-gray-100 text-green-600 font-medium text-sm flex items-center">
                                        View Details
                                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <div className="text-6xl mb-4">🌟</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Current Promotions</h3>
                        <p className="text-gray-600">There are no active paid placements at the moment.</p>
                    </div>
                )}
            </section>
            </div>
        </>
    )
}
