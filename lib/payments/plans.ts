export type PaymentPlan = {
  id: string
  name: string
  description: string
  amountKobo: number
  currency: 'NGN'
  featuredDays?: number
}

export const PAYMENT_PLANS: Record<string, PaymentPlan> = {
  featured_30d: {
    id: 'featured_30d',
    name: 'Featured Listing (30 days)',
    description: 'Top placement on category pages + Featured page badge for 30 days.',
    amountKobo: 1500000,
    currency: 'NGN',
    featuredDays: 30,
  },
  featured_90d: {
    id: 'featured_90d',
    name: 'Featured Listing (90 days)',
    description: 'Top placement on category pages + Featured page badge for 90 days.',
    amountKobo: 3500000,
    currency: 'NGN',
    featuredDays: 90,
  },
}

export function getPaymentPlan(planId: string): PaymentPlan | null {
  return PAYMENT_PLANS[planId] ?? null
}

export function formatNairaFromKobo(amountKobo: number) {
  const naira = amountKobo / 100
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(naira)
}

