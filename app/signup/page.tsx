'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PRICING_PLANS, type PlanId } from '@/lib/pricing'

export default function SignupPage() {
    const searchParams = useSearchParams()
    const planId = searchParams.get('plan') as PlanId | null
    const selectedPlan = PRICING_PLANS.find(p => p.id === planId)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Use runtime URL for local development, configured URL for production
            const runtimeBaseUrl = window.location.origin.replace(/\/$/, '')
            const configuredBaseUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
            const isLocalhost = runtimeBaseUrl.includes('localhost') || runtimeBaseUrl.includes('127.0.0.1')
            const baseUrl = isLocalhost ? runtimeBaseUrl : (configuredBaseUrl || runtimeBaseUrl)

            // Include plan in the callback URL
            const callbackUrl = planId
                ? `${baseUrl}/auth/callback?plan=${planId}`
                : `${baseUrl}/auth/callback`

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: callbackUrl,
                    data: {
                        full_name: fullName,
                        selected_plan: planId || null,
                    },
                },
            })

            if (error) throw error

            // Notify admin of new signup (fire and forget)
            fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'new_signup',
                    data: { email, fullName, plan: planId }
                })
            }).catch(console.error)

            setSuccess(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
                    <div className="text-green-500 text-5xl mb-4">✓</div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Check your email</h2>
                    <p className="mt-2 text-gray-600">
                        We've sent a confirmation link to <strong>{email}</strong>.
                        <br />
                        Please click the link to verify your account.
                    </p>
                    {selectedPlan && (
                        <p className="mt-4 text-sm text-gray-500">
                            After verification, you'll complete payment for the <strong>{selectedPlan.name}</strong> plan.
                        </p>
                    )}
                    <div className="mt-6">
                        <Link href="/login" className="text-green-600 hover:text-green-500 font-medium">
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    {selectedPlan ? (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800 text-center">
                                You selected the <strong>{selectedPlan.name}</strong> plan
                            </p>
                            <p className="text-lg font-bold text-green-700 text-center mt-1">
                                {selectedPlan.priceFormatted}/{selectedPlan.intervalLabel}
                            </p>
                        </div>
                    ) : (
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
                                Sign in
                            </Link>
                        </p>
                    )}
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="full-name" className="sr-only">
                                Full Name
                            </label>
                            <input
                                id="full-name"
                                name="fullName"
                                type="text"
                                required
                                className="appearance-none rounded-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                placeholder="Password (min 6 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        By signing up, you agree to our{' '}
                        <Link href="/terms" className="text-green-600 hover:underline">Terms</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>
                    </p>
                </form>

                {!selectedPlan && (
                    <div className="text-center">
                        <Link href="/pricing" className="text-sm text-green-600 hover:text-green-500">
                            View pricing plans
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
