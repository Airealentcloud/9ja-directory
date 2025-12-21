'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

    const rawData = {
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

    const { error } = await supabase
        .from('listings')
        .insert(rawData)

    if (error) {
        console.error('Error creating listing:', error)
        throw new Error(`Failed to create listing: ${error.message}`)
    }

    revalidatePath('/dashboard')
    return { success: true }
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

    const rawData = {
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

    const { data: updatedData, error } = await supabase
        .from('listings')
        .update(rawData)
        .eq('id', listingId)
        .select()
        .single()

    console.log('Update Result:', updatedData)
    console.log('Update Error:', error)

    if (error) {
        console.error('Error updating listing:', error)
        throw new Error(`Failed to update listing: ${error.message}`)
    }

    // Revalidate paths
    revalidatePath('/dashboard/my-listings')
    if (existing?.slug) {
        revalidatePath(`/listings/${existing.slug}`)
    }
    revalidatePath('/') // Revalidate home page just in case

    return { success: true }
}
