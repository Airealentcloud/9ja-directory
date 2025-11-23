type Listing = {
    id: string
    business_name: string
    slug: string
    description?: string | null
    website_url?: string | null
    phone?: string | null
    email?: string | null
    address?: string | null
    city?: string | null
    neighborhood?: string | null
    latitude?: number | null
    longitude?: number | null
    images?: any
    image_url?: string | null
    logo_url?: string | null
    opening_hours?: any
    payment_methods?: any
    year_established?: number | null
    services_offered?: any
    facebook_url?: string | null
    instagram_url?: string | null
    twitter_url?: string | null
    categories?: { name: string; slug: string } | null
    states?: { name: string; slug: string } | null
    created_at?: string
}


type OpeningHours = {
    [key: string]: {
        open: string
        close: string
        closed?: boolean
    }
}

type Review = {
    id: string
    rating: number
    title?: string
    comment: string
    reviewer_name?: string
    created_at: string
    user_id?: string
}

/**
 * Generates LocalBusiness JSON-LD schema for a listing
 * Supports multiple business types including Real Estate
 */
export function generateLocalBusinessSchema(
    listing: Listing,
    reviews?: Review[],
    averageRating?: number,
    reviewCount?: number
) {
    // Determine specific business type
    const businessType = getBusinessType(listing.categories?.name)

    const schema: any = {
        '@context': 'https://schema.org',
        '@type': businessType,
        '@id': `https://9jadirectory.org/listings/${listing.slug}`,
        name: listing.business_name,
        description: listing.description,
    }

    // URL
    if (listing.website_url) {
        schema.url = listing.website_url
    }

    // Contact Information
    if (listing.phone) {
        schema.telephone = listing.phone
    }
    if (listing.email) {
        schema.email = listing.email
    }

    // Address
    if (listing.address) {
        schema.address = {
            '@type': 'PostalAddress',
            streetAddress: listing.address,
            addressLocality: listing.city,
            addressRegion: listing.states?.name || listing.city,
            addressCountry: 'NG',
        }

        if (listing.neighborhood) {
            schema.address.addressLocality = `${listing.neighborhood}, ${listing.city}`
        }
    }

    // Geographic Coordinates
    if (listing.latitude && listing.longitude) {
        schema.geo = {
            '@type': 'GeoCoordinates',
            latitude: listing.latitude.toString(),
            longitude: listing.longitude.toString(),
        }

        // Add map URL
        schema.hasMap = `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`
    }

    // Images
    const images = []
    if (listing.images && Array.isArray(listing.images)) {
        images.push(...listing.images)
    } else if (listing.image_url) {
        images.push(listing.image_url)
    }
    if (images.length > 0) {
        schema.image = images
    }

    // Logo
    if (listing.logo_url) {
        schema.logo = {
            '@type': 'ImageObject',
            url: listing.logo_url,
        }
    }

    // Opening Hours
    if (listing.opening_hours) {
        const openingHoursSpec = generateOpeningHoursSpecification(
            listing.opening_hours as OpeningHours
        )
        if (openingHoursSpec.length > 0) {
            schema.openingHoursSpecification = openingHoursSpec
        }
    }

    // Aggregate Rating
    if (averageRating && reviewCount && reviewCount > 0) {
        schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: averageRating.toFixed(1),
            reviewCount: reviewCount.toString(),
            bestRating: '5',
            worstRating: '1',
        }
    }

    // Reviews
    if (reviews && reviews.length > 0) {
        schema.review = reviews.slice(0, 5).map((review) => ({
            '@type': 'Review',
            author: {
                '@type': 'Person',
                name: review.reviewer_name || 'Anonymous',
            },
            datePublished: new Date(review.created_at).toISOString().split('T')[0],
            reviewRating: {
                '@type': 'Rating',
                ratingValue: review.rating.toString(),
                bestRating: '5',
                worstRating: '1',
            },
            reviewBody: review.comment,
            ...(review.title && { name: review.title }),
        }))
    }

    // Payment Methods
    if (listing.payment_methods && Array.isArray(listing.payment_methods)) {
        schema.paymentAccepted = listing.payment_methods
        schema.currenciesAccepted = 'NGN'
    }

    // Price Range (estimate based on category or default)
    schema.priceRange = '$$'

    // Social Media
    const socialProfiles = [
        listing.facebook_url,
        listing.instagram_url,
        listing.twitter_url,
    ].filter(Boolean)

    if (socialProfiles.length > 0) {
        schema.sameAs = socialProfiles
    }

    // Additional business details
    if (listing.year_established) {
        schema.foundingDate = listing.year_established.toString()
    }

    // Real Estate specific fields
    if (businessType === 'RealEstateAgent') {
        schema.knowsAbout = [
            'Residential Real Estate',
            'Commercial Real Estate',
            'Property Investment',
            'Property Management',
            'Land Sales',
        ]

        if (listing.city && listing.states?.name) {
            schema.areaServed = [
                {
                    '@type': 'City',
                    name: listing.city,
                    containedInPlace: {
                        '@type': 'State',
                        name: listing.states.name,
                    },
                },
            ]
        }

        schema.priceRange = '₦₦₦'
        schema.paymentAccepted = ['Cash', 'Bank Transfer', 'Mortgage', 'Installment']
        schema.currenciesAccepted = 'NGN'

        if (listing.services_offered && Array.isArray(listing.services_offered)) {
            schema.hasOfferCatalog = {
                '@type': 'OfferCatalog',
                name: 'Real Estate Services',
                itemListElement: listing.services_offered.map((service: string) => ({
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: service,
                    },
                })),
            }
        }
    }

    return schema
}

/**
 * Generates opening hours specification from JSONB data
 */
function generateOpeningHoursSpecification(hours: OpeningHours) {
    const specs: any[] = []
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    days.forEach((day, index) => {
        const dayHours = hours[day]
        if (dayHours && !dayHours.closed) {
            specs.push({
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: dayNames[index],
                opens: dayHours.open,
                closes: dayHours.close,
            })
        }
    })

    return specs
}

/**
 * Determines the specific Schema.org business type based on category
 */
function getBusinessType(categoryName?: string): string {
    if (!categoryName) return 'LocalBusiness'

    const categoryLower = categoryName.toLowerCase()

    // Real Estate
    if (categoryLower.includes('real estate') || categoryLower.includes('property')) {
        return 'RealEstateAgent'
    }

    // Food & Dining
    if (categoryLower.includes('restaurant') || categoryLower.includes('food')) {
        return 'Restaurant'
    }
    if (categoryLower.includes('cafe') || categoryLower.includes('coffee')) {
        return 'CafeOrCoffeeShop'
    }
    if (categoryLower.includes('bar') || categoryLower.includes('pub')) {
        return 'BarOrPub'
    }

    // Lodging
    if (categoryLower.includes('hotel')) {
        return 'Hotel'
    }
    if (categoryLower.includes('hostel') || categoryLower.includes('lodge')) {
        return 'LodgingBusiness'
    }

    // Health
    if (categoryLower.includes('hospital') || categoryLower.includes('clinic')) {
        return 'MedicalClinic'
    }
    if (categoryLower.includes('pharmacy')) {
        return 'Pharmacy'
    }
    if (categoryLower.includes('dentist')) {
        return 'Dentist'
    }

    // Services
    if (categoryLower.includes('salon') || categoryLower.includes('beauty')) {
        return 'BeautySalon'
    }
    if (categoryLower.includes('spa')) {
        return 'DaySpa'
    }
    if (categoryLower.includes('gym') || categoryLower.includes('fitness')) {
        return 'HealthClub'
    }

    // Retail
    if (categoryLower.includes('store') || categoryLower.includes('shop')) {
        return 'Store'
    }
    if (categoryLower.includes('supermarket') || categoryLower.includes('grocery')) {
        return 'GroceryStore'
    }

    // Professional Services
    if (categoryLower.includes('lawyer') || categoryLower.includes('attorney')) {
        return 'Attorney'
    }
    if (categoryLower.includes('accountant')) {
        return 'AccountingService'
    }

    // Default
    return 'LocalBusiness'
}

/**
 * Generates breadcrumb schema for listing page
 */
export function generateBreadcrumbSchema(listing: Listing) {
    const items = [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://9jadirectory.org',
        },
    ]

    if (listing.states?.name && listing.states?.slug) {
        items.push({
            '@type': 'ListItem',
            position: 2,
            name: listing.states.name,
            item: `https://9jadirectory.org/states/${listing.states.slug}`,
        })
    }

    if (listing.categories?.name && listing.categories?.slug) {
        items.push({
            '@type': 'ListItem',
            position: items.length + 1,
            name: listing.categories.name,
            item: `https://9jadirectory.org/categories/${listing.categories.slug}`,
        })
    }

    items.push({
        '@type': 'ListItem',
        position: items.length + 1,
        name: listing.business_name,
        item: `https://9jadirectory.org/listings/${listing.slug}`,
    })

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items,
    }
}

/**
 * Generates RealEstateListing schema for real estate businesses
 */
export function generateRealEstateListingSchema(listing: Listing) {
    const schema: any = {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        '@id': `https://9jadirectory.org/listings/${listing.slug}#listing`,
        name: listing.business_name,
        description: listing.description,
        url: `https://9jadirectory.org/listings/${listing.slug}`,
        datePosted: listing.created_at,
    }

    // Offer details
    schema.offers = {
        '@type': 'Offer',
        priceCurrency: 'NGN',
        availability: 'https://schema.org/InStock',
        businessFunction: 'http://purl.org/goodrelations/v1#Sell',
    }

    // Location
    if (listing.address) {
        schema.address = {
            '@type': 'PostalAddress',
            streetAddress: listing.address,
            addressLocality: listing.city,
            addressRegion: listing.states?.name,
            addressCountry: 'NG',
        }
    }

    // Geo coordinates (CRITICAL for local SEO)
    if (listing.latitude && listing.longitude) {
        schema.geo = {
            '@type': 'GeoCoordinates',
            latitude: listing.latitude.toString(),
            longitude: listing.longitude.toString(),
        }
    }

    // Area served
    if (listing.city && listing.states?.name) {
        schema.areaServed = {
            '@type': 'City',
            name: listing.city,
            containedInPlace: {
                '@type': 'State',
                name: listing.states.name,
            },
        }
    }

    return schema
}

/**
 * Generates FAQPage schema for listing pages
 */
export function generateFAQSchema(listing: Listing) {
    const faqs = [
        {
            question: `What areas does ${listing.business_name} serve?`,
            answer: listing.city && listing.states?.name
                ? `${listing.business_name} serves ${listing.city} and surrounding areas in ${listing.states.name}, Nigeria.`
                : `${listing.business_name} serves various locations across Nigeria.`,
        },
        {
            question: `How can I contact ${listing.business_name}?`,
            answer: `You can reach ${listing.business_name}${listing.phone ? ` by phone at ${listing.phone}` : ''}${listing.email ? `, email at ${listing.email}` : ''}${listing.address ? `, or visit their office at ${listing.address}` : ''}.`,
        },
        {
            question: `What services does ${listing.business_name} offer?`,
            answer:
                listing.description ||
                `${listing.business_name} offers comprehensive ${listing.categories?.name || 'business'} services.`,
        },
    ]

    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    }
}
