'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface PaymentResult {
    status: 'success' | 'failed' | 'pending'
    amount?: number
    reference?: string
    plan_id?: string
    listing_id?: string | null
    paid_at?: string
    requires_account?: boolean
    link_error?: string | null
    lead?: {
        email?: string | null
        business_name?: string | null
        phone?: string | null
    }
}

export default function PaymentVerifyPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const reference = searchParams.get('reference')
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [result, setResult] = useState<PaymentResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [fullName, setFullName] = useState('')
    const [password, setPassword] = useState('')
    const [creatingAccount, setCreatingAccount] = useState(false)
    const [accountError, setAccountError] = useState<string | null>(null)
    const [confirmationSent, setConfirmationSent] = useState(false)

    useEffect(() => {
        if (!reference) {
            setError('No payment reference provided')
            setLoading(false)
            return
        }

        const verifyPayment = async () => {
            try {
                const response = await fetch(`/api/payments/verify?reference=${reference}`)
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Payment verification failed')
                }

                setResult({
                    status: data.data.status,
                    amount: data.data.amount,
                    reference: data.data.reference,
                    plan_id: data.data.plan_id,
                    listing_id: data.data.listing_id,
                    paid_at: data.data.paid_at,
                    requires_account: data.data.requires_account,
                    link_error: data.data.link_error,
                    lead: data.data.lead,
                })
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Verification failed')
            } finally {
                setLoading(false)
            }
        }

        verifyPayment()
    }, [reference])

    useEffect(() => {
        if (result?.lead?.business_name && !fullName) {
            setFullName(result.lead.business_name)
        }
    }, [result, fullName])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900">Verifying Payment...</h2>
                    <p className="text-gray-600 mt-2">Please wait while we confirm your payment</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="text-6xl mb-4" aria-hidden="true">X</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Verification Failed</h1>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <div className="space-y-4">
                        <Link
                            href="/pricing"
                            className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            Try Again
                        </Link>
                        <Link
                            href="/contact"
                            className="block w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const handleCompleteAccount = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!reference || !result?.lead?.email) {
            setAccountError('Missing payment reference or email')
            return
        }

        setCreatingAccount(true)
        setAccountError(null)

        try {
            const response = await fetch('/api/payments/complete-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reference,
                    full_name: fullName,
                    password,
                }),
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create account')
            }

            if (data.confirmation_required) {
                setConfirmationSent(true)
                setCreatingAccount(false)
                return
            }

            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: result.lead.email,
                password,
            })

            if (loginError) {
                throw loginError
            }

            router.push(`/dashboard/my-listings/${data.data.listing_id}/edit`)
            router.refresh()
        } catch (err) {
            setAccountError(err instanceof Error ? err.message : 'Failed to create account')
            setCreatingAccount(false)
        }
    }

    if (result?.status === 'success') {
        if (result.link_error) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="max-w-md w-full rounded-lg bg-white p-8 shadow-md text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment received</h1>
                        <p className="text-gray-600 mb-4">
                            Your payment is confirmed, but the listing could not be linked automatically.
                        </p>
                        <p className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900 mb-5">
                            {result.link_error}
                        </p>
                        <p className="text-sm text-gray-600 mb-6">
                            Reference: <span className="font-mono">{result.reference}</span>
                        </p>
                        <Link href="/contact" className="block w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">
                            Contact support
                        </Link>
                    </div>
                </div>
            )
        }

        if (result.requires_account) {
            if (confirmationSent) {
                return (
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                        <div className="max-w-md w-full rounded-lg bg-white p-8 shadow-md text-center">
                            <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-5 text-2xl" aria-hidden="true">@</div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-3">Confirm your email</h1>
                            <p className="text-gray-600 mb-4">
                                Your payment is linked and your listing is saved. We sent a confirmation link to <strong>{result.lead?.email}</strong>.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Open that email, confirm your address, then sign in to complete your business details.
                            </p>
                            <Link href={`/login?next=${encodeURIComponent(`/payment/verify?reference=${reference || ''}`)}`} className="block w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">
                                Go to sign in
                            </Link>
                        </div>
                    </div>
                )
            }

            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="max-w-md w-full">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg
                                    className="w-10 h-10 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment received</h1>
                            <p className="text-gray-600">
                                Create your account to complete your listing.
                            </p>
                        </div>

                        <form onSubmit={handleCompleteAccount} className="bg-white rounded-lg shadow-md p-6 space-y-4">
                            {accountError && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                                    {accountError}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={result.lead?.email || ''}
                                    disabled
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full name</label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Create password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={creatingAccount}
                                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {creatingAccount ? 'Creating account...' : 'Create account & continue'}
                            </button>
                            <p className="text-center text-sm text-gray-500">
                                Already have an account?{' '}
                                <Link href={`/login?next=${encodeURIComponent(`/payment/verify?reference=${reference || ''}`)}`} className="text-green-600 hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            )
        }

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-gray-600 mb-4">
                        Thank you for your payment. Your paid listing plan is now active.
                    </p>

                    {/* Listing Submission Notice */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-center mb-2">
                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-semibold text-green-800">Listing Submitted!</span>
                        </div>
                        <p className="text-sm text-green-700">
                            Your business listing has been submitted for review. You'll be notified after it is checked and approved.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-left">
                        <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Amount</span>
                                <span className="font-semibold">
                                    {'\u20A6'}{result.amount?.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Reference</span>
                                <span className="font-mono text-sm">{result.reference}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Plan</span>
                                <span className="font-semibold capitalize">{result.plan_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date</span>
                                <span>
                                    {result.paid_at
                                        ? new Date(result.paid_at).toLocaleDateString('en-NG', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                          })
                                        : '-'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {result.listing_id && (
                            <Link
                                href={`/dashboard/my-listings/${result.listing_id}/edit`}
                                className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                Complete or edit your listing
                            </Link>
                        )}
                        <Link
                            href="/dashboard"
                            className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            Go to Dashboard
                        </Link>
                        <Link
                            href="/dashboard/my-listings"
                            className="block w-full bg-white border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                        >
                            View My Listings
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Payment failed or pending
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="text-6xl mb-4">
                    {result?.status === 'pending' ? 'Pending' : 'Failed'}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {result?.status === 'pending' ? 'Payment Pending' : 'Payment Failed'}
                </h1>
                <p className="text-gray-600 mb-8">
                    {result?.status === 'pending'
                        ? 'Your payment is being processed. Please check back shortly.'
                        : 'Your payment could not be completed. Please try again.'}
                </p>
                <div className="space-y-4">
                    <Link
                        href="/pricing"
                        className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                        Try Again
                    </Link>
                    <Link
                        href="/"
                        className="block w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
