import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | 9jaDirectory',
  description: 'Sign in to manage your business listings, plans, and profile on 9jaDirectory.',
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
