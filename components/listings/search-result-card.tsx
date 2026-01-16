'use client'

import Link from 'next/link'
import { type ScoredListing, getListingBadge } from '@/lib/search/scoring'

interface SearchResultCardProps {
    listing: ScoredListing
    showScore?: boolean // For debugging
}

export default function SearchResultCard({ listing, showScore = false }: SearchResultCardProps) {
    const badge = getListingBadge(listing)
    const imageUrl = listing.logo_url || listing.image_url || listing.images?.[0]
    const categoryName = listing.categories?.name

    return (
        <Link
            href={`/listings/${listing.slug}`}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group relative"
        >
            {/* Premium/Featured indicator stripe */}
            {(listing._isLifetime || listing._isPremium || listing._isFeatured) && (
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                    listing._isFeatured ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                    listing._isLifetime ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
                    'bg-gradient-to-r from-green-400 to-emerald-500'
                }`} />
            )}

            {/* Image */}
            <div className="h-48 bg-gray-200 relative overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={listing.business_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl bg-gradient-to-br from-gray-100 to-gray-200">
                        🏢
                    </div>
                )}

                {/* Badge */}
                {badge && (
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${badge.bgColor} ${badge.color} shadow-sm`}>
                        {badge.text}
                    </div>
                )}

                {/* Score badge for debugging */}
                {showScore && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                        Score: {listing._score}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900 flex-1 group-hover:text-green-600 transition-colors line-clamp-2">
                        {listing.business_name}
                    </h3>
                    {listing.verified && (
                        <span className="ml-2 flex-shrink-0" title="Verified Business">
                            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </span>
                    )}
                </div>

                {/* Category */}
                {categoryName && (
                    <p className="text-sm text-green-600 font-medium mb-2">
                        {categoryName}
                    </p>
                )}

                {/* Location */}
                <p className="text-sm text-gray-500 flex items-center mb-2">
                    <span className="mr-1">📍</span>
                    {listing.city || 'Nigeria'}
                    {listing.states?.name && `, ${listing.states.name}`}
                </p>

                {/* Rating */}
                {listing.average_rating && listing.average_rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    className={`w-4 h-4 ${star <= Math.round(listing.average_rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-sm text-gray-600">
                            {listing.average_rating.toFixed(1)}
                            {listing.review_count && ` (${listing.review_count})`}
                        </span>
                    </div>
                )}

                {/* Description */}
                {listing.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {listing.description}
                    </p>
                )}

                {/* Plan indicators */}
                <div className="mt-3 flex items-center gap-2">
                    {listing._isLifetime && (
                        <span className="inline-flex items-center text-xs text-purple-600">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Top Business
                        </span>
                    )}
                    {listing._isPremium && !listing._isLifetime && (
                        <span className="inline-flex items-center text-xs text-green-600">
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Premium
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}
