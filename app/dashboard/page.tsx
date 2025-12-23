import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PRICING_PLANS } from '@/lib/pricing'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch user profile with subscription info
    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_status, subscription_expires_at, can_add_listings, can_claim_listings, can_feature_listings, featured_posts_remaining')
        .eq('id', user.id)
        .single()

    // Get current plan details
    const currentPlan = PRICING_PLANS.find(p => p.id === profile?.subscription_plan) || null
    const isSubscribed = profile?.subscription_status === 'active'
    const expiresAt = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at) : null

    // Fetch all user listings
    const { data: allListings } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)

    // Calculate stats from the data
    const totalListings = allListings?.length || 0
    const pendingListings = allListings?.filter(l => l.status === 'pending').length || 0
    const approvedListings = allListings?.filter(l => l.status === 'approved').length || 0

    // Fetch recent listings
    const { data: recentListings } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>

            {/* Subscription Banner */}
            {!isSubscribed ? (
                <div className="mb-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="text-xl font-bold mb-2">Upgrade Your Plan</h3>
                            <p className="text-green-100">
                                Get more visibility, faster approvals, and premium features for your business.
                            </p>
                        </div>
                        <Link
                            href="/pricing"
                            className="mt-4 md:mt-0 inline-block bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            View Plans
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="mb-8 bg-white border border-green-200 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                                    {currentPlan?.name || 'Active'} Plan
                                </span>
                                {profile?.can_feature_listings && (
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                                        {profile.featured_posts_remaining || 0} Featured Posts Left
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600">
                                {expiresAt && expiresAt > new Date() ? (
                                    <>Valid until {expiresAt.toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</>
                                ) : (
                                    <>Your subscription is active</>
                                )}
                            </p>
                        </div>
                        <Link
                            href="/pricing"
                            className="mt-4 md:mt-0 inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            Upgrade Plan
                        </Link>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Listings</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalListings || 0}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Approval</dt>
                        <dd className="mt-1 text-3xl font-semibold text-yellow-600">{pendingListings || 0}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Live Listings</dt>
                        <dd className="mt-1 text-3xl font-semibold text-green-600">{approvedListings || 0}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Current Plan</dt>
                        <dd className="mt-1 text-2xl font-semibold text-green-600 capitalize">
                            {currentPlan?.name || 'Free'}
                        </dd>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Listings</h3>
                    <Link href="/dashboard/my-listings" className="text-sm text-green-600 hover:text-green-500">
                        View all
                    </Link>
                </div>
                <ul className="divide-y divide-gray-200">
                    {recentListings && recentListings.length > 0 ? (
                        recentListings.map((listing) => (
                            <li key={listing.id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium text-green-600 truncate">{listing.business_name}</p>
                                        <p className="text-sm text-gray-500">{listing.city}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${listing.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            listing.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-8 text-center text-gray-500">
                            No listings yet. <Link href="/add-business" className="text-green-600 hover:underline">Add your first business</Link>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}
