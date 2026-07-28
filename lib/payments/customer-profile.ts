import { normalizeEmailAddress } from '@/lib/validation/email'

type AdminSupabaseClient = ReturnType<
  typeof import('@/lib/supabase/admin').createAdminClient
>

type CustomerProfile = {
  id: string
  email: string | null
  full_name: string | null
  subscription_plan: string | null
  subscription_status: string | null
  subscription_expires_at: string | null
}

function metadataName(metadata: Record<string, unknown> | undefined): string | null {
  const value = metadata?.full_name ?? metadata?.name
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export async function ensureCustomerProfile(
  supabase: AdminSupabaseClient,
  userId: string
): Promise<CustomerProfile> {
  const { data: authUserData, error: authUserError } =
    await supabase.auth.admin.getUserById(userId)

  if (authUserError || !authUserData.user) {
    throw new Error(authUserError?.message || 'Customer authentication account is missing.')
  }

  const authEmail = normalizeEmailAddress(authUserData.user.email)
  if (!authEmail) throw new Error('The customer authentication account has no email address.')

  const authName = metadataName(authUserData.user.user_metadata)
  const { data: existingProfile, error: profileLookupError } = await supabase
    .from('profiles')
    .select('id, email, full_name, subscription_plan, subscription_status, subscription_expires_at')
    .eq('id', userId)
    .maybeSingle()

  if (profileLookupError) throw new Error(profileLookupError.message)

  if (existingProfile) {
    const profileEmail = normalizeEmailAddress(existingProfile.email)
    const needsRepair =
      profileEmail !== authEmail ||
      (!existingProfile.full_name && Boolean(authName))

    if (!needsRepair) return existingProfile as CustomerProfile

    const { data: repairedProfile, error: repairError } = await supabase
      .from('profiles')
      .update({
        email: authEmail,
        full_name: existingProfile.full_name || authName,
      })
      .eq('id', userId)
      .select('id, email, full_name, subscription_plan, subscription_status, subscription_expires_at')
      .single()

    if (repairError || !repairedProfile) {
      throw new Error(repairError?.message || 'Could not repair the customer profile.')
    }
    return repairedProfile as CustomerProfile
  }

  const { data: createdProfile, error: createError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email: authEmail,
      full_name: authName,
    })
    .select('id, email, full_name, subscription_plan, subscription_status, subscription_expires_at')
    .single()

  if (createError || !createdProfile) {
    throw new Error(createError?.message || 'Could not create the customer profile.')
  }

  return createdProfile as CustomerProfile
}
