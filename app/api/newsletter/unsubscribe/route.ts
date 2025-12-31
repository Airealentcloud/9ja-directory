import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendNewsletterUnsubscribeConfirmation } from '@/lib/email/notifications'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        const supabase = createAdminClient()

        // Find subscriber
        const { data: subscriber, error: findError } = await supabase
            .from('newsletter_subscribers')
            .select('id, status')
            .eq('email', email.toLowerCase())
            .single()

        if (findError || !subscriber) {
            // Don't reveal if email exists or not for privacy
            return NextResponse.json({
                success: true,
                message: 'If this email was subscribed, it has been unsubscribed.'
            })
        }

        if (subscriber.status === 'unsubscribed') {
            return NextResponse.json({
                success: true,
                message: 'This email is already unsubscribed.'
            })
        }

        // Update subscriber status
        const { error: updateError } = await supabase
            .from('newsletter_subscribers')
            .update({
                status: 'unsubscribed',
                unsubscribed_at: new Date().toISOString()
            })
            .eq('id', subscriber.id)

        if (updateError) {
            console.error('Newsletter unsubscribe error:', updateError)
            return NextResponse.json(
                { error: 'Failed to unsubscribe. Please try again.' },
                { status: 500 }
            )
        }

        // Send confirmation email
        await sendNewsletterUnsubscribeConfirmation({ email: email.toLowerCase() })

        return NextResponse.json({
            success: true,
            message: 'You have been successfully unsubscribed.'
        })

    } catch (error) {
        console.error('Newsletter unsubscribe error:', error)
        return NextResponse.json(
            { error: 'An error occurred. Please try again.' },
            { status: 500 }
        )
    }
}

// Also support GET for direct link unsubscribe
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
        return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
        )
    }

    // Create a mock request for the POST handler
    const mockRequest = new Request(request.url, {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' }
    })

    return POST(mockRequest)
}
