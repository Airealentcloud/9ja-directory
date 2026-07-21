'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
    isAdmin: boolean
    isOpen?: boolean
    onClose?: () => void
}

export default function Sidebar({ isAdmin, isOpen = true, onClose }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const isActive = (path: string) => pathname === path

    const handleLinkClick = () => {
        // Close sidebar on mobile after clicking a link
        if (onClose) {
            onClose()
        }
    }

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-green-700">
                        9jaDirectory
                    </Link>
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="pb-4">
                        <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Menu
                        </p>
                        <Link
                            href="/dashboard"
                            onClick={handleLinkClick}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/dashboard')
                                ? 'bg-green-50 text-green-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            Overview
                        </Link>
                        <Link
                            href="/dashboard/my-listings"
                            onClick={handleLinkClick}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/dashboard/my-listings')
                                ? 'bg-green-50 text-green-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            My Listings
                        </Link>
                        <Link
                            href="/add-business"
                            onClick={handleLinkClick}
                            className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                            Add New Business
                        </Link>
                        <Link
                            href="/dashboard/profile"
                            onClick={handleLinkClick}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/dashboard/profile')
                                ? 'bg-green-50 text-green-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            Profile
                        </Link>
                    </div>

                    {isAdmin && (
                        <div className="pt-4 border-t border-gray-200">
                            <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Admin
                            </p>
                            <Link
                                href="/admin/dashboard"
                                onClick={handleLinkClick}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/admin/dashboard')
                                    ? 'bg-purple-50 text-purple-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                Admin Overview
                            </Link>
                            <Link
                                href="/admin/listings"
                                onClick={handleLinkClick}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/admin/listings')
                                    ? 'bg-purple-50 text-purple-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                Manage Listings
                            </Link>
                            <Link
                                href="/admin/reviews"
                                onClick={handleLinkClick}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/admin/reviews')
                                    ? 'bg-purple-50 text-purple-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                Manage Reviews
                            </Link>
                            <Link
                                href="/admin/claims"
                                onClick={handleLinkClick}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/admin/claims')
                                    ? 'bg-purple-50 text-purple-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                Manage Claims
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
        </>
    )
}
