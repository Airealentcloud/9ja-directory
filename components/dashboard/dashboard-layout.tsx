'use client'

import { useEffect, useState } from 'react'
import Sidebar from './sidebar'
import Header from './header'
import type { User } from '@supabase/supabase-js'

interface DashboardLayoutProps {
    children: React.ReactNode
    user: User
    isAdmin: boolean
}

export default function DashboardLayout({ children, user, isAdmin }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        if (!sidebarOpen) return

        const previousOverflow = document.body.style.overflow
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setSidebarOpen(false)
        }

        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', closeOnEscape)

        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', closeOnEscape)
        }
    }, [sidebarOpen])

    return (
        <div className="relative flex min-h-[calc(100dvh-4rem)] bg-gray-50">
            {/* Sidebar - hidden on mobile by default, shown on lg screens */}
            <div className="hidden lg:block">
                <Sidebar isAdmin={isAdmin} isOpen={true} />
            </div>

            {/* Mobile sidebar */}
            <div className="lg:hidden">
                <Sidebar
                    isAdmin={isAdmin}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                <Header user={user} onMenuClick={() => setSidebarOpen(true)} />
                <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
