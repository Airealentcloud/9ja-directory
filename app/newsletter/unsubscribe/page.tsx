'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function NewsletterUnsubscribePage() {
    const searchParams = useSearchParams()
    const emailParam = searchParams.get('email')

    const [email, setEmail] = useState(emailParam || '')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    // Auto-unsubscribe if email is in URL
    useEffect(() => {
        if (emailParam) {
            handleUnsubscribe(emailParam)
        }
    }, [emailParam])

    const handleUnsubscribe = async (emailToUnsubscribe: string) => {
        setStatus('loading')

        try {
            const response = await fetch('/api/newsletter/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailToUnsubscribe })
            })

            const data = await response.json()

            if (!response.ok) {
                setStatus('error')
                setMessage(data.error || 'Unsubscribe failed')
                return
            }

            setStatus('success')
            setMessage(data.message)
        } catch {
            setStatus('error')
            setMessage('Something went wrong. Please try again.')
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (email) {
            handleUnsubscribe(email)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {status === 'loading' && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
                        <h1 className="text-xl font-semibold text-gray-900">Processing...</h1>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-gray-400 text-6xl mb-4">👋</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Unsubscribed</h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <p className="text-gray-500 text-sm mb-6">
                            We're sorry to see you go. You can always resubscribe from our website.
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                            Visit 9jaDirectory
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="text-red-500 text-6xl mb-4">✗</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </>
                )}

                {status === 'idle' && (
                    <>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Unsubscribe</h1>
                        <p className="text-gray-600 mb-6">
                            Enter your email to unsubscribe from the 9jaDirectory newsletter.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                                Unsubscribe
                            </button>
                        </form>
                        <p className="text-gray-400 text-sm mt-4">
                            <Link href="/" className="hover:text-green-600">
                                Go back to homepage
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}
