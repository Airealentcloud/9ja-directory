import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    const { count: pendingCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    const { count: totalCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Approvals</dt>
                        <dd className="mt-1 text-3xl font-semibold text-yellow-600">{pendingCount || 0}</dd>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Listings</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalCount || 0}</dd>
                    </div>
                </div>
            </div>
        </div>
    )
}
