import { createClient } from '@/lib/supabase/server'
import { approveClaim, rejectClaim } from '@/app/actions/admin'
import { redirect } from 'next/navigation'

export default async function AdminClaimsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const { status } = await searchParams
    const currentStatus = status || 'pending'
    const supabase = await createClient()

    // Check admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch claims with listing and user details
    const { data: claims, error } = await supabase
        .from('claim_requests')
        .select(`
      *,
      listings (business_name, slug, claimed, claimed_by),
      profiles:user_id (full_name, email)
    `)
        .eq('status', currentStatus)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching claims:', error)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Claim Moderation</h1>
                <div className="flex space-x-2">
                    <a
                        href="/admin/claims?status=pending"
                        className={`px-4 py-2 rounded-md text-sm font-medium ${currentStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Pending
                    </a>
                    <a
                        href="/admin/claims?status=approved"
                        className={`px-4 py-2 rounded-md text-sm font-medium ${currentStatus === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Approved
                    </a>
                    <a
                        href="/admin/claims?status=rejected"
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
                    {claims && claims.length > 0 ? (
                        claims.map((claim) => (
                            <li key={claim.id} className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Claim for: {claim.listings?.business_name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Requested by: {claim.profiles?.full_name} ({claim.profiles?.email})
                                        </p>
                                        {claim.listings?.claimed && claim.status === 'pending' && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                                                Warning: Business already claimed by another user
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(claim.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-md mb-4 space-y-3">
                                    <div>
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Additional Notes
                                        </span>
                                        <p className="text-gray-700 mt-1">{claim.notes || 'No notes provided.'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Proof of Ownership
                                        </span>
                                        <p className="text-gray-700 mt-1 break-all">
                                            {claim.proof_document ? (
                                                claim.proof_document.startsWith('http') ? (
                                                    <a href={claim.proof_document} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                        {claim.proof_document}
                                                    </a>
                                                ) : (
                                                    claim.proof_document
                                                )
                                            ) : (
                                                'No proof provided.'
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {currentStatus === 'pending' && (
                                    <div className="flex justify-end space-x-3">
                                        <form action={async () => {
                                            'use server'
                                            await rejectClaim(claim.id, 'Insufficient proof')
                                        }}>
                                            <button
                                                type="submit"
                                                className="text-red-600 hover:text-red-900 font-medium px-4 py-2"
                                            >
                                                Reject
                                            </button>
                                        </form>
                                        <form action={async () => {
                                            'use server'
                                            await approveClaim(claim.id)
                                        }}>
                                            <button
                                                type="submit"
                                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
                                            >
                                                Approve Claim
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </li>
                        ))
                    ) : (
                        <li className="p-12 text-center text-gray-500">
                            No {currentStatus} claims found.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}
