import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/sidebar'
import Header from '@/components/dashboard/header'

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

    const isAdmin = profile?.role === 'admin' || user.email === 'israelakhas@gmail.com'

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isAdmin={isAdmin} />
            <div className="flex-1 flex flex-col">
                <Header user={user} />
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
