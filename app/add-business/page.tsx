'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = {
    id: string
    name: string
}

type State = {
    id: string
    name: string
}

export default function AddBusinessPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [states, setStates] = useState<State[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    // Form State
    const [formData, setFormData] = useState({
        business_name: '',
        description: '',
        category_id: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        state_id: '',
        city: '', // We'll treat city as text for now or fetch cities based on state later
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check auth
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/login?next=/add-business')
                    return
                }

                // Fetch categories
                const { data: categoriesData } = await supabase
                    .from('categories')
                    .select('id, name')
                    .order('name')

                if (categoriesData) setCategories(categoriesData)

                // Fetch states
                const { data: statesData } = await supabase
                    .from('states')
                    .select('id, name')
                    .order('name')

                if (statesData) setStates(statesData)

            } catch (err) {
                console.error('Error fetching data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router, supabase])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error('You must be logged in to add a business')

            // Generate a simple slug from business name
            const slug = formData.business_name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7)

            const { error: insertError } = await supabase
                .from('listings')
                .insert({
                    user_id: user.id,
                    business_name: formData.business_name,
                    slug: slug,
                    description: formData.description,
                    category_id: formData.category_id,
                    phone: formData.phone,
                    email: formData.email,
                    website: formData.website,
                    address: formData.address,
                    state_id: formData.state_id,
                    status: 'pending' // Default status
                })

            if (insertError) throw insertError

            // Redirect to dashboard or success page
            router.push('/dashboard?success=true') // Assuming we'll make a dashboard later, or just home for now
            // For now, go home with a query param
            router.push('/?listing_submitted=true')

        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Add Your Business</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Fill in the details to list your business on 9jaDirectory.
                        </p>
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-6 gap-6">

                                {/* Business Name */}
                                <div className="col-span-6">
                                    <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
                                        Business Name
                                    </label>
                                    <input
                                        type="text"
                                        name="business_name"
                                        id="business_name"
                                        required
                                        value={formData.business_name}
                                        onChange={handleChange}
                                        className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>

                                {/* Category */}
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                                        Category
                                    </label>
                                    <select
                                        id="category_id"
                                        name="category_id"
                                        required
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Description */}
                                <div className="col-span-6">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={3}
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Brief description of your business.
                                    </p>
                                </div>

                                {/* Contact Info */}
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        id="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>

                                <div className="col-span-6">
                                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        name="website"
                                        id="website"
                                        placeholder="https://example.com"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>

                                {/* Location */}
                                <div className="col-span-6">
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        id="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="state_id" className="block text-sm font-medium text-gray-700">
                                        State
                                    </label>
                                    <select
                                        id="state_id"
                                        name="state_id"
                                        required
                                        value={formData.state_id}
                                        onChange={handleChange}
                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    >
                                        <option value="">Select a state</option>
                                        {states.map(state => (
                                            <option key={state.id} value={state.id}>{state.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        id="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>

                            </div>

                            {error && (
                                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Business'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
