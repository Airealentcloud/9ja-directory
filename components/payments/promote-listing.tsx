'use client'

import { useMemo, useState } from 'react'
import { startFeaturedPayment } from '@/app/actions/payments'
import { formatNairaFromKobo, PAYMENT_PLANS } from '@/lib/payments/plans'

export default function PromoteListing({
  listingId,
  businessName,
}: {
  listingId: string
  businessName: string
}) {
  const plans = useMemo(() => Object.values(PAYMENT_PLANS), [])
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id ?? 'featured_30d')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedPlan = PAYMENT_PLANS[selectedPlanId]

  const onPay = async () => {
    setLoading(true)
    setError(null)
    try {
      const { authorizationUrl } = await startFeaturedPayment({ listingId, planId: selectedPlanId })
      window.location.href = authorizationUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment initialization failed')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-base font-semibold text-gray-900">Choose a plan</h2>
        <p className="mt-1 text-sm text-gray-600">
          Featured listings appear higher in results and get a highlighted badge.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {plans.map((plan) => {
            const active = plan.id === selectedPlanId
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={`text-left rounded-lg border p-4 transition-colors ${
                  active ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-gray-900">{plan.name}</div>
                    <div className="mt-1 text-sm text-gray-600">{plan.description}</div>
                  </div>
                  <div className="shrink-0 rounded-md bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm">
                    {formatNairaFromKobo(plan.amountKobo)}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-gray-600">Upgrading:</div>
            <div className="font-semibold text-gray-900">{businessName}</div>
          </div>
          <button
            type="button"
            disabled={loading || !selectedPlan}
            onClick={onPay}
            className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Redirecting…' : `Pay with Paystack (${formatNairaFromKobo(selectedPlan.amountKobo)})`}
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          You will be redirected to Paystack to complete payment securely.
        </p>
      </div>
    </div>
  )
}

