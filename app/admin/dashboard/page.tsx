import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    const { count: pendingCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    const { count: approvedCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')

    const { count: totalCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Pending Approvals - Clickable and Prominent */}
                <Link href="/admin/listings" className="block">
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 overflow-hidden shadow-lg rounded-lg border-2 border-yellow-400 hover:shadow-xl transition-shadow cursor-pointer">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <dt className="text-sm font-medium text-gray-700 truncate">Pending Approvals</dt>
                                    <dd className="mt-1 text-4xl font-bold text-yellow-600">{pendingCount || 0}</dd>
                                    {pendingCount && pendingCount > 0 ? (
                                        <p className="mt-2 text-sm text-yellow-700 font-medium">
                                            Click to review →
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-sm text-gray-500">
                                            No pending listings
                                        </p>
                                    )}
                                </div>
                                <div className="flex-shrink-0">
                                    <svg className="h-12 w-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Approved Listings */}
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 truncate">Approved Listings</dt>
                                <dd className="mt-1 text-3xl font-semibold text-green-600">{approvedCount || 0}</dd>
                            </div>
                            <div className="flex-shrink-0">
                                <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Listings */}
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Listings</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalCount || 0}</dd>
                            </div>
                            <div className="flex-shrink-0">
                                <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            {pendingCount && pendingCount > 0 && (
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-blue-800">
                                Action Required
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>
                                    You have <strong>{pendingCount}</strong> listing{pendingCount > 1 ? 's' : ''} waiting for approval.
                                </p>
                            </div>
                            <div className="mt-4">
                                <Link
                                    href="/admin/listings"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Review Pending Listings
                                    <svg className="ml-2 -mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
