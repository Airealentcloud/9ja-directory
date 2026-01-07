type Category = {
    id: string
    name: string
    slug: string
    description?: string | null
    icon?: string | null
}

type Listing = {
    id: string
    business_name: string
    slug: string
    description?: string | null
    verified?: boolean
    states?: { name: string; slug: string } | null | any
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://9jadirectory.org'

/**
 * Generates ItemList schema for category pages
 * Shows listings as a structured list for search engines
 */
export function generateCategoryItemListSchema(
    category: Category,
    listings: Listing[],
    totalCount: number
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${category.name} in Nigeria`,
        description: category.description || `Find the best ${category.name} businesses across Nigeria`,
        numberOfItems: totalCount,
        itemListElement: listings.slice(0, 10).map((listing, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'LocalBusiness',
                '@id': `${siteUrl}/listings/${listing.slug}`,
                name: listing.business_name,
                url: `${siteUrl}/listings/${listing.slug}`,
                description: listing.description,
            },
        })),
    }
}

/**
 * Generates BreadcrumbList schema for category pages
 */
export function generateCategoryBreadcrumbSchema(category: Category) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteUrl,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Categories',
                item: `${siteUrl}/categories`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: category.name,
                item: `${siteUrl}/categories/${category.slug}`,
            },
        ],
    }
}

/**
 * Generates CollectionPage schema for category pages
 */
export function generateCategoryCollectionSchema(category: Category, totalCount: number) {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${category.name} in Nigeria`,
        description: category.description || `Comprehensive directory of ${category.name} businesses in Nigeria`,
        url: `${siteUrl}/categories/${category.slug}`,
        inLanguage: 'en-NG',
        about: {
            '@type': 'Thing',
            name: category.name,
        },
        numberOfItems: totalCount,
    }
}

/**
 * Generates FAQPage schema for Real Estate category
 */
export function generateRealEstateFAQSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'What are the best real estate companies in Nigeria?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: "Nigeria's top real estate companies include A.I Realent Global Resources (Abuja), Adron Homes (nationwide affordable housing), Sujimoto Construction (luxury developments), Mixta Africa (pan-African presence), Dutum Construction (20+ years experience), UPDC Plc (since 1997), and Jide Taiwo & Co (ESVARBON registered). These companies are recognized for their expertise, project quality, and customer satisfaction across Lagos, Abuja, Port Harcourt, and other major cities.",
                },
            },
            {
                '@type': 'Question',
                name: 'How do I choose a reliable real estate company in Nigeria?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Look for companies with: (1) Verified track records and years of experience (20+ years is ideal), (2) Transparent pricing and flexible payment plans, (3) Property verification services and title checks, (4) Positive client reviews and testimonials, (5) Professional certifications like ESVARBON registration, (6) Portfolio of completed projects, (7) Clear legal documentation support.',
                },
            },
            {
                '@type': 'Question',
                name: 'Which cities have the most real estate development in Nigeria?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Lagos leads with areas like Lekki, Victoria Island, Ikoyi, Ajah, and Ibeju-Lekki. Abuja follows with Maitama, Asokoro, Jahi, Gwarinpa, and Katampe Extension. Other major cities include Port Harcourt (GRA, Trans Amadi), Ibadan, and Kano. Lagos and Abuja account for over 60% of Nigeria\'s real estate investment.',
                },
            },
            {
                '@type': 'Question',
                name: 'What is the average cost of property in Nigeria?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Property prices vary by location: Lagos (Lekki) houses: ₦50M-₦500M+, Abuja (Maitama) houses: ₦80M-₦1B+, Land in Ibeju-Lekki: ₦5M-₦20M per plot, Apartments in Lagos: ₦25M-₦150M. Prices depend on location, property type, and amenities. Always verify property documents and engage a lawyer.',
                },
            },
        ],
    }
}
