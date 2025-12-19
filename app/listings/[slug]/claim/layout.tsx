import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Claim Business Listing | 9jaDirectory',
  robots: { index: false, follow: false },
}

export default function ClaimLayout({ children }: { children: React.ReactNode }) {
  return children
}

