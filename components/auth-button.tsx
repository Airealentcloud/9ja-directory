'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type AuthButtonProps = {
  variant?: 'desktop' | 'mobile'
}

export default function AuthButton({ variant = 'desktop' }: AuthButtonProps) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    supabase.auth.getUser().then(({ data }) => {
      if (active) setUser(data.user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  if (user) {
    if (variant === 'mobile') {
      return (
        <div className="space-y-3">
          <div className="text-sm text-gray-700">
            Hello, {user.user_metadata.full_name || 'User'}
          </div>
          <Link
            href="/dashboard"
            className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
          >
            Dashboard
          </Link>
          <form action="/auth/signout" method="post">
            <button className="block w-full rounded-md border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">
              Sign Out
            </button>
          </form>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          Hello, {user.user_metadata.full_name || 'User'}
        </span>
        <Link href="/dashboard" className="text-green-600 hover:text-green-700 text-sm font-medium">
          Dashboard
        </Link>
        <form action="/auth/signout" method="post">
          <button className="text-gray-500 hover:text-gray-700 text-sm font-medium">
            Sign Out
          </button>
        </form>
      </div>
    )
  }

  if (variant === 'mobile') {
    return (
      <div className="space-y-2">
        <Link
          href="/login"
          className="block w-full rounded-md border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
      >
        Sign In
      </Link>
    </div>
  )
}
