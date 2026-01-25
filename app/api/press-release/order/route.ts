import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id')
    const reference = searchParams.get('reference')

    if (!orderId && !reference) {
      return NextResponse.json(
        { error: 'Order ID or reference is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('press_release_orders')
      .select('*')

    if (orderId) {
      query = query.eq('id', orderId)
    } else if (reference) {
      query = query.eq('payment_reference', reference)
    }

    const { data: order, error } = await query.single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Return sanitized order data
    return NextResponse.json({
      order: {
        id: order.id,
        reference: order.payment_reference,
        packageName: order.package_name,
        packageSlug: order.package_slug,
        amount: order.package_price,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        companyName: order.company_name,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        status: order.status,
        receiptUploaded: !!order.bank_transfer_proof,
        expiresAt: order.expires_at,
        createdAt: order.created_at,
        paidAt: order.paid_at,
      },
    })
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
