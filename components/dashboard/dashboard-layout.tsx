'use client'

import { useState } from 'react'
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

    return (
        <div className="flex min-h-screen bg-gray-50">
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

            <div className="flex-1 flex flex-col min-w-0">
                <Header user={user} onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
