import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPayment } from '@/lib/paystack'
import { sendEmail } from '@/lib/email/resend'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://9jadirectory.org'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find the order by reference
    const { data: order, error: orderError } = await supabase
      .from('press_release_orders')
      .select('*')
      .eq('payment_reference', reference)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // If already verified, return success
    if (order.payment_status === 'success') {
      return NextResponse.json({
        success: true,
        status: 'success',
        order: {
          id: order.id,
          reference: order.payment_reference,
          packageName: order.package_name,
          amount: order.package_price,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          paymentMethod: order.payment_method,
        },
      })
    }

    // Only verify Paystack payments
    if (order.payment_method !== 'paystack') {
      return NextResponse.json({
        success: true,
        status: order.payment_status,
        paymentMethod: order.payment_method,
        order: {
          id: order.id,
          reference: order.payment_reference,
          packageName: order.package_name,
          amount: order.package_price,
        },
      })
    }

    // Verify with Paystack
    const paystackResponse = await verifyPayment(reference)

    if (!paystackResponse.status || !paystackResponse.data) {
      return NextResponse.json(
        { error: 'Failed to verify payment' },
        { status: 500 }
      )
    }

    const paymentData = paystackResponse.data

    // Check payment status
    if (paymentData.status === 'success') {
      // Update order to success
      const { error: updateError } = await supabase
        .from('press_release_orders')
        .update({
          payment_status: 'success',
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', order.id)

      if (updateError) {
        console.error('Failed to update order:', updateError)
      }

      // Send confirmation email
      try {
        await sendEmail({
          to: order.customer_email,
          subject: `Payment Confirmed - ${order.package_name} | 9jaDirectory`,
          text: `Payment confirmed for ${order.package_name}. Reference: ${order.payment_reference}. Amount: NGN ${(order.package_price / 100).toLocaleString()}. Please reply with your press release content, logo, and images.`,
          html: `
            <h2>Payment Confirmed!</h2>
            <p>Thank you, ${order.customer_name}! Your payment has been received.</p>

            <h3>Order Details</h3>
            <ul>
              <li><strong>Order Reference:</strong> ${order.payment_reference}</li>
              <li><strong>Package:</strong> ${order.package_name}</li>
              <li><strong>Amount Paid:</strong> ₦${(order.package_price / 100).toLocaleString()}</li>
            </ul>

            <h3>What's Next?</h3>
            <p>Our team will begin processing your press release order. You'll receive further instructions on how to submit your press release content.</p>

            <p>If you haven't already, please prepare:</p>
            <ul>
              <li>Your press release content (or Google Docs link)</li>
              <li>Company logo (if applicable)</li>
              <li>Any images you'd like included</li>
            </ul>

            <p>You can reply to this email or contact us on WhatsApp: +234 916 002 3442</p>

            <p>Thank you for choosing 9jaDirectory!</p>
          `,
        })
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError)
      }

      // Notify admin
      try {
        const adminEmail = process.env.ADMIN_EMAIL
        if (adminEmail) {
          await sendEmail({
            to: adminEmail,
            subject: `Payment Received - ${order.payment_reference} | Press Release`,
            text: `Payment received for ${order.package_name}. Reference: ${order.payment_reference}. Amount: NGN ${(order.package_price / 100).toLocaleString()}. Customer: ${order.customer_name} (${order.customer_email}).`,
            html: `
              <h2>Payment Received!</h2>
              <p>A press release order has been paid via Paystack.</p>

              <h3>Order Details</h3>
              <ul>
                <li><strong>Reference:</strong> ${order.payment_reference}</li>
                <li><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</li>
                <li><strong>Package:</strong> ${order.package_name}</li>
                <li><strong>Amount:</strong> ₦${(order.package_price / 100).toLocaleString()}</li>
              </ul>

              <p><a href="${siteUrl}/admin/press-release">View in Admin Dashboard</a></p>
            `,
          })
        }
      } catch {
        // Don't fail if admin notification fails
      }

      return NextResponse.json({
        success: true,
        status: 'success',
        order: {
          id: order.id,
          reference: order.payment_reference,
          packageName: order.package_name,
          amount: order.package_price,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          paymentMethod: order.payment_method,
        },
      })
    } else if (paymentData.status === 'failed' || paymentData.status === 'abandoned') {
      // Update order to failed
      await supabase
        .from('press_release_orders')
        .update({
          payment_status: paymentData.status,
        })
        .eq('id', order.id)

      return NextResponse.json({
        success: false,
        status: paymentData.status,
        message: 'Payment was not successful. Please try again.',
      })
    }

    // Payment still pending
    return NextResponse.json({
      success: false,
      status: 'pending',
      message: 'Payment is still being processed.',
    })
  } catch (error) {
    console.error('Press release verify error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
