import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PromoteListing from '@/components/payments/promote-listing'
import { getAccountPlanLimits, resolveAccountPlan } from '@/lib/entitlements'

export const metadata: Metadata = {
  title: 'Promote Listing | 9jaDirectory',
  robots: { index: false, follow: false },
}

export default async function PromoteListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/dashboard/my-listings/${encodeURIComponent(id)}/promote`)
  }

  const [{ data: profile }, { data: listing, error }] = await Promise.all([
    supabase
      .from('profiles')
      .select('role, subscription_plan, subscription_status, subscription_expires_at')
      .eq('id', user.id)
      .single(),
    supabase
      .from('listings')
      .select('id, business_name, status, featured, featured_until')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (error || !listing) redirect('/dashboard/my-listings')

  const accountPlan = resolveAccountPlan({
    role: profile?.role,
    subscriptionPlan: profile?.subscription_plan,
    subscriptionStatus: profile?.subscription_status,
    subscriptionExpiresAt: profile?.subscription_expires_at,
  })
  const limits = getAccountPlanLimits(accountPlan)

  if (!limits.canBuyFeaturedPlacement || listing.status !== 'approved') {
    redirect('/dashboard/my-listings')
  }

  if (listing.featured && listing.featured_until && new Date(listing.featured_until) > new Date()) {
    redirect('/dashboard/my-listings')
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Promote your listing</h1>
        <p className="mt-2 text-gray-600">
          Boost <span className="font-medium text-gray-900">{listing.business_name}</span> with a featured add-on.
        </p>
      </div>

      <PromoteListing listingId={listing.id} businessName={listing.business_name} />
    </div>
  )
}
