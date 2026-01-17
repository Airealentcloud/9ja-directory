import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ReviewInsights from '@/components/reviews/review-insights'
import { getPlanLimits, type PlanId } from '@/lib/pricing'

export default async function ListingAnalyticsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Get user's profile and plan
    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', user.id)
        .single()

    const userPlan = (profile?.subscription_plan as PlanId) || 'basic'
    const planLimits = getPlanLimits(userPlan) || {
        hasAiReviewInsights: false,
        hasAnalytics: false,
    }

    // Fetch the listing
    const { data: listing, error } = await supabase
        .from('listings')
        .select(`
            id, business_name, slug, status, created_at, views_count,
            categories(name)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !listing) {
        notFound()
    }

    // Fetch reviews for this listing
    const { data: reviews, count: reviewCount } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, reviewer_name, status', { count: 'exact' })
        .eq('listing_id', id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10)

    // Calculate average rating
    const avgRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
                <Link href="/dashboard/my-listings" className="hover:text-gray-700">
                    My Listings
                </Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">{listing.business_name}</span>
            </nav>

            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{listing.business_name}</h1>
                        <p className="text-gray-500 mt-1">
                            {/* @ts-ignore */}
                            {listing.categories?.name || 'Uncategorized'} • Added {new Date(listing.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/listings/${listing.slug}`}
                            target="_blank"
                            className="text-sm text-green-600 hover:text-green-700"
                        >
                            View public listing →
                        </Link>
                        <Link
                            href={`/dashboard/my-listings/${id}/edit`}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                        >
                            Edit Listing
                        </Link>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500">Status</p>
                        <p className={`text-lg font-semibold capitalize ${
                            listing.status === 'approved' ? 'text-green-600' :
                            listing.status === 'rejected' ? 'text-red-600' :
                            'text-yellow-600'
                        }`}>
                            {listing.status}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500">Total Reviews</p>
                        <p className="text-lg font-semibold text-gray-900">{reviewCount || 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500">Average Rating</p>
                        <p className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                            {avgRating > 0 ? avgRating.toFixed(1) : '-'}
                            {avgRating > 0 && (
                                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            )}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500">Your Plan</p>
                        <p className={`text-lg font-semibold capitalize ${
                            userPlan === 'lifetime' ? 'text-purple-600' :
                            userPlan === 'premium' ? 'text-green-600' :
                            'text-gray-600'
                        }`}>
                            {userPlan}
                        </p>
                    </div>
                </div>
            </div>

            {/* AI Review Insights */}
            <ReviewInsights
                listingId={listing.id}
                listingName={listing.business_name}
                hasAccess={planLimits.hasAiReviewInsights}
                reviewCount={reviewCount || 0}
            />

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h2>

                {reviews && reviews.length > 0 ? (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg
                                                    key={star}
                                                    className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            by {review.reviewer_name || 'Anonymous'}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-700 text-sm">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No reviews yet. Share your listing to get customer feedback!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
