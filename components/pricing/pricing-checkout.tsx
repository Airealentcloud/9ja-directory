'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PRICING_PLANS, type PlanId } from '@/lib/pricing'

type PricingCheckoutProps = {
    className?: string
}

export default function PricingCheckout({ className }: PricingCheckoutProps) {
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setIsLoggedIn(!!user)
        }
        checkAuth()
    }, [supabase.auth])

    const handleSelectPlan = (planId: PlanId) => {
        if (isLoggedIn) {
            router.push(`/checkout?plan=${planId}`)
        } else {
            router.push(`/signup?plan=${planId}`)
        }
    }

    return (
        <div className={className}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {PRICING_PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                                plan.highlighted
                                    ? 'ring-2 ring-green-500 md:scale-105'
                                    : 'border border-gray-200'
                            }`}
                        >
                            {/* Discount Badge */}
                            {plan.discount && (
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                                    <div className="bg-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                        {plan.discount}
                                    </div>
                                </div>
                            )}

                            {/* Plan Badge (Popular, Best Value) */}
                            {plan.badge && (
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                        plan.highlighted
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-orange-100 text-orange-800'
                                    }`}>
                                        {plan.badge}
                                    </span>
                                </div>
                            )}

                            <div className="p-8 pt-12">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                                    {plan.name}
                                </h3>

                                {/* Price Section */}
                                <div className="text-center mb-2">
                                    <span className="text-4xl font-bold text-gray-900">
                                        {plan.priceFormatted.replace('₦', '')}
                                    </span>
                                    <span className="text-lg text-gray-500 ml-1">NGN</span>
                                    {plan.originalPriceFormatted && (
                                        <span className="text-lg text-gray-400 line-through ml-2">
                                            {plan.originalPriceFormatted.replace('₦', '')}NGN
                                        </span>
                                    )}
                                </div>

                                {/* Interval Label */}
                                <div className="text-center mb-6">
                                    <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                                        {plan.intervalLabel}
                                    </span>
                                    <p className="text-gray-500 text-sm mt-1">never pay again</p>
                                </div>

                                <p className="text-gray-600 text-center mb-6 text-sm">
                                    {plan.description}
                                </p>

                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    className={`w-full py-3 px-6 rounded-full font-semibold text-center transition-all ${
                                        plan.highlighted
                                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                                            : 'bg-rose-400 text-white hover:bg-rose-500'
                                    }`}
                                >
                                    Get Listed
                                </button>

                                {/* Features Section */}
                                <div className="mt-8 border-t pt-6">
                                    <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {plan.id === 'basic' ? 'Standard' : plan.id === 'premium' ? 'Highlighted' : 'Featured'} listing
                                    </p>

                                    <ul className="space-y-3">
                                        {plan.features.slice(0, 10).map((feature, index) => (
                                            <li key={index} className="flex items-start text-sm">
                                                <svg
                                                    className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span className="text-gray-600">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {plan.features.length > 10 && (
                                        <p className="text-sm text-green-600 mt-4 font-medium">
                                            + {plan.features.length - 10} more features
                                        </p>
                                    )}
                                </div>

                                {/* Limits Summary */}
                                <div className="mt-6 pt-4 border-t space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Listings</span>
                                        <span className="font-semibold text-gray-900">
                                            {plan.limits.maxListings === -1 ? 'Unlimited' : plan.limits.maxListings}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Photos</span>
                                        <span className="font-semibold text-gray-900">{plan.limits.maxPhotos}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Categories</span>
                                        <span className="font-semibold text-gray-900">{plan.limits.maxCategories}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Keywords</span>
                                        <span className="font-semibold text-gray-900">{plan.limits.maxKeywords}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust badges */}
                <div className="mt-12 text-center">
                    <p className="text-gray-500 mb-4">Trusted payment powered by</p>
                    <div className="flex items-center justify-center space-x-6">
                        <span className="text-gray-400 font-semibold">Paystack</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-400 text-sm">256-bit SSL Encryption</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-400 text-sm">7-day Money Back</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
