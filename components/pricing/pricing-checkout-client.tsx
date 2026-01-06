'use client'

import dynamic from 'next/dynamic'

const PricingCheckout = dynamic(() => import('@/components/pricing/pricing-checkout'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
    </div>
  ),
})

export default function PricingCheckoutClient() {
  return <PricingCheckout />
}
