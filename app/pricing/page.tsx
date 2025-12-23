'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PRICING_PLANS, type PlanId } from '@/lib/pricing'

export default function PricingPage() {
    const router = useRouter()
    const [loading, setLoading] = useState<PlanId | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSelectPlan = async (planId: PlanId) => {
        setLoading(planId)
        setError(null)

        try {
            const response = await fetch('/api/payments/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plan_id: planId }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 401) {
                    // User not logged in, redirect to login
                    router.push(`/login?redirect=/pricing&plan=${planId}`)
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
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Choose the plan that works best for your business. No hidden fees.
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {PRICING_PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                                plan.highlighted
                                    ? 'ring-2 ring-green-500 scale-105'
                                    : 'border border-gray-200'
                            }`}
                        >
                            {/* Badge */}
                            {plan.badge && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                                    {plan.badge}
                                </div>
                            )}

                            <div className="p-8">
                                {/* Plan Header */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {plan.name}
                                </h3>
                                <p className="text-gray-600 mb-6">{plan.description}</p>

                                {/* Price */}
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">
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
                                <ul className="mt-8 space-y-4">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <svg
                                                className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                    Frequently Asked Questions
                </h2>

                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            What payment methods do you accept?
                        </h3>
                        <p className="text-gray-600">
                            We accept all major debit/credit cards, bank transfers, and USSD payments through Paystack.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Can I upgrade my plan later?
                        </h3>
                        <p className="text-gray-600">
                            Yes! You can upgrade your plan at any time. The difference will be prorated.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Is there a refund policy?
                        </h3>
                        <p className="text-gray-600">
                            We offer a 7-day money-back guarantee if you're not satisfied with your plan.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            How do I cancel my subscription?
                        </h3>
                        <p className="text-gray-600">
                            You can cancel your subscription anytime from your dashboard. Your access will continue until the end of your billing period.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 text-center">
                <div className="bg-green-600 rounded-2xl p-8 text-white">
                    <h2 className="text-2xl font-bold mb-4">Need help choosing?</h2>
                    <p className="text-green-100 mb-6">
                        Contact our team and we'll help you find the perfect plan for your business.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
    )
}
