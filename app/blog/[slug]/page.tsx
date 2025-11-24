import { blogPosts } from '@/lib/blog-data';
import BlogCard from '@/components/blog/blog-card';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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

    return {
        title: `${post.title} - 9ja Directory`,
        description: post.excerpt,
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

    return (
        <div className="min-h-screen bg-white pb-20">
            {post.schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: post.schema }}
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
