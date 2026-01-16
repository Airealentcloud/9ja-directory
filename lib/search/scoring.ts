// Search scoring and ranking system for enhanced search results
// This provides weighted scoring for relevance + premium plan boosting

import { type PlanId } from '@/lib/pricing'

export interface SearchableListing {
    id: string
    business_name: string
    description?: string | null
    city?: string | null
    category_id?: string | null
    state_id?: string | null
    slug: string
    image_url?: string | null
    logo_url?: string | null
    images?: string[] | null
    verified?: boolean
    featured?: boolean
    featured_until?: string | null
    average_rating?: number | null
    review_count?: number | null
    user_id?: string
    created_at?: string
    // Profile info for plan-based boosting
    profiles?: {
        subscription_plan?: string | null
    } | null
    categories?: {
        id: string
        name: string
        slug: string
    } | null
    states?: {
        id: string
        name: string
        slug: string
    } | null
}

export interface ScoredListing extends SearchableListing {
    _score: number
    _matchType: 'exact' | 'partial' | 'category' | 'location' | 'none'
    _planBoost: number
    _isPremium: boolean
    _isLifetime: boolean
    _isFeatured: boolean
}

// Scoring weights
const WEIGHTS = {
    // Relevance scoring
    exactNameMatch: 100,      // Exact business name match
    nameStartsWith: 80,       // Name starts with query
    nameContains: 60,         // Name contains query
    descriptionMatch: 30,     // Description contains query
    cityMatch: 20,            // City matches query

    // Plan-based boosts (multiplicative)
    lifetimePlan: 1.5,        // 50% boost for Lifetime
    premiumPlan: 1.25,        // 25% boost for Premium
    basicPlan: 1.0,           // No boost for Basic

    // Feature boosts (additive)
    featured: 50,             // Currently featured listing
    verified: 20,             // Verified listing
    hasImages: 10,            // Has images/photos
    hasRating: 15,            // Has at least one rating
    highRating: 25,           // Rating >= 4.0

    // Freshness (slight boost for newer listings)
    recentListing: 5,         // Created within last 30 days
}

/**
 * Calculate relevance score for a listing based on search query
 */
export function calculateRelevanceScore(
    listing: SearchableListing,
    query: string
): number {
    if (!query || query.trim().length === 0) return 0

    const q = query.toLowerCase().trim()
    const name = (listing.business_name || '').toLowerCase()
    const description = (listing.description || '').toLowerCase()
    const city = (listing.city || '').toLowerCase()

    let score = 0

    // Name matching (highest priority)
    if (name === q) {
        score += WEIGHTS.exactNameMatch
    } else if (name.startsWith(q)) {
        score += WEIGHTS.nameStartsWith
    } else if (name.includes(q)) {
        score += WEIGHTS.nameContains
    }

    // Description matching
    if (description.includes(q)) {
        score += WEIGHTS.descriptionMatch
    }

    // City matching
    if (city.includes(q)) {
        score += WEIGHTS.cityMatch
    }

    // Multi-word query handling
    const queryWords = q.split(/\s+/).filter(w => w.length > 2)
    if (queryWords.length > 1) {
        const matchedWords = queryWords.filter(word =>
            name.includes(word) || description.includes(word)
        )
        // Bonus for matching multiple query words
        score += matchedWords.length * 10
    }

    return score
}

/**
 * Calculate plan boost multiplier based on subscription plan
 */
export function getPlanBoost(plan: string | null | undefined): number {
    switch (plan) {
        case 'lifetime':
            return WEIGHTS.lifetimePlan
        case 'premium':
            return WEIGHTS.premiumPlan
        default:
            return WEIGHTS.basicPlan
    }
}

/**
 * Calculate feature bonus score
 */
export function calculateFeatureBonus(listing: SearchableListing): number {
    let bonus = 0

    // Featured listing boost
    if (listing.featured && listing.featured_until) {
        const featuredUntil = new Date(listing.featured_until)
        if (featuredUntil > new Date()) {
            bonus += WEIGHTS.featured
        }
    }

    // Verified listing
    if (listing.verified) {
        bonus += WEIGHTS.verified
    }

    // Has images
    if (listing.image_url || listing.logo_url || (listing.images && listing.images.length > 0)) {
        bonus += WEIGHTS.hasImages
    }

    // Has rating
    if (listing.average_rating && listing.average_rating > 0) {
        bonus += WEIGHTS.hasRating

        // High rating bonus
        if (listing.average_rating >= 4.0) {
            bonus += WEIGHTS.highRating
        }
    }

    // Recent listing bonus (created within 30 days)
    if (listing.created_at) {
        const createdAt = new Date(listing.created_at)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        if (createdAt > thirtyDaysAgo) {
            bonus += WEIGHTS.recentListing
        }
    }

    return bonus
}

/**
 * Calculate total score for a listing
 */
export function calculateTotalScore(
    listing: SearchableListing,
    query: string
): ScoredListing {
    const relevanceScore = calculateRelevanceScore(listing, query)
    const featureBonus = calculateFeatureBonus(listing)
    const plan = listing.profiles?.subscription_plan
    const planBoost = getPlanBoost(plan)

    // Total score = (relevance + features) * plan multiplier
    const baseScore = relevanceScore + featureBonus
    const totalScore = Math.round(baseScore * planBoost)

    // Determine match type for UI
    let matchType: ScoredListing['_matchType'] = 'none'
    if (query) {
        const q = query.toLowerCase().trim()
        const name = (listing.business_name || '').toLowerCase()
        if (name === q) matchType = 'exact'
        else if (name.includes(q)) matchType = 'partial'
        else if ((listing.description || '').toLowerCase().includes(q)) matchType = 'category'
        else if ((listing.city || '').toLowerCase().includes(q)) matchType = 'location'
    }

    // Check featured status
    const isFeatured = listing.featured && listing.featured_until
        ? new Date(listing.featured_until) > new Date()
        : false

    return {
        ...listing,
        _score: totalScore,
        _matchType: matchType,
        _planBoost: planBoost,
        _isPremium: plan === 'premium',
        _isLifetime: plan === 'lifetime',
        _isFeatured: isFeatured,
    }
}

/**
 * Score and sort listings by relevance + premium boosting
 */
export function scoreAndSortListings(
    listings: SearchableListing[],
    query: string
): ScoredListing[] {
    // Score all listings
    const scored = listings.map(listing => calculateTotalScore(listing, query))

    // Sort by score (descending), then by name (alphabetical)
    return scored.sort((a, b) => {
        // First, featured listings always come first (if they match)
        if (a._isFeatured && !b._isFeatured && a._score > 0) return -1
        if (!a._isFeatured && b._isFeatured && b._score > 0) return 1

        // Then by score
        if (b._score !== a._score) return b._score - a._score

        // Finally by name
        return (a.business_name || '').localeCompare(b.business_name || '')
    })
}

/**
 * Find similar listings based on category, location, and keywords
 */
export function findSimilarListings(
    targetListing: SearchableListing,
    allListings: SearchableListing[],
    limit: number = 6
): ScoredListing[] {
    // Filter out the target listing
    const candidates = allListings.filter(l => l.id !== targetListing.id)

    // Score based on similarity
    const scored = candidates.map(listing => {
        let similarityScore = 0

        // Same category (highest weight)
        if (listing.category_id && listing.category_id === targetListing.category_id) {
            similarityScore += 50
        }

        // Same city
        if (listing.city && listing.city === targetListing.city) {
            similarityScore += 30
        }

        // Same state
        if (listing.state_id && listing.state_id === targetListing.state_id) {
            similarityScore += 20
        }

        // Add feature bonus
        similarityScore += calculateFeatureBonus(listing)

        // Apply plan boost
        const planBoost = getPlanBoost(listing.profiles?.subscription_plan)
        similarityScore = Math.round(similarityScore * planBoost)

        const plan = listing.profiles?.subscription_plan
        const isFeatured = listing.featured && listing.featured_until
            ? new Date(listing.featured_until) > new Date()
            : false

        return {
            ...listing,
            _score: similarityScore,
            _matchType: 'category' as const,
            _planBoost: planBoost,
            _isPremium: plan === 'premium',
            _isLifetime: plan === 'lifetime',
            _isFeatured: isFeatured,
        }
    })

    // Sort by similarity score and return top N
    return scored
        .sort((a, b) => {
            // Featured first
            if (a._isFeatured && !b._isFeatured) return -1
            if (!a._isFeatured && b._isFeatured) return 1
            return b._score - a._score
        })
        .slice(0, limit)
}

/**
 * Get display badge for listing based on plan
 */
export function getListingBadge(listing: ScoredListing): {
    text: string
    color: string
    bgColor: string
} | null {
    if (listing._isFeatured) {
        return {
            text: 'Featured',
            color: 'text-amber-700',
            bgColor: 'bg-amber-100',
        }
    }
    if (listing._isLifetime) {
        return {
            text: 'Top Rated',
            color: 'text-purple-700',
            bgColor: 'bg-purple-100',
        }
    }
    if (listing._isPremium) {
        return {
            text: 'Premium',
            color: 'text-green-700',
            bgColor: 'bg-green-100',
        }
    }
    if (listing.verified) {
        return {
            text: 'Verified',
            color: 'text-blue-700',
            bgColor: 'bg-blue-100',
        }
    }
    return null
}
