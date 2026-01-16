'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getPlanBoost, calculateFeatureBonus, type SearchableListing } from '@/lib/search/scoring'

interface RelatedListingsProps {
  listingId: string
  categoryId: string
  categorySlug: string
  categoryName: string
  city: string
  stateSlug: string
  stateName: string
}

interface Listing {
  id: string
  slug: string
  business_name: string
  city: string
  logo_url?: string | null
  images?: string[] | null
  verified?: boolean
  featured?: boolean
  featured_until?: string | null
  average_rating?: number | null
  categories?: { name?: string } | { name?: string }[]
  // Supabase returns profiles as array when using foreign key
  profiles?: { subscription_plan?: string | null }[] | { subscription_plan?: string | null } | null
  _score?: number
  _isPremium?: boolean
  _isLifetime?: boolean
  _isFeatured?: boolean
}

export default function RelatedListings({
  listingId,
  categoryId,
  categorySlug,
  categoryName,
  city,
  stateSlug,
  stateName,
}: RelatedListingsProps) {
  const [sameCategory, setSameCategory] = useState<Listing[]>([])
  const [sameCity, setSameCity] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        // Helper function to score and sort listings with premium boosting
        const scoreListings = (listings: Listing[]): Listing[] => {
          return listings
            .map(listing => {
              // Handle profiles being either array or object
              const profileData = Array.isArray(listing.profiles)
                ? listing.profiles[0]
                : listing.profiles
              const plan = profileData?.subscription_plan
              const planBoost = getPlanBoost(plan)
              const featureBonus = calculateFeatureBonus(listing as unknown as SearchableListing)
              const score = Math.round((50 + featureBonus) * planBoost)

              const isFeatured = listing.featured && listing.featured_until
                ? new Date(listing.featured_until) > new Date()
                : false

              return {
                ...listing,
                _score: score,
                _isPremium: plan === 'premium',
                _isLifetime: plan === 'lifetime',
                _isFeatured: isFeatured,
              }
            })
            .sort((a, b) => {
              // Featured first
              if (a._isFeatured && !b._isFeatured) return -1
              if (!a._isFeatured && b._isFeatured) return 1
              // Then by score
              return (b._score || 0) - (a._score || 0)
            })
        }

        // Fetch listings in the same category (exclude current listing) with plan info
        const { data: sameCategoryData } = await supabase
          .from('listings')
          .select(`
            id, slug, business_name, city, logo_url, images, verified, featured, featured_until, average_rating,
            profiles!listings_user_id_fkey(subscription_plan)
          `)
          .eq('category_id', categoryId)
          .neq('id', listingId)
          .eq('status', 'approved')
          .limit(10)

        // Score and get top 3
        const scoredCategory = scoreListings(sameCategoryData || []).slice(0, 3)
        setSameCategory(scoredCategory)

        // Fetch listings in the same city, different category with plan info
        const { data: sameCityData } = await supabase
          .from('listings')
          .select(`
            id, slug, business_name, city, logo_url, images, verified, featured, featured_until, average_rating,
            categories(name),
            profiles!listings_user_id_fkey(subscription_plan)
          `)
          .eq('city', city)
          .neq('category_id', categoryId)
          .neq('id', listingId)
          .eq('status', 'approved')
          .limit(10)

        // Score and get top 3
        const scoredCity = scoreListings(sameCityData || []).slice(0, 3)
        setSameCity(scoredCity)
      } catch (error) {
        console.error('Error fetching related listings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelated()
  }, [listingId, categoryId, city, supabase])

  if (loading) {
    return (
      <div className="mt-12 space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-12 space-y-8">
      {/* Related in same category */}
      {sameCategory && sameCategory.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            More {categoryName} in {city}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sameCategory.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.slug}`}
                prefetch={false}
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border-l-4 border-green-600 relative"
              >
                {/* Premium indicator stripe */}
                {(listing._isLifetime || listing._isPremium || listing._isFeatured) && (
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    listing._isFeatured ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                    listing._isLifetime ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
                    'bg-gradient-to-r from-green-400 to-emerald-500'
                  }`} />
                )}

                <div className="h-40 bg-gray-200 overflow-hidden relative">
                  {listing.logo_url || listing.images?.[0] ? (
                    <img
                      src={listing.logo_url || listing.images?.[0] || ''}
                      alt={listing.business_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 text-2xl font-semibold text-gray-700">
                      {listing.business_name?.[0] || '#'}
                    </div>
                  )}

                  {/* Badge */}
                  {listing._isFeatured && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">Featured</span>
                  )}
                  {listing._isLifetime && !listing._isFeatured && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">Top Rated</span>
                  )}
                  {listing._isPremium && !listing._isLifetime && !listing._isFeatured && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">Premium</span>
                  )}
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                    {listing.business_name}
                  </h4>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-600">
                      {listing.city || 'Nigeria'}
                    </p>
                    {listing.average_rating && listing.average_rating > 0 && (
                      <span className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {listing.average_rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related in same city, different category */}
      {sameCity && sameCity.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Other Services in {city}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sameCity.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.slug}`}
                prefetch={false}
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border-l-4 border-blue-600 relative"
              >
                {/* Premium indicator stripe */}
                {(listing._isLifetime || listing._isPremium || listing._isFeatured) && (
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    listing._isFeatured ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                    listing._isLifetime ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
                    'bg-gradient-to-r from-green-400 to-emerald-500'
                  }`} />
                )}

                <div className="h-40 bg-gray-200 overflow-hidden relative">
                  {listing.logo_url || listing.images?.[0] ? (
                    <img
                      src={listing.logo_url || listing.images?.[0] || ''}
                      alt={listing.business_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-2xl font-semibold text-gray-700">
                      {listing.business_name?.[0] || '#'}
                    </div>
                  )}

                  {/* Badge */}
                  {listing._isFeatured && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">Featured</span>
                  )}
                  {listing._isLifetime && !listing._isFeatured && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">Top Rated</span>
                  )}
                  {listing._isPremium && !listing._isLifetime && !listing._isFeatured && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">Premium</span>
                  )}
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {listing.business_name}
                  </h4>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-600">
                      {Array.isArray(listing.categories)
                        ? listing.categories[0]?.name
                        : listing.categories?.name || 'Related service'}
                    </p>
                    {listing.average_rating && listing.average_rating > 0 && (
                      <span className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {listing.average_rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Browse more */}
      <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">Browse More</h3>
        <div className="space-y-3 text-sm">
          <Link
            href={`/categories/${categorySlug}`}
            className="text-green-600 hover:text-green-700 hover:underline block"
          >
            All {categoryName} in Nigeria
          </Link>
          <Link
            href={`/states/${stateSlug}`}
            className="text-green-600 hover:text-green-700 hover:underline block"
          >
            All Businesses in {stateName}
          </Link>
          <Link
            href={`/categories/${categorySlug}/${stateSlug}`}
            className="text-green-600 hover:text-green-700 hover:underline block font-semibold bg-green-50 p-2 rounded"
          >
            Best {categoryName} in {stateName}
          </Link>
          <Link
            href="/categories"
            className="text-blue-600 hover:text-blue-700 hover:underline block"
          >
            Browse All Categories
          </Link>
        </div>
      </section>
    </div>
  )
}
