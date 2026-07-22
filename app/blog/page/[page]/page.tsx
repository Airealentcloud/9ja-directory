import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import BlogIndexContent, {
  BLOG_PAGE_COUNT,
  getBlogPageHref,
  isValidBlogPage,
} from '@/components/blog/blog-index-page'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org'

interface PaginatedBlogPageProps {
  params: Promise<{ page: string }>
}

export function generateStaticParams() {
  return Array.from({ length: Math.max(0, BLOG_PAGE_COUNT - 1) }, (_, index) => ({
    page: String(index + 2),
  }))
}

export async function generateMetadata({ params }: PaginatedBlogPageProps): Promise<Metadata> {
  const page = Number((await params).page)

  if (!isValidBlogPage(page) || page === 1) {
    return {
      title: 'Blog Page Not Found | 9jaDirectory',
      robots: { index: false, follow: false },
    }
  }

  const path = getBlogPageHref(page)
  const title = `Nigeria Business Guides – Page ${page} | 9jaDirectory`
  const description = `Browse page ${page} of practical Nigeria business guides, market insights, local SEO advice, and company research from 9jaDirectory.`

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}${path}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${path}`,
      siteName: '9jaDirectory',
      locale: 'en_NG',
      type: 'website',
      images: ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/opengraph-image'],
    },
  }
}

export default async function PaginatedBlogPage({ params }: PaginatedBlogPageProps) {
  const page = Number((await params).page)

  if (page === 1) {
    permanentRedirect('/blog')
  }

  if (!isValidBlogPage(page)) {
    notFound()
  }

  return <BlogIndexContent currentPage={page} />
}
