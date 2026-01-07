import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://9jadirectory.org'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  return {
    title: 'Claim Business Listing | 9jaDirectory',
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${siteUrl}/listings/${slug}`,
    },
  }
}

export default function ClaimLayout({ children }: { children: React.ReactNode }) {
  return children
}