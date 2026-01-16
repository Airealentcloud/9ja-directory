'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { type SearchableListing, type ScoredListing, findSimilarListings, getListingBadge } from '@/lib/search/scoring'

interface SimilarBusinessesProps {
    listingId: string
    categoryId: string
    categoryName: string
    stateId?: string
    city?: string
}

export default function SimilarBusinesses({
    listingId,
    categoryId,
    categoryName,
    stateId,
    city,
}: SimilarBusinessesProps) {
    const [similarListings, setSimilarListings] = useState<ScoredListing[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchSimilar = async () => {
            try {
                // Fetch potential similar listings from same category and nearby locations
                const { data: listings } = await supabase
                    .from('listings')
                    .select(`
                        id, slug, business_name, description, city, state_id, category_id,
                        logo_url, image_url, images, verified, featured, featured_until,
                        average_rating, review_count, created_at, user_id,
                        profiles!listings_user_id_fkey(subscription_plan),
                        categories(id, name, slug),
                        states(id, name, slug)
                    `)
                    .eq('status', 'approved')
                    .neq('id', listingId)
                    .or(`category_id.eq.${categoryId}${stateId ? `,state_id.eq.${stateId}` : ''}`)
                    .limit(50)

                if (listings && listings.length > 0) {
                    // Create target listing object for comparison
                    const targetListing: SearchableListing = {
                        id: listingId,
                        business_name: '',
                        slug: '',
                        category_id: categoryId,
                        state_id: stateId,
                        city: city,
                    }

                    // Use our scoring algorithm to find and rank similar businesses
                    const scored = findSimilarListings(
                        targetListing,
                        listings as unknown as SearchableListing[],
                        6
                    )
                    setSimilarListings(scored)
                }
            } catch (error) {
                console.error('Error fetching similar businesses:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSimilar()
    }, [listingId, categoryId, stateId, city, supabase])

    if (loading) {
        return (
            <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Similar Businesses</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-32 bg-gray-200 rounded-lg mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (similarListings.length === 0) {
        return null
    }

    return (
        <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                    You Might Also Like
                </h3>
                <Link
                    href={`/search?category=${categoryId}`}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                    View all {categoryName} →
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {similarListings.map((listing) => {
                    const badge = getListingBadge(listing)
                    const imageUrl = listing.logo_url || listing.image_url || listing.images?.[0]

                    return (
                        <Link
                            key={listing.id}
                            href={`/listings/${listing.slug}`}
                            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100"
                        >
                            {/* Premium indicator */}
                            {(listing._isLifetime || listing._isPremium || listing._isFeatured) && (
                                <div className={`h-0.5 ${
                                    listing._isFeatured ? 'bg-amber-400' :
                                    listing._isLifetime ? 'bg-purple-500' :
                                    'bg-green-500'
                                }`} />
                            )}

                            {/* Image */}
                            <div className="h-24 bg-gray-100 relative overflow-hidden">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={listing.business_name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                                        {listing.business_name?.[0] || '🏢'}
                                    </div>
                                )}

                                {/* Small badge */}
                                {badge && (
                                    <div className={`absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${badge.bgColor} ${badge.color}`}>
                                        {badge.text}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-2">
                                <h4 className="font-medium text-sm text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                                    {listing.business_name}
                                </h4>

                                {/* Rating */}
                                {listing.average_rating && listing.average_rating > 0 ? (
                                    <div className="flex items-center gap-1 mt-1">
                                        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="text-xs text-gray-600">{listing.average_rating.toFixed(1)}</span>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                        {listing.city || 'Nigeria'}
                                    </p>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
