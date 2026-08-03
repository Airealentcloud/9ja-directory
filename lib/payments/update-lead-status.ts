import type { createAdminClient } from '@/lib/supabase/admin'

type AdminClient = ReturnType<typeof createAdminClient>

export async function updateVerifiedPaymentLead(
  supabase: AdminClient,
  input: {
    id: string
    status: 'pending' | 'success' | 'failed' | 'abandoned'
    paidAt?: string | null
  }
) {
  const update = await supabase
    .from('payment_leads')
    .update({ status: input.status, paid_at: input.paidAt ?? null })
    .eq('id', input.id)

  if (!update.error) return

  // Some early production databases created paid_at as VARCHAR(20) instead of
  // TIMESTAMPTZ. Paystack's ISO timestamp is longer than that. Do not let this
  // legacy storage defect discard an otherwise verified payment.
  if (input.paidAt && /character varying\(20\)|value too long/i.test(update.error.message)) {
    console.warn('Payment lead timestamp exceeded the legacy column width; saving verified status without rewriting paid_at.', {
      leadId: input.id,
      status: input.status,
      code: update.error.code,
    })

    const fallback = await supabase
      .from('payment_leads')
      .update({ status: input.status })
      .eq('id', input.id)

    if (!fallback.error) return
    throw new Error(`Could not save verified payment status: ${fallback.error.message}`)
  }

  throw new Error(`Could not save payment verification: ${update.error.message}`)
}
