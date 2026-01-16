// Pricing plans configuration for 9jaDirectory

export type PlanId = 'basic' | 'premium' | 'lifetime'

export interface PlanLimits {
    maxListings: number
    maxPhotos: number
    maxCategories: number
    maxKeywords: number
    maxDescriptionLength: number
    hasBusinessHours: boolean
    hasSocialLinks: boolean
    hasWebsiteUrl: boolean
    hasYearEstablished: boolean
    hasEmployeeCount: boolean
    hasHighlightedBadge: boolean
    hasTopSearchPlacement: boolean
    hasFeaturedHomepage: boolean
    hasReviewReply: boolean
    hasAiDescription: boolean
    hasAiReviewInsights: boolean
    hasAnalytics: boolean
    hasPrioritySupport: boolean
}

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
        description: 'Perfect for small businesses getting started',
        price: 38500,
        priceFormatted: '₦38,500',
        originalPrice: 70000,
        originalPriceFormatted: '₦70,000',
        discount: '-45%',
        interval: 'one_time',
        intervalLabel: 'one-time fee',
        features: [
            '1 business listing',
            '4 photos',
            '3 categories',
            '5 keywords/tags',
            'Business logo',
            'Contact information',
            'Google Maps location',
            'Category listing',
            'State/City visibility',
            'Standard approval (24-48 hrs)',
        ],
        limits: {
            maxListings: 1,
            maxPhotos: 4,
            maxCategories: 3,
            maxKeywords: 5,
            maxDescriptionLength: 400,
            hasBusinessHours: false,
            hasSocialLinks: false,
            hasWebsiteUrl: false,
            hasYearEstablished: false,
            hasEmployeeCount: false,
            hasHighlightedBadge: false,
            hasTopSearchPlacement: false,
            hasFeaturedHomepage: false,
            hasReviewReply: false,
            hasAiDescription: false,
            hasAiReviewInsights: false,
            hasAnalytics: false,
            hasPrioritySupport: false,
        },
    },
    {
        id: 'premium',
        name: 'PREMIUM',
        description: 'Great for growing businesses wanting visibility',
        price: 115500,
        priceFormatted: '₦115,500',
        originalPrice: 210000,
        originalPriceFormatted: '₦210,000',
        discount: '-45%',
        interval: 'one_time',
        intervalLabel: 'one-time fee',
        highlighted: true,
        badge: 'Popular',
        features: [
            '5 business listings',
            '15 photos per listing',
            '6 categories',
            '10 keywords/tags',
            'Everything in Basic',
            'Business hours display',
            'Social media links',
            'Website URL',
            'Year established',
            'Employee count',
            'Highlighted listing badge',
            'Top search placement',
            'AI Description Writer',
            'Reply to reviews',
            'Basic analytics',
            'Faster approval (12-24 hrs)',
        ],
        limits: {
            maxListings: 5,
            maxPhotos: 15,
            maxCategories: 6,
            maxKeywords: 10,
            maxDescriptionLength: 800,
            hasBusinessHours: true,
            hasSocialLinks: true,
            hasWebsiteUrl: true,
            hasYearEstablished: true,
            hasEmployeeCount: true,
            hasHighlightedBadge: true,
            hasTopSearchPlacement: true,
            hasFeaturedHomepage: false,
            hasReviewReply: true,
            hasAiDescription: true,
            hasAiReviewInsights: false,
            hasAnalytics: true,
            hasPrioritySupport: false,
        },
    },
    {
        id: 'lifetime',
        name: 'LIFETIME',
        description: 'Maximum visibility for established businesses',
        price: 198000,
        priceFormatted: '₦198,000',
        originalPrice: 360000,
        originalPriceFormatted: '₦360,000',
        discount: '-45%',
        interval: 'one_time',
        intervalLabel: 'one-time fee',
        badge: 'Best Value',
        features: [
            'Unlimited business listings',
            '100 photos per listing',
            '8 categories',
            '15 keywords/tags',
            'Everything in Premium',
            'Featured on homepage',
            'AI Review Insights',
            'Advanced analytics dashboard',
            'Priority support',
            'Priority approval (< 6 hrs)',
            'Verified badge',
            'Never pay again',
        ],
        limits: {
            maxListings: -1, // -1 means unlimited
            maxPhotos: 100,
            maxCategories: 8,
            maxKeywords: 15,
            maxDescriptionLength: -1, // unlimited
            hasBusinessHours: true,
            hasSocialLinks: true,
            hasWebsiteUrl: true,
            hasYearEstablished: true,
            hasEmployeeCount: true,
            hasHighlightedBadge: true,
            hasTopSearchPlacement: true,
            hasFeaturedHomepage: true,
            hasReviewReply: true,
            hasAiDescription: true,
            hasAiReviewInsights: true,
            hasAnalytics: true,
            hasPrioritySupport: true,
        },
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
