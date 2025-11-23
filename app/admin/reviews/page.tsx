import { createClient } from '@/lib/supabase/server'
import { approveReview, rejectReview } from '@/app/actions/admin'
import { redirect } from 'next/navigation'

export default async function AdminReviewsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const { status } = await searchParams
    const currentStatus = status || 'pending'
    const supabase = await createClient()

    // Check admin using secure RPC
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin')

    if (adminError || !isAdmin) {
        console.error('Admin check failed:', adminError)
        redirect('/')
    }

    // Fetch reviews with listing and user details
    const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
      *,
      listings (business_name, slug),
      profiles:user_id (full_name, email)
    `)
        .eq('status', currentStatus)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching reviews:', error)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
                <div className="flex space-x-2">
                    <a
                        href="/admin/reviews?status=pending"
                        className={`px-4 py-2 rounded-md text-sm font-medium ${currentStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Pending
                    </a>
                    <a
                        href="/admin/reviews?status=approved"
                        className={`px-4 py-2 rounded-md text-sm font-medium ${currentStatus === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Approved
                    </a>
                    <a
                        href="/admin/reviews?status=rejected"
                        className={`px-4 py-2 rounded-md text-sm font-medium ${currentStatus === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Rejected
                    </a>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {reviews && reviews.length > 0 ? (
                        reviews.map((review) => (
                            <li key={review.id} className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {review.listings?.business_name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Reviewed by {review.profiles?.full_name || review.reviewer_name || 'Anonymous'}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-yellow-400 text-xl mr-1">★</span>
                                        <span className="font-bold text-gray-900">{review.rating}</span>
                                        <span className="text-gray-400 text-sm ml-1">/ 5</span>
                                    </div>
                                </div>

                                <p className="text-gray-700 mb-4 bg-gray-50 p-4 rounded-md">
                                    {review.comment}
                                </p>

                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>Submitted on {new Date(review.created_at).toLocaleDateString()}</span>

                                    {currentStatus === 'pending' && (
                                        <div className="flex space-x-3">
                                            <form action={async () => {
                                                'use server'
                                                await rejectReview(review.id)
                                            }}>
                                                <button
                                                    type="submit"
                                                    className="text-red-600 hover:text-red-900 font-medium"
                                                >
                                                    Reject
                                                </button>
                                            </form>
                                            <form action={async () => {
                                                'use server'
                                                await approveReview(review.id)
                                            }}>
                                                <button
                                                    type="submit"
                                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
                                                >
                                                    Approve
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="p-12 text-center text-gray-500">
                            No {currentStatus} reviews found.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}
