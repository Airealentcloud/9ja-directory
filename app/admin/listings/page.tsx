'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAdminListings, approveListingServer, rejectListingServer } from '@/app/actions/admin'

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
    categories?: {
        name: string
    }
    profiles?: {
        email: string
        full_name?: string
    }
}

export default function AdminListingsPage() {
    const [listings, setListings] = useState<Listing[]>([])
    const [filteredListings, setFilteredListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
    const [processingId, setProcessingId] = useState<string | null>(null)
    const supabase = createClient()

    const fetchListings = async () => {
        setLoading(true)

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

            // 3. Combine data
            const combinedData = listingsData.map(l => ({
                ...l,
                profiles: profilesMap[l.user_id] || { email: 'Unknown (RLS restricted)' }
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
            setFilteredListings(listings)
            return
        }

        const query = searchQuery.toLowerCase()
        const filtered = listings.filter(listing =>
            listing.business_name.toLowerCase().includes(query) ||
            listing.city?.toLowerCase().includes(query) ||
            listing.description?.toLowerCase().includes(query) ||
            listing.profiles?.email?.toLowerCase().includes(query)
        )
        setFilteredListings(filtered)
    }, [searchQuery, listings])

    const handleApprove = async (id: string) => {
        if (!confirm('Are you sure you want to approve this listing?')) return

        setProcessingId(id)
        console.log('Attempting to approve listing:', id)

        try {
            // Try server action first
            const result = await approveListingServer(id)

            if (result && !result.error) {
                console.log('Successfully approved listing via server')
                alert('✅ Listing approved successfully!')
                // Trigger email notification
                try {
                    await fetch('/api/send-emails', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ listingId: id, action: 'approved' })
                    })
                } catch (emailError) {
                    console.error('Error sending email:', emailError)
                }
                fetchListings()
                setProcessingId(null)
                return
            }

            // Fallback to client-side
            console.log('Server action failed/skipped, trying client-side...', result?.error)

            const { data, error } = await supabase
                .from('listings')
                .update({ status: 'approved', rejection_reason: null })
                .eq('id', id)
                .select()

            console.log('Approve result:', { data, error })

            if (error) {
                console.error('Error approving listing:', error)
                alert('Error approving listing: ' + error.message)
            } else if (!data || data.length === 0) {
                console.error('No data returned. RLS policy might be blocking the update.')
                alert('⚠️ Approval failed! The database blocked the update. This is likely a permission issue. Please run the "fix-approval-permissions.sql" script in Supabase.')
            } else {
                console.log('Successfully approved listing')
                alert('✅ Listing approved successfully!')

                // Trigger email notification
                try {
                    await fetch('/api/send-emails', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ listingId: id, action: 'approved' })
                    })
                } catch (emailError) {
                    console.error('Error sending email:', emailError)
                }

                fetchListings()
            }
        } catch (err) {
            console.error('Unexpected error:', err)
            alert('Unexpected error: ' + (err as Error).message)
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
        console.log('Attempting to reject listing:', rejectingId)

        try {
            // Try server action first
            const result = await rejectListingServer(rejectingId, rejectionReason)

            if (result && !result.error) {
                console.log('Successfully rejected listing via server')
                alert('✅ Listing rejected successfully!')
                // Trigger email notification
                try {
                    await fetch('/api/send-emails', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ listingId: rejectingId, action: 'rejected' })
                    })
                } catch (emailError) {
                    console.error('Error sending email:', emailError)
                }
                setRejectingId(null)
                setRejectionReason('')
                fetchListings()
                setProcessingId(null)
                return
            }

            // Fallback to client-side
            console.log('Server action failed/skipped, trying client-side...', result?.error)

            const { data, error } = await supabase
                .from('listings')
                .update({
                    status: 'rejected',
                    rejection_reason: rejectionReason
                })
                .eq('id', rejectingId)
                .select()

            console.log('Reject result:', { data, error })

            if (error) {
                console.error('Error rejecting listing:', error)
                alert('Error rejecting listing: ' + error.message)
            } else if (!data || data.length === 0) {
                console.error('No data returned. RLS policy might be blocking the update.')
                alert('⚠️ Rejection failed! The database blocked the update. This is likely a permission issue.')
            } else {
                console.log('Successfully rejected listing')
                alert('✅ Listing rejected successfully!')

                // Trigger email notification
                try {
                    await fetch('/api/send-emails', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ listingId: rejectingId, action: 'rejected' })
                    })
                } catch (emailError) {
                    console.error('Error sending email:', emailError)
                }

                setRejectingId(null)
                setRejectionReason('')
                fetchListings()
            }
        } catch (err) {
            console.error('Unexpected error:', err)
            alert('Unexpected error: ' + (err as Error).message)
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
                                                {duplicateCount > 0 && (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                                        ⚠️ {duplicateCount} similar
                                                    </span>
                                                )}
                                            </div>

                                            {/* User Info */}
                                            <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                                                <span>📧 {listing.profiles?.email || 'Unknown user'}</span>
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
                                                    onClick={() => handleApprove(listing.id)}
                                                    disabled={isProcessing}
                                                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white ${isProcessing
                                                        ? 'bg-gray-400 cursor-not-allowed'
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
