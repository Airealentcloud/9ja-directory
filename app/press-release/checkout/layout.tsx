import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Press Release Checkout | 9jaDirectory',
  description: 'Complete checkout for your 9jaDirectory press release package.',
  robots: { index: false, follow: false },
}

export default function PressReleaseCheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
