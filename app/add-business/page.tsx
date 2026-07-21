import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ListingForm from '@/components/listings/listing-form'
import {
    canCreateAnotherListing,
    getAccountPlanLimits,
    resolveAccountPlan,
} from '@/lib/entitlements'

export const metadata: Metadata = {
    title: 'Add Your Business | 9jaDirectory',
    robots: { index: false, follow: false },
}

export default async function AddBusinessPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login?next=/add-business')

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, subscription_plan, subscription_status, subscription_expires_at')
        .eq('id', user.id)
        .maybeSingle()

    if (profileError) {
        throw new Error(`Failed to check listing permissions: ${profileError.message}`)
    }

    const userPlan = resolveAccountPlan({
        role: profile?.role,
        subscriptionPlan: profile?.subscription_plan,
        subscriptionStatus: profile?.subscription_status,
        subscriptionExpiresAt: profile?.subscription_expires_at,
    })

    if (userPlan === 'free') redirect('/pricing')

    const planLimits = getAccountPlanLimits(userPlan)
    if (profile?.role !== 'admin' && planLimits.maxListings !== -1) {
        const { count, error: countError } = await supabase
            .from('listings')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .in('status', ['pending', 'approved'])

        if (countError) throw new Error(`Failed to check listing allowance: ${countError.message}`)
        if (!canCreateAnotherListing(userPlan, count || 0)) {
            redirect('/pricing?reason=listing-limit')
        }
    }

    const [{ data: categories }, { data: states }] = await Promise.all([
        supabase.from('categories').select('id, name').order('name'),
        supabase.from('states').select('id, name').order('name'),
    ])

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
                planLimits={planLimits}
                userPlan={userPlan}
            />
        </div>
    )
}
