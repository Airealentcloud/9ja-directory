'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Sidebar({ isAdmin }: { isAdmin: boolean }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const isActive = (path: string) => pathname === path

    return (
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <Link href="/" className="text-2xl font-bold text-green-700">
                    9jaDirectory
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                <div className="pb-4">
                    <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Menu
                    </p>
                    <Link
                        href="/dashboard"
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/dashboard')
                                ? 'bg-green-50 text-green-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        Overview
                    </Link>
                    <Link
                        href="/dashboard/my-listings"
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/dashboard/my-listings')
                                ? 'bg-green-50 text-green-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        My Listings
                    </Link>
                    <Link
                        href="/add-business"
                        className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                        Add New Business
                    </Link>
                </div>

                {isAdmin && (
                    <div className="pt-4 border-t border-gray-200">
                        <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Admin
                        </p>
                        <Link
                            href="/admin/dashboard"
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/admin/dashboard')
                                    ? 'bg-purple-50 text-purple-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            Admin Overview
                        </Link>
                        <Link
                            href="/admin/listings"
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/admin/listings')
                                    ? 'bg-purple-50 text-purple-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            Manage Listings
                        </Link>
                    </div>
                )}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
                >
                    Sign Out
                </button>
            </div>
        </div>
    )
}
