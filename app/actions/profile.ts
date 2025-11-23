'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const fullName = formData.get('full_name') as string
    const phoneNumber = formData.get('phone_number') as string
    const bio = formData.get('bio') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const state = formData.get('state') as string
    const avatarUrl = formData.get('avatar_url') as string

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            phone_number: phoneNumber,
            bio: bio,
            address: address,
            city: city,
            state: state,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        throw new Error('Failed to update profile')
    }

    revalidatePath('/dashboard/profile')
    return { success: true }
}
