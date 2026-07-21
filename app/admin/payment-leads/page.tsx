import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  createListingFromPaymentLeadServer,
  createListingFromUnlinkedPaymentServer,
  repairPaymentLeadOwnerServer,
} from '@/app/actions/admin'
import { redirect } from 'next/navigation'

async function createListingFormAction(formData: FormData) {
  'use server'
  const result = await createListingFromPaymentLeadServer(formData)
  if (result?.error?.message) {
    redirect(`/admin/payment-leads?error=${encodeURIComponent(result.error.message)}`)
  }

  redirect('/admin/listings')
}

async function repairOwnerFormAction(formData: FormData) {
  'use server'
  const result = await repairPaymentLeadOwnerServer(formData)
  if (result?.error?.message) {
    redirect(`/admin/payment-leads?error=${encodeURIComponent(result.error.message)}`)
  }

  redirect('/admin/listings')
}

async function createUnlinkedPaymentListingFormAction(formData: FormData) {
  'use server'
  const result = await createListingFromUnlinkedPaymentServer(formData)
  if (result?.error?.message) {
    redirect(`/admin/payment-leads?error=${encodeURIComponent(result.error.message)}`)
  }

  redirect('/admin/listings')
}

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

type UnlinkedPayment = {
  id: string
  user_id: string | null
  reference: string
  plan: string
  amount: number
  currency: string
  status: 'success'
  paid_at: string | null
  created_at: string
  profiles?: { email?: string | null; full_name?: string | null; phone?: string | null } | null
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

export default async function AdminPaymentLeadsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const params = searchParams ? await searchParams : {}

  const { data, error } = await supabase
    .from('payment_leads')
    .select('id, user_id, listing_id, email, phone, business_name, plan, amount, currency, reference, status, paid_at, created_at')
    .order('created_at', { ascending: false })

  const leads = (data || []) as PaymentLead[]
  const { data: unlinkedPaymentData, error: unlinkedPaymentError } = await supabase
    .from('payments')
    .select('id, user_id, reference, plan, amount, currency, status, paid_at, created_at')
    .eq('status', 'success')
    .is('listing_id', null)
    .order('created_at', { ascending: false })

  const unlinkedPayments = (unlinkedPaymentData || []) as UnlinkedPayment[]
  const paymentUserIds = Array.from(new Set(unlinkedPayments.map((payment) => payment.user_id).filter(Boolean))) as string[]
  const { data: paymentProfiles, error: paymentProfilesError } = paymentUserIds.length
    ? await supabase
        .from('profiles')
        .select('id, email, full_name, phone')
        .in('id', paymentUserIds)
    : { data: [], error: null }

  const profilesById = new Map((paymentProfiles || []).map((profile) => [profile.id, profile]))
  unlinkedPayments.forEach((payment) => {
    payment.profiles = payment.user_id ? profilesById.get(payment.user_id) || null : null
  })

  const paidUnlinked =
    leads.filter((lead) => lead.status === 'success' && !lead.listing_id).length + unlinkedPayments.length
  const loadError = error || unlinkedPaymentError || paymentProfilesError

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

      {params.error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {params.error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total leads</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{leads.length + unlinkedPayments.length}</p>
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

      {loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load paid records: {loadError.message}
        </div>
      ) : leads.length === 0 && unlinkedPayments.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          No payment leads found yet.
        </div>
      ) : (
        <div className="space-y-6">
          {unlinkedPayments.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-amber-200 bg-white shadow-sm">
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
              <h3 className="font-semibold text-amber-950">Paid payments awaiting a listing</h3>
              <p className="mt-1 text-sm text-amber-800">
                These are verified payments from a signed-in customer. Create the pending listing using the business name from the payment receipt, then review it in Manage Listings.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Create listing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {unlinkedPayments.map((payment) => {
                    const suggestedName = payment.profiles?.full_name || payment.profiles?.email?.split('@')[0] || ''
                    return (
                      <tr key={payment.id}>
                        <td className="px-4 py-4 align-top">
                          <div className="font-medium text-gray-900">{payment.profiles?.full_name || 'Registered customer'}</div>
                          <div className="mt-1 text-sm text-gray-600">{payment.profiles?.email || 'Customer email unavailable'}</div>
                          {payment.profiles?.phone && <div className="mt-1 text-sm text-gray-500">{payment.profiles.phone}</div>}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="font-medium text-gray-900">{formatAmount(payment.amount, payment.currency)}</div>
                          <div className="mt-1 text-sm uppercase text-gray-500">{payment.plan}</div>
                          <div className="mt-2 text-xs text-gray-500">Paid: {formatDate(payment.paid_at)}</div>
                        </td>
                        <td className="px-4 py-4 align-top"><code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">{payment.reference}</code></td>
                        <td className="px-4 py-4 align-top">
                          <form action={createUnlinkedPaymentListingFormAction} className="flex min-w-64 flex-col gap-2">
                            <input type="hidden" name="payment_id" value={payment.id} />
                            <label className="text-xs font-medium text-gray-700" htmlFor={`business-${payment.id}`}>Business name on receipt</label>
                            <input id={`business-${payment.id}`} name="business_name" required defaultValue={suggestedName} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
                            <button type="submit" className="inline-flex w-fit rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700">Create pending listing</button>
                          </form>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {leads.length > 0 && <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Account</th>
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
                      {lead.user_id ? (
                        <div>
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                            Registered
                          </span>
                          <div className="mt-2 text-xs text-gray-500">{lead.user_id}</div>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                            Not registered
                          </span>
                          <p className="mt-2 max-w-xs text-xs text-gray-500">
                            The customer paid but did not finish account/listing setup.
                          </p>
                        </div>
                      )}
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
                          <form action={repairOwnerFormAction} className="mt-3">
                            <input type="hidden" name="lead_id" value={lead.id} />
                            <button
                              type="submit"
                              className="inline-flex rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                            >
                              Fix owner
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                            Needs listing
                          </span>
                          <p className="mt-2 max-w-xs text-xs text-gray-500">
                            Create or find the listing, then connect this payment reference before approval.
                          </p>
                          {lead.status === 'success' && (
                            <form action={createListingFormAction} className="mt-3">
                              <input type="hidden" name="lead_id" value={lead.id} />
                              <button
                                type="submit"
                                className="inline-flex rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                              >
                                Create pending listing
                              </button>
                            </form>
                          )}
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
          </div>}
        </div>
      )}
    </div>
  )
}
