'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { notifyAdminNewListing } from '@/lib/email/notifications'
import { autoApproveVerifiedPaidListing } from '@/lib/listings/auto-approve'
import {
    canCreateAnotherListing,
    getMissingListingFields,
    listingLimitMessage,
    resolveAccountPlan,
    sanitizeListingForPlan,
    type AccountPlanId,
} from '@/lib/entitlements'

type SupabaseErrorLike = {
    message?: string
    code?: string
}

type EntitlementProfile = {
    role?: string | null
    subscription_plan?: string | null
    subscription_status?: string | null
    subscription_expires_at?: string | null
}

function getMissingColumnName(error: SupabaseErrorLike): string | null {
    const message = error?.message
    if (!message) return null

    const schemaCacheMatch = message.match(/Could not find the '([^']+)' column/i)
    if (schemaCacheMatch?.[1]) return schemaCacheMatch[1]

    const relationMatch = message.match(/column "([^"]+)" of relation/i)
    if (relationMatch?.[1]) return relationMatch[1]

    return null
}

function applyColumnFallback(payload: Record<string, unknown>, missingColumn: string) {
    const next = { ...payload }

    if (missingColumn === 'website_url') {
        const value = next.website_url
        delete next.website_url
        if (typeof value === 'string' && value.length > 0 && !('website' in next)) {
            next.website = value
        }
        return next
    }

    if (missingColumn === 'whatsapp_number') {
        const value = next.whatsapp_number
        delete next.whatsapp_number
        if (typeof value === 'string' && value.length > 0 && !('whatsapp' in next)) {
            next.whatsapp = value
        }
        return next
    }

    delete next[missingColumn]
    return next
}

function parseJsonField(value: FormDataEntryValue | null, fallback: unknown) {
    if (typeof value !== 'string' || !value.trim()) return fallback
    try {
        return JSON.parse(value)
    } catch {
        throw new Error('One of the listing fields contains invalid data. Refresh the page and try again.')
    }
}

function formString(formData: FormData, key: string) {
    const value = formData.get(key)
    return typeof value === 'string' ? value.trim() : ''
}

async function getEntitlementContext(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string
): Promise<{ planId: AccountPlanId; isAdmin: boolean; profile: EntitlementProfile }> {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, subscription_plan, subscription_status, subscription_expires_at')
        .eq('id', userId)
        .maybeSingle()

    if (error) {
        throw new Error(
            `Failed to check your plan: ${error.message}. Run migrations/008 and migrations/012 in Supabase if the subscription columns are missing.`
        )
    }

    if (!profile) throw new Error('Your account profile is missing. Please contact support.')

    const typedProfile = profile as EntitlementProfile
    return {
        profile: typedProfile,
        isAdmin: typedProfile.role === 'admin',
        planId: resolveAccountPlan({
            role: typedProfile.role,
            subscriptionPlan: typedProfile.subscription_plan,
            subscriptionStatus: typedProfile.subscription_status,
            subscriptionExpiresAt: typedProfile.subscription_expires_at,
        }),
    }
}

async function assertListingQuota(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
    planId: AccountPlanId,
    isAdmin: boolean
) {
    if (isAdmin) return

    const { count, error } = await supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('status', ['pending', 'approved'])

    if (error) throw new Error(`Failed to check your listing allowance: ${error.message}`)
    if (!canCreateAnotherListing(planId, count || 0)) {
        throw new Error(listingLimitMessage(planId))
    }
}

function buildListingPayload(formData: FormData) {
    const websiteValue = formData.get('website_url') ?? formData.get('website')
    const whatsappValue = formData.get('whatsapp_number') ?? formData.get('whatsapp')

    return {
        business_name: formString(formData, 'business_name'),
        description: formString(formData, 'description'),
        category_id: formString(formData, 'category_id'),
        phone: formString(formData, 'phone'),
        email: formString(formData, 'email'),
        website_url: typeof websiteValue === 'string' ? websiteValue.trim() : '',
        whatsapp_number: typeof whatsappValue === 'string' ? whatsappValue.trim() : '',
        address: formString(formData, 'address'),
        state_id: formString(formData, 'state_id'),
        city: formString(formData, 'city'),
        logo_url: formString(formData, 'logo_url'),
        facebook_url: formString(formData, 'facebook_url'),
        instagram_url: formString(formData, 'instagram_url'),
        twitter_url: formString(formData, 'twitter_url'),
        linkedin_url: formString(formData, 'linkedin_url'),
        images: parseJsonField(formData.get('images'), []),
        opening_hours: parseJsonField(formData.get('opening_hours'), null),
    }
}

function enforceListingInput(planId: AccountPlanId, input: ReturnType<typeof buildListingPayload>) {
    const missingFields = getMissingListingFields(input)
    if (missingFields.length > 0) {
        throw new Error(`Complete the required fields: ${missingFields.join(', ')}.`)
    }

    const sanitized = sanitizeListingForPlan(planId, input)
    if (sanitized.errors.length > 0) throw new Error(sanitized.errors.join(' '))
    return sanitized.value
}

export async function createListing(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('You must be logged in to add a business')

    const { planId, isAdmin } = await getEntitlementContext(supabase, user.id)
    if (!isAdmin && planId === 'free') {
        throw new Error('Please complete payment before adding a listing.')
    }
    await assertListingQuota(supabase, user.id, planId, isAdmin)

    const input = enforceListingInput(planId, buildListingPayload(formData))
    const slug = `${input.business_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')}-${Math.random().toString(36).substring(2, 7)}`

    let rawData: Record<string, unknown> = {
        ...input,
        user_id: user.id,
        slug,
        status: 'pending',
        verified: false,
        featured: false,
        featured_until: null,
    }

    let lastError: SupabaseErrorLike | null = null
    for (let attempt = 0; attempt < 12; attempt++) {
        const { data: insertedData, error } = await supabase
            .from('listings')
            .insert(rawData)
            .select('id, business_name, city')
            .single()

        if (!error && insertedData) {
            let autoApproved = false
            if (!isAdmin) {
                try {
                    const approval = await autoApproveVerifiedPaidListing({
                        listingId: insertedData.id,
                        userId: user.id,
                        planId,
                    })
                    autoApproved = approval.approved
                } catch (approvalError) {
                    console.error('Automatic paid-listing approval failed:', approvalError)
                }
            }

            revalidatePath('/dashboard')
            revalidatePath('/dashboard/my-listings')
            revalidatePath('/')

            if (!autoApproved) {
                notifyAdminNewListing({
                    listingId: insertedData.id,
                    businessName: insertedData.business_name,
                    ownerEmail: user.email || 'Unknown',
                    ownerName: user.user_metadata?.full_name,
                    city: insertedData.city,
                    category: input.category_id,
                    submittedAt: new Date(),
                }).catch(console.error)
            }

            return { success: true, listingId: insertedData.id, autoApproved }
        }

        lastError = error
        const missingColumn = getMissingColumnName(error)
        if (missingColumn) {
            if (missingColumn === 'user_id') {
                throw new Error(
                    "Database is missing required column 'user_id' on listings. Run supabase_schema_update.sql in Supabase SQL Editor."
                )
            }
            rawData = applyColumnFallback(rawData, missingColumn)
            continue
        }

        if (error.message?.toLowerCase().includes('row-level security')) {
            throw new Error('Database security blocked listing creation. Apply migration 012 and try again.')
        }
        break
    }

    console.error('Error creating listing:', lastError)
    throw new Error(`Failed to create listing: ${lastError?.message || 'Unknown error'}`)
}

export async function updateListing(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const listingId = formString(formData, 'id')
    if (!listingId) throw new Error('Listing ID is required')

    const { data: existing, error: existingError } = await supabase
        .from('listings')
        .select('user_id, slug')
        .eq('id', listingId)
        .single()

    if (existingError || !existing) throw new Error('Listing not found')

    const { planId, isAdmin } = await getEntitlementContext(supabase, user.id)
    if (existing.user_id !== user.id && !isAdmin) {
        throw new Error('Unauthorized: You do not own this listing')
    }
    if (!isAdmin && planId === 'free') {
        throw new Error('Your paid plan is not active. Please renew or contact support before editing.')
    }

    const input = enforceListingInput(planId, buildListingPayload(formData))
    let rawData: Record<string, unknown> = {
        ...input,
        updated_at: new Date().toISOString(),
    }

    let updateError: SupabaseErrorLike | null = null
    for (let attempt = 0; attempt < 12; attempt++) {
        const result = await supabase
            .from('listings')
            .update(rawData)
            .eq('id', listingId)
            .select('id')
            .single()

        updateError = result.error
        if (!updateError) break

        const missingColumn = getMissingColumnName(updateError)
        if (missingColumn) {
            rawData = applyColumnFallback(rawData, missingColumn)
            continue
        }
        break
    }

    if (updateError) {
        console.error('Error updating listing:', updateError)
        throw new Error(`Failed to update listing: ${updateError.message}`)
    }

    let autoApproved = false
    if (!isAdmin) {
        try {
            const approval = await autoApproveVerifiedPaidListing({
                listingId,
                userId: user.id,
                planId,
            })
            autoApproved = approval.approved
        } catch (approvalError) {
            console.error('Automatic paid-listing approval failed after update:', approvalError)
        }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/my-listings')
    revalidatePath(`/listings/${existing.slug}`)
    revalidatePath('/')

    return { success: true, autoApproved }
}
