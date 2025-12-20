'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

type NavLinkProps = {
  href: string
  className?: string
  children: React.ReactNode
}

export default function NavLink({ href, className, children }: NavLinkProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <Link
      href={href}
      className={className}
      aria-disabled={isPending}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return
        }

        event.preventDefault()
        startTransition(() => router.push(href))
      }}
    >
      <span className="inline-flex items-center gap-2">
        {children}
        {isPending && (
          <span
            className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
            aria-hidden="true"
          />
        )}
      </span>
    </Link>
  )
}

