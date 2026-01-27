'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getPackageBySlug, BANK_ACCOUNT, WHATSAPP_NUMBER } from '@/lib/press-release/packages'
import { CreditCard, Building2, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react'
import PressReleaseWhatsApp from '@/components/press-release-whatsapp'

type PaymentMethod = 'paystack' | 'bank_transfer'

export default function PressReleaseCheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const packageSlug = searchParams.get('package') || ''
  const selectedPackage = getPackageBySlug(packageSlug)

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    companyName: '',
    orderNotes: '',
    acceptTerms: false,
  })

  if (!selectedPackage) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">📦</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Package Not Found</h1>
            <p className="text-gray-600 mb-6">
              The selected package could not be found. Please choose a package from our offerings.
            </p>
            <Link
              href="/press-release"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              View Packages
            </Link>
          </div>
        </div>
        <PressReleaseWhatsApp />
      </>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions to proceed.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/press-release/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageSlug: selectedPackage.slug,
          packageName: selectedPackage.name,
          packagePrice: selectedPackage.price,
          packageType: selectedPackage.type,
          paymentMethod,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          companyName: formData.companyName || null,
          orderNotes: formData.orderNotes || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      if (paymentMethod === 'paystack' && data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url
      } else if (paymentMethod === 'bank_transfer' && data.orderId) {
        // Redirect to bank transfer pending page
        router.push(`/press-release/order-pending?order=${data.orderId}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href={`/press-release/${selectedPackage.slug}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to package details
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Order</h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        required
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                        Company/Business Name
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Your Company Ltd"
                      />
                    </div>
                    <div>
                      <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="customerEmail"
                        name="customerEmail"
                        required
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="customerPhone"
                        name="customerPhone"
                        required
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Notes */}
                <div>
                  <label htmlFor="orderNotes" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="orderNotes"
                    name="orderNotes"
                    rows={3}
                    value={formData.orderNotes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Any specific requirements or questions..."
                  />
                </div>

                {/* Payment Method Selection */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    {/* Paystack Option */}
                    <label
                      className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === 'paystack'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paystack"
                        checked={paymentMethod === 'paystack'}
                        onChange={() => setPaymentMethod('paystack')}
                        className="mt-1 w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-gray-900">Pay Online</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Recommended</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Pay instantly with card, bank transfer, or USSD via Paystack
                        </p>
                      </div>
                    </label>

                    {/* Bank Transfer Option */}
                    <label
                      className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => setPaymentMethod('bank_transfer')}
                        className="mt-1 w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">Bank Transfer</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Transfer directly to our bank account and upload receipt
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Bank Transfer Details Preview */}
                  {paymentMethod === 'bank_transfer' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-sm font-medium text-blue-900 mb-2">Bank Account Details:</p>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p><span className="font-medium">Account Name:</span> {BANK_ACCOUNT.accountName}</p>
                        <p><span className="font-medium">Account Number:</span> {BANK_ACCOUNT.accountNumber}</p>
                        <p><span className="font-medium">Bank:</span> {BANK_ACCOUNT.bankName}</p>
                      </div>
                      <p className="text-xs text-blue-600 mt-3">
                        After placing your order, you&apos;ll receive detailed instructions and can upload your payment receipt.
                        Orders expire after 48 hours if payment is not confirmed.
                      </p>
                    </div>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-green-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-green-600 hover:underline">
                      Privacy Policy
                    </Link>
                    . I understand that press release content will be reviewed before publication.
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : paymentMethod === 'paystack' ? (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay {selectedPackage.priceDisplay}
                    </>
                  ) : (
                    <>
                      <Building2 className="w-5 h-5" />
                      Place Order - {selectedPackage.priceDisplay}
                    </>
                  )}
                </button>
              </form>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* Package Info */}
              <div className="pb-4 border-b border-gray-200">
                {selectedPackage.badge && (
                  <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mb-2">
                    {selectedPackage.badge}
                  </span>
                )}
                <h3 className="font-bold text-xl text-gray-900">{selectedPackage.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{selectedPackage.type} Package</p>
                {selectedPackage.releases && (
                  <p className="text-sm text-gray-600 mt-1">{selectedPackage.releases}</p>
                )}
                {selectedPackage.delivery && (
                  <p className="text-sm text-gray-600">{selectedPackage.delivery}</p>
                )}
              </div>

              {/* Features */}
              <div className="py-4 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Includes:</p>
                <ul className="space-y-2">
                  {selectedPackage.features.slice(0, 5).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price */}
              <div className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total</span>
                  <span className="text-2xl font-bold text-gray-900">{selectedPackage.priceDisplay}</span>
                </div>
              </div>

              {/* Support */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Need help?</p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi,%20I%20need%20help%20with%20the%20${encodeURIComponent(selectedPackage.name)}%20package.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 font-medium text-sm hover:underline"
                >
                  Chat with us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PressReleaseWhatsApp />
    </>
  )
}
