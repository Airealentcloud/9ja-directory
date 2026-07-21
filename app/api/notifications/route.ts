import { NextRequest, NextResponse } from 'next/server'
import { notifyAdminContactForm } from '@/lib/email/notifications'

type NotificationPayload = {
    type?: 'contact_form' | string
    data?: Record<string, unknown>
}

function textField(value: unknown, maxLength: number) {
    return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function isEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as NotificationPayload
        const data = body.data || {}

        if (body.type === 'contact_form') {
            const name = textField(data.name, 120)
            const email = textField(data.email, 320).toLowerCase()
            const subject = textField(data.subject, 180)
            const message = textField(data.message, 5000)

            if (!name || !isEmail(email) || !subject || message.length < 10) {
                return NextResponse.json({ error: 'Complete all contact fields with valid details.' }, { status: 400 })
            }

            await notifyAdminContactForm({ name, email, subject, message })
            return NextResponse.json({ success: true, message: 'Contact form submitted successfully' })
        }

        // Listing notifications are sent only inside authenticated server actions.
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    } catch (error) {
        console.error('Notification error:', error)
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
    }
}
