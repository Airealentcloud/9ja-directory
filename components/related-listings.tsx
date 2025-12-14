'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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
  categories?: { name?: string } | { name?: string }[]
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
        // Fetch listings in the same category (exclude current listing)
        const { data: sameCategoryData } = await supabase
          .from('listings')
          .select('id, slug, business_name, city, logo_url, images')
          .eq('category_id', categoryId)
          .neq('id', listingId)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(3)

        setSameCategory(sameCategoryData || [])

        // Fetch listings in the same city, different category
        const { data: sameCityData } = await supabase
          .from('listings')
          .select('id, slug, business_name, city, logo_url, images, categories(name)')
          .eq('city', city)
          .neq('category_id', categoryId)
          .neq('id', listingId)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(3)

        setSameCity(sameCityData || [])
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
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border-l-4 border-green-600"
              >
                <div className="h-40 bg-gray-200 overflow-hidden">
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
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                    {listing.business_name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-2">
                    Location: {listing.city || 'Nigeria'}
                  </p>
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
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border-l-4 border-blue-600"
              >
                <div className="h-40 bg-gray-200 overflow-hidden">
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
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {listing.business_name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-2">
                    {Array.isArray(listing.categories)
                      ? listing.categories[0]?.name
                      : listing.categories?.name || 'Related service'}
                  </p>
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
