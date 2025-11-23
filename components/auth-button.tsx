import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AuthButton() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    return user ? (
        <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">Hello, {user.user_metadata.full_name || 'User'}</span>
            <Link
                href="/dashboard"
                className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
                Dashboard
            </Link>
            <form action="/auth/signout" method="post">
                <button className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                    Sign Out
                </button>
            </form>
        </div>
    ) : (
        <div className="flex items-center gap-2">
            <Link
                href="/login"
                className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
            >
                Sign In
            </Link>
            <Link
                href="/signup"
                className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
            >
                Sign Up
            </Link>
        </div>
    )
}
