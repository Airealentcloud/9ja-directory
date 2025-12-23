'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PRICING_PLANS, type PlanId } from '@/lib/pricing'

export default function ListingCreatedPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const listingId = searchParams.get('listing_id')

    const [loading, setLoading] = useState<PlanId | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSelectPlan = async (planId: PlanId) => {
        if (!listingId) {
            setError('Missing listing ID')
            return
        }

        setLoading(planId)
        setError(null)

        try {
            const response = await fetch('/api/payments/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan_id: planId,
                    listing_id: listingId,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 401) {
                    router.push(`/login?redirect=/listing-created?listing_id=${listingId}`)
                    return
                }
                throw new Error(data.error || 'Failed to initialize payment')
            }

            // Redirect to Paystack checkout
            window.location.href = data.data.authorization_url
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
            setLoading(null)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            {/* Success Header */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        className="w-10 h-10 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Listing Created Successfully!
                </h1>
                <p className="text-lg text-gray-600 max-w-xl mx-auto">
                    Your business has been saved. To get your listing approved and visible to customers,
                    please select a plan below.
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="max-w-3xl mx-auto px-4 mb-8">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                </div>
            )}

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                    Choose Your Plan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {PRICING_PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                                plan.highlighted
                                    ? 'ring-2 ring-green-500 md:scale-105'
                                    : 'border border-gray-200'
                            }`}
                        >
                            {/* Badge */}
                            {plan.badge && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                                    {plan.badge}
                                </div>
                            )}

                            <div className="p-6 lg:p-8">
                                {/* Plan Header */}
                                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                                    {plan.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                                {/* Price */}
                                <div className="mb-6">
                                    <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                                        {plan.priceFormatted}
                                    </span>
                                    <span className="text-gray-500 ml-2">
                                        /{plan.intervalLabel}
                                    </span>
                                </div>

                                {/* CTA Button */}
                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    disabled={loading !== null}
                                    className={`w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                                        plan.highlighted
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-900 text-white hover:bg-gray-800'
                                    } ${loading === plan.id ? 'opacity-75 cursor-wait' : ''} disabled:opacity-50`}
                                >
                                    {loading === plan.id ? (
                                        <span className="flex items-center justify-center">
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        `Get ${plan.name}`
                                    )}
                                </button>

                                {/* Features */}
                                <ul className="mt-6 space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <svg
                                                className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="text-gray-700 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Skip for now link */}
                <div className="text-center mt-8">
                    <p className="text-gray-500 mb-2">Not ready to pay yet?</p>
                    <Link
                        href="/dashboard"
                        className="text-green-600 hover:text-green-700 font-medium"
                    >
                        Go to Dashboard (listing will remain pending)
                    </Link>
                </div>
            </div>

            {/* What happens next */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
                <div className="bg-white rounded-lg shadow-md p-6 lg:p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">What happens next?</h3>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                                <span className="text-green-600 font-bold">1</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Complete Payment</h4>
                                <p className="text-gray-600 text-sm">Select a plan and complete payment securely with Paystack</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                                <span className="text-green-600 font-bold">2</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Review Process</h4>
                                <p className="text-gray-600 text-sm">Our team reviews your listing to ensure quality (usually within 24-48 hours)</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                                <span className="text-green-600 font-bold">3</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Go Live!</h4>
                                <p className="text-gray-600 text-sm">Once approved, your listing becomes visible to thousands of potential customers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
