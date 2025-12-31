import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendNewsletterVerification } from '@/lib/email/notifications'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        // Validate email
        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        const supabase = createAdminClient()

        // Check if email already exists
        const { data: existing } = await supabase
            .from('newsletter_subscribers')
            .select('id, status, verification_token')
            .eq('email', email.toLowerCase())
            .single()

        if (existing) {
            if (existing.status === 'active') {
                return NextResponse.json(
                    { error: 'This email is already subscribed' },
                    { status: 400 }
                )
            }

            // If pending or unsubscribed, resend verification
            if (existing.status === 'pending' || existing.status === 'unsubscribed') {
                // Generate new token for re-verification
                const newToken = crypto.randomUUID()

                await supabase
                    .from('newsletter_subscribers')
                    .update({
                        status: 'pending',
                        verification_token: newToken,
                        unsubscribed_at: null
                    })
                    .eq('id', existing.id)

                // Send verification email
                await sendNewsletterVerification({
                    email: email.toLowerCase(),
                    verificationToken: newToken
                })

                return NextResponse.json({
                    success: true,
                    message: 'Verification email sent. Please check your inbox.'
                })
            }
        }

        // Insert new subscriber
        const { data: newSubscriber, error: insertError } = await supabase
            .from('newsletter_subscribers')
            .insert({
                email: email.toLowerCase(),
                status: 'pending',
                source: 'website'
            })
            .select('verification_token')
            .single()

        if (insertError) {
            console.error('Newsletter subscribe error:', insertError)
            return NextResponse.json(
                { error: 'Failed to subscribe. Please try again.' },
                { status: 500 }
            )
        }

        // Send verification email
        await sendNewsletterVerification({
            email: email.toLowerCase(),
            verificationToken: newSubscriber.verification_token
        })

        return NextResponse.json({
            success: true,
            message: 'Please check your email to confirm your subscription.'
        })

    } catch (error) {
        console.error('Newsletter subscribe error:', error)
        return NextResponse.json(
            { error: 'An error occurred. Please try again.' },
            { status: 500 }
        )
    }
}
