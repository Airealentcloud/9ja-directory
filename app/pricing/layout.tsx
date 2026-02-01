import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org'

export const metadata: Metadata = {
  title: 'Pricing | 9jaDirectory',
  description: 'Choose a listing plan and get your business in front of Nigerian customers.',
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
