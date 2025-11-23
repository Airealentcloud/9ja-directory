import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This API route processes pending email notifications
// You can call this manually or set up a cron job to run it periodically

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabaseAdmin = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null

export async function POST(request: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: 'Supabase admin client not configured' },
                { status: 500 }
            )
        }

        // Fetch unsent email notifications
        const { data: notifications, error: fetchError } = await supabaseAdmin
            .from('email_notifications')
            .select('*')
            .eq('sent', false)
            .order('created_at', { ascending: true })
            .limit(50) // Process 50 at a time

        if (fetchError) {
            throw fetchError
        }

        if (!notifications || notifications.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No pending notifications',
                sent: 0
            })
        }

        let sentCount = 0
        const errors: any[] = []

        // Process each notification
        for (const notification of notifications) {
            try {
                // Send email using Supabase Auth's email system
                // Note: This uses the auth.users table email
                const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
                    notification.email,
                    {
                        data: {
                            notification_type: notification.type,
                            notification_subject: notification.subject,
                            notification_body: notification.body
                        }
                    }
                )

                if (emailError) {
                    console.error('Email send error:', emailError)
                    errors.push({
                        id: notification.id,
                        error: emailError.message
                    })
                    continue
                }

                // Mark as sent
                await supabaseAdmin
                    .from('email_notifications')
                    .update({
                        sent: true,
                        sent_at: new Date().toISOString()
                    })
                    .eq('id', notification.id)

                sentCount++
            } catch (err: any) {
                console.error('Error processing notification:', err)
                errors.push({
                    id: notification.id,
                    error: err.message
                })
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${notifications.length} notifications`,
            sent: sentCount,
            errors: errors.length > 0 ? errors : undefined
        })

    } catch (error: any) {
        console.error('Email processing error:', error)
        return NextResponse.json(
            {
                error: 'Failed to process email notifications',
                details: error.message
            },
            { status: 500 }
        )
    }
}

// GET endpoint to check status
export async function GET(request: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: 'Supabase admin client not configured' },
                { status: 500 }
            )
        }

        const { count: pendingCount } = await supabaseAdmin
            .from('email_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('sent', false)

        const { count: sentCount } = await supabaseAdmin
            .from('email_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('sent', true)

        return NextResponse.json({
            status: 'active',
            pending: pendingCount || 0,
            sent: sentCount || 0,
            endpoint: '/api/send-emails',
            description: 'Email notification processor'
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
