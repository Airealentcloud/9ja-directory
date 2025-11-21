import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MyListingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: listings } = await supabase
        .from('listings')
        .select('*, categories(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>
                <Link
                    href="/add-business"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    Add New Business
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {listings && listings.length > 0 ? (
                        listings.map((listing) => (
                            <li key={listing.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-green-600 truncate">{listing.business_name}</p>
                                                <div className="ml-2 flex-shrink-0 flex">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${listing.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                            listing.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500 mr-6">
                                                        {/* @ts-ignore */}
                                                        {listing.categories?.name || 'Uncategorized'}
                                                    </p>
                                                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                        {listing.city}
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                    <p>
                                                        Added on <time dateTime={listing.created_at}>{new Date(listing.created_at).toLocaleDateString()}</time>
                                                    </p>
                                                </div>
                                            </div>
                                            {listing.rejection_reason && listing.status === 'rejected' && (
                                                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                                    <strong>Reason for rejection:</strong> {listing.rejection_reason}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-5 flex-shrink-0 flex space-x-2">
                                            <Link
                                                href={`/dashboard/edit/${listing.id}`}
                                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                            >
                                                Edit
                                            </Link>
                                            {/* Delete button would go here (requires client component or server action) */}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-12 text-center text-gray-500">
                            <p className="mb-4">You haven't added any businesses yet.</p>
                            <Link
                                href="/add-business"
                                className="text-green-600 font-medium hover:underline"
                            >
                                Get started by adding your first business
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}
