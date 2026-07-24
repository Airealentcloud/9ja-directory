// Pricing plans configuration for 9jaDirectory

import { PLAN_LIMITS, type PaidPlanId, type PlanLimits } from '@/lib/entitlements'

export type PlanId = PaidPlanId
export type { PlanLimits } from '@/lib/entitlements'

export interface PricingPlan {
    id: PlanId
    name: string
    description: string
    price: number // in Naira
    priceFormatted: string
    originalPrice?: number // for showing discount
    originalPriceFormatted?: string
    discount?: string // e.g., "-45%"
    interval: 'one_time'
    intervalLabel: string
    features: string[]
    limits: PlanLimits
    highlighted?: boolean
    badge?: string
}

export const PRICING_PLANS: PricingPlan[] = [
    {
        id: 'basic',
        name: 'BASIC',
        description: 'A simple directory presence for one small business',
        price: 5000,
        priceFormatted: '\u20A65,000',
        originalPrice: 10000,
        originalPriceFormatted: '\u20A610,000',
        discount: '-50%',
        interval: 'one_time',
        intervalLabel: 'one-time fee',
        features: [
            '1 business listing',
            '4 photos',
            '400-character business description',
            'Business logo',
            'Phone, email and WhatsApp details',
            '1 primary business category',
            'State/City visibility',
            'Standard directory placement',
        ],
        limits: PLAN_LIMITS.basic,
    },
    {
        id: 'premium',
        name: 'PREMIUM',
        description: 'A verified, richer profile for growing businesses',
        price: 10000,
        priceFormatted: '\u20A610,000',
        originalPrice: 20000,
        originalPriceFormatted: '\u20A620,000',
        discount: '-50%',
        interval: 'one_time',
        intervalLabel: 'one-time fee',
        highlighted: true,
        badge: 'Popular',
        features: [
            '5 business listings',
            '15 photos per listing',
            '800-character description per listing',
            'Everything in Basic',
            'Verified business badge after approval',
            'Business hours display',
            'Social media links',
            'Website URL',
            'Highlighted listing badge',
            'Enhanced search visibility',
            'AI Description Writer',
            'Listing analytics',
        ],
        limits: PLAN_LIMITS.premium,
    },
    {
        id: 'lifetime',
        name: 'LIFETIME',
        description: 'Maximum placement and tools for established businesses',
        price: 30000,
        priceFormatted: '\u20A630,000',
        originalPrice: 60000,
        originalPriceFormatted: '\u20A660,000',
        discount: '-50%',
        interval: 'one_time',
        intervalLabel: 'one-time fee',
        badge: 'Best Value',
        features: [
            'Unlimited business listings',
            '100 photos per listing',
            'Unlimited description length',
            'Everything in Premium',
            'Featured homepage placement included',
            'Priority search placement',
            'AI Review Insights',
            'Verified badge',
            'Never pay again',
        ],
        limits: PLAN_LIMITS.lifetime,
    },
]

export function getPlanById(planId: PlanId): PricingPlan | undefined {
    return PRICING_PLANS.find(plan => plan.id === planId)
}

export function getPlanPrice(planId: PlanId): number {
    const plan = getPlanById(planId)
    return plan?.price ?? 0
}

export function getPlanLimits(planId: PlanId): PlanLimits | undefined {
    const plan = getPlanById(planId)
    return plan?.limits
}

// Convert Naira to Kobo for Paystack (Paystack uses kobo)
export function nairaToKobo(naira: number): number {
    return naira * 100
}

// Convert Kobo to Naira
export function koboToNaira(kobo: number): number {
    return kobo / 100
}
