import Image from 'next/image'
import Link from 'next/link'
import BlogCard from '@/components/blog/blog-card'
import { blogPostSummaries } from '@/lib/blog-index-data'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org'

export const BLOG_POSTS_PER_PAGE = 12
export const BLOG_PAGE_COUNT = Math.max(1, Math.ceil(blogPostSummaries.length / BLOG_POSTS_PER_PAGE))

export function getBlogPageHref(page: number) {
  return page <= 1 ? '/blog' : `/blog/page/${page}`
}

export function isValidBlogPage(page: number) {
  return Number.isInteger(page) && page >= 1 && page <= BLOG_PAGE_COUNT
}

interface BlogIndexPageProps {
  currentPage: number
}

export default function BlogIndexContent({ currentPage }: BlogIndexPageProps) {
  const offset = (currentPage - 1) * BLOG_POSTS_PER_PAGE
  const pagePosts = blogPostSummaries.slice(offset, offset + BLOG_POSTS_PER_PAGE)
  const featuredPost = currentPage === 1 ? pagePosts[0] : null
  const recentPosts = featuredPost ? pagePosts.slice(1) : pagePosts
  const canonicalPath = getBlogPageHref(currentPage)

  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
  ]

  if (currentPage > 1) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: `Page ${currentPage}`,
      item: `${siteUrl}${canonicalPath}`,
    })
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  }

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${siteUrl}${canonicalPath}#blog`,
    name: currentPage === 1 ? '9jaDirectory Blog' : `9jaDirectory Blog – Page ${currentPage}`,
    description: 'Practical guides and market insights for Nigerian businesses and customers.',
    url: `${siteUrl}${canonicalPath}`,
    inLanguage: 'en-NG',
    publisher: {
      '@type': 'Organization',
      name: '9jaDirectory',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    blogPost: pagePosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `${siteUrl}/blog/${post.slug}`,
      datePublished: post.date,
      author: { '@type': 'Organization', name: post.author },
    })),
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />

      <div className="bg-green-900 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              {currentPage === 1 ? 'Insights & Resources' : `Business Guides – Page ${currentPage}`}
            </h1>
            <p className="text-lg text-green-100 md:text-xl">
              Expert guides, business tips, and market trends to help you succeed in Nigeria&apos;s dynamic economy.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-12 px-4">
        {featuredPost && (
          <section className="mb-16">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">Featured Article</h2>
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-lg md:grid md:grid-cols-2">
              <div className="relative h-64 w-full bg-gray-100 md:h-auto md:min-h-[420px]">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="flex flex-col justify-center p-8 md:p-12">
                <div className="mb-4">
                  <span className="rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-800">
                    {featuredPost.category}
                  </span>
                </div>
                <h2 className="mb-4 text-3xl font-bold text-gray-900">
                  <Link href={`/blog/${featuredPost.slug}`} className="hover:text-green-700">
                    {featuredPost.title}
                  </Link>
                </h2>
                <p className="mb-6 text-lg text-gray-600">{featuredPost.excerpt}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span className="font-medium text-gray-900">{featuredPost.author}</span>
                  <span aria-hidden="true">•</span>
                  <span>{featuredPost.date}</span>
                  <span aria-hidden="true">•</span>
                  <span>{featuredPost.readTime}</span>
                </div>
                <div className="mt-8">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                  >
                    Read Full Article
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentPage === 1 ? 'Recent Articles' : 'More Business Guides'}
            </h2>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {BLOG_PAGE_COUNT}
            </span>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        {BLOG_PAGE_COUNT > 1 && (
          <nav className="mt-14 flex flex-wrap items-center justify-center gap-2" aria-label="Blog pages">
            {currentPage > 1 && (
              <Link
                href={getBlogPageHref(currentPage - 1)}
                rel="prev"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:border-green-600 hover:text-green-700"
              >
                Previous
              </Link>
            )}

            {Array.from({ length: BLOG_PAGE_COUNT }, (_, index) => index + 1).map((page) => (
              <Link
                key={page}
                href={getBlogPageHref(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={
                  page === currentPage
                    ? 'rounded-lg bg-green-700 px-4 py-2 font-semibold text-white'
                    : 'rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:border-green-600 hover:text-green-700'
                }
              >
                {page}
              </Link>
            ))}

            {currentPage < BLOG_PAGE_COUNT && (
              <Link
                href={getBlogPageHref(currentPage + 1)}
                rel="next"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:border-green-600 hover:text-green-700"
              >
                Next
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  )
}
