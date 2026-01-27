'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Clock, Upload, CheckCircle2, Loader2, Copy, Check, MessageCircle, ArrowLeft } from 'lucide-react'
import { BANK_ACCOUNT, WHATSAPP_NUMBER } from '@/lib/press-release/packages'
import PressReleaseWhatsApp from '@/components/press-release-whatsapp'

interface OrderDetails {
  id: string
  reference: string
  packageName: string
  amount: number
  customerName: string
  customerEmail: string
  status: string
  receiptUploaded: boolean
  expiresAt: string
}

export default function OrderPendingPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')

  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setError('Order ID not provided')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/press-release/order?id=${orderId}`)
        if (!response.ok) throw new Error('Order not found')

        const data = await response.json()
        setOrder(data.order)
      } catch {
        setError('Could not load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !orderId) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload an image (JPG, PNG, WebP) or PDF file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('orderId', orderId)
      formData.append('receipt', file)

      const response = await fetch('/api/press-release/confirm-transfer', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setUploadSuccess(true)
      if (order) {
        setOrder({ ...order, receiptUploaded: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload receipt')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/press-release"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Packages
          </Link>
        </div>
      </div>
    )
  }

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
        {/* Success Banner if Receipt Uploaded */}
        {uploadSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Receipt Uploaded Successfully!</p>
              <p className="text-sm text-green-700">
                We&apos;ve received your payment receipt. Our team will verify it within 24 hours.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Awaiting Payment</h1>
            <p className="text-gray-600">
              Please complete your bank transfer to proceed with your order.
            </p>
          </div>

          {/* Order Summary */}
          {order && (
            <div className="bg-gray-50 rounded-xl p-5 mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference</span>
                  <span className="font-mono font-medium text-gray-900">{order.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Package</span>
                  <span className="font-medium text-gray-900">{order.packageName}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Amount Due</span>
                  <span className="text-green-600">₦{(order.amount / 100).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Bank Details */}
          <div className="bg-blue-50 rounded-xl p-5 mb-6 border border-blue-200">
            <h2 className="font-semibold text-blue-900 mb-4">Bank Transfer Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-700">Account Name</p>
                  <p className="font-semibold text-blue-900">{BANK_ACCOUNT.accountName}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(BANK_ACCOUNT.accountName, 'name')}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  {copied === 'name' ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-700">Account Number</p>
                  <p className="font-semibold text-blue-900 font-mono text-lg">{BANK_ACCOUNT.accountNumber}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(BANK_ACCOUNT.accountNumber, 'number')}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  {copied === 'number' ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-700">Bank</p>
                  <p className="font-semibold text-blue-900">{BANK_ACCOUNT.bankName}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(BANK_ACCOUNT.bankName, 'bank')}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  {copied === 'bank' ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-4">
              Use your order reference <span className="font-mono font-bold">{order?.reference}</span> as the transfer description.
            </p>
          </div>

          {/* Upload Receipt Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center mb-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
            />

            {order?.receiptUploaded ? (
              <div className="text-green-600">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                <p className="font-semibold">Receipt Uploaded</p>
                <p className="text-sm text-gray-600 mt-1">We&apos;re verifying your payment.</p>
              </div>
            ) : uploading ? (
              <div>
                <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Uploading receipt...</p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="font-semibold text-gray-900 mb-1">Upload Payment Receipt</p>
                <p className="text-sm text-gray-600 mb-4">
                  JPG, PNG, WebP or PDF (max 5MB)
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Choose File
                </button>
              </>
            )}

            {error && (
              <p className="text-red-600 text-sm mt-3">{error}</p>
            )}
          </div>

          {/* Expiry Notice */}
          <div className="bg-yellow-50 rounded-xl p-4 mb-6 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This order will expire after 48 hours if payment is not confirmed.
              Please complete your transfer and upload the receipt as soon as possible.
            </p>
          </div>

          {/* Support */}
          <div className="text-center">
            <p className="text-gray-600 mb-3">Need help with your payment?</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi,%20I%20need%20help%20with%20my%20order%20${order?.reference}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Chat with Support
            </a>
          </div>
        </div>
      </div>
      <PressReleaseWhatsApp />
    </div>
  )
}
