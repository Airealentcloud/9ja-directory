import { blogPosts } from '@/lib/blog-data';
import BlogCard from '@/components/blog/blog-card';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org';

const stopwords = new Set([
    'a',
    'an',
    'and',
    'are',
    'at',
    'for',
    'from',
    'how',
    'in',
    'into',
    'is',
    'of',
    'on',
    'or',
    'the',
    'to',
    'vs',
    'with',
    'your',
    'you',
    '2024',
    '2025',
    '2026',
    'guide',
    'top',
    'best',
]);

function deriveKeywords(post: { title: string; category: string }): string[] {
    const base: string[] = ['Nigeria', '9jaDirectory', 'Nigeria business directory', 'Nigerian SMEs'];
    const byCategory: Record<string, string[]> = {
        Marketing: ['local SEO Nigeria', 'business listings Nigeria', 'Google Maps marketing'],
        'Business Guide': ['small business Nigeria', 'entrepreneurship Nigeria', 'start a business Nigeria'],
        Business: ['start a business Nigeria', 'business ideas Nigeria'],
        Finance: ['SME finance Nigeria', 'business loans Nigeria', 'SME banking Nigeria'],
        Funding: ['grants Nigeria', 'SME funding Nigeria'],
        Legal: ['business compliance Nigeria', 'CAC registration Nigeria', 'regulatory requirements Nigeria'],
        Technology: ['SME tools Nigeria', 'business technology Nigeria'],
        Investment: ['investment Nigeria', 'business opportunities Nigeria'],
    };

    const tokens = post.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 2 && !stopwords.has(t))
        .slice(0, 10);

    const combined = [...tokens, ...(byCategory[post.category] || []), ...base];
    return Array.from(new Set(combined)).slice(0, 20);
}

function safeJsonParse(value: string): unknown | null {
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function fixJsonLdImages(node: unknown, fallbackImageUrl: string): unknown {
    const isBadBlogImage = (url: string) => url.startsWith('https://www.9jadirectory.org/images/blog/');

    const fixImageValue = (value: unknown): unknown => {
        if (typeof value === 'string') return isBadBlogImage(value) ? fallbackImageUrl : value;
        if (Array.isArray(value)) return value.map((v) => fixImageValue(v));
        if (value && typeof value === 'object') {
            const anyValue = value as Record<string, unknown>;
            if (typeof anyValue.url === 'string') {
                return { ...anyValue, url: isBadBlogImage(anyValue.url) ? fallbackImageUrl : anyValue.url };
            }
        }
        return value;
    };

    if (Array.isArray(node)) return node.map((item) => fixJsonLdImages(item, fallbackImageUrl));
    if (!node || typeof node !== 'object') return node;

    const current = node as Record<string, unknown>;
    const next: Record<string, unknown> = { ...current };

    if (current.image) {
        next.image = fixImageValue(current.image);
    }

    for (const [key, value] of Object.entries(current)) {
        if (key === 'image') continue;
        if (Array.isArray(value) || (value && typeof value === 'object')) {
            next[key] = fixJsonLdImages(value, fallbackImageUrl);
        }
    }

    return next;
}

interface BlogPostPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    const canonical = `${siteUrl}/blog/${post.slug}`;
    const images = post.image ? [post.image] : [`${siteUrl}/opengraph-image`];
    const keywords = post.keywords?.length ? post.keywords : deriveKeywords({ title: post.title, category: post.category });

    return {
        title: `${post.title} | 9jaDirectory`,
        description: post.excerpt,
        alternates: {
            canonical,
        },
        keywords,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            url: canonical,
            type: 'article',
            siteName: '9jaDirectory',
            images,
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images,
        },
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    // Get related posts (exclude current post, take first 3)
    const relatedPosts = blogPosts
        .filter((p) => p.slug !== slug)
        .slice(0, 3);

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
            { '@type': 'ListItem', position: 3, name: post.title, item: `${siteUrl}/blog/${post.slug}` },
        ],
    };

    const parsedSchema = post.schema ? safeJsonParse(post.schema) : null;
    const fixedSchema = parsedSchema ? fixJsonLdImages(parsedSchema, post.image) : null;
    const schemaJson = fixedSchema ? JSON.stringify(fixedSchema) : post.schema;

    return (
        <div className="min-h-screen bg-white pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            {schemaJson && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: schemaJson }}
                />
            )}
            {/* Header/Image */}
            <div className="relative h-[60vh] w-full">
                <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
                    <div className="container mx-auto max-w-4xl">
                        <Link
                            href="/blog"
                            className="mb-6 inline-flex items-center text-sm font-medium text-white/80 hover:text-white"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Blog
                        </Link>
                        <div className="mb-4">
                            <span className="rounded-full bg-green-600 px-4 py-1.5 text-sm font-semibold text-white">
                                {post.category}
                            </span>
                        </div>
                        <h1 className="mb-6 text-3xl font-bold text-white md:text-5xl lg:text-6xl">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-6 text-white/90">
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-full bg-gray-200" /> {/* Placeholder Avatar */}
                                <span className="font-medium">{post.author}</span>
                            </div>
                            <span>•</span>
                            <span>{post.date}</span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto mt-12 max-w-3xl px-4">
                <article className="prose prose-lg prose-green mx-auto prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-img:rounded-2xl">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </article>

                {post.keywords && post.keywords.length > 0 && (
                    <div className="mt-10 rounded-2xl bg-green-50 p-6">
                        <h2 className="text-xl font-semibold text-gray-900">Key topics</h2>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {post.keywords.slice(0, 6).map((keyword) => (
                                <span
                                    key={keyword}
                                    className="rounded-full bg-white px-3 py-1 text-sm font-medium text-green-700 shadow-sm"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-10 grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-100 p-4">
                        <h3 className="text-lg font-semibold text-gray-900">Explore categories</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Browse verified businesses by industry and service.
                        </p>
                        <Link href="/categories" className="mt-3 inline-flex text-sm font-semibold text-green-700 hover:text-green-800">
                            View categories
                        </Link>
                    </div>
                    <div className="rounded-xl border border-gray-100 p-4">
                        <h3 className="text-lg font-semibold text-gray-900">Explore locations</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Find businesses by state and city across Nigeria.
                        </p>
                        <Link href="/states" className="mt-3 inline-flex text-sm font-semibold text-green-700 hover:text-green-800">
                            View locations
                        </Link>
                    </div>
                    <div className="rounded-xl border border-gray-100 p-4">
                        <h3 className="text-lg font-semibold text-gray-900">Featured businesses</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            See top-rated and highlighted listings.
                        </p>
                        <Link href="/featured" className="mt-3 inline-flex text-sm font-semibold text-green-700 hover:text-green-800">
                            View featured
                        </Link>
                    </div>
                    <div className="rounded-xl border border-gray-100 p-4">
                        <h3 className="text-lg font-semibold text-gray-900">Get listed</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Publish your business and reach more customers.
                        </p>
                        <Link href="/pricing" className="mt-3 inline-flex text-sm font-semibold text-green-700 hover:text-green-800">
                            See plans
                        </Link>
                    </div>
                </div>

                {/* Share/Tags Placeholder */}
                <div className="mt-12 border-t border-gray-200 py-8">
                    <p className="text-center text-gray-500">Share this article</p>
                    {/* Social Share Buttons would go here */}
                </div>
            </div>

            {/* Related Posts */}
            <div className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
                        Related Articles
                    </h2>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {relatedPosts.map((post) => (
                            <BlogCard key={post.slug} post={post} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
