'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type SupabaseErrorLike = {
    message?: string
    code?: string
}

function getMissingColumnName(error: SupabaseErrorLike): string | null {
    const message = error?.message
    if (!message) return null

    const schemaCacheMatch = message.match(/Could not find the '([^']+)' column/i)
    if (schemaCacheMatch?.[1]) return schemaCacheMatch[1]

    const relationMatch = message.match(/column \"([^\"]+)\" of relation/i)
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

export async function createListing(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('You must be logged in to add a business')
    }

    const business_name = formData.get('business_name') as string
    // Generate slug
    const slug = business_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7)

    const websiteUrlValue = formData.get('website_url') ?? formData.get('website')
    const whatsappNumberValue = formData.get('whatsapp_number') ?? formData.get('whatsapp')

    let rawData: Record<string, unknown> = {
        user_id: user.id,
        business_name,
        slug,
        description: formData.get('description') as string,
        category_id: formData.get('category_id') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        website_url: typeof websiteUrlValue === 'string' ? websiteUrlValue : '',
        whatsapp_number: typeof whatsappNumberValue === 'string' ? whatsappNumberValue : '',
        address: formData.get('address') as string,
        state_id: formData.get('state_id') as string,
        city: formData.get('city') as string,

        // New Fields
        logo_url: formData.get('logo_url') as string,
        facebook_url: formData.get('facebook_url') as string,
        instagram_url: formData.get('instagram_url') as string,
        twitter_url: formData.get('twitter_url') as string,
        linkedin_url: formData.get('linkedin_url') as string,

        // JSON fields need parsing
        images: formData.get('images') ? JSON.parse(formData.get('images') as string) : [],
        opening_hours: formData.get('opening_hours') ? JSON.parse(formData.get('opening_hours') as string) : null,

        status: 'pending'
    }

    let lastError: SupabaseErrorLike | null = null
    for (let attempt = 0; attempt < 10; attempt++) {
        const { data: insertedData, error } = await supabase.from('listings').insert(rawData).select('id').single()
        if (!error && insertedData) {
            lastError = null
            revalidatePath('/dashboard')
            return { success: true, listingId: insertedData.id }
        }

        lastError = error
        const missingColumn = getMissingColumnName(error)

        if (missingColumn) {
            if (missingColumn === 'user_id') {
                throw new Error(
                    "Database is missing required column 'user_id' on listings. Run `supabase_schema_update.sql` in Supabase SQL Editor."
                )
            }
            rawData = applyColumnFallback(rawData, missingColumn)
            continue
        }

        if (error.message?.toLowerCase().includes('row-level security')) {
            throw new Error(
                'Database RLS blocked listing creation. Ensure you ran `supabase_schema_update.sql` (RLS + insert policy) in Supabase SQL Editor.'
            )
        }

        break
    }

    if (lastError) {
        console.error('Error creating listing:', lastError)
        throw new Error(`Failed to create listing: ${lastError.message}`)
    }

    // This shouldn't be reached normally since we return inside the loop
    return { success: false, listingId: null }
}

export async function updateListing(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const listingId = formData.get('id') as string

    // Fetch existing data to get slug and verify ownership
    const { data: existing } = await supabase
        .from('listings')
        .select('user_id, slug')
        .eq('id', listingId)
        .single()

    if (!existing || existing.user_id !== user.id) {
        // Check if admin
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role !== 'admin') {
            throw new Error('Unauthorized: You do not own this listing')
        }
    }

    let rawData: Record<string, unknown> = {
        business_name: formData.get('business_name') as string,
        description: formData.get('description') as string,
        category_id: formData.get('category_id') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        website_url: typeof (formData.get('website_url') ?? formData.get('website')) === 'string'
            ? ((formData.get('website_url') ?? formData.get('website')) as string)
            : '',
        whatsapp_number: typeof (formData.get('whatsapp_number') ?? formData.get('whatsapp')) === 'string'
            ? ((formData.get('whatsapp_number') ?? formData.get('whatsapp')) as string)
            : '',
        address: formData.get('address') as string,
        state_id: formData.get('state_id') as string,
        city: formData.get('city') as string,

        logo_url: formData.get('logo_url') as string,
        facebook_url: formData.get('facebook_url') as string,
        instagram_url: formData.get('instagram_url') as string,
        twitter_url: formData.get('twitter_url') as string,
        linkedin_url: formData.get('linkedin_url') as string,

        images: formData.get('images') ? JSON.parse(formData.get('images') as string) : [],
        opening_hours: formData.get('opening_hours') ? JSON.parse(formData.get('opening_hours') as string) : null,

        updated_at: new Date().toISOString()
        // NOTE: We do NOT update status here, so it remains 'approved' if it was approved
    }

    console.log('Update Listing - Raw Images:', formData.get('images'))
    console.log('Update Listing - Parsed Images:', rawData.images)

    let updatedData: any = null
    let updateError: SupabaseErrorLike | null = null

    for (let attempt = 0; attempt < 10; attempt++) {
        const result = await supabase
            .from('listings')
            .update(rawData)
            .eq('id', listingId)
            .select()
            .single()

        updatedData = result.data
        updateError = result.error

        if (!updateError) break

        const missingColumn = getMissingColumnName(updateError)
        if (missingColumn) {
            if (missingColumn === 'user_id') {
                throw new Error(
                    "Database is missing required column 'user_id' on listings. Run `supabase_schema_update.sql` in Supabase SQL Editor."
                )
            }
            rawData = applyColumnFallback(rawData, missingColumn)
            continue
        }

        break
    }

    console.log('Update Result:', updatedData)
    console.log('Update Error:', updateError)

    if (updateError) {
        console.error('Error updating listing:', updateError)
        throw new Error(`Failed to update listing: ${updateError.message}`)
    }

    // Revalidate paths
    revalidatePath('/dashboard/my-listings')
    if (existing?.slug) {
        revalidatePath(`/listings/${existing.slug}`)
    }
    revalidatePath('/') // Revalidate home page just in case

    return { success: true }
}
