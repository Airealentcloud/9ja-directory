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
            // User is logged in, go directly to checkout
            router.push(`/checkout?plan=${planId}`)
        } else {
            // User not logged in, go to signup first
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
                                    ? 'ring-2 ring-green-500 scale-105'
                                    : 'border border-gray-200'
                            }`}
                        >
                            {plan.badge && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                                    {plan.badge}
                                </div>
                            )}

                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {plan.name}
                                </h3>
                                <p className="text-gray-600 mb-6">{plan.description}</p>

                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">
                                        {plan.priceFormatted}
                                    </span>
                                    <span className="text-gray-500 ml-2">
                                        /{plan.intervalLabel}
                                    </span>
                                </div>

                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    className={`w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                                        plan.highlighted
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-900 text-white hover:bg-gray-800'
                                    }`}
                                >
                                    Get {plan.name}
                                </button>

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
        </div>
    )
}
