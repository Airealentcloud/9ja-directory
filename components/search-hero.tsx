'use client'

import Image from 'next/image'
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
        <section className="relative isolate overflow-hidden text-white">
            <div className="absolute inset-0">
                <Image
                    src="/images/hero-nigeria.jpg"
                    alt="Abuja cityscape along a highway"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-green-900/75 to-emerald-700/60" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                    Discover Local Businesses Across Nigeria
                </h1>
                <p className="text-xl md:text-2xl mb-10 text-green-50 drop-shadow-md">
                    Connect with trusted services in your area
                </p>

                <div className="max-w-4xl mx-auto">
                    <form
                        onSubmit={handleSearch}
                        className="bg-white/95 rounded-lg shadow-2xl p-4 flex flex-col md:flex-row gap-3 backdrop-blur"
                    >
                        <input
                            type="text"
                            name="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="What business/service are you looking for?"
                            aria-label="Search for businesses or services"
                            className="flex-1 px-4 py-3 text-gray-900 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <select
                            name="state"
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            aria-label="Select state"
                            className="px-4 py-3 text-gray-900 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white min-w-[200px]"
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
