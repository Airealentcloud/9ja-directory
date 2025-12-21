import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import OperatingHours from '@/components/operating-hours'
import ReviewButton from '@/components/reviews/review-button'
import ClaimButton from '@/components/listings/claim-button'
import RelatedListings from '@/components/related-listings'
import {
  generateLocalBusinessSchema,
  generateBreadcrumbSchema,
  generateRealEstateListingSchema,
  generateFAQSchema
} from '@/lib/schema/local-business'

// Define listing type for proper typing
interface ListingData {
  id: string
  business_name: string
  slug: string
  description?: string
  address?: string
  phone?: string
  email?: string
  website_url?: string
  website?: string
  whatsapp_number?: string
  whatsapp?: string
  facebook_url?: string
  instagram_url?: string
  twitter_url?: string
  image_url?: string
  images?: string[]
  opening_hours?: Record<string, unknown>
  verified?: boolean
  claimed?: boolean
  city?: string
  category_id?: string
  services_offered?: string[]
  amenities?: string
  payment_methods?: string[]
  languages_spoken?: string[]
  average_rating?: number
  categories?: { id: string; name: string; slug: string; icon?: string } | null
  states?: { id: string; name: string; slug: string } | null
  [key: string]: unknown
}

// Helper to avoid long waits if Supabase is slow
async function withTimeout<T>(thenable: PromiseLike<T>, ms = 5000): Promise<T> {
  return Promise.race([
    Promise.resolve(thenable),
    new Promise<T>((_resolve, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    ),
  ])
}

// FIXED VERSION - Recreated to resolve persistent syntax error
export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch the listing with its category and state
  let listing: ListingData | null = null
  let fetchError: unknown = null

  try {
    const result = await withTimeout<{ data: ListingData | null; error: unknown }>(
      supabase
        .from('listings')
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            icon
          ),
          states (
            id,
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .eq('status', 'approved')
        .single(),
      6000
    )
    listing = result.data
    fetchError = result.error
  } catch (err) {
    fetchError = err
  }

  if (fetchError || !listing) {
    notFound()
  }

  // ✅ Extract category and state for use throughout component
  const category = Array.isArray(listing.categories) ? listing.categories[0] : listing.categories
  const state = Array.isArray(listing.states) ? listing.states[0] : listing.states
  const whatsappNumber = listing.whatsapp_number || listing.whatsapp || ''
  const websiteUrl = listing.website_url || listing.website || ''

  // Fetch reviews for this listing
  let reviews: Array<{ rating: number; id?: string; comment?: string; created_at?: string }> = []
  try {
    const reviewResult = await withTimeout<{ data: Array<{ rating: number }> | null; error: unknown }>(
      supabase
        .from('reviews')
        .select('*')
        .eq('listing_id', listing.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10),
      6000
    )
    reviews = (reviewResult.data || []) as typeof reviews
  } catch {
    reviews = []
  }

  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : undefined

  // Check if this is a real estate listing
  const isRealEstate = listing.categories?.name?.toLowerCase().includes('real estate')

  // Generate schemas
  const localBusinessSchema = generateLocalBusinessSchema(
    listing as Parameters<typeof generateLocalBusinessSchema>[0],
    reviews as Parameters<typeof generateLocalBusinessSchema>[1],
    averageRating,
    reviews?.length
  )
  const breadcrumbSchema = generateBreadcrumbSchema(listing)

  // Generate additional schemas for real estate
  const realEstateSchema = isRealEstate ? generateRealEstateListingSchema(listing) : null
  const faqSchema = generateFAQSchema(listing)

  // Parse photos if they exist (assuming JSON array)
  const photos = listing.images || []

  // Generate map URL (Google Maps embed)
  const mapUrl = listing.address
    ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(listing.address)}`
    : null

  return (
    <>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {realEstateSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-green-600">Home</Link>
              <span>/</span>
              <Link href="/categories" className="hover:text-green-600">Categories</Link>
              <span>/</span>
              <Link
                href={`/categories/${listing.categories?.slug}`}
                className="hover:text-green-600"
              >
                {listing.categories?.name}
              </Link>
              <span>/</span>
              <span className="text-gray-900">{listing.business_name}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Photo Gallery */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 p-2">
                    {photos.map((photo: string, index: number) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`${listing.business_name} - Photo ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                ) : listing.image_url ? (
                  <img
                    src={listing.image_url}
                    alt={listing.business_name}
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center">
                    <span className="text-8xl">{listing.categories?.icon || '🏢'}</span>
                  </div>
                )}
              </div>

              {/* Business Info Card */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {listing.business_name}
                      </h1>
                      {listing.verified && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Category Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Link
                        href={`/categories/${listing.categories?.slug}`}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                      >
                        <span className="mr-1">{listing.categories?.icon}</span>
                        {listing.categories?.name}
                      </Link>
                      <Link
                        href={`/states/${listing.states?.slug}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-full text-sm text-blue-700 transition-colors"
                      >
                        <span className="mr-1">📍</span>
                        {listing.states?.name}
                      </Link>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-600 text-sm">4.0 (12 reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">About This Business</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {listing.description}
                  </p>
                </div>

                {/* Services & Amenities */}
                {(listing.services_offered || listing.amenities || listing.payment_methods || listing.languages_spoken) && (
                  <div className="mt-6 pt-6 border-t">
                    {listing.services_offered && listing.services_offered.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Services Offered</h3>
                        <ul className="grid grid-cols-2 gap-2">
                          {listing.services_offered.map((service: string, index: number) => (
                            <li key={index} className="flex items-center text-gray-700">
                              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {service}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {listing.payment_methods && listing.payment_methods.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Methods</h3>
                        <div className="flex flex-wrap gap-2">
                          {listing.payment_methods.map((method: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                              {method}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {listing.languages_spoken && listing.languages_spoken.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Languages Spoken</h3>
                        <div className="flex flex-wrap gap-2">
                          {listing.languages_spoken.map((language: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {listing.amenities && (
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Amenities</h3>
                        <p className="text-gray-700">{listing.amenities}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Map Location */}
              {listing.address && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">📍</span>
                      Location
                    </h2>
                    <p className="text-gray-700 mb-4">{listing.address}</p>
                    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm">Map integration coming soon</p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 text-sm font-medium mt-2 inline-block"
                        >
                          View on Google Maps →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Customer Reviews</h2>

                {/* Review Summary */}
                <div className="border-b pb-6 mb-6">
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900">4.0</div>
                      <div className="flex items-center justify-center mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">12 reviews</p>
                    </div>
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-600 w-3">{rating}</span>
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{ width: rating === 5 ? '50%' : rating === 4 ? '40%' : '10%' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-semibold text-green-600">A</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">Adebayo O.</h4>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-gray-500 text-sm">2 weeks ago</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">
                          Excellent service and very professional staff. Highly recommended for anyone looking for quality accommodation in Lagos.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-semibold text-blue-600">C</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">Chiamaka N.</h4>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4].map((star) => (
                                  <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </div>
                              <span className="text-gray-500 text-sm">1 month ago</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">
                          Good location and friendly staff. The facilities are clean and well-maintained.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Write Review Button */}
                <div className="mt-6 pt-6 border-t">
                  <ReviewButton listingId={listing.id} businessName={listing.business_name} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>

                <div className="space-y-4">
                  {/* Phone */}
                  {listing.phone && (
                    <div className="pb-4 border-b">
                      <div className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                        <span className="mr-2">📞</span>
                        Phone
                      </div>
                      <a
                        href={`tel:${listing.phone}`}
                        className="text-lg text-green-600 hover:text-green-700 font-semibold block"
                      >
                        {listing.phone}
                      </a>
                    </div>
                  )}

                  {/* Email */}
                  {listing.email && (
                    <div className="pb-4 border-b">
                      <div className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                        <span className="mr-2">✉️</span>
                        Email
                      </div>
                      <a
                        href={`mailto:${listing.email}`}
                        className="text-green-600 hover:text-green-700 font-medium break-all"
                      >
                        {listing.email}
                      </a>
                    </div>
                  )}

                  {/* WhatsApp */}
                  {whatsappNumber && (
                    <div className="pb-4 border-b">
                      <div className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                        <span className="mr-2">💬</span>
                        WhatsApp
                      </div>
                      <a
                        href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2"
                      >
                        {whatsappNumber}
                        <span className="text-xs">→</span>
                      </a>
                    </div>
                  )}

                  {/* Website */}
                  {websiteUrl && (
                    <div className="pb-4 border-b">
                      <div className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                        <span className="mr-2">🌐</span>
                        Website
                      </div>
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 font-medium break-all"
                      >
                        Visit Website →
                      </a>
                    </div>
                  )}

                  {/* Social Media */}
                  {(listing.facebook_url || listing.instagram_url || listing.twitter_url) && (
                    <div className="pb-4 border-b">
                      <div className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                        <span className="mr-2">📱</span>
                        Social Media
                      </div>
                      <div className="flex gap-3">
                        {listing.facebook_url && (
                          <a
                            href={listing.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                            title="Facebook"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                          </a>
                        )}
                        {listing.instagram_url && (
                          <a
                            href={listing.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:text-pink-700"
                            title="Instagram"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                          </a>
                        )}
                        {listing.twitter_url && (
                          <a
                            href={listing.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-500"
                            title="Twitter/X"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {listing.address && (
                    <div className="pb-4 border-b">
                      <div className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                        <span className="mr-2">📍</span>
                        Address
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {listing.address}
                      </p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 text-sm font-medium mt-2 inline-block"
                      >
                        Get Directions →
                      </a>
                    </div>
                  )}

                  {/* Business Hours */}
                  <OperatingHours hours={listing.opening_hours as Parameters<typeof OperatingHours>[0]['hours']} />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t">
                  {listing.phone && (
                    <a
                      href={`tel:${listing.phone}`}
                      className="flex items-center justify-center w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call Now
                    </a>
                  )}
                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      Chat on WhatsApp
                    </a>
                  )}
                  {listing.email && (
                    <a
                      href={`mailto:${listing.email}`}
                      className="flex items-center justify-center w-full bg-white border-2 border-green-600 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Email
                    </a>
                  )}
                </div>

                {/* Share & Save */}
                <div className="flex gap-2 pt-4 border-t">
                  <button className="flex-1 flex items-center justify-center py-2 px-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                  <button className="flex-1 flex items-center justify-center py-2 px-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Save
                  </button>
                </div>

                {/* Claim Business */}
                <ClaimButton slug={listing.slug} isClaimed={listing.claimed ?? false} />
              </div>
            </div>
          </div>

          {/* ✅ RELATED LISTINGS & INTERNAL LINKING */}
          <div className="lg:col-span-3 mt-12">
            <RelatedListings
              listingId={listing.id}
              categoryId={listing.category_id || ''}
              categorySlug={category?.slug || ''}
              categoryName={category?.name || 'Business'}
              city={listing.city || ''}
              stateSlug={state?.slug || ''}
              stateName={state?.name || 'Nigeria'}
            />
          </div>
        </div>
      </div>
    </>
  )
}

// Extract category and state for component props (at component level)
async function getCategoryAndState(listing: any) {
  const category = Array.isArray(listing.categories) ? listing.categories[0] : listing.categories
  const state = Array.isArray(listing.states) ? listing.states[0] : listing.states
  return { category, state }
}

// Generate metadata for SEO - ENHANCED FOR RANKING
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  let listing: ListingData | null = null
  try {
    const result = await withTimeout<{ data: ListingData | null; error: unknown }>(
      supabase
        .from('listings')
        .select(`
          *,
          categories (id, name, slug),
          states (id, name, slug)
        `)
        .eq('slug', slug)
        .eq('status', 'approved')
        .single(),
      6000
    )
    listing = result.data
  } catch {
    listing = null
  }

  if (!listing) {
    return {
      title: 'Business Not Found | 9jaDirectory',
      description: 'The business listing you are looking for does not exist on 9jaDirectory.'
    }
  }

  // Extract category and state safely
  const category = Array.isArray(listing.categories) ? listing.categories[0] : listing.categories
  const state = Array.isArray(listing.states) ? listing.states[0] : listing.states

  const categoryName = category?.name || 'Business'
  const categorySlug = category?.slug || ''
  const stateName = state?.name || 'Nigeria'
  const cityName = listing.city || ''
  const locationName = [cityName, stateName].filter(Boolean).join(', ')
  const websiteUrl = listing.website_url || listing.website || ''

  const metaTitleRaw = (listing as any)?.meta_title
  const metaDescriptionRaw = (listing as any)?.meta_description

  const seoTitle =
    typeof metaTitleRaw === 'string' && metaTitleRaw.trim().length > 0
      ? metaTitleRaw.trim()
      : `${listing.business_name} | ${categoryName} in ${locationName} | 9jaDirectory`

  const seoDescription =
    typeof metaDescriptionRaw === 'string' && metaDescriptionRaw.trim().length > 0
      ? metaDescriptionRaw.trim()
      : (() => {
          const baseBlurb =
            typeof listing.description === 'string' && listing.description.trim().length > 0
              ? listing.description.trim()
              : `View contact details, reviews, and directions for ${listing.business_name}.`
          const ratingText =
            typeof listing.average_rating === 'number' && Number.isFinite(listing.average_rating)
              ? `Rated ${listing.average_rating.toFixed(1)}/5.`
              : 'No ratings yet.'

          const full = `${listing.business_name} is a ${categoryName.toLowerCase()} in ${locationName}. ${baseBlurb} ${ratingText}`
            .replace(/\s+/g, ' ')
            .trim()

          return full.length > 155 ? `${full.slice(0, 152).trimEnd()}...` : full
        })()

  const seoKeywords = [
    listing.business_name,
    cityName ? `${listing.business_name} ${cityName}` : null,
    stateName ? `${listing.business_name} ${stateName}` : null,
    cityName ? `${categoryName} in ${cityName}` : null,
    `${categoryName} in ${stateName}`,
    cityName ? `best ${categoryName.toLowerCase()} in ${cityName}` : null,
    cityName ? `top rated ${categoryName.toLowerCase()} ${cityName}` : null,
    cityName ? `verified ${categoryName.toLowerCase()} ${cityName}` : null,
    `Nigeria ${categoryName.toLowerCase()} directory`,
    'Nigeria business directory',
    '9jaDirectory',
  ].filter(Boolean) as string[]

  // ✅ OPTIMIZED TITLE - INCLUDES LOCATION + CATEGORY + KEYWORD MODIFIERS
  // Pattern: "Business Name | Category in City, State | 9jaDirectory"
  const title = `${listing.business_name} | ${categoryName} in ${cityName}, ${stateName} | 9jaDirectory`

  // ✅ OPTIMIZED DESCRIPTION - INCLUDES KEYWORDS + RATING + LOCATION
  // Keep under 160 characters for Google search results
  const rating = listing.average_rating ? `⭐ ${listing.average_rating.toFixed(1)}` : '⭐ New'
  const description = `${listing.business_name} - ${categoryName} in ${cityName}, ${stateName}. ${listing.description?.substring(0, 80) || 'Verified business'}... ${rating} | 📍 ${cityName} | Contact: ${listing.phone || 'Available'}`

  // ✅ MULTI-LEVEL KEYWORDS FOR DIFFERENT INTENT LEVELS
  const keywords = [
    // Brand search
    listing.business_name,
    
    // Local brand search
    `${listing.business_name} ${cityName}`,
    `${listing.business_name} ${stateName}`,
    
    // Local category search
    `${categoryName} in ${cityName}`,
    `${categoryName} in ${stateName}`,
    `${categoryName} near me ${cityName}`,
    
    // Hyper-local search
    `${categoryName} ${cityName} ${stateName}`,
    `best ${categoryName.toLowerCase()} in ${cityName}`,
    `top rated ${categoryName.toLowerCase()} ${cityName}`,
    
    // Review-intent keywords
    `verified ${categoryName.toLowerCase()} ${cityName}`,
    `recommended ${categoryName.toLowerCase()} in ${stateName}`,
    
    // Transactional keywords
    `${categoryName.toLowerCase()} near ${cityName}`,
    `where to find ${categoryName.toLowerCase()} in ${cityName}`,
    
    // Directory keyword
    '9jaDirectory',
    'Nigeria business directory',
    `Nigerian ${categoryName.toLowerCase()} directory`,
  ].filter(Boolean).join(', ')

  // ✅ FEATURE SNIPPET OPTIMIZATION
  const metadataRobots = listing.verified ? 'index, follow' : 'index, follow'

  // ✅ OPEN GRAPH - FOR SOCIAL SHARING
  const ogImages = [
    listing.image_url,
    listing.logo_url,
    ...(listing.images || [])
  ].filter(Boolean)

  if (ogImages.length === 0) {
    ogImages.push('/opengraph-image')
  }

  // ✅ CANONICAL URL TO PREVENT DUPLICATES
  const canonicalUrl = `https://9jadirectory.org/listings/${slug}`

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    robots: metadataRobots,
    
    // ✅ OPEN GRAPH - CRITICAL FOR SOCIAL SHARING & CTR
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonicalUrl,
      type: 'website',
      locale: 'en_NG',
      siteName: '9jaDirectory',
      images: ogImages.map((img, idx) => ({
        url: img,
        width: 1200,
        height: 630,
        alt: `${listing.business_name} - ${idx === 0 ? 'Featured' : `Photo ${idx}`}`,
        type: 'image/jpeg',
      })),
      
      // Business-specific OG properties
      ...(listing.phone && { 'business:contact_data:phone_number': listing.phone }),
      ...(websiteUrl && { 'business:contact_data:website': websiteUrl }),
      ...(listing.email && { 'business:contact_data:email': listing.email }),
    },
    
    // ✅ TWITTER CARD - FOR TWITTER SHARING
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: ogImages,
      creator: '@9jaDirectory',
      site: '@9jaDirectory',
    },
    
    // ✅ CANONICAL URL - AVOID DUPLICATE CONTENT
    alternates: {
      canonical: canonicalUrl,
    },
    
    // ✅ STRUCTURED DATA HINTS
    other: {
      'business:category': categoryName,
      'business:city': cityName,
      'business:state': stateName,
      'business:country': 'Nigeria',
      'rating:ratingValue': listing.average_rating?.toString() || '0',
      'rating:bestRating': '5',
      'rating:worstRating': '1',
    }
  }
}
