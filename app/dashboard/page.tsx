import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PRICING_PLANS } from '@/lib/pricing'
import { getAccountPlanLimits, resolveAccountPlan } from '@/lib/entitlements'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const [{ data: profile }, { data: allListings }, { data: recentListings }] = await Promise.all([
        supabase
            .from('profiles')
            .select('role, subscription_plan, subscription_status, subscription_expires_at')
            .eq('id', user.id)
            .single(),
        supabase
            .from('listings')
            .select('id, status')
            .eq('user_id', user.id),
        supabase
            .from('listings')
            .select('id, slug, business_name, city, status, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
    ])

    const accountPlan = resolveAccountPlan({
        role: profile?.role,
        subscriptionPlan: profile?.subscription_plan,
        subscriptionStatus: profile?.subscription_status,
        subscriptionExpiresAt: profile?.subscription_expires_at,
    })
    const planLimits = getAccountPlanLimits(accountPlan)
    const currentPlan = accountPlan === 'free'
        ? null
        : PRICING_PLANS.find(plan => plan.id === accountPlan) || null
    const isSubscribed = accountPlan !== 'free'

    const totalListings = allListings?.length || 0
    const pendingListings = allListings?.filter(listing => listing.status === 'pending').length || 0
    const approvedListings = allListings?.filter(listing => listing.status === 'approved').length || 0
    const listingAllowance = planLimits.maxListings === -1 ? 'Unlimited' : String(planLimits.maxListings)

    const planSummary = accountPlan === 'basic'
        ? `1 listing, up to ${planLimits.maxPhotos} photos and standard directory placement.`
        : accountPlan === 'premium'
            ? `Up to ${planLimits.maxListings} listings with verified badges, website links and analytics.`
            : accountPlan === 'lifetime'
                ? 'Unlimited listings with priority search and homepage featuring included.'
                : ''

    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Overview</h2>

            {!isSubscribed ? (
                <div className="mb-8 rounded-lg bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="mb-2 text-xl font-bold">Choose a listing plan</h3>
                            <p className="text-green-100">
                                Payment is required before a business can be submitted for approval.
                            </p>
                        </div>
                        <Link
                            href="/pricing"
                            className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-green-700 transition-colors hover:bg-gray-100 md:mt-0"
                        >
                            Compare Plans
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="mb-8 rounded-lg border border-green-200 bg-white p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                                    {currentPlan?.name || 'Active'} Plan
                                </span>
                                {planLimits.hasVerifiedBadge && (
                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                                        Verified after approval
                                    </span>
                                )}
                                {planLimits.hasFeaturedHomepage && (
                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                                        Homepage feature included
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-700">{planSummary}</p>
                            <p className="mt-1 text-sm text-gray-500">
                                One-time payment · {totalListings} of {listingAllowance} listing allowance used
                            </p>
                        </div>
                        {accountPlan !== 'lifetime' && (
                            <Link
                                href="/pricing"
                                className="inline-block rounded-lg bg-green-600 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-green-700"
                            >
                                Upgrade Plan
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <dl className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Total Listings</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalListings}</dd>
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Pending Approval</dt>
                        <dd className="mt-1 text-3xl font-semibold text-yellow-600">{pendingListings}</dd>
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Live Listings</dt>
                        <dd className="mt-1 text-3xl font-semibold text-green-600">{approvedListings}</dd>
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Current Plan</dt>
                        <dd className="mt-1 text-2xl font-semibold capitalize text-green-600">
                            {currentPlan?.name || 'No paid plan'}
                        </dd>
                    </div>
                </div>
            </dl>

            <div className="rounded-lg bg-white shadow">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Listings</h3>
                    <Link href="/dashboard/my-listings" className="text-sm text-green-600 hover:text-green-500">
                        View all
                    </Link>
                </div>
                <ul className="divide-y divide-gray-200">
                    {recentListings && recentListings.length > 0 ? (
                        recentListings.map((listing) => (
                            <li key={listing.id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <Link
                                            href={`/dashboard/my-listings/${listing.id}/edit`}
                                            className="block truncate text-sm font-medium text-green-600 hover:underline"
                                        >
                                            {listing.business_name}
                                        </Link>
                                        <p className="text-sm text-gray-500">{listing.city}</p>
                                    </div>
                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                        listing.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            listing.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                                    </span>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-8 text-center text-gray-500">
                            No listings yet.{' '}
                            {isSubscribed ? (
                                <Link href="/add-business" className="text-green-600 hover:underline">Add your first business</Link>
                            ) : (
                                <Link href="/pricing" className="text-green-600 hover:underline">Choose a plan</Link>
                            )}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}
