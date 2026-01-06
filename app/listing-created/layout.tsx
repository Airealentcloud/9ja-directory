import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Complete Your Listing | 9jaDirectory',
  robots: { index: false, follow: false },
}

export default function ListingCreatedLayout({ children }: { children: React.ReactNode }) {
  return children
}
