'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useId, useState } from 'react'

import NavLink from '@/components/nav-link'

type MobileNavProps = {
  children?: React.ReactNode
}

export default function MobileNav({ children }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const menuId = useId()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <div className="relative flex items-center gap-2">
      <NavLink
        href="/add-business"
        className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
      >
        List
      </NavLink>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-50"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? (
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div
            id={menuId}
            className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            <div className="space-y-1 p-3">
              <NavLink
                href="/"
                className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-600"
              >
                Home
              </NavLink>
              <NavLink
                href="/categories"
                className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-600"
              >
                Categories
              </NavLink>
              <NavLink
                href="/states"
                className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-600"
              >
                Locations
              </NavLink>
              <NavLink
                href="/blog"
                className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-600"
              >
                Blog
              </NavLink>
              <NavLink
                href="/faq"
                className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-600"
              >
                FAQ
              </NavLink>
              <NavLink
                href="/add-business"
                className="mt-2 block rounded-md bg-green-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-green-700"
              >
                List Your Business
              </NavLink>
            </div>
            {children && (
              <div className="border-t border-gray-200 p-3">{children}</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

