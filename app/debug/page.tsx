import { createClient } from '@/lib/supabase/server'

export default async function DebugPage() {
  const supabase = await createClient()

  // Fetch all listings without filters
  const { data: allListings, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch all categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .limit(20)

  // Fetch all states
  const { data: states, error: statesError } = await supabase
    .from('states')
    .select('*')
    .limit(40)

  // Count listings by status
  const { data: statusCounts } = await supabase
    .from('listings')
    .select('status')

  const statusBreakdown = statusCounts?.reduce((acc: Record<string, number>, item) => {
    acc[item.status || 'null'] = (acc[item.status || 'null'] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Debug Information</h1>

        {/* Listings Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Listings</h2>

          {listingsError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error: {listingsError.message}
            </div>
          )}

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Status Breakdown:</h3>
            <pre className="bg-gray-100 p-3 rounded">
              {JSON.stringify(statusBreakdown, null, 2)}
            </pre>
          </div>

          <h3 className="font-semibold mb-2">Last 10 Listings:</h3>
          {allListings && allListings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">State ID</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allListings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="px-4 py-2 text-sm">{listing.id}</td>
                      <td className="px-4 py-2 text-sm">{listing.business_name}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          listing.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {listing.status || 'null'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">{listing.is_featured ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2 text-sm">{listing.category_id || 'null'}</td>
                      <td className="px-4 py-2 text-sm">{listing.state_id || 'null'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No listings found in database</p>
          )}
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Categories</h2>

          {categoriesError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error: {categoriesError.message}
            </div>
          )}

          <p className="mb-2">Total Categories: {categories?.length || 0}</p>

          {categories && categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="border rounded p-3">
                  <div className="text-2xl mb-1">{category.icon || '🏢'}</div>
                  <div className="font-semibold text-sm">{category.name}</div>
                  <div className="text-xs text-gray-500">ID: {category.id}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No categories found</p>
          )}
        </div>

        {/* States Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">States</h2>

          {statesError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error: {statesError.message}
            </div>
          )}

          <p className="mb-2">Total States: {states?.length || 0}</p>

          {states && states.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {states.map((state) => (
                <div key={state.id} className="border rounded p-2 text-sm">
                  {state.name}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No states found</p>
          )}
        </div>
      </div>
    </div>
  )
}
