import { PlanId } from '@/lib/pricing'

export type PaymentPlan = {
  id: string
  name: string
  description: string
  amountKobo: number
  currency: 'NGN'
  planType: 'subscription' | 'featured' | 'test'
  subscriptionPlanId?: PlanId // Links to pricing.ts plan
  featuredDays?: number
}

export const PAYMENT_PLANS: Record<string, PaymentPlan> = {
  // Main subscription plans
  basic: {
    id: 'basic',
    name: 'BASIC',
    description: 'Perfect for small businesses getting started. 1 listing, 4 photos, basic features.',
    amountKobo: 3850000, // ₦38,500
    currency: 'NGN',
    planType: 'subscription',
    subscriptionPlanId: 'basic',
  },
  premium: {
    id: 'premium',
    name: 'PREMIUM',
    description: 'Great for growing businesses. 5 listings, 15 photos, social links, AI features.',
    amountKobo: 11550000, // ₦115,500
    currency: 'NGN',
    planType: 'subscription',
    subscriptionPlanId: 'premium',
  },
  lifetime: {
    id: 'lifetime',
    name: 'LIFETIME',
    description: 'Maximum visibility. Unlimited listings, 100 photos, all features, never pay again.',
    amountKobo: 19800000, // ₦198,000
    currency: 'NGN',
    planType: 'subscription',
    subscriptionPlanId: 'lifetime',
  },
  // Featured listing add-ons (optional upgrades)
  featured_30d: {
    id: 'featured_30d',
    name: 'Featured Listing (30 days)',
    description: 'Top placement on category pages + Featured badge for 30 days.',
    amountKobo: 1500000, // ₦15,000
    currency: 'NGN',
    planType: 'featured',
    featuredDays: 30,
  },
  featured_90d: {
    id: 'featured_90d',
    name: 'Featured Listing (90 days)',
    description: 'Top placement on category pages + Featured badge for 90 days.',
    amountKobo: 3500000, // ₦35,000
    currency: 'NGN',
    planType: 'featured',
    featuredDays: 90,
  },
  // Test payment (for testing)
  test_payment: {
    id: 'test_payment',
    name: 'Test Payment',
    description: 'Simple test to verify Paystack integration is working.',
    amountKobo: 200000, // ₦2,000
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
