import type { Metadata } from 'next'
import Link from 'next/link'
import { verifyPaystackTransaction } from '@/lib/payments/paystack'
import { fulfillPaystackSuccess } from '@/lib/payments/fulfill'

export const metadata: Metadata = {
  title: 'Payment Status | 9jaDirectory',
  robots: { index: false, follow: false },
}

export default async function PaystackCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>
}) {
  const { reference } = await searchParams

  if (!reference) {
    return (
      <div className="mx-auto max-w-xl py-12 px-4">
        <h1 className="text-2xl font-bold text-gray-900">Payment verification failed</h1>
        <p className="mt-2 text-gray-600">Missing Paystack reference.</p>
        <div className="mt-6">
          <Link href="/dashboard/my-listings" className="text-green-600 hover:underline">
            Back to My Listings
          </Link>
        </div>
      </div>
    )
  }

  try {
    const tx = await verifyPaystackTransaction(reference)
    const isSuccess = tx.status === 'success'

    if (isSuccess) {
      const result = await fulfillPaystackSuccess({
        reference: tx.reference,
        amountKobo: tx.amount,
        currency: tx.currency,
        paidAt: tx.paid_at ?? null,
      })

      return (
        <div className="mx-auto max-w-xl py-12 px-4">
          <h1 className="text-2xl font-bold text-gray-900">Payment successful</h1>
          <p className="mt-2 text-gray-600">Your listing has been upgraded.</p>
          <div className="mt-6 flex flex-col gap-3">
            {result.listingSlug && (
              <Link href={`/listings/${result.listingSlug}`} className="text-green-600 hover:underline">
                View your listing
              </Link>
            )}
            <Link href="/dashboard/my-listings" className="text-green-600 hover:underline">
              Back to My Listings
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-xl py-12 px-4">
        <h1 className="text-2xl font-bold text-gray-900">Payment not completed</h1>
        <p className="mt-2 text-gray-600">We could not confirm a successful payment for this reference.</p>
        <div className="mt-6">
          <Link href="/dashboard/my-listings" className="text-green-600 hover:underline">
            Back to My Listings
          </Link>
        </div>
      </div>
    )
  } catch (err) {
    return (
      <div className="mx-auto max-w-xl py-12 px-4">
        <h1 className="text-2xl font-bold text-gray-900">Payment verification failed</h1>
        <p className="mt-2 text-gray-600">{err instanceof Error ? err.message : 'Unknown error'}</p>
        <div className="mt-6">
          <Link href="/dashboard/my-listings" className="text-green-600 hover:underline">
            Back to My Listings
          </Link>
        </div>
      </div>
    )
  }
}

