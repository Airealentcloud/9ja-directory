// Pricing plans configuration for 9jaDirectory

export type PlanId = 'basic' | 'standard' | 'premium'

export interface PricingPlan {
    id: PlanId
    name: string
    description: string
    price: number // in Naira
    priceFormatted: string
    interval: 'one_time' | 'monthly'
    intervalLabel: string
    features: string[]
    highlighted?: boolean
    badge?: string
    paystackPlanCode?: string // For recurring subscriptions
}

export const PRICING_PLANS: PricingPlan[] = [
    {
        id: 'basic',
        name: 'Basic',
        description: 'Perfect for small businesses getting started',
        price: 30000,
        priceFormatted: '₦30,000',
        interval: 'one_time',
        intervalLabel: 'one-time payment',
        features: [
            'Add 1 business listing',
            'Basic business profile',
            'Contact information display',
            'Category listing',
            'State/City visibility',
            'Standard approval (24-48 hrs)',
        ],
    },
    {
        id: 'standard',
        name: 'Standard',
        description: 'Great for growing businesses',
        price: 10000,
        priceFormatted: '₦10,000',
        interval: 'monthly',
        intervalLabel: 'per month',
        highlighted: true,
        badge: 'Popular',
        features: [
            'Everything in Basic',
            'Add unlimited listings',
            'Claim existing businesses',
            'Edit your listings anytime',
            'Priority support',
            'Faster approval (12-24 hrs)',
        ],
    },
    {
        id: 'premium',
        name: 'Premium',
        description: 'Maximum visibility for serious businesses',
        price: 35000,
        priceFormatted: '₦35,000',
        interval: 'monthly',
        intervalLabel: 'per month',
        badge: 'Best Value',
        features: [
            'Everything in Standard',
            'Verified badge on listings',
            'Priority approval (< 6 hrs)',
            '2 Featured posts per month',
            'Homepage visibility',
            'Category page boost',
            'Analytics dashboard',
            'Dedicated account manager',
        ],
    },
]

export function getPlanById(planId: PlanId): PricingPlan | undefined {
    return PRICING_PLANS.find(plan => plan.id === planId)
}

export function getPlanPrice(planId: PlanId): number {
    const plan = getPlanById(planId)
    return plan?.price ?? 0
}

// Convert Naira to Kobo for Paystack (Paystack uses kobo)
export function nairaToKobo(naira: number): number {
    return naira * 100
}

// Convert Kobo to Naira
export function koboToNaira(kobo: number): number {
    return kobo / 100
}
