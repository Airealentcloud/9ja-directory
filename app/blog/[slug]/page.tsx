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

/**
 * Ensures every Article/BlogPosting node in a schema array has:
 * - inLanguage: "en-NG"
 * - dateModified (falls back to datePublished if missing)
 */
function normalizeArticleSchemas(schemas: unknown): unknown {
    if (!Array.isArray(schemas)) return schemas;
    return schemas.map((item) => {
        if (!item || typeof item !== 'object') return item;
        const s = item as Record<string, unknown>;
        const type = s['@type'];
        if (type === 'Article' || type === 'BlogPosting' || type === 'NewsArticle') {
            return {
                ...s,
                inLanguage: s.inLanguage ?? 'en-NG',
                dateModified: s.dateModified ?? s.datePublished,
            };
        }
        return s;
    });
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

    // Get related posts: same category first, then fill with others
    const sameCat = blogPosts.filter((p) => p.slug !== slug && p.category === post.category);
    const otherPosts = blogPosts.filter((p) => p.slug !== slug && p.category !== post.category);
    const relatedPosts = [...sameCat, ...otherPosts].slice(0, 3);

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
            { '@type': 'ListItem', position: 3, name: post.title, item: `${siteUrl}/blog/${post.slug}` },
        ],
    };

    const absolutePostImage = post.image.startsWith('/') ? `${siteUrl}${post.image}` : post.image;
    const parsedSchema = post.schema ? safeJsonParse(post.schema) : null;
    const fixedSchema = parsedSchema ? fixJsonLdImages(parsedSchema, absolutePostImage) : null;
    const normalizedSchema = fixedSchema ? normalizeArticleSchemas(fixedSchema) : null;
    const schemaJson = normalizedSchema ? JSON.stringify(normalizedSchema) : post.schema;

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
                                <div className="h-10 w-10 rounded-full bg-green-600 border-2 border-white flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    {post.author.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                </div>
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

                {/* Social Share */}
                <div className="mt-12 border-t border-gray-200 py-8">
                    <p className="text-center text-sm font-semibold text-gray-700 mb-4">Share this article</p>
                    <div className="flex justify-center gap-3">
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(post.title + ' — ' + siteUrl + '/blog/' + post.slug)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                        >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            WhatsApp
                        </a>
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(siteUrl + '/blog/' + post.slug)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                        >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.636L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            X / Twitter
                        </a>
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl + '/blog/' + post.slug)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                        >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            Facebook
                        </a>
                    </div>
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
