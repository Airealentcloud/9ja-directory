'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { PRICING_PLANS, type PlanId } from '@/lib/pricing'

type Category = { id: string; name: string }
type State = { id: string; name: string }

export default function CheckoutPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const planId = searchParams.get('plan') as PlanId | null
    const selectedPlan = PRICING_PLANS.find(p => p.id === planId)

    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<any>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [states, setStates] = useState<State[]>([])
    const supabase = createClient()

    // Listing form state
    const [businessName, setBusinessName] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [description, setDescription] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [website, setWebsite] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
    const [address, setAddress] = useState('')
    const [stateId, setStateId] = useState('')
    const [city, setCity] = useState('')

    useEffect(() => {
        const initialize = async () => {
            // Check user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push(planId ? `/signup?plan=${planId}` : '/pricing')
                return
            }
            setUser(user)
            setEmail(user.email || '')

            // Fetch categories and states
            const [categoriesRes, statesRes] = await Promise.all([
                supabase.from('categories').select('id, name').order('name'),
                supabase.from('states').select('id, name').order('name')
            ])

            setCategories(categoriesRes.data || [])
            setStates(statesRes.data || [])
            setLoading(false)
        }
        initialize()
    }, [planId, router, supabase])

    const validateForm = () => {
        if (!businessName.trim()) {
            setError('Business name is required')
            return false
        }
        if (!categoryId) {
            setError('Please select a category')
            return false
        }
        if (!description.trim()) {
            setError('Business description is required')
            return false
        }
        if (!phone.trim()) {
            setError('Phone number is required')
            return false
        }
        if (!stateId) {
            setError('Please select a state')
            return false
        }
        if (!city.trim()) {
            setError('City is required')
            return false
        }
        return true
    }

    const handlePayment = async () => {
        if (!selectedPlan) {
            setError('Please select a plan')
            return
        }

        if (!validateForm()) {
            return
        }

        setProcessing(true)
        setError(null)

        try {
            const listingData = {
                business_name: businessName.trim(),
                category_id: categoryId,
                description: description.trim(),
                phone: phone.trim(),
                email: email.trim(),
                website_url: website.trim(),
                whatsapp_number: whatsapp.trim(),
                address: address.trim(),
                state_id: stateId,
                city: city.trim(),
            }

            const response = await fetch('/api/payments/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan_id: selectedPlan.id,
                    listing_data: listingData,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to initialize payment')
            }

            // Redirect to Paystack
            window.location.href = data.data.authorization_url
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!selectedPlan) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                    <div className="text-red-500 text-5xl mb-4">!</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">No plan selected</h1>
                    <p className="text-gray-600 mb-6">Please select a plan to continue.</p>
                    <Link
                        href="/pricing"
                        className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
                    >
                        View Plans
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Complete Your Listing</h1>
                    <p className="mt-2 text-gray-600">Fill in your business details and complete payment</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Listing Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Information</h2>

                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Business Name */}
                                <div>
                                    <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Business Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="business_name"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="Enter your business name"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="category"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="Describe your business, services, and what makes you unique"
                                    />
                                </div>

                                {/* Phone and WhatsApp */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="+234..."
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                                            WhatsApp (optional)
                                        </label>
                                        <input
                                            type="tel"
                                            id="whatsapp"
                                            value={whatsapp}
                                            onChange={(e) => setWhatsapp(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="+234..."
                                        />
                                    </div>
                                </div>

                                {/* Email and Website */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Business Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="contact@yourbusiness.com"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                                            Website (optional)
                                        </label>
                                        <input
                                            type="url"
                                            id="website"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="https://yourbusiness.com"
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="Street address"
                                    />
                                </div>

                                {/* State and City */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                            State <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="state"
                                            value={stateId}
                                            onChange={(e) => setStateId(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value="">Select a state</option>
                                            {states.map((state) => (
                                                <option key={state.id} value={state.id}>{state.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                            City <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="Enter city"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
                            {/* Plan Summary */}
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-900">{selectedPlan.name} Plan</p>
                                        <p className="text-sm text-gray-500">{selectedPlan.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-gray-900">{selectedPlan.priceFormatted}</p>
                                        <p className="text-sm text-gray-500">/{selectedPlan.intervalLabel}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="p-6 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">What's included:</h3>
                                <ul className="space-y-2">
                                    {selectedPlan.features.slice(0, 4).map((feature, index) => (
                                        <li key={index} className="flex items-start text-sm">
                                            <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* User Info */}
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Account</h3>
                                <p className="text-gray-900">{user?.email}</p>
                                <p className="text-sm text-gray-500">{user?.user_metadata?.full_name}</p>
                            </div>

                            {/* Payment Button */}
                            <div className="p-6">
                                <button
                                    onClick={handlePayment}
                                    disabled={processing}
                                    className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        `Pay ${selectedPlan.priceFormatted}`
                                    )}
                                </button>
                                <p className="mt-4 text-xs text-gray-500 text-center">
                                    Secure payment powered by Paystack. Your listing will be submitted for review after payment.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 text-center">
                            <Link href="/pricing" className="text-sm text-gray-600 hover:text-green-600">
                                Change plan
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
