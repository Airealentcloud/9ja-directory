import { createClient } from '@/lib/supabase/server'

export default async function TestDBPage() {
  const supabase = await createClient()

  // Test connection by fetching categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .limit(5)

  // Test connection by fetching states
  const { data: states, error: stateError } = await supabase
    .from('states')
    .select('*')
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🔌 Supabase Connection Test
        </h1>

        {/* Categories Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📁 Categories Table</h2>
          {catError ? (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="text-red-800 font-semibold">❌ Error:</p>
              <p className="text-red-600 text-sm mt-2">{catError.message}</p>
              <p className="text-gray-600 text-xs mt-4">
                This likely means you haven't run the database schema yet.
                Go to your Supabase dashboard → SQL Editor and run the code from database-schema.sql
              </p>
            </div>
          ) : categories && categories.length > 0 ? (
            <div>
              <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                <p className="text-green-800 font-semibold">✅ Connection Successful!</p>
                <p className="text-green-600 text-sm">Found {categories.length} categories</p>
              </div>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.id} className="flex items-center p-3 bg-gray-50 rounded">
                    <span className="text-2xl mr-3">{cat.icon}</span>
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-sm text-gray-500">{cat.slug}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-yellow-800">⚠️ No categories found. Database might be empty.</p>
            </div>
          )}
        </div>

        {/* States Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🗺️ States Table</h2>
          {stateError ? (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="text-red-800 font-semibold">❌ Error:</p>
              <p className="text-red-600 text-sm mt-2">{stateError.message}</p>
            </div>
          ) : states && states.length > 0 ? (
            <div>
              <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                <p className="text-green-800 font-semibold">✅ Connection Successful!</p>
                <p className="text-green-600 text-sm">Found {states.length} states</p>
              </div>
              <ul className="grid grid-cols-2 gap-2">
                {states.map((state) => (
                  <li key={state.id} className="p-3 bg-gray-50 rounded">
                    <p className="font-medium">{state.name}</p>
                    <p className="text-sm text-gray-500">{state.code}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-yellow-800">⚠️ No states found. Database might be empty.</p>
            </div>
          )}
        </div>

        {/* Connection Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Connection Info</h3>
          <p className="text-sm text-blue-800 mb-1">
            <strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}
          </p>
          <p className="text-sm text-blue-800">
            <strong>API Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30)}...
          </p>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ← Back to Homepage
          </a>
        </div>
      </div>
    </div>
  )
}
