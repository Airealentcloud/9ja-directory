import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'

export type QueuedEmailInput = {
  eventKey: string
  userId?: string | null
  listingId?: string | null
  email: string
  type: string
  subject: string
  text: string
  html: string
}

type QueuedEmailRow = {
  id: string
  event_key: string | null
  email: string
  subject: string
  body: string
  html_body: string | null
  sent: boolean
  delivery_status: 'queued' | 'processing' | 'sent' | 'failed'
  attempts: number
}

function retryAt(attempts: number) {
  const minutes = Math.min(60, Math.max(5, attempts * 5))
  return new Date(Date.now() + minutes * 60 * 1000).toISOString()
}

export async function deliverQueuedEmail(row: QueuedEmailRow) {
  const supabase = createAdminClient()

  try {
    await sendEmail({
      to: row.email,
      subject: row.subject,
      text: row.body,
      html: row.html_body || undefined,
      idempotencyKey: row.event_key || `notification-${row.id}`,
    })

    const { error } = await supabase
      .from('email_notifications')
      .update({
        sent: true,
        sent_at: new Date().toISOString(),
        delivery_status: 'sent',
        last_error: null,
      })
      .eq('id', row.id)

    if (error) throw error
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email delivery failed'
    await supabase
      .from('email_notifications')
      .update({
        sent: false,
        delivery_status: 'failed',
        last_error: message.slice(0, 1000),
        next_attempt_at: retryAt(row.attempts),
      })
      .eq('id', row.id)
    throw error
  }
}

export async function queueTransactionalEmail(input: QueuedEmailInput) {
  const supabase = createAdminClient()
  const { error: insertError } = await supabase
    .from('email_notifications')
    .upsert(
      {
        event_key: input.eventKey,
        user_id: input.userId || null,
        listing_id: input.listingId || null,
        email: input.email.trim().toLowerCase(),
        type: input.type,
        subject: input.subject,
        body: input.text,
        html_body: input.html,
        sent: false,
        delivery_status: 'queued',
        next_attempt_at: new Date().toISOString(),
      },
      {
        onConflict: 'event_key',
        ignoreDuplicates: true,
      }
    )

  if (insertError) throw new Error(`Could not queue ${input.type} email: ${insertError.message}`)

  const { data, error: lookupError } = await supabase
    .from('email_notifications')
    .select('id, event_key, email, subject, body, html_body, sent, delivery_status, attempts')
    .eq('event_key', input.eventKey)
    .single()

  if (lookupError || !data) {
    throw new Error(`Could not load queued ${input.type} email: ${lookupError?.message || 'missing row'}`)
  }

  const row = data as QueuedEmailRow
  if (row.sent || row.delivery_status === 'sent' || row.delivery_status === 'processing') {
    return { queued: true, sent: row.sent }
  }

  const { data: claimed, error: claimError } = await supabase
    .from('email_notifications')
    .update({
      delivery_status: 'processing',
      attempts: row.attempts + 1,
      last_error: null,
    })
    .eq('id', row.id)
    .in('delivery_status', ['queued', 'failed'])
    .select('id, event_key, email, subject, body, html_body, sent, delivery_status, attempts')
    .maybeSingle()

  if (claimError) throw new Error(`Could not claim ${input.type} email: ${claimError.message}`)
  if (!claimed) return { queued: true, sent: false }

  try {
    await deliverQueuedEmail(claimed as QueuedEmailRow)
    return { queued: true, sent: true }
  } catch (error) {
    console.error(`Immediate ${input.type} email delivery failed; it remains queued for retry.`, error)
    return { queued: true, sent: false }
  }
}
