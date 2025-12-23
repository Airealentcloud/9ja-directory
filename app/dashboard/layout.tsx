import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayoutClient from '@/components/dashboard/dashboard-layout'

export const metadata: Metadata = {
    robots: { index: false, follow: false },
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user profile to check role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const isAdmin = profile?.role === 'admin'

    return (
        <DashboardLayoutClient user={user} isAdmin={isAdmin}>
            {children}
        </DashboardLayoutClient>
    )
}
