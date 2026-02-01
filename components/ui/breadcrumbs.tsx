import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org'

export interface BreadcrumbItem {
    label: string
    href: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
    className?: string
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
    // Generate JSON-LD schema for breadcrumbs
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteUrl,
            },
            ...items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 2,
                name: item.label,
                item: `${siteUrl}${item.href}`,
            })),
        ],
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <nav
                aria-label="Breadcrumb"
                className={`flex items-center space-x-2 text-sm ${className}`}
            >
                <Link
                    href="/"
                    className="flex items-center text-gray-500 hover:text-green-600 transition-colors"
                    aria-label="Home"
                >
                    <Home className="w-4 h-4" />
                </Link>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1

                    return (
                        <div key={item.href} className="flex items-center space-x-2">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            {isLast ? (
                                <span className="text-gray-900 font-medium" aria-current="page">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="text-gray-500 hover:text-green-600 transition-colors"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </div>
                    )
                })}
            </nav>
        </>
    )
}
