import { createClient } from '@/lib/supabase/server'

export default async function StatsPage() {
  const supabase = await createClient()

  // Get total counts
  const { count: totalListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })

  const { count: approvedListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  // Get breakdown by state
  const { data: stateBreakdown } = await supabase
    .from('listings')
    .select('state_id, states(name)')
    .eq('status', 'approved')

  const stateCounts = stateBreakdown?.reduce((acc: any, item: any) => {
    const stateName = item.states?.name || 'Unknown'
    acc[stateName] = (acc[stateName] || 0) + 1
    return acc
  }, {})

  // Get breakdown by category
  const { data: categoryBreakdown } = await supabase
    .from('listings')
    .select('category_id, categories(name)')
    .eq('status', 'approved')

  const categoryCounts = categoryBreakdown?.reduce((acc: any, item: any) => {
    const categoryName = item.categories?.name || 'Unknown'
    acc[categoryName] = (acc[categoryName] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-8">Database Statistics</h1>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-5xl font-bold text-green-600 mb-2">{totalListings}</div>
            <div className="text-gray-600">Total Listings</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">{approvedListings}</div>
            <div className="text-gray-600">Approved (Visible)</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-5xl font-bold text-purple-600 mb-2">
              {Object.keys(stateCounts || {}).length}
            </div>
            <div className="text-gray-600">States Covered</div>
          </div>
        </div>

        {/* By State */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-6">Listings by State</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stateCounts || {})
              .sort(([, a]: any, [, b]: any) => b - a)
              .map(([state, count]) => (
                <div key={state} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">{state}</span>
                  <span className="text-lg font-bold text-green-600">{count as number}</span>
                </div>
              ))}
          </div>
        </div>

        {/* By Category */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Listings by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryCounts || {})
              .sort(([, a]: any, [, b]: any) => b - a)
              .map(([category, count]) => (
                <div key={category} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">{category}</span>
                  <span className="text-lg font-bold text-blue-600">{count as number}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-green-600 hover:text-green-700 font-semibold">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
