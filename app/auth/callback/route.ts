import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { resolveApplicationOrigin } from '@/lib/http/application-origin'
import { getPlanById, type PlanId } from '@/lib/pricing'
import { queueRegistrationCompleteEmail } from '@/lib/email/transactional'

function safeInternalPath(value: string | null) {
    if (!value || !value.startsWith('/') || value.startsWith('//')) return '/'
    return value
}

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const requestedPlan = requestUrl.searchParams.get('plan')
    const nextPath = safeInternalPath(requestUrl.searchParams.get('next'))
    const origin = resolveApplicationOrigin(request)

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // Server Components cannot always persist refreshed cookies.
                        }
                    },
                },
            }
        )

        const { error, data } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            if (data.user?.id && data.user.email) {
                try {
                    await queueRegistrationCompleteEmail({
                        userId: data.user.id,
                        email: data.user.email,
                        fullName: typeof data.user.user_metadata?.full_name === 'string'
                            ? data.user.user_metadata.full_name
                            : null,
                    })
                } catch (notificationError) {
                    // Verification must succeed even if the mail provider is temporarily down.
                    // The queued row, when created, is retried by the scheduled email worker.
                    console.error('Could not queue registration-complete email:', notificationError)
                }
            }

            const metadataPlan = data.user?.user_metadata?.selected_plan
            const selectedPlan = requestedPlan || (typeof metadataPlan === 'string' ? metadataPlan : null)
            if (selectedPlan && getPlanById(selectedPlan as PlanId)) {
                const checkoutUrl = new URL('/checkout', origin)
                checkoutUrl.searchParams.set('plan', selectedPlan)
                return NextResponse.redirect(checkoutUrl)
            }

            return NextResponse.redirect(new URL(nextPath, origin))
        }
    }

    return NextResponse.redirect(new URL('/auth/auth-code-error', origin))
}
