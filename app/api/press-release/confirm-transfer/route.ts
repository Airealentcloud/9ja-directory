import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://9jadirectory.org'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const orderId = formData.get('orderId') as string
    const receiptFile = formData.get('receipt') as File | null

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find the order
    const { data: order, error: orderError } = await supabase
      .from('press_release_orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order is bank transfer
    if (order.payment_method !== 'bank_transfer') {
      return NextResponse.json(
        { error: 'This order was not placed via bank transfer' },
        { status: 400 }
      )
    }

    // Check if already paid
    if (order.payment_status === 'success') {
      return NextResponse.json(
        { error: 'This order has already been paid' },
        { status: 400 }
      )
    }

    let receiptUrl: string | null = null

    // Upload receipt if provided
    if (receiptFile) {
      const fileExt = receiptFile.name.split('.').pop()
      const fileName = `receipts/${order.payment_reference}-${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, receiptFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Receipt upload error:', uploadError)
        return NextResponse.json(
          { error: 'Failed to upload receipt. Please try again.' },
          { status: 500 }
        )
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(uploadData.path)

      receiptUrl = publicUrl
    }

    // Update order with receipt
    const { error: updateError } = await supabase
      .from('press_release_orders')
      .update({
        bank_transfer_proof: receiptUrl,
        // Keep status as pending_payment until admin confirms
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Failed to update order:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order. Please try again.' },
        { status: 500 }
      )
    }

    // Notify admin of receipt upload
    try {
      const adminEmail = process.env.ADMIN_EMAIL
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: `Receipt Uploaded - ${order.payment_reference} | Press Release`,
          text: `Receipt uploaded for ${order.payment_reference} by ${order.customer_name} (${order.customer_email}). Package: ${order.package_name}. Amount: NGN ${(order.package_price / 100).toLocaleString()}. ${receiptUrl ? `Receipt: ${receiptUrl}` : ''}`,
          html: `
            <h2>Bank Transfer Receipt Uploaded</h2>
            <p>A customer has uploaded their payment receipt for review.</p>

            <h3>Order Details</h3>
            <ul>
              <li><strong>Reference:</strong> ${order.payment_reference}</li>
              <li><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</li>
              <li><strong>Phone:</strong> ${order.customer_phone}</li>
              <li><strong>Package:</strong> ${order.package_name}</li>
              <li><strong>Amount:</strong> ₦${(order.package_price / 100).toLocaleString()}</li>
            </ul>

            ${receiptUrl ? `<p><strong>Receipt:</strong> <a href="${receiptUrl}">View Receipt</a></p>` : ''}

            <p><strong>Action Required:</strong> Please verify the payment and confirm the order.</p>

            <p><a href="${siteUrl}/admin/press-release">Go to Admin Dashboard</a></p>
          `,
        })
      }
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
      // Don't fail if email fails
    }

    // Send confirmation to customer
    try {
      await sendEmail({
        to: order.customer_email,
        subject: `Receipt Received - ${order.package_name} | 9jaDirectory`,
        text: `We received your payment receipt for ${order.package_name}. Reference: ${order.payment_reference}. Amount: NGN ${(order.package_price / 100).toLocaleString()}. We will verify within 24 hours.`,
        html: `
          <h2>Receipt Received!</h2>
          <p>Thank you, ${order.customer_name}! We've received your payment receipt.</p>

          <h3>Order Details</h3>
          <ul>
            <li><strong>Order Reference:</strong> ${order.payment_reference}</li>
            <li><strong>Package:</strong> ${order.package_name}</li>
            <li><strong>Amount:</strong> ₦${(order.package_price / 100).toLocaleString()}</li>
          </ul>

          <h3>What's Next?</h3>
          <p>Our team will verify your payment within 24 hours. Once confirmed, we'll send you instructions for submitting your press release content.</p>

          <p>If you have any questions, contact us on WhatsApp: +234 916 002 3442</p>

          <p>Thank you for your patience!</p>
        `,
      })
    } catch {
      // Don't fail if customer email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Receipt uploaded successfully. We will verify your payment shortly.',
      receiptUrl,
    })
  } catch (error) {
    console.error('Confirm transfer error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Admin endpoint to confirm bank transfer payment
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, action, adminNotes } = body

    if (!orderId || !action) {
      return NextResponse.json(
        { error: 'Order ID and action are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Find the order
    const { data: order, error: orderError } = await supabase
      .from('press_release_orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (action === 'confirm') {
      // Confirm the payment
      const { error: updateError } = await supabase
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

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to confirm payment' },
          { status: 500 }
        )
      }

      // Notify customer
      try {
        await sendEmail({
          to: order.customer_email,
          subject: `Payment Confirmed - ${order.package_name} | 9jaDirectory`,
          text: `Payment confirmed for ${order.package_name}. Reference: ${order.payment_reference}. Amount: NGN ${(order.package_price / 100).toLocaleString()}. Please reply with your press release content, logo, and any images.`,
          html: `
            <h2>Payment Confirmed!</h2>
            <p>Great news, ${order.customer_name}! Your bank transfer has been verified.</p>

            <h3>Order Details</h3>
            <ul>
              <li><strong>Order Reference:</strong> ${order.payment_reference}</li>
              <li><strong>Package:</strong> ${order.package_name}</li>
              <li><strong>Amount:</strong> ₦${(order.package_price / 100).toLocaleString()}</li>
            </ul>

            <h3>What's Next?</h3>
            <p>Our team will now begin processing your press release. Please reply to this email with:</p>
            <ul>
              <li>Your press release content (or Google Docs link)</li>
              <li>Company logo</li>
              <li>Any images to include</li>
            </ul>

            <p>Or contact us on WhatsApp: +234 916 002 3442</p>

            <p>Thank you for choosing 9jaDirectory!</p>
          `,
        })
      } catch {
        // Don't fail if email fails
      }

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed successfully',
      })
    } else if (action === 'reject') {
      // Reject/cancel the order
      const { error: updateError } = await supabase
        .from('press_release_orders')
        .update({
          payment_status: 'failed',
          status: 'cancelled',
          admin_notes: adminNotes || 'Payment could not be verified',
        })
        .eq('id', orderId)

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update order' },
          { status: 500 }
        )
      }

      // Notify customer
      try {
        await sendEmail({
          to: order.customer_email,
          subject: `Payment Issue - ${order.package_name} | 9jaDirectory`,
          text: `We could not verify your payment for ${order.package_name}. Reference: ${order.payment_reference}. ${adminNotes ? `Note: ${adminNotes}. ` : ''}Please contact us with proof via WhatsApp +234 916 002 3442 or email support@9jadirectory.org.`,
          html: `
            <h2>Payment Verification Issue</h2>
            <p>Hi ${order.customer_name},</p>
            <p>We were unable to verify your bank transfer payment for order ${order.payment_reference}.</p>

            ${adminNotes ? `<p><strong>Note:</strong> ${adminNotes}</p>` : ''}

            <p>If you believe this is an error, please contact us with your payment proof:</p>
            <ul>
              <li>WhatsApp: +234 916 002 3442</li>
              <li>Email: support@9jadirectory.org</li>
            </ul>

            <p>You can also place a new order at <a href="${siteUrl}/press-release">${siteUrl}/press-release</a></p>
          `,
        })
      } catch {
        // Don't fail if email fails
      }

      return NextResponse.json({
        success: true,
        message: 'Order has been cancelled',
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Admin confirm transfer error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
