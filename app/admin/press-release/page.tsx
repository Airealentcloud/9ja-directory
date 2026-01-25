import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/press-release/packages'
import { Eye, CheckCircle, XCircle, Clock, ExternalLink, Download } from 'lucide-react'

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

  redirect('/admin/press-release')
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

  redirect('/admin/press-release')
}

export default async function AdminPressReleasePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; payment?: string }>
}) {
  const { status, payment } = await searchParams
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

  // Build query
  let query = supabase
    .from('press_release_orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }
  if (payment) {
    query = query.eq('payment_status', payment)
  }

  const { data: orders, error } = await query

  if (error) {
    console.error('Error fetching orders:', error)
  }

  // Get stats
  const { count: totalCount } = await supabase
    .from('press_release_orders')
    .select('*', { count: 'exact', head: true })

  const { count: pendingPaymentCount } = await supabase
    .from('press_release_orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_payment')

  const { count: paidCount } = await supabase
    .from('press_release_orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'paid')

  const { count: bankTransferPending } = await supabase
    .from('press_release_orders')
    .select('*', { count: 'exact', head: true })
    .eq('payment_method', 'bank_transfer')
    .eq('payment_status', 'pending')
    .not('bank_transfer_proof', 'is', null)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Press Release Orders</h1>
          <p className="text-gray-500 mt-1">Manage press release orders and payments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Orders</div>
          <div className="text-2xl font-bold text-gray-900">{totalCount || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Awaiting Payment</div>
          <div className="text-2xl font-bold text-yellow-600">{pendingPaymentCount || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Paid Orders</div>
          <div className="text-2xl font-bold text-green-600">{paidCount || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="text-sm text-gray-500">Receipts to Review</div>
          <div className="text-2xl font-bold text-orange-600">{bankTransferPending || 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/press-release"
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            !status && !payment
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          All
        </Link>
        <Link
          href="/admin/press-release?status=pending_payment"
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            status === 'pending_payment'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Pending Payment
        </Link>
        <Link
          href="/admin/press-release?status=paid"
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            status === 'paid'
              ? 'bg-green-100 text-green-800'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Paid
        </Link>
        <Link
          href="/admin/press-release?status=in_progress"
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            status === 'in_progress'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          In Progress
        </Link>
        <Link
          href="/admin/press-release?status=completed"
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            status === 'completed'
              ? 'bg-green-100 text-green-800'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Completed
        </Link>
        <span className="border-l border-gray-300 mx-2" />
        <Link
          href="/admin/press-release?payment=pending"
          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${
            payment === 'pending'
              ? 'bg-orange-100 text-orange-800'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          Bank Transfer Pending
        </Link>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Package
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.payment_reference}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {order.customer_name}
                    </div>
                    <div className="text-sm text-gray-500">{order.customer_email}</div>
                    <div className="text-xs text-gray-400">{order.customer_phone}</div>
                    {order.company_name && (
                      <div className="text-xs text-gray-400">{order.company_name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {order.package_name}
                    </div>
                    <div className="text-sm text-green-600 font-semibold">
                      {formatPrice(order.package_price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        paymentStatusColors[order.payment_status as PaymentStatus] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.payment_status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {order.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Paystack'}
                    </div>
                    {order.bank_transfer_proof && (
                      <a
                        href={order.bank_transfer_proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                      >
                        <Download className="w-3 h-3" />
                        View Receipt
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[order.status as OrderStatus] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                    {order.expires_at && order.status === 'pending_payment' && (
                      <div className="text-xs text-gray-500 mt-1">
                        Expires: {new Date(order.expires_at).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Bank Transfer Confirmation */}
                    {order.payment_method === 'bank_transfer' &&
                      order.payment_status === 'pending' &&
                      order.bank_transfer_proof && (
                        <div className="flex items-center justify-end gap-2">
                          <form action={confirmPayment}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="action" value="confirm" />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-medium hover:bg-green-700"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Confirm
                            </button>
                          </form>
                          <form action={confirmPayment}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="action" value="reject" />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </form>
                        </div>
                      )}

                    {/* Status Update for Paid Orders */}
                    {order.status === 'paid' && (
                      <form action={updateOrderStatus} className="inline">
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="newStatus" value="in_progress" />
                        <button
                          type="submit"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Start Processing
                        </button>
                      </form>
                    )}

                    {order.status === 'in_progress' && (
                      <form action={updateOrderStatus} className="inline">
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="newStatus" value="completed" />
                        <button
                          type="submit"
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Mark Complete
                        </button>
                      </form>
                    )}

                    {/* View Details */}
                    <Link
                      href={`/admin/press-release/${order.id}`}
                      className="ml-4 text-gray-600 hover:text-gray-900"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
