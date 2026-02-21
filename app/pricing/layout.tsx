import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org'

export const metadata: Metadata = {
  title: 'Business Listing Plans & Pricing | 9jaDirectory',
  description: 'Compare business listing plans on 9jaDirectory — Basic, Standard, and Premium. Promote your business across all 36 Nigerian states with no hidden fees. Start listing today.',
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
  openGraph: {
    title: 'Business Listing Plans & Pricing | 9jaDirectory',
    description: 'Compare Basic, Standard, and Premium listing plans. Get your business in front of Nigerian customers with no hidden fees.',
    url: `${siteUrl}/pricing`,
    siteName: '9jaDirectory',
    locale: 'en_NG',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: '9jaDirectory Pricing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Business Listing Plans & Pricing | 9jaDirectory',
    description: 'Compare Basic, Standard, and Premium listing plans. Get your business in front of Nigerian customers with no hidden fees.',
    images: ['/opengraph-image'],
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
