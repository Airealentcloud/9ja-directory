'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { startTestPayment } from '@/app/actions/payments'

export default function TestPaymentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePayment() {
    setLoading(true)
    setError(null)

    try {
      const result = await startTestPayment()
      // Redirect to Paystack checkout
      window.location.href = result.authorizationUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Payment</h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            This is a test payment of <strong>₦5,000</strong> to verify your Paystack integration is working correctly.
          </p>
          <p className="text-blue-700 text-sm mt-2">
            Real money will be transferred to your Paystack account.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount</span>
            <span className="text-2xl font-bold text-gray-900">₦5,000</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Processing...' : 'Pay ₦5,000 Test'}
        </button>

        <p className="text-gray-500 text-xs text-center mt-4">
          You must be logged in to make this payment
        </p>
      </div>
    </div>
  )
}
