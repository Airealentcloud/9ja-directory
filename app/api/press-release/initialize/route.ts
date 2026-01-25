import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initializePayment } from '@/lib/paystack'
import { generateOrderReference, getPackageBySlug } from '@/lib/press-release/packages'
import { sendEmail } from '@/lib/email/resend'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://9jadirectory.org'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      packageSlug,
      packageName,
      packagePrice,
      packageType,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      companyName,
      orderNotes,
    } = body

    // Validate required fields
    if (!packageSlug || !packageName || !packagePrice || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required package information' },
        { status: 400 }
      )
    }

    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: 'Please provide your name, email, and phone number' },
        { status: 400 }
      )
    }

    // Validate payment method
    if (!['paystack', 'bank_transfer'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }

    // Validate package exists
    const pkg = getPackageBySlug(packageSlug)
    if (!pkg) {
      return NextResponse.json(
        { error: 'Invalid package selected' },
        { status: 400 }
      )
    }

    // Verify price matches (security check)
    if (pkg.price !== packagePrice) {
      return NextResponse.json(
        { error: 'Price mismatch. Please refresh and try again.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user is logged in (optional)
    const { data: { user } } = await supabase.auth.getUser()

    // Generate unique order reference
    const orderReference = generateOrderReference()

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('press_release_orders')
      .insert({
        user_id: user?.id || null,
        package_slug: packageSlug,
        package_name: packageName,
        package_price: packagePrice,
        package_type: packageType || 'standalone',
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        company_name: companyName || null,
        payment_method: paymentMethod,
        payment_reference: orderReference,
        payment_status: 'pending',
        order_notes: orderNotes || null,
        status: 'pending_payment',
      })
      .select()
      .single()

    if (orderError) {
      console.error('Failed to create order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order. Please try again.' },
        { status: 500 }
      )
    }

    // Handle Paystack payment
    if (paymentMethod === 'paystack') {
      try {
        const callbackUrl = `${siteUrl}/press-release/order-success?reference=${orderReference}`

        const paystackResponse = await initializePayment({
          email: customerEmail,
          amount: packagePrice, // Already in kobo
          reference: orderReference,
          callback_url: callbackUrl,
          metadata: {
            order_id: order.id,
            order_type: 'press_release',
            package_slug: packageSlug,
            package_name: packageName,
            customer_name: customerName,
            customer_phone: customerPhone,
          } as Record<string, any>,
        })

        if (!paystackResponse.status || !paystackResponse.data?.authorization_url) {
          throw new Error('Failed to initialize Paystack payment')
        }

        return NextResponse.json({
          success: true,
          orderId: order.id,
          reference: orderReference,
          authorization_url: paystackResponse.data.authorization_url,
        })
      } catch (paystackError) {
        console.error('Paystack initialization error:', paystackError)

        // Update order status to failed
        await supabase
          .from('press_release_orders')
          .update({ payment_status: 'failed' })
          .eq('id', order.id)

        return NextResponse.json(
          { error: 'Payment initialization failed. Please try again.' },
          { status: 500 }
        )
      }
    }

    // Handle Bank Transfer
    if (paymentMethod === 'bank_transfer') {
      // Send confirmation email with bank details
      try {
        await sendEmail({
          to: customerEmail,
          subject: `Order Confirmation - ${packageName} | 9jaDirectory`,
          html: `
            <h2>Thank you for your order, ${customerName}!</h2>
            <p>Your order for <strong>${packageName}</strong> has been received.</p>

            <h3>Order Details</h3>
            <ul>
              <li><strong>Order Reference:</strong> ${orderReference}</li>
              <li><strong>Package:</strong> ${packageName}</li>
              <li><strong>Amount:</strong> ₦${(packagePrice / 100).toLocaleString()}</li>
            </ul>

            <h3>Bank Transfer Details</h3>
            <p>Please transfer the exact amount to:</p>
            <ul>
              <li><strong>Account Name:</strong> A.I ROBOTICS LOGISTICS LTD</li>
              <li><strong>Account Number:</strong> 1219916577</li>
              <li><strong>Bank:</strong> Zenith Bank</li>
            </ul>

            <p><strong>Important:</strong> Use your order reference <code>${orderReference}</code> as the transfer description/narration.</p>

            <p>After making the transfer, please upload your payment receipt at:<br>
            <a href="${siteUrl}/press-release/order-pending?order=${order.id}">${siteUrl}/press-release/order-pending?order=${order.id}</a></p>

            <p><strong>Note:</strong> Your order will expire after 48 hours if payment is not confirmed.</p>

            <p>Need help? Contact us on WhatsApp: +234 916 002 3442</p>

            <p>Thank you for choosing 9jaDirectory!</p>
          `,
        })
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError)
        // Don't fail the order if email fails
      }

      // Notify admin of new bank transfer order
      try {
        const adminEmail = process.env.ADMIN_EMAIL
        if (adminEmail) {
          await sendEmail({
            to: adminEmail,
            subject: `New Press Release Order (Bank Transfer) - ${orderReference}`,
            html: `
              <h2>New Press Release Order</h2>
              <p><strong>Payment Method:</strong> Bank Transfer (Pending)</p>

              <h3>Customer Details</h3>
              <ul>
                <li><strong>Name:</strong> ${customerName}</li>
                <li><strong>Email:</strong> ${customerEmail}</li>
                <li><strong>Phone:</strong> ${customerPhone}</li>
                ${companyName ? `<li><strong>Company:</strong> ${companyName}</li>` : ''}
              </ul>

              <h3>Order Details</h3>
              <ul>
                <li><strong>Reference:</strong> ${orderReference}</li>
                <li><strong>Package:</strong> ${packageName}</li>
                <li><strong>Amount:</strong> ₦${(packagePrice / 100).toLocaleString()}</li>
                ${orderNotes ? `<li><strong>Notes:</strong> ${orderNotes}</li>` : ''}
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
        orderId: order.id,
        reference: orderReference,
        paymentMethod: 'bank_transfer',
      })
    }

    return NextResponse.json(
      { error: 'Invalid payment method' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Press release initialize error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
