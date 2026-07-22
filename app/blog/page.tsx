import type { Metadata } from 'next'
import BlogIndexContent from '@/components/blog/blog-index-page'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org'

export const metadata: Metadata = {
  title: 'Business Blog & Guides | 9jaDirectory',
  description: 'Practical Nigeria business guides, local market insights, and expert tips for finding services, winning customers, and growing your company.',
  keywords: [
    'Nigeria business blog',
    'business guides Nigeria',
    'Nigeria market insights',
    'small business tips Nigeria',
    '9jaDirectory blog',
  ],
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
  openGraph: {
    title: 'Business Blog & Guides | 9jaDirectory',
    description: 'Practical guides and market insights for Nigerian businesses and customers.',
    url: `${siteUrl}/blog`,
    siteName: '9jaDirectory',
    locale: 'en_NG',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: '9jaDirectory business guides',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Business Blog & Guides | 9jaDirectory',
    description: 'Practical guides and market insights for Nigerian businesses and customers.',
    images: ['/opengraph-image'],
  },
}

export default function BlogIndexPage() {
  return <BlogIndexContent currentPage={1} />
}
