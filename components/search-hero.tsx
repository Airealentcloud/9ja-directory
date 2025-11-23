'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type State = {
    name: string
    slug: string
}

export default function SearchHero({ states }: { states: State[] }) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedState, setSelectedState] = useState('')

    const handleSearch = (e: FormEvent) => {
        e.preventDefault()

        // Build search URL with query parameters
        const params = new URLSearchParams()
        if (searchQuery.trim()) {
            params.set('q', searchQuery.trim())
        }
        if (selectedState) {
            params.set('state', selectedState)
        }

        // Navigate to search page
        router.push(`/search?${params.toString()}`)
    }

    return (
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    Discover Local Businesses Across Nigeria
                </h1>
                <p className="text-xl md:text-2xl mb-10 text-green-100">
                    Connect with trusted services in your area
                </p>

                <div className="max-w-4xl mx-auto">
                    <form
                        onSubmit={handleSearch}
                        className="bg-white rounded-lg shadow-xl p-4 flex flex-col md:flex-row gap-3"
                    >
                        <input
                            type="text"
                            name="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="What business/service are you looking for?"
                            aria-label="Search for businesses or services"
                            className="flex-1 px-4 py-3 text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <select
                            name="state"
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            aria-label="Select state"
                            className="px-4 py-3 text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white min-w-[200px]"
                        >
                            <option value="">Nigeria (All States)</option>
                            {(states || []).map((state) => (
                                <option key={state.slug} value={state.slug}>
                                    {state.name}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold transition-colors"
                            aria-label="Search businesses"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>
        </section>
    )
}
