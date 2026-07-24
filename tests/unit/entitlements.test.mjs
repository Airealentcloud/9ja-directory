import assert from 'node:assert/strict'
import test from 'node:test'

import {
    PLAN_LIMITS,
    canCreateAnotherListing,
    getApprovedListingPlanFlags,
    resolveAccountPlan,
    resolvePublicListingPlan,
    sanitizeListingForPlan,
} from '../../lib/entitlements.ts'

const NOW = new Date('2026-07-21T12:00:00.000Z')

test('only an active, unexpired paid subscription resolves to a paid plan', () => {
    assert.equal(resolveAccountPlan(null, NOW), 'free')
    assert.equal(
        resolveAccountPlan(
            { subscriptionPlan: 'basic', subscriptionStatus: 'none' },
            NOW
        ),
        'free'
    )
    assert.equal(
        resolveAccountPlan(
            {
                subscriptionPlan: 'premium',
                subscriptionStatus: 'active',
                subscriptionExpiresAt: '2026-07-20T00:00:00.000Z',
            },
            NOW
        ),
        'free'
    )
    assert.equal(
        resolveAccountPlan(
            {
                subscriptionPlan: 'premium',
                subscriptionStatus: 'active',
                subscriptionExpiresAt: '2126-07-21T00:00:00.000Z',
            },
            NOW
        ),
        'premium'
    )
    assert.equal(resolveAccountPlan({ role: 'admin' }, NOW), 'lifetime')
})

test('public listing tier signals preserve Premium and Lifetime ranking benefits', () => {
    assert.equal(resolvePublicListingPlan({ planTier: 'basic' }, NOW), 'basic')
    assert.equal(resolvePublicListingPlan({ verified: true }, NOW), 'premium')
    assert.equal(resolvePublicListingPlan({
        verified: true,
        featured: true,
        featuredUntil: '2126-07-21T00:00:00.000Z',
    }, NOW), 'lifetime')
    assert.equal(resolvePublicListingPlan({
        verified: true,
        featured: true,
        featuredUntil: '2026-08-21T00:00:00.000Z',
    }, NOW), 'premium')
})

test('listing quotas differ for Basic, Premium and Lifetime', () => {
    assert.equal(canCreateAnotherListing('basic', 0), true)
    assert.equal(canCreateAnotherListing('basic', 1), false)
    assert.equal(canCreateAnotherListing('premium', 4), true)
    assert.equal(canCreateAnotherListing('premium', 5), false)
    assert.equal(canCreateAnotherListing('lifetime', 10_000), true)
})

test('Basic strips Premium fields and reports its content limits', () => {
    const result = sanitizeListingForPlan('basic', {
        description: 'x'.repeat(401),
        images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'],
        website_url: 'https://example.com',
        facebook_url: 'https://facebook.com/example',
        opening_hours: { weekdays: { open: '09:00', close: '17:00' } },
    })

    assert.equal(result.errors.length, 2)
    assert.equal(result.value.images.length, PLAN_LIMITS.basic.maxPhotos)
    assert.equal(result.value.website_url, null)
    assert.equal(result.value.facebook_url, null)
    assert.equal(result.value.opening_hours, null)
})

test('Premium keeps rich profile fields but does not receive Lifetime placement', () => {
    const result = sanitizeListingForPlan('premium', {
        description: 'A premium listing',
        images: ['1.jpg'],
        website_url: 'https://example.com',
        instagram_url: 'https://instagram.com/example',
        opening_hours: { weekdays: { open: '09:00', close: '17:00' } },
    })

    assert.deepEqual(result.errors, [])
    assert.equal(result.value.website_url, 'https://example.com')
    assert.equal(result.value.instagram_url, 'https://instagram.com/example')
    assert.deepEqual(result.value.opening_hours, {
        weekdays: { open: '09:00', close: '17:00' },
    })
    assert.equal(PLAN_LIMITS.premium.hasVerifiedBadge, true)
    assert.equal(PLAN_LIMITS.premium.hasFeaturedHomepage, false)
})

test('Lifetime has unlimited listings and descriptions plus homepage placement', () => {
    const result = sanitizeListingForPlan('lifetime', {
        description: 'x'.repeat(5_000),
        images: Array.from({ length: 100 }, (_, index) => `${index}.jpg`),
        website_url: 'https://example.com',
    })

    assert.deepEqual(result.errors, [])
    assert.equal(result.value.description.length, 5_000)
    assert.equal(result.value.images.length, 100)
    assert.equal(PLAN_LIMITS.lifetime.hasTopSearchPlacement, true)
    assert.equal(PLAN_LIMITS.lifetime.hasFeaturedHomepage, true)
    assert.equal(PLAN_LIMITS.lifetime.hasPrioritySupport, false)
})

test('moderation applies each plan benefit without leaking higher-tier placement', () => {
    const basic = getApprovedListingPlanFlags('basic', {
        status: 'approved',
        planTier: 'premium',
        featured: true,
        featuredUntil: '2026-08-21T00:00:00.000Z',
    }, NOW)
    assert.deepEqual(basic, {
        plan_tier: 'basic',
        verified: false,
        featured: false,
        is_featured: false,
        featured_until: null,
    })

    const premium = getApprovedListingPlanFlags('premium', {
        status: 'approved',
        featured: false,
        featuredUntil: null,
    }, NOW)
    assert.equal(premium.verified, true)
    assert.equal(premium.featured, false)
    assert.equal(premium.featured_until, null)

    const premiumWithAddOn = getApprovedListingPlanFlags('premium', {
        status: 'approved',
        planTier: 'premium',
        featured: true,
        featuredUntil: '2026-08-21T00:00:00.000Z',
    }, NOW)
    assert.equal(premiumWithAddOn.verified, true)
    assert.equal(premiumWithAddOn.featured, true)
    assert.equal(premiumWithAddOn.featured_until, '2026-08-21T00:00:00.000Z')

    const premiumCannotInheritLifetimePlacement = getApprovedListingPlanFlags('premium', {
        status: 'approved',
        planTier: 'lifetime',
        featured: true,
        featuredUntil: '2126-08-21T00:00:00.000Z',
    }, NOW)
    assert.equal(premiumCannotInheritLifetimePlacement.verified, true)
    assert.equal(premiumCannotInheritLifetimePlacement.featured, false)
    assert.equal(premiumCannotInheritLifetimePlacement.featured_until, null)

    const premiumCannotKeepLifetimeLengthPlacement = getApprovedListingPlanFlags('premium', {
        status: 'approved',
        planTier: 'premium',
        featured: true,
        featuredUntil: '2126-08-21T00:00:00.000Z',
    }, NOW)
    assert.equal(premiumCannotKeepLifetimeLengthPlacement.featured, false)
    assert.equal(premiumCannotKeepLifetimeLengthPlacement.featured_until, null)

    const lifetime = getApprovedListingPlanFlags('lifetime', {
        status: 'approved',
    }, NOW)
    assert.equal(lifetime.verified, true)
    assert.equal(lifetime.featured, true)
    assert.equal(lifetime.is_featured, true)
    assert.equal(lifetime.featured_until, '2126-07-21T12:00:00.000Z')
})

test('pending listings never receive public badges or placement', () => {
    const flags = getApprovedListingPlanFlags('lifetime', {
        status: 'pending',
        featured: true,
        featuredUntil: '2126-07-21T12:00:00.000Z',
    }, NOW)

    assert.equal(flags.verified, false)
    assert.equal(flags.featured, false)
    assert.equal(flags.featured_until, null)
})
