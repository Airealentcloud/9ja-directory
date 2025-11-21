'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

type Listing = {
    id: string
    business_name: string
    description: string
    status: string
    created_at: string
    user_id: string
    city: string
}

export default function AdminListingsPage() {
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const supabase = createClient()

    const fetchListings = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('listings')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (data) setListings(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchListings()
    }, [])

    const handleApprove = async (id: string) => {
        if (!confirm('Are you sure you want to approve this listing?')) return

        const { error } = await supabase
            .from('listings')
            .update({ status: 'approved', rejection_reason: null })
            .eq('id', id)

        if (error) {
            alert('Error approving listing: ' + error.message)
        } else {
            fetchListings()
        }
    }

    const handleReject = async () => {
        if (!rejectingId || !rejectionReason) return

        const { error } = await supabase
            .from('listings')
            .update({
                status: 'rejected',
                rejection_reason: rejectionReason
            })
            .eq('id', rejectingId)

        if (error) {
            alert('Error rejecting listing: ' + error.message)
        } else {
            setRejectingId(null)
            setRejectionReason('')
            fetchListings()
        }
    }

    if (loading) return <div className="p-6">Loading...</div>

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Listings</h2>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {listings.length > 0 ? (
                        listings.map((listing) => (
                            <li key={listing.id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">{listing.business_name}</h3>
                                        <p className="text-sm text-gray-500">{listing.city}</p>
                                        <p className="mt-2 text-sm text-gray-600">{listing.description}</p>
                                        <p className="mt-1 text-xs text-gray-400">Submitted: {new Date(listing.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="ml-4 flex items-center space-x-2">
                                        <button
                                            onClick={() => handleApprove(listing.id)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => setRejectingId(listing.id)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-12 text-center text-gray-500">
                            No pending listings found.
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
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={handleReject}
                                >
                                    Reject Listing
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setRejectingId(null)}
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
