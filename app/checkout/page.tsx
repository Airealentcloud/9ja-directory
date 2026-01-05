'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { PRICING_PLANS, type PlanId } from '@/lib/pricing'

export default function CheckoutPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const planId = searchParams.get('plan') as PlanId | null
    const selectedPlan = PRICING_PLANS.find(p => p.id === planId)

    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                // Not logged in, redirect to signup with plan
                router.push(planId ? `/signup?plan=${planId}` : '/pricing')
                return
            }
            setUser(user)
            setLoading(false)
        }
        checkUser()
    }, [planId, router, supabase.auth])

    const handlePayment = async () => {
        if (!selectedPlan) {
            setError('Please select a plan')
            return
        }

        setProcessing(true)
        setError(null)

        try {
            const response = await fetch('/api/payments/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan_id: selectedPlan.id,
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No plan selected</h2>
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
            <div className="max-w-lg mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
                    <p className="mt-2 text-gray-600">You're almost there!</p>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Plan Summary */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-900">{selectedPlan.name} Plan</p>
                                <p className="text-sm text-gray-500">{selectedPlan.description}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">{selectedPlan.priceFormatted}</p>
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
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
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
                            Secure payment powered by Paystack. You'll be redirected to complete payment.
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/pricing" className="text-sm text-gray-600 hover:text-green-600">
                        Change plan
                    </Link>
                </div>
            </div>
        </div>
    )
}
