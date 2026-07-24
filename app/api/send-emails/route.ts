import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deliverQueuedEmail } from '@/lib/email/queue'

// This API route processes pending email notifications
// You can call this manually or set up a cron job to run it periodically

function isAuthorized(request: NextRequest) {
    const secret = process.env.CRON_SECRET
    if (!secret) return false
    return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function POST(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const supabaseAdmin = createAdminClient()
        const { data: notifications, error: fetchError } = await supabaseAdmin
            .rpc('claim_email_notifications', { batch_limit: 50 })

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
                await deliverQueuedEmail(notification)
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
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const supabaseAdmin = createAdminClient()

        const { count: pendingCount } = await supabaseAdmin
            .from('email_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('sent', false)
            .in('delivery_status', ['queued', 'failed'])

        const { count: sentCount } = await supabaseAdmin
            .from('email_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('sent', true)

        return NextResponse.json({
            status: 'active',
            pending: pendingCount || 0,
            sent: sentCount || 0,
            maxAttempts: 5,
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
