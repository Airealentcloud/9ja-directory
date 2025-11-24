import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/lib/blog-data';

interface BlogCardProps {
    post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block h-full">
            <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                {/* Image Container */}
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-4 left-4">
                        <span className="inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-green-700 backdrop-blur-sm">
                            {post.category}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col p-6">
                    <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                    </div>

                    <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-green-700 line-clamp-2">
                        {post.title}
                    </h3>

                    <p className="mb-4 text-gray-600 line-clamp-3 flex-grow">
                        {post.excerpt}
                    </p>

                    <div className="mt-auto flex items-center gap-2 text-sm font-medium text-green-600 group-hover:text-green-700">
                        Read Article
                        <svg
                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}
