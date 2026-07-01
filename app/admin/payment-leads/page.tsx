import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type PaymentLead = {
  id: string
  user_id: string | null
  listing_id: string | null
  email: string
  phone: string | null
  business_name: string | null
  plan: string
  amount: number
  currency: string
  reference: string
  status: 'pending' | 'success' | 'failed' | 'abandoned'
  paid_at: string | null
  created_at: string
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency || 'NGN',
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

function formatDate(date: string | null) {
  if (!date) return 'Not recorded'
  return new Date(date).toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function statusClass(status: PaymentLead['status']) {
  if (status === 'success') return 'bg-green-100 text-green-800'
  if (status === 'pending') return 'bg-yellow-100 text-yellow-800'
  if (status === 'failed') return 'bg-red-100 text-red-800'
  return 'bg-orange-100 text-orange-800'
}

export default async function AdminPaymentLeadsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payment_leads')
    .select('id, user_id, listing_id, email, phone, business_name, plan, amount, currency, reference, status, paid_at, created_at')
    .order('created_at', { ascending: false })

  const leads = (data || []) as PaymentLead[]
  const paidUnlinked = leads.filter((lead) => lead.status === 'success' && !lead.listing_id).length

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paid Leads</h2>
          <p className="mt-1 text-sm text-gray-600">
            Payments captured before a listing is fully linked for approval.
          </p>
        </div>
        <Link
          href="/admin/listings"
          className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Manage Listings
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total leads</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{leads.length}</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm">
          <p className="text-sm text-green-700">Paid but not linked</p>
          <p className="mt-1 text-3xl font-bold text-green-700">{paidUnlinked}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Linked to listing</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{leads.filter((lead) => lead.listing_id).length}</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load payment leads: {error.message}
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          No payment leads found yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Listing link</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-4 py-4 align-top">
                      <div className="font-medium text-gray-900">{lead.business_name || 'Business name missing'}</div>
                      <div className="mt-1 text-sm text-gray-600">{lead.email}</div>
                      {lead.phone && <div className="mt-1 text-sm text-gray-500">{lead.phone}</div>}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="font-medium text-gray-900">{formatAmount(lead.amount, lead.currency)}</div>
                      <div className="mt-1 text-sm uppercase text-gray-500">{lead.plan}</div>
                      <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">{lead.reference}</code>
                    </td>
                    <td className="px-4 py-4 align-top">
                      {lead.listing_id ? (
                        <div>
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                            Linked
                          </span>
                          <div className="mt-2 text-xs text-gray-500">{lead.listing_id}</div>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                            Needs listing
                          </span>
                          <p className="mt-2 max-w-xs text-xs text-gray-500">
                            Create or find the listing, then connect this payment reference before approval.
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-gray-600">
                      <div>Paid: {formatDate(lead.paid_at)}</div>
                      <div className="mt-1 text-xs text-gray-400">Created: {formatDate(lead.created_at)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
