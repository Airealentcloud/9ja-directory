import { blogPosts } from '@/lib/blog-data';
import BlogCard from '@/components/blog/blog-card';
import Link from 'next/link';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org';

export const metadata: Metadata = {
    title: 'Business Blog & Guides | 9jaDirectory',
    description: 'Latest insights, guides, and news about business in Nigeria. Learn how to grow, find services, and make smarter decisions with 9jaDirectory.',
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
        description: 'Insights, guides, and news about business in Nigeria.',
        url: `${siteUrl}/blog`,
        siteName: '9jaDirectory',
        locale: 'en_NG',
        type: 'website',
        images: [
            {
                url: '/opengraph-image',
                width: 1200,
                height: 630,
                alt: '9jaDirectory',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Blog | 9jaDirectory',
        description: 'Insights, guides, and news about business in Nigeria.',
        images: ['/opengraph-image'],
    },
};

export default function BlogIndexPage() {
    const featuredPost = blogPosts[0];
    const recentPosts = blogPosts.slice(1);

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
        ],
    };

    const blogSchema = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        '@id': `${siteUrl}/blog#blog`,
        name: '9jaDirectory Blog',
        description: 'Insights, guides, and news about business in Nigeria.',
        url: `${siteUrl}/blog`,
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
        blogPost: blogPosts.slice(0, 20).map((post) => ({
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            url: `${siteUrl}/blog/${post.slug}`,
            datePublished: post.date,
            author: { '@type': 'Person', name: post.author },
        })),
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
            {/* Hero Section */}
            <div className="bg-green-900 py-20 text-white">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
                            Insights & Resources
                        </h1>
                        <p className="text-lg text-green-100 md:text-xl">
                            Expert guides, business tips, and market trends to help you succeed in Nigeria's dynamic economy.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto mt-12 px-4">
                {/* Featured Post */}
                <section className="mb-16">
                    <h2 className="mb-8 text-2xl font-bold text-gray-900">Featured Article</h2>
                    <div className="relative overflow-hidden rounded-3xl bg-white shadow-lg md:grid md:grid-cols-2">
                        <div
                            className="h-64 w-full bg-cover bg-center md:h-auto"
                            style={{ backgroundImage: `url(${featuredPost.image})` }}
                        />
                        <div className="flex flex-col justify-center p-8 md:p-12">
                            <div className="mb-4">
                                <span className="rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-800">
                                    {featuredPost.category}
                                </span>
                            </div>
                            <h3 className="mb-4 text-3xl font-bold text-gray-900">
                                <Link href={`/blog/${featuredPost.slug}`} className="hover:text-green-700">
                                    {featuredPost.title}
                                </Link>
                            </h3>
                            <p className="mb-6 text-lg text-gray-600">
                                {featuredPost.excerpt}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="font-medium text-gray-900">{featuredPost.author}</span>
                                <span>•</span>
                                <span>{featuredPost.date}</span>
                                <span>•</span>
                                <span>{featuredPost.readTime}</span>
                            </div>
                            <div className="mt-8">
                                <Link
                                    href={`/blog/${featuredPost.slug}`}
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                                >
                                    Read Full Article
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recent Posts Grid */}
                <section>
                    <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Recent Articles</h2>
                        {/* Placeholder for future filter/search */}
                        <div className="hidden md:block">
                            {/* <SearchInput /> */}
                        </div>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {recentPosts.map((post) => (
                            <BlogCard key={post.slug} post={post} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
