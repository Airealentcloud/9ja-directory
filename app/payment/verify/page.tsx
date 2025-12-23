'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface PaymentResult {
    status: 'success' | 'failed' | 'pending'
    amount?: number
    reference?: string
    plan_id?: string
    paid_at?: string
}

export default function PaymentVerifyPage() {
    const searchParams = useSearchParams()
    const reference = searchParams.get('reference')

    const [loading, setLoading] = useState(true)
    const [result, setResult] = useState<PaymentResult | null>(null)
    const [error, setError] = useState<string | null>(null)

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
                    paid_at: data.data.paid_at,
                })
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Verification failed')
            } finally {
                setLoading(false)
            }
        }

        verifyPayment()
    }, [reference])

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
                    <div className="text-6xl mb-4">❌</div>
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

    if (result?.status === 'success') {
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
                    <p className="text-gray-600 mb-8">
                        Thank you for your payment. Your subscription is now active.
                    </p>

                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-left">
                        <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Amount</span>
                                <span className="font-semibold">
                                    ₦{result.amount?.toLocaleString()}
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
                        <Link
                            href="/dashboard"
                            className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            Go to Dashboard
                        </Link>
                        <Link
                            href="/add-business"
                            className="block w-full bg-white border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                        >
                            Add Your Business
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
                    {result?.status === 'pending' ? '⏳' : '❌'}
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
