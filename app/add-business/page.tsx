import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ListingForm from '@/components/listings/listing-form'

export const metadata: Metadata = {
    title: 'Add Your Business | 9jaDirectory',
    robots: { index: false, follow: false },
}

export default async function AddBusinessPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?next=/add-business')
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('can_add_listings')
        .eq('id', user.id)
        .maybeSingle()

    if (profileError) {
        const message = (profileError as { message?: string }).message || ''
        if (message.includes('can_add_listings')) {
            throw new Error(
                "Database is missing required column 'can_add_listings' on profiles. Run `migrations/008_subscriptions_and_profile_permissions.sql` in Supabase SQL Editor."
            )
        }
        throw new Error(`Failed to check listing permissions: ${message || 'Unknown error'}`)
    }

    if (!profile?.can_add_listings) {
        redirect('/pricing')
    }

    // Fetch data for form
    const { data: categories } = await supabase.from('categories').select('id, name').order('name')
    const { data: states } = await supabase.from('states').select('id, name').order('name')

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Add Your Business</h1>
                <p className="mt-2 text-gray-600">
                    Fill in the details below to list your business on 9jaDirectory.
                </p>
            </div>

            <ListingForm
                categories={categories || []}
                states={states || []}
            />
        </div>
    )
}
