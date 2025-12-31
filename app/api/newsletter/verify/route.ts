import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendNewsletterWelcome } from '@/lib/email/notifications'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')

        if (!token) {
            return NextResponse.json(
                { error: 'Verification token is required' },
                { status: 400 }
            )
        }

        const supabase = createAdminClient()

        // Find subscriber by token
        const { data: subscriber, error: findError } = await supabase
            .from('newsletter_subscribers')
            .select('id, email, status')
            .eq('verification_token', token)
            .single()

        if (findError || !subscriber) {
            return NextResponse.json(
                { error: 'Invalid or expired verification link' },
                { status: 400 }
            )
        }

        // Check if already verified
        if (subscriber.status === 'active') {
            return NextResponse.json({
                success: true,
                message: 'Email already verified',
                alreadyVerified: true
            })
        }

        // Update subscriber status to active
        const { error: updateError } = await supabase
            .from('newsletter_subscribers')
            .update({
                status: 'active',
                verified_at: new Date().toISOString()
            })
            .eq('id', subscriber.id)

        if (updateError) {
            console.error('Newsletter verify error:', updateError)
            return NextResponse.json(
                { error: 'Failed to verify subscription' },
                { status: 500 }
            )
        }

        // Send welcome email
        await sendNewsletterWelcome({ email: subscriber.email })

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully'
        })

    } catch (error) {
        console.error('Newsletter verify error:', error)
        return NextResponse.json(
            { error: 'An error occurred. Please try again.' },
            { status: 500 }
        )
    }
}
