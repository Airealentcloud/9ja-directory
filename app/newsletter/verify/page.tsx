'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function NewsletterVerifyPage() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [status, setStatus] = useState<'loading' | 'success' | 'already' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage('Invalid verification link')
            return
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(`/api/newsletter/verify?token=${token}`)
                const data = await response.json()

                if (!response.ok) {
                    setStatus('error')
                    setMessage(data.error || 'Verification failed')
                    return
                }

                if (data.alreadyVerified) {
                    setStatus('already')
                    setMessage('Your email is already verified!')
                } else {
                    setStatus('success')
                    setMessage('Your email has been verified!')
                }
            } catch {
                setStatus('error')
                setMessage('Something went wrong. Please try again.')
            }
        }

        verifyEmail()
    }, [token])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {status === 'loading' && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <h1 className="text-xl font-semibold text-gray-900">Verifying your email...</h1>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-green-500 text-6xl mb-4">✓</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to 9jaDirectory!</h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <p className="text-gray-500 text-sm mb-6">
                            You'll now receive weekly updates on featured businesses, new listings, and exclusive deals.
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                            Explore Businesses
                        </Link>
                    </>
                )}

                {status === 'already' && (
                    <>
                        <div className="text-blue-500 text-6xl mb-4">✓</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Verified</h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                            Go to Homepage
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="text-red-500 text-6xl mb-4">✗</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <p className="text-gray-500 text-sm mb-6">
                            The verification link may have expired or is invalid. Please try subscribing again.
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                            Go to Homepage
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}
