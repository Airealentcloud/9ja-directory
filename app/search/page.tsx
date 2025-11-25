import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; state?: string }>
}) {
    const { q, state } = await searchParams
    const query = q || ''
    const stateSlug = state || ''

    if (!query && !stateSlug) {
        redirect('/')
    }

    const supabase = await createClient()

    // Build the search query - simplified to avoid relation errors
    let searchQuery = supabase
        .from('listings')
        .select('*')
        .eq('status', 'approved')

    // Filter by search term if provided
    if (query) {
        searchQuery = searchQuery.or(
            `business_name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`
        )
    }

    // Filter by state if provided
    if (stateSlug && stateSlug !== '') {
        const { data: stateData } = await supabase
            .from('states')
            .select('id')
            .eq('slug', stateSlug)
            .single()

        if (stateData) {
            searchQuery = searchQuery.eq('state_id', stateData.id)
        }
    }

    const { data: results, error } = await searchQuery.order('created_at', {
        ascending: false,
    })

    // Debug logging with full error details
    console.log('Search params:', { query, stateSlug })
    console.log('Search results:', { count: results?.length, error: error ? JSON.stringify(error) : null })
    if (error) {
        console.error('Full search error:', error)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-green-600 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="text-sm hover:underline mb-2 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold">Search Results</h1>
                    <p className="text-green-100 mt-2">
                        {query && `Showing results for "${query}"`}
                        {query && stateSlug && ' in '}
                        {stateSlug && stateSlug !== '' && `${stateSlug.replace('-', ' ')}`}
                    </p>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        Error loading results. Please try again.
                    </div>
                )}

                {!error && results && results.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            No results found
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Try adjusting your search terms or browse by category
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Back to Home
                        </Link>
                    </div>
                )}

                {!error && results && results.length > 0 && (
                    <>
                        <div className="mb-6">
                            <p className="text-gray-600">
                                Found <strong>{results.length}</strong> business
                                {results.length !== 1 ? 'es' : ''}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.map((listing) => (
                                <Link
                                    key={listing.id}
                                    href={`/listings/${listing.slug}`}
                                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
                                >
                                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                                        {listing.image_url ? (
                                            <img
                                                src={listing.image_url}
                                                alt={listing.business_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                                                🏢
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-lg text-gray-900 flex-1">
                                                {listing.business_name}
                                            </h3>
                                            {listing.status && listing.status !== 'approved' && (
                                                <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    {listing.status}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Business
                                        </p>
                                        <p className="text-sm text-gray-500 flex items-center mb-2">
                                            <span className="mr-1">📍</span>
                                            {listing.city || 'Nigeria'}
                                        </p>
                                        {listing.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {listing.description}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
