import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch the listing with its category and state
  const { data: listing, error } = await supabase
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
    .single()

  if (error || !listing) {
    notFound()
  }

  // Parse photos if they exist (assuming JSON array)
  const photos = listing.photos || []

  // Generate map URL (Google Maps embed)
  const mapUrl = listing.address
    ? `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(listing.address)}`
    : null

  return (
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
              {(listing.services || listing.amenities) && (
                <div className="mt-6 pt-6 border-t">
                  {listing.services && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Services Offered</h3>
                      <p className="text-gray-700">{listing.services}</p>
                    </div>
                  )}
                  {listing.amenities && (
                    <div>
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
                <button className="w-full py-3 px-6 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors">
                  Write a Review
                </button>
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

                {/* Website */}
                {listing.website && (
                  <div className="pb-4 border-b">
                    <div className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                      <span className="mr-2">🌐</span>
                      Website
                    </div>
                    <a
                      href={listing.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 font-medium break-all"
                    >
                      Visit Website →
                    </a>
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
                {listing.hours && (
                  <div className="pb-4">
                    <div className="text-sm font-medium text-gray-600 mb-3 flex items-center">
                      <span className="mr-2">🕒</span>
                      Business Hours
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monday - Friday</span>
                        <span className="text-gray-900 font-medium">9:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Saturday</span>
                        <span className="text-gray-900 font-medium">10:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sunday</span>
                        <span className="text-red-600 font-medium">Closed</span>
                      </div>
                    </div>
                  </div>
                )}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('business_name, description')
    .eq('slug', slug)
    .single()

  if (!listing) {
    return {
      title: 'Business Not Found'
    }
  }

  return {
    title: `${listing.business_name} - 9jaDirectory`,
    description: listing.description || `Find ${listing.business_name} on 9jaDirectory`
  }
}
