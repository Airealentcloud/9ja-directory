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
  average_rating: number | null
  image_url: string | null
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
        // ✅ FETCH LISTINGS IN SAME CATEGORY (exclude current listing)
        const { data: sameCategoryData } = await supabase
          .from('listings')
          .select('id, slug, business_name, city, average_rating, image_url')
          .eq('category_id', categoryId)
          .neq('id', listingId)
          .eq('status', 'approved')
          .order('average_rating', { ascending: false })
          .limit(3)

        setSameCategory(sameCategoryData || [])

        // ✅ FETCH LISTINGS IN SAME CITY, DIFFERENT CATEGORY (for cross-selling)
        const { data: sameCityData } = await supabase
          .from('listings')
          .select('id, slug, business_name, city, average_rating, image_url, categories(name)')
          .eq('city', city)
          .neq('category_id', categoryId)
          .neq('id', listingId)
          .eq('status', 'approved')
          .order('average_rating', { ascending: false })
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
      {/* ✅ RELATED IN SAME CATEGORY */}
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
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border-l-4 border-green-600"
              >
                {/* Featured Image */}
                <div className="h-40 bg-gray-200 overflow-hidden">
                  {listing.image_url ? (
                    <img
                      src={listing.image_url}
                      alt={listing.business_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 text-4xl">
                      🏪
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                    {listing.business_name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-2">
                    📍 {listing.city}
                  </p>
                  {listing.average_rating && (
                    <p className="text-sm text-yellow-500 mt-2 font-medium">
                      {'⭐'.repeat(Math.round(listing.average_rating))}
                      <span className="text-gray-600 ml-1">
                        {listing.average_rating.toFixed(1)}
                      </span>
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ✅ RELATED IN SAME CITY, DIFFERENT CATEGORY (CROSS-SELL) */}
      {sameCity && sameCity.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Other Services in {city}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sameCity.map((listing: any) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.slug}`}
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border-l-4 border-blue-600"
              >
                {/* Featured Image */}
                <div className="h-40 bg-gray-200 overflow-hidden">
                  {listing.image_url ? (
                    <img
                      src={listing.image_url}
                      alt={listing.business_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-4xl">
                      🏢
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {listing.business_name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-2">
                    {listing.categories?.name}
                  </p>
                  {listing.average_rating && (
                    <p className="text-sm text-yellow-500 mt-2 font-medium">
                      {'⭐'.repeat(Math.round(listing.average_rating))}
                      <span className="text-gray-600 ml-1">
                        {listing.average_rating.toFixed(1)}
                      </span>
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ✅ BREADCRUMB NAVIGATION LINKS - FOR HIERARCHICAL CRAWL */}
      <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">📍 Browse More</h3>
        <div className="space-y-3 text-sm">
          {/* Link to all in this category */}
          <Link
            href={`/categories/${categorySlug}`}
            className="text-green-600 hover:text-green-700 hover:underline block flex items-center gap-2"
          >
            <span>→</span> All {categoryName} in Nigeria
          </Link>

          {/* Link to state level */}
          <Link
            href={`/states/${stateSlug}`}
            className="text-green-600 hover:text-green-700 hover:underline block flex items-center gap-2"
          >
            <span>→</span> All Businesses in {stateName}
          </Link>

          {/* Link to state + category combination (MONEY PAGE!) */}
          <Link
            href={`/categories/${categorySlug}/${stateSlug}`}
            className="text-green-600 hover:text-green-700 hover:underline block flex items-center gap-2 font-semibold bg-green-50 p-2 rounded"
          >
            <span>→</span> Best {categoryName} in {stateName}
          </Link>

          {/* Link to browse all categories */}
          <Link
            href="/categories"
            className="text-blue-600 hover:text-blue-700 hover:underline block flex items-center gap-2"
          >
            <span>→</span> Browse All Categories
          </Link>
        </div>
      </section>
    </div>
  )
}
