'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Loader2, XCircle, ArrowRight, MessageCircle } from 'lucide-react'
import { WHATSAPP_NUMBER } from '@/lib/press-release/packages'

type OrderStatus = 'loading' | 'success' | 'failed' | 'pending'

interface OrderDetails {
  id: string
  reference: string
  packageName: string
  amount: number
  customerName: string
  customerEmail: string
  paymentMethod: string
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')

  const [status, setStatus] = useState<OrderStatus>('loading')
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function verifyPayment() {
      if (!reference) {
        setStatus('failed')
        setErrorMessage('No payment reference provided')
        return
      }

      try {
        const response = await fetch(`/api/press-release/verify?reference=${reference}`)
        const data = await response.json()

        if (data.success && data.status === 'success') {
          setStatus('success')
          setOrder(data.order)
        } else if (data.status === 'pending') {
          setStatus('pending')
        } else {
          setStatus('failed')
          setErrorMessage(data.message || 'Payment verification failed')
        }
      } catch {
        setStatus('failed')
        setErrorMessage('Failed to verify payment. Please contact support.')
      }
    }

    verifyPayment()
  }, [reference])

  // Loading State
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h1>
          <p className="text-gray-600">Please wait while we confirm your payment.</p>
        </div>
      </div>
    )
  }

  // Success State
  if (status === 'success' && order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you, {order.customerName}! Your order has been confirmed.
            </p>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h2 className="font-semibold text-gray-900 mb-4">Order Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Reference</span>
                  <span className="font-medium text-gray-900">{order.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Package</span>
                  <span className="font-medium text-gray-900">{order.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-medium text-gray-900">
                    ₦{(order.amount / 100).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-900">{order.customerEmail}</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-green-50 rounded-xl p-6 mb-8 text-left border border-green-200">
              <h2 className="font-semibold text-green-900 mb-3">What&apos;s Next?</h2>
              <ol className="space-y-2 text-sm text-green-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>You&apos;ll receive a confirmation email with instructions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Prepare your press release content or share a Google Docs link.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Our team will review and distribute your press release.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>You&apos;ll receive live publication links once published.</span>
                </li>
              </ol>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi,%20I%20just%20completed%20my%20order%20${order.reference}%20and%20would%20like%20to%20submit%20my%20press%20release%20content.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Submit Content via WhatsApp
              </a>
              <Link
                href="/press-release"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                View More Packages
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pending State
  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-yellow-500 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Processing</h1>
          <p className="text-gray-600 mb-6">
            Your payment is still being processed. This may take a few moments.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Check Again
          </button>
        </div>
      </div>
    )
  }

  // Failed State
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          {errorMessage || 'We could not verify your payment. Please try again or contact support.'}
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/press-release"
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Try Again
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi,%20I%20had%20an%20issue%20with%20my%20payment%20(Reference:%20${reference}).%20Can%20you%20help?`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
