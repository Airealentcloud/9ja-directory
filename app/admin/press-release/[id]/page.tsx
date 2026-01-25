import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/press-release/packages'
import { ArrowLeft, CheckCircle, XCircle, Clock, Download, User, Package, CreditCard, FileText } from 'lucide-react'

type OrderStatus = 'pending_payment' | 'paid' | 'in_progress' | 'completed' | 'cancelled' | 'refunded'
type PaymentStatus = 'pending' | 'success' | 'failed' | 'abandoned'

const statusColors: Record<OrderStatus, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

const paymentStatusColors: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  abandoned: 'bg-gray-100 text-gray-800',
}

async function confirmPayment(formData: FormData) {
  'use server'
  const orderId = formData.get('orderId') as string
  const action = formData.get('action') as string
  const adminNotes = formData.get('adminNotes') as string

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  if (action === 'confirm') {
    await supabase
      .from('press_release_orders')
      .update({
        payment_status: 'success',
        status: 'paid',
        paid_at: new Date().toISOString(),
        bank_transfer_confirmed_by: user.id,
        bank_transfer_confirmed_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      })
      .eq('id', orderId)
  } else if (action === 'reject') {
    await supabase
      .from('press_release_orders')
      .update({
        payment_status: 'failed',
        status: 'cancelled',
        admin_notes: adminNotes || 'Payment could not be verified',
      })
      .eq('id', orderId)
  }

  redirect(`/admin/press-release/${orderId}`)
}

async function updateOrderStatus(formData: FormData) {
  'use server'
  const orderId = formData.get('orderId') as string
  const newStatus = formData.get('newStatus') as OrderStatus

  const supabase = await createClient()

  const updateData: Record<string, unknown> = { status: newStatus }

  if (newStatus === 'in_progress') {
    updateData.started_at = new Date().toISOString()
  } else if (newStatus === 'completed') {
    updateData.completed_at = new Date().toISOString()
  }

  await supabase
    .from('press_release_orders')
    .update(updateData)
    .eq('id', orderId)

  redirect(`/admin/press-release/${orderId}`)
}

async function updateAdminNotes(formData: FormData) {
  'use server'
  const orderId = formData.get('orderId') as string
  const adminNotes = formData.get('adminNotes') as string

  const supabase = await createClient()

  await supabase
    .from('press_release_orders')
    .update({ admin_notes: adminNotes })
    .eq('id', orderId)

  redirect(`/admin/press-release/${orderId}`)
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Check admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  // Fetch order
  const { data: order, error } = await supabase
    .from('press_release_orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !order) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/press-release"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Order: {order.payment_reference}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[order.status as OrderStatus] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {order.status.replace('_', ' ')}
          </span>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              paymentStatusColors[order.payment_status as PaymentStatus] || 'bg-gray-100 text-gray-800'
            }`}
          >
            Payment: {order.payment_status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
            </div>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Full Name</dt>
                <dd className="text-sm font-medium text-gray-900">{order.customer_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-sm font-medium text-gray-900">
                  <a href={`mailto:${order.customer_email}`} className="text-blue-600 hover:underline">
                    {order.customer_email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Phone</dt>
                <dd className="text-sm font-medium text-gray-900">
                  <a href={`tel:${order.customer_phone}`} className="text-blue-600 hover:underline">
                    {order.customer_phone}
                  </a>
                </dd>
              </div>
              {order.company_name && (
                <div>
                  <dt className="text-sm text-gray-500">Company</dt>
                  <dd className="text-sm font-medium text-gray-900">{order.company_name}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Package Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Package Details</h2>
            </div>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Package Name</dt>
                <dd className="text-sm font-medium text-gray-900">{order.package_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Package Type</dt>
                <dd className="text-sm font-medium text-gray-900 capitalize">{order.package_type}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Amount</dt>
                <dd className="text-lg font-bold text-green-600">{formatPrice(order.package_price)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Package Slug</dt>
                <dd className="text-sm font-medium text-gray-500">{order.package_slug}</dd>
              </div>
            </dl>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
            </div>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Payment Method</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {order.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Paystack'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Payment Reference</dt>
                <dd className="text-sm font-medium text-gray-900">{order.payment_reference}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Payment Status</dt>
                <dd>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      paymentStatusColors[order.payment_status as PaymentStatus] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </dd>
              </div>
              {order.paid_at && (
                <div>
                  <dt className="text-sm text-gray-500">Paid At</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {new Date(order.paid_at).toLocaleString('en-NG')}
                  </dd>
                </div>
              )}
            </dl>

            {/* Bank Transfer Receipt */}
            {order.bank_transfer_proof && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Bank Transfer Receipt</h3>
                <a
                  href={order.bank_transfer_proof}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <Download className="w-4 h-4" />
                  View/Download Receipt
                </a>

                {/* Confirm/Reject Actions */}
                {order.payment_status === 'pending' && (
                  <div className="mt-4 flex flex-col gap-3">
                    <textarea
                      form="confirm-form"
                      name="adminNotes"
                      placeholder="Add notes (optional)..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <form id="confirm-form" action={confirmPayment}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="action" value="confirm" />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirm Payment
                        </button>
                      </form>
                      <form action={confirmPayment}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="action" value="reject" />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject Payment
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Notes */}
          {order.order_notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Customer Notes</h2>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.order_notes}</p>
            </div>
          )}

          {/* Admin Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h2>
            <form action={updateAdminNotes}>
              <input type="hidden" name="orderId" value={order.id} />
              <textarea
                name="adminNotes"
                defaultValue={order.admin_notes || ''}
                placeholder="Add internal notes..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                rows={4}
              />
              <button
                type="submit"
                className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-black"
              >
                Save Notes
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Actions</h2>

            {order.status === 'paid' && (
              <form action={updateOrderStatus}>
                <input type="hidden" name="orderId" value={order.id} />
                <input type="hidden" name="newStatus" value="in_progress" />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Start Processing
                </button>
              </form>
            )}

            {order.status === 'in_progress' && (
              <form action={updateOrderStatus}>
                <input type="hidden" name="orderId" value={order.id} />
                <input type="hidden" name="newStatus" value="completed" />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Mark as Completed
                </button>
              </form>
            )}

            {order.status === 'completed' && (
              <div className="text-center text-gray-500">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p>This order has been completed.</p>
              </div>
            )}

            {order.status === 'pending_payment' && order.payment_method === 'bank_transfer' && !order.bank_transfer_proof && (
              <div className="text-center text-gray-500">
                <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p>Waiting for customer to upload payment receipt.</p>
                {order.expires_at && (
                  <p className="text-xs text-gray-400 mt-2">
                    Expires: {new Date(order.expires_at).toLocaleString('en-NG')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Order Created</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleString('en-NG')}
                  </p>
                </div>
              </div>
              {order.paid_at && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Confirmed</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.paid_at).toLocaleString('en-NG')}
                    </p>
                  </div>
                </div>
              )}
              {order.started_at && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Processing Started</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.started_at).toLocaleString('en-NG')}
                    </p>
                  </div>
                </div>
              )}
              {order.completed_at && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order Completed</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.completed_at).toLocaleString('en-NG')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
            <div className="space-y-2">
              <a
                href={`mailto:${order.customer_email}`}
                className="block w-full px-4 py-2 text-center border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Email Customer
              </a>
              <a
                href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-2 text-center border border-green-200 rounded-lg text-green-700 hover:bg-green-50"
              >
                WhatsApp Customer
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
