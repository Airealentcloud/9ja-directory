export const PAID_PLAN_IDS = ['basic', 'premium', 'lifetime'] as const

export type PaidPlanId = (typeof PAID_PLAN_IDS)[number]
export type AccountPlanId = 'free' | PaidPlanId

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
    hasVerifiedBadge: boolean
    hasTopSearchPlacement: boolean
    hasFeaturedHomepage: boolean
    hasReviewReply: boolean
    hasAiDescription: boolean
    hasAiReviewInsights: boolean
    hasAnalytics: boolean
    hasPrioritySupport: boolean
    canClaimListings: boolean
    canBuyFeaturedPlacement: boolean
}

export const PLAN_LIMITS: Record<AccountPlanId, PlanLimits> = {
    free: {
        maxListings: 0,
        maxPhotos: 0,
        maxCategories: 0,
        maxKeywords: 0,
        maxDescriptionLength: 0,
        hasBusinessHours: false,
        hasSocialLinks: false,
        hasWebsiteUrl: false,
        hasYearEstablished: false,
        hasEmployeeCount: false,
        hasHighlightedBadge: false,
        hasVerifiedBadge: false,
        hasTopSearchPlacement: false,
        hasFeaturedHomepage: false,
        hasReviewReply: false,
        hasAiDescription: false,
        hasAiReviewInsights: false,
        hasAnalytics: false,
        hasPrioritySupport: false,
        canClaimListings: false,
        canBuyFeaturedPlacement: false,
    },
    basic: {
        maxListings: 1,
        maxPhotos: 4,
        maxCategories: 1,
        maxKeywords: 0,
        maxDescriptionLength: 400,
        hasBusinessHours: false,
        hasSocialLinks: false,
        hasWebsiteUrl: false,
        hasYearEstablished: false,
        hasEmployeeCount: false,
        hasHighlightedBadge: false,
        hasVerifiedBadge: false,
        hasTopSearchPlacement: false,
        hasFeaturedHomepage: false,
        hasReviewReply: false,
        hasAiDescription: false,
        hasAiReviewInsights: false,
        hasAnalytics: false,
        hasPrioritySupport: false,
        canClaimListings: false,
        canBuyFeaturedPlacement: false,
    },
    premium: {
        maxListings: 5,
        maxPhotos: 15,
        maxCategories: 1,
        maxKeywords: 0,
        maxDescriptionLength: 800,
        hasBusinessHours: true,
        hasSocialLinks: true,
        hasWebsiteUrl: true,
        hasYearEstablished: false,
        hasEmployeeCount: false,
        hasHighlightedBadge: true,
        hasVerifiedBadge: true,
        hasTopSearchPlacement: false,
        hasFeaturedHomepage: false,
        hasReviewReply: false,
        hasAiDescription: true,
        hasAiReviewInsights: false,
        hasAnalytics: true,
        hasPrioritySupport: false,
        canClaimListings: true,
        canBuyFeaturedPlacement: true,
    },
    lifetime: {
        maxListings: -1,
        maxPhotos: 100,
        maxCategories: 1,
        maxKeywords: 0,
        maxDescriptionLength: -1,
        hasBusinessHours: true,
        hasSocialLinks: true,
        hasWebsiteUrl: true,
        hasYearEstablished: false,
        hasEmployeeCount: false,
        hasHighlightedBadge: true,
        hasVerifiedBadge: true,
        hasTopSearchPlacement: true,
        hasFeaturedHomepage: true,
        hasReviewReply: false,
        hasAiDescription: true,
        hasAiReviewInsights: true,
        hasAnalytics: true,
        hasPrioritySupport: false,
        canClaimListings: true,
        canBuyFeaturedPlacement: false,
    },
}

export type ModeratedListingPlanInput = {
    status?: unknown
    planTier?: unknown
    featured?: unknown
    featuredUntil?: unknown
}

export type ModeratedListingPlanFlags = {
    plan_tier: AccountPlanId
    verified: boolean
    featured: boolean
    is_featured: boolean
    featured_until: string | null
}

export type ProfileEntitlementState = {
    role?: string | null
    subscriptionPlan?: string | null
    subscriptionStatus?: string | null
    subscriptionExpiresAt?: string | null
}

export type ListingEntitlementInput = Record<string, unknown> & {
    description?: unknown
    images?: unknown
    website_url?: unknown
    website?: unknown
    opening_hours?: unknown
    business_hours?: unknown
    facebook_url?: unknown
    instagram_url?: unknown
    twitter_url?: unknown
    linkedin_url?: unknown
    year_established?: unknown
    established_year?: unknown
    employee_count?: unknown
    employee_count_range?: unknown
    keywords?: unknown
}

export type SanitizedListingResult<T extends ListingEntitlementInput> = {
    value: T
    errors: string[]
}

export function isPaidPlanId(value: unknown): value is PaidPlanId {
    return typeof value === 'string' && PAID_PLAN_IDS.includes(value as PaidPlanId)
}

export function resolveAccountPlan(
    profile: ProfileEntitlementState | null | undefined,
    now = new Date()
): AccountPlanId {
    if (profile?.role === 'admin') return 'lifetime'
    if (!isPaidPlanId(profile?.subscriptionPlan)) return 'free'
    if (profile.subscriptionStatus !== 'active') return 'free'

    if (profile.subscriptionExpiresAt) {
        const expiry = new Date(profile.subscriptionExpiresAt)
        if (Number.isNaN(expiry.getTime()) || expiry <= now) return 'free'
    }

    return profile.subscriptionPlan
}

export function resolvePublicListingPlan(
    input: {
        planTier?: unknown
        verified?: unknown
        featured?: unknown
        featuredUntil?: unknown
    },
    now = new Date()
): AccountPlanId {
    if (isPaidPlanId(input.planTier)) return input.planTier

    const expiry = typeof input.featuredUntil === 'string'
        ? new Date(input.featuredUntil)
        : null
    const isLongRunningFeature = Boolean(
        input.featured === true &&
        expiry &&
        !Number.isNaN(expiry.getTime()) &&
        expiry.getTime() > now.getTime() + 365 * 24 * 60 * 60 * 1000
    )

    if (input.verified === true && isLongRunningFeature) return 'lifetime'
    if (input.verified === true) return 'premium'
    return 'free'
}

export function getAccountPlanLimits(planId: AccountPlanId): PlanLimits {
    return PLAN_LIMITS[planId]
}

export function canCreateAnotherListing(planId: AccountPlanId, currentListingCount: number): boolean {
    const maxListings = PLAN_LIMITS[planId].maxListings
    return maxListings === -1 || currentListingCount < maxListings
}

export function getApprovedListingPlanFlags(
    planId: AccountPlanId,
    input: ModeratedListingPlanInput,
    now = new Date()
): ModeratedListingPlanFlags {
    const limits = PLAN_LIMITS[planId]
    const isApproved = input.status === 'approved'
    const currentFeaturedUntil =
        typeof input.featuredUntil === 'string' && input.featuredUntil.trim()
            ? new Date(input.featuredUntil)
            : null
    const hasValidFeaturedExpiry = Boolean(
        currentFeaturedUntil &&
        !Number.isNaN(currentFeaturedUntil.getTime()) &&
        currentFeaturedUntil > now
    )
    const premiumAddOnCutoff = new Date(now)
    premiumAddOnCutoff.setUTCFullYear(premiumAddOnCutoff.getUTCFullYear() + 2)
    const hasActivePremiumAddOn = Boolean(
        planId === 'premium' &&
        input.planTier === 'premium' &&
        input.featured === true &&
        hasValidFeaturedExpiry &&
        currentFeaturedUntil &&
        currentFeaturedUntil < premiumAddOnCutoff
    )

    let featuredUntil: string | null = null
    if (isApproved && limits.hasFeaturedHomepage) {
        const lifetimeExpiry = new Date(now)
        lifetimeExpiry.setUTCFullYear(lifetimeExpiry.getUTCFullYear() + 100)
        featuredUntil =
            currentFeaturedUntil &&
            !Number.isNaN(currentFeaturedUntil.getTime()) &&
            currentFeaturedUntil > lifetimeExpiry
                ? currentFeaturedUntil.toISOString()
                : lifetimeExpiry.toISOString()
    } else if (isApproved && hasActivePremiumAddOn && currentFeaturedUntil) {
        featuredUntil = currentFeaturedUntil.toISOString()
    }

    const isFeatured = Boolean(
        isApproved &&
        (limits.hasFeaturedHomepage || hasActivePremiumAddOn)
    )

    return {
        plan_tier: planId,
        verified: Boolean(isApproved && limits.hasVerifiedBadge),
        featured: isFeatured,
        is_featured: isFeatured,
        featured_until: featuredUntil,
    }
}

export function listingLimitMessage(planId: AccountPlanId): string {
    const maxListings = PLAN_LIMITS[planId].maxListings
    if (maxListings === 0) return 'Choose and pay for a listing plan before adding a business.'
    if (maxListings === -1) return ''
    return `Your ${planId} plan includes ${maxListings} ${maxListings === 1 ? 'listing' : 'listings'}. Upgrade to add more.`
}

export function normalizeListingImages(value: unknown): string[] {
    let candidate = value
    if (typeof candidate === 'string') {
        try {
            candidate = JSON.parse(candidate)
        } catch {
            return []
        }
    }

    if (!Array.isArray(candidate)) return []

    return Array.from(
        new Set(
            candidate
                .filter((item): item is string => typeof item === 'string')
                .map(item => item.trim())
                .filter(Boolean)
        )
    )
}

export function sanitizeListingForPlan<T extends ListingEntitlementInput>(
    planId: AccountPlanId,
    input: T
): SanitizedListingResult<T> {
    const limits = PLAN_LIMITS[planId]
    const value = { ...input } as T
    const errors: string[] = []
    const description = typeof input.description === 'string' ? input.description.trim() : ''
    const images = normalizeListingImages(input.images)

    value.description = description
    value.images = images.slice(0, Math.max(0, limits.maxPhotos))

    if (limits.maxDescriptionLength !== -1 && description.length > limits.maxDescriptionLength) {
        errors.push(
            `Description exceeds the ${limits.maxDescriptionLength}-character limit for the ${planId} plan.`
        )
    }

    if (images.length > limits.maxPhotos) {
        errors.push(
            `The ${planId} plan allows ${limits.maxPhotos} ${limits.maxPhotos === 1 ? 'photo' : 'photos'} per listing.`
        )
    }

    if (!limits.hasWebsiteUrl) {
        value.website_url = null
        value.website = null
    }

    if (!limits.hasSocialLinks) {
        value.facebook_url = null
        value.instagram_url = null
        value.twitter_url = null
        value.linkedin_url = null
    }

    if (!limits.hasBusinessHours) {
        value.opening_hours = null
        value.business_hours = null
    }
    if (!limits.hasYearEstablished) {
        value.year_established = null
        value.established_year = null
    }
    if (!limits.hasEmployeeCount) {
        value.employee_count = null
        value.employee_count_range = null
    }
    if (limits.maxKeywords === 0) value.keywords = []

    return { value, errors }
}

export function getMissingListingFields(input: Record<string, unknown>): string[] {
    const requiredFields: Array<[string, string]> = [
        ['business_name', 'business name'],
        ['description', 'description'],
        ['category_id', 'category'],
        ['phone', 'phone number'],
        ['state_id', 'state'],
        ['city', 'city'],
    ]

    return requiredFields
        .filter(([field]) => typeof input[field] !== 'string' || !String(input[field]).trim())
        .map(([, label]) => label)
}
