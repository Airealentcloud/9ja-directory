'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    getAdminListings,
    getUnlinkedSuccessfulPaymentsServer,
    linkPaymentToExistingListingServer,
    approveListingServer,
    rejectListingServer,
} from '@/app/actions/admin'

type Listing = {
    id: string
    business_name: string
    description: string
    status: string
    created_at: string
    user_id: string
    city: string
    phone?: string
    address?: string
    category_id?: string
    rejection_reason?: string
    payment_status?: string
    payment_reference?: string | null
    payment_created_at?: string | null
    payment_paid_at?: string | null
    categories?: {
        name: string
    }
    profiles?: {
        email: string
        full_name?: string
    }
}

type UnlinkedPayment = {
    id: string
    user_id: string
    reference: string
    plan: string
    amount: number
    currency: string
    paid_at?: string | null
    profile?: {
        email?: string | null
        full_name?: string | null
    } | null
    candidate_listings: Array<{
        id: string
        business_name: string
        status: string
        created_at: string
    }>
}

export default function AdminListingsPage() {
    const [listings, setListings] = useState<Listing[]>([])
    const [filteredListings, setFilteredListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
    const [paymentFilter, setPaymentFilter] = useState<'all' | 'success' | 'pending' | 'failed' | 'abandoned' | 'none'>('all')
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [unlinkedPayments, setUnlinkedPayments] = useState<UnlinkedPayment[]>([])
    const [selectedListingByPayment, setSelectedListingByPayment] = useState<Record<string, string>>({})
    const supabase = createClient()

    const fetchListings = async () => {
        setLoading(true)

        try {
            const unlinked = await getUnlinkedSuccessfulPaymentsServer() as UnlinkedPayment[]
            setUnlinkedPayments(unlinked)
            setSelectedListingByPayment((current) => {
                const next = { ...current }
                unlinked.forEach((payment) => {
                    if (!next[payment.id] && payment.candidate_listings.length === 1) {
                        next[payment.id] = payment.candidate_listings[0].id
                    }
                })
                return next
            })
        } catch (error) {
            console.error('Could not load unlinked successful payments:', error)
            setUnlinkedPayments([])
        }

        // 1. Try server-side fetch first (bypasses RLS if service key exists)
        try {
            const serverData = await getAdminListings(statusFilter)

            if (serverData) {
                console.log(`Found ${serverData.length} listings via server action`)
                setListings(serverData as unknown as Listing[])
                setFilteredListings(serverData as unknown as Listing[])
                setLoading(false)
                return
            }
        } catch (e) {
            console.error('Server action failed:', e)
        }

        // 2. Fallback to client-side fetch (original logic)
        console.log('Falling back to client-side fetch...')

        // 1. Fetch listings first without join to ensure we get them even if profile RLS fails
        let query = supabase
            .from('listings')
            .select('*') // Simplified to debug RLS issues
            .order('created_at', { ascending: false })

        // Apply status filter
        if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter)
        }

        const { data: listingsData, error: listingsError } = await query

        console.log('Admin listings query result:', { listingsData, listingsError, statusFilter })

        if (listingsError) {
            console.error('Error fetching listings (full object):', JSON.stringify(listingsError, null, 2))
            console.error('Error details:', listingsError)
            alert('Error loading listings: ' + (listingsError.message || JSON.stringify(listingsError)))
            setLoading(false)
            return
        }

        if (listingsData) {
            // 2. Fetch profiles separately
            const userIds = Array.from(new Set(listingsData.map(l => l.user_id).filter(Boolean)))

            let profilesMap: Record<string, any> = {}

            if (userIds.length > 0) {
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name') // Removed email to avoid error if column missing
                    .in('id', userIds)

                if (profilesData) {
                    profilesData.forEach(p => {
                        profilesMap[p.id] = p
                    })
                } else if (profilesError) {
                    console.warn('Error fetching profiles (likely RLS):', profilesError)
                }
            }

            // 3. Fetch payments separately (may be blocked by RLS for non-admin users)
            const listingIds = Array.from(new Set(listingsData.map(l => l.id)))
            let paymentsMap: Record<string, any> = {}

            if (listingIds.length > 0) {
                const { data: paymentsData, error: paymentsError } = await supabase
                    .from('payments')
                    .select('listing_id, status, reference, created_at, paid_at')
                    .in('listing_id', listingIds)

                if (paymentsData && !paymentsError) {
                    paymentsData.forEach((payment: any) => {
                        if (!payment.listing_id) return
                        const existing = paymentsMap[payment.listing_id]
                        if (!existing) {
                            paymentsMap[payment.listing_id] = payment
                            return
                        }
                        const existingTime = new Date(existing.created_at || 0).getTime()
                        const nextTime = new Date(payment.created_at || 0).getTime()
                        if (nextTime > existingTime) {
                            paymentsMap[payment.listing_id] = payment
                        }
                    })
                } else if (paymentsError) {
                    console.warn('Error fetching payments (likely RLS):', paymentsError)
                }
            }

            // 4. Combine data
            const combinedData = listingsData.map(l => ({
                ...l,
                profiles: profilesMap[l.user_id] || { email: 'Unknown (RLS restricted)' },
                payment_status: paymentsMap[l.id]?.status ?? 'none',
                payment_reference: paymentsMap[l.id]?.reference ?? null,
                payment_created_at: paymentsMap[l.id]?.created_at ?? null,
                payment_paid_at: paymentsMap[l.id]?.paid_at ?? null,
            }))

            console.log(`Found ${combinedData.length} listings with status: ${statusFilter}`)
            setListings(combinedData)
            setFilteredListings(combinedData)
        } else {
            setListings([])
            setFilteredListings([])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchListings()
    }, [statusFilter])

    // Filter listings based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            const filtered = listings.filter(listing => {
                const paymentStatus = listing.payment_status || 'none'
                if (paymentFilter !== 'all' && paymentStatus !== paymentFilter) return false
                return true
            })
            setFilteredListings(filtered)
            return
        }

        const query = searchQuery.toLowerCase()
        const filtered = listings.filter(listing =>
            listing.business_name.toLowerCase().includes(query) ||
            listing.city?.toLowerCase().includes(query) ||
            listing.description?.toLowerCase().includes(query) ||
            listing.profiles?.email?.toLowerCase().includes(query)
        ).filter(listing => {
            const paymentStatus = listing.payment_status || 'none'
            if (paymentFilter !== 'all' && paymentStatus !== paymentFilter) return false
            return true
        })
        setFilteredListings(filtered)
    }, [searchQuery, listings, paymentFilter])

    const handleApprove = async (listing: Listing) => {
        if ((listing.payment_status || 'none') !== 'success') {
            alert('Payment is not completed for this listing. Only paid listings can be approved.')
            return
        }
        if (!confirm('Are you sure you want to approve this listing?')) return

        setProcessingId(listing.id)
        try {
            const result = await approveListingServer(listing.id)
            if (result?.error?.message) throw new Error(result.error.message)

            alert('Listing approved successfully.')
            await fetchListings()
        } catch (error) {
            console.error('Approval failed:', error)
            alert(error instanceof Error ? error.message : 'Could not approve the listing.')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async () => {
        if (!rejectingId || !rejectionReason.trim()) {
            alert('Please provide a rejection reason')
            return
        }

        setProcessingId(rejectingId)
        try {
            const result = await rejectListingServer(rejectingId, rejectionReason.trim())
            if (result?.error?.message) throw new Error(result.error.message)

            alert('Listing rejected successfully.')
            setRejectingId(null)
            setRejectionReason('')
            await fetchListings()
        } catch (error) {
            console.error('Rejection failed:', error)
            alert(error instanceof Error ? error.message : 'Could not reject the listing.')
        } finally {
            setProcessingId(null)
        }
    }

    // Check for potential duplicates
    const getPotentialDuplicates = (businessName: string) => {
        const name = businessName.toLowerCase()
        return listings.filter(l =>
            l.business_name.toLowerCase().includes(name) ||
            name.includes(l.business_name.toLowerCase())
        ).length - 1 // Subtract 1 to exclude self
    }

    if (loading) return <div className="p-6">Loading...</div>

    const stats = {
        all: listings.length,
        pending: listings.filter(l => l.status === 'pending').length,
        approved: listings.filter(l => l.status === 'approved').length,
        rejected: listings.filter(l => l.status === 'rejected').length,
    }

    const handleLinkPayment = async (payment: UnlinkedPayment) => {
        const listingId = selectedListingByPayment[payment.id]
        if (!listingId) {
            alert('Select the customer\'s pending listing first.')
            return
        }

        setProcessingId(payment.id)
        try {
            const result = await linkPaymentToExistingListingServer(payment.id, listingId)
            if (result?.error?.message) {
                alert(result.error.message)
                return
            }

            alert(`Payment linked to ${result.data?.business_name || 'the pending listing'}. You can now review and approve it.`)
            await fetchListings()
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Could not link payment to listing.')
        } finally {
            setProcessingId(null)
        }
    }

    const paymentStats = {
        paid: listings.filter(l => (l.payment_status || 'none') === 'success').length,
        pending: listings.filter(l => (l.payment_status || 'none') === 'pending').length,
        noPayment: listings.filter(l => (l.payment_status || 'none') === 'none').length,
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Manage Listings</h2>
                <Link
                    href="/admin/dashboard"
                    className="text-sm text-gray-600 hover:text-gray-900"
                >
                    ← Back to Admin Dashboard
                </Link>
            </div>

            {unlinkedPayments.length > 0 && (
                <section className="mb-6 overflow-hidden rounded-lg border border-amber-300 bg-amber-50 shadow-sm">
                    <div className="border-b border-amber-200 px-4 py-3 sm:px-6">
                        <h3 className="font-semibold text-amber-950">Successful payments needing a listing link</h3>
                        <p className="mt-1 text-sm text-amber-800">
                            Link a payment only to a pending listing submitted by the same customer. Payments with no submitted listing cannot be approved yet.
                        </p>
                    </div>
                    <div className="divide-y divide-amber-200">
                        {unlinkedPayments.map((payment) => {
                            const selectedListingId = selectedListingByPayment[payment.id] || ''
                            const isProcessing = processingId === payment.id
                            return (
                                <div key={payment.id} className="grid gap-4 px-4 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:px-6">
                                    <div>
                                        <p className="font-medium text-gray-900">{payment.profile?.full_name || 'Registered customer'}</p>
                                        <p className="text-sm text-gray-700">{payment.profile?.email || 'Email unavailable'}</p>
                                        <p className="mt-1 text-xs text-gray-500">Reference: {payment.reference}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: payment.currency || 'NGN', maximumFractionDigits: 0 }).format(payment.amount / 100)} · {payment.plan.toUpperCase()}
                                        </p>
                                    </div>

                                    {payment.candidate_listings.length > 0 ? (
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-700" htmlFor={`listing-${payment.id}`}>
                                                Customer's unpaid pending listing
                                            </label>
                                            <select
                                                id={`listing-${payment.id}`}
                                                value={selectedListingId}
                                                onChange={(event) => setSelectedListingByPayment((current) => ({ ...current, [payment.id]: event.target.value }))}
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                                            >
                                                <option value="">Select listing</option>
                                                {payment.candidate_listings.map((candidate) => (
                                                    <option key={candidate.id} value={candidate.id}>{candidate.business_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-red-700">
                                            No pending business listing was submitted. Ask this customer to sign in and complete the listing form before approval.
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => handleLinkPayment(payment)}
                                        disabled={!selectedListingId || isProcessing}
                                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                                    >
                                        {isProcessing ? 'Linking...' : 'Link payment'}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                {/* Search Bar */}
                <div>
                    <input
                        type="text"
                        placeholder="Search by business name, city, or user email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                {/* Status Filter Tabs */}
                <div className="flex space-x-2 border-b border-gray-200">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${statusFilter === status
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                                {status === 'all' ? stats.all : stats[status]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Payment Filter */}
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-600">Payment:</label>
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="all">All</option>
                        <option value="success">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="abandoned">Abandoned</option>
                        <option value="failed">Failed</option>
                        <option value="none">No payment started</option>
                    </select>
                    <span className="text-xs text-gray-500">
                        Paid {paymentStats.paid} • Payment pending {paymentStats.pending} • No linked payment {paymentStats.noPayment}
                    </span>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
                Showing {filteredListings.length} of {listings.length} listings
            </div>

            {/* Listings */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {filteredListings.length > 0 ? (
                        filteredListings.map((listing) => {
                            const duplicateCount = getPotentialDuplicates(listing.business_name)
                            const isProcessing = processingId === listing.id
                            const paymentStatus = listing.payment_status || 'none'
                            const paymentLabel =
                                paymentStatus === 'success'
                                    ? 'Paid'
                                    : paymentStatus === 'pending'
                                        ? 'Pending'
                                        : paymentStatus === 'abandoned'
                                            ? 'Abandoned'
                                            : paymentStatus === 'failed'
                                                ? 'Failed'
                                                : 'No payment'
                            const paymentClass =
                                paymentStatus === 'success'
                                    ? 'bg-green-100 text-green-800'
                                    : paymentStatus === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : paymentStatus === 'abandoned'
                                            ? 'bg-orange-100 text-orange-800'
                                            : paymentStatus === 'failed'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-gray-100 text-gray-600'
                            const canApprove = paymentStatus === 'success'

                            return (
                                <li key={listing.id} className="px-4 py-4 sm:px-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {listing.business_name}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${listing.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    listing.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${paymentClass}`}>
                                                    {paymentLabel}
                                                </span>
                                                {duplicateCount > 0 && (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                                        ⚠️ {duplicateCount} similar
                                                    </span>
                                                )}
                                            </div>

                                            {/* User Info */}
                                            <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                                                <span>📧 Registered email: {listing.profiles?.email || 'Unavailable'}</span>
                                                {listing.profiles?.full_name && (
                                                    <span>👤 {listing.profiles.full_name}</span>
                                                )}
                                            </div>

                                            {/* Business Details */}
                                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                                <span>📍 {listing.city}</span>
                                                {listing.phone && <span>📞 {listing.phone}</span>}
                                                {listing.categories?.name && (
                                                    <span>🏷️ {listing.categories.name}</span>
                                                )}
                                            </div>

                                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                                {listing.description}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                Submitted: {new Date(listing.created_at).toLocaleString()}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400">
                                                Payment status: {paymentLabel}
                                                {listing.payment_reference ? ` (ref: ${listing.payment_reference})` : ''}
                                            </p>

                                            {listing.rejection_reason && listing.status === 'rejected' && (
                                                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                                    <strong>Rejection reason:</strong> {listing.rejection_reason}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        {listing.status === 'pending' && (
                                            <div className="ml-4 flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleApprove(listing)}
                                                    disabled={isProcessing || !canApprove}
                                                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white ${isProcessing
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : !canApprove
                                                            ? 'bg-gray-300 cursor-not-allowed'
                                                        : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                                                        }`}
                                                >
                                                    {isProcessing ? 'Processing...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => setRejectingId(listing.id)}
                                                    disabled={isProcessing}
                                                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white ${isProcessing
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                                                        }`}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            )
                        })
                    ) : (
                        <li className="px-4 py-12 text-center text-gray-500">
                            {searchQuery
                                ? `No listings found matching "${searchQuery}"`
                                : `No ${statusFilter === 'all' ? '' : statusFilter} listings found.`
                            }
                        </li>
                    )}
                </ul>
            </div>

            {/* Rejection Modal */}
            {rejectingId && (
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setRejectingId(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Reject Listing
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 mb-2">
                                                Please provide a reason for rejection. This will be visible to the user.
                                            </p>
                                            <textarea
                                                className="w-full shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm border-gray-300 rounded-md"
                                                rows={3}
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="e.g. Incomplete information, Inappropriate content..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    onClick={handleReject}
                                    disabled={!rejectionReason.trim() || processingId === rejectingId}
                                >
                                    {processingId === rejectingId ? 'Processing...' : 'Reject Listing'}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => {
                                        setRejectingId(null)
                                        setRejectionReason('')
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
