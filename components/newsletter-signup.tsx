'use client'

import { useState } from 'react'

export default function NewsletterSignup() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to subscribe')
            }

            setSuccess(true)
            setEmail('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="text-center">
                <div className="text-green-400 text-2xl mb-2">✓</div>
                <p className="text-green-400 font-medium text-sm">Check your email to confirm!</p>
                <button
                    onClick={() => setSuccess(false)}
                    className="text-gray-400 text-xs mt-2 hover:text-white"
                >
                    Subscribe another email
                </button>
            </div>
        )
    }

    return (
        <div>
            <h3 className="text-white font-semibold mb-2">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-3">
                Get weekly business insights and deals
            </p>
            <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '...' : 'Subscribe'}
                    </button>
                </div>
                {error && (
                    <p className="text-red-400 text-xs">{error}</p>
                )}
            </form>
        </div>
    )
}
