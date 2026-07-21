import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ListingForm from '@/components/listings/listing-form'
import { getAccountPlanLimits, resolveAccountPlan } from '@/lib/entitlements'

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const [{ data: listing }, { data: profile, error: profileError }] = await Promise.all([
        supabase.from('listings').select('*').eq('id', id).single(),
        supabase
            .from('profiles')
            .select('role, subscription_plan, subscription_status, subscription_expires_at')
            .eq('id', user.id)
            .single(),
    ])

    if (!listing) notFound()
    if (profileError) throw new Error(`Failed to load your plan: ${profileError.message}`)
    if (listing.user_id !== user.id && profile?.role !== 'admin') {
        redirect('/dashboard/my-listings')
    }

    const userPlan = resolveAccountPlan({
        role: profile?.role,
        subscriptionPlan: profile?.subscription_plan,
        subscriptionStatus: profile?.subscription_status,
        subscriptionExpiresAt: profile?.subscription_expires_at,
    })

    if (userPlan === 'free') redirect('/pricing?reason=inactive-plan')
    const planLimits = getAccountPlanLimits(userPlan)

    const [{ data: categories }, { data: states }] = await Promise.all([
        supabase.from('categories').select('id, name').order('name'),
        supabase.from('states').select('id, name').order('name'),
    ])

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
                <p className="mt-2 text-gray-600">Update your business details.</p>
            </div>

            <ListingForm
                initialData={listing}
                categories={categories || []}
                states={states || []}
                isEditing
                planLimits={planLimits}
                userPlan={userPlan}
            />
        </div>
    )
}
