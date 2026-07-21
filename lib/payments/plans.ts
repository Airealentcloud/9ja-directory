import { PRICING_PLANS, nairaToKobo, type PlanId } from '@/lib/pricing'

export type PaymentPlan = {
  id: string
  name: string
  description: string
  amountKobo: number
  currency: 'NGN'
  planType: 'subscription' | 'featured' | 'test'
  subscriptionPlanId?: PlanId
  featuredDays?: number
}

const subscriptionPlans = Object.fromEntries(
  PRICING_PLANS.map((plan) => [
    plan.id,
    {
      id: plan.id,
      name: plan.name,
      description: `${plan.description}. ${plan.features.slice(0, 3).join(', ')}.`,
      amountKobo: nairaToKobo(plan.price),
      currency: 'NGN' as const,
      planType: 'subscription' as const,
      subscriptionPlanId: plan.id,
    },
  ])
) as Record<PlanId, PaymentPlan>

export const PAYMENT_PLANS: Record<string, PaymentPlan> = {
  ...subscriptionPlans,
  featured_30d: {
    id: 'featured_30d',
    name: 'Featured Listing (30 days)',
    description: 'Sponsored placement on category pages plus a Featured badge for 30 days.',
    amountKobo: 1500000,
    currency: 'NGN',
    planType: 'featured',
    featuredDays: 30,
  },
  featured_90d: {
    id: 'featured_90d',
    name: 'Featured Listing (90 days)',
    description: 'Sponsored placement on category pages plus a Featured badge for 90 days.',
    amountKobo: 3500000,
    currency: 'NGN',
    planType: 'featured',
    featuredDays: 90,
  },
  test_payment: {
    id: 'test_payment',
    name: 'Test Payment',
    description: 'Internal payment-integration test. It grants no listing entitlement.',
    amountKobo: 200000,
    currency: 'NGN',
    planType: 'test',
  },
}

export function getPaymentPlan(planId: string): PaymentPlan | null {
  return PAYMENT_PLANS[planId] ?? null
}

export function getSubscriptionPlans(): PaymentPlan[] {
  return Object.values(PAYMENT_PLANS).filter(plan => plan.planType === 'subscription')
}

export function getFeaturedPlans(): PaymentPlan[] {
  return Object.values(PAYMENT_PLANS).filter(plan => plan.planType === 'featured')
}

export function formatNairaFromKobo(amountKobo: number) {
  const naira = amountKobo / 100
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(naira)
}
