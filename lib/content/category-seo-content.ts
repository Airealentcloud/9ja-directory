// SEO-optimized content for category pages
// Includes intro text, FAQs, and helpful tips for each major category

export interface CategorySEOContent {
    slug: string
    introText: string
    faqs: Array<{
        question: string
        answer: string
    }>
    tips?: string[]
}

export const categorySEOContent: CategorySEOContent[] = [
    {
        slug: 'restaurants',
        introText: `Looking for the best places to eat in Nigeria? Our comprehensive restaurant directory features thousands of verified dining establishments across all 36 states and the FCT. From traditional Nigerian cuisine and continental dishes to fast food and fine dining, discover restaurants that match your taste and budget. Whether you're searching for a family-friendly spot in Lagos, a romantic dinner venue in Abuja, or authentic local food in Port Harcourt, 9jaDirectory connects you with the best culinary experiences Nigeria has to offer. Filter by cuisine type, price range, location, and customer ratings to find your perfect dining destination.`,
        faqs: [
            {
                question: 'How do I find restaurants near me on 9jaDirectory?',
                answer: 'Use our location filter to select your state and city. You can also search by specific areas like "Lekki restaurants" or "Wuse 2 restaurants" to find dining options in your neighborhood.',
            },
            {
                question: 'Can I see restaurant menus and prices?',
                answer: 'Many restaurants on our platform include menu information and price ranges in their listings. Look for the "$" symbols indicating budget-friendly ($), mid-range ($$), upscale ($$$), or fine dining ($$$$) establishments.',
            },
            {
                question: 'Are customer reviews reliable?',
                answer: 'Yes! We verify all reviews to ensure authenticity. Only customers who have interacted with the business can leave reviews, and we moderate them to prevent fake or spam reviews.',
            },
            {
                question: 'What types of cuisine can I find?',
                answer: 'Our directory includes Nigerian cuisine (Jollof, Suya, Amala, etc.), Continental, Chinese, Indian, Italian, Lebanese, Asian fusion, seafood, vegetarian/vegan options, and more across all major Nigerian cities.',
            },
        ],
        tips: [
            'Check business hours before visiting - many restaurants update their schedules',
            'Read recent reviews to get the latest customer experiences',
            'Call ahead for reservations, especially for popular restaurants on weekends',
            'Look for restaurants with verified badges for trusted establishments',
        ],
    },
    {
        slug: 'hotels',
        introText: `Find your perfect accommodation in Nigeria with our extensive hotel and lodging directory. From luxury 5-star hotels in Lagos and Abuja to budget-friendly guesthouses, short-let apartments, and boutique hotels across the country, we've got you covered. Whether you're traveling for business, leisure, or special events, our verified listings include detailed information about amenities, room types, pricing, and guest reviews. Discover hotels near airports, business districts, tourist attractions, and event centers. Filter by star rating, price range, facilities (pool, gym, restaurant, conference rooms), and location to find accommodation that meets your specific needs and budget.`,
        faqs: [
            {
                question: 'How do I book a hotel through 9jaDirectory?',
                answer: 'Our directory provides hotel contact information (phone, email, website). You can call directly, visit their website, or use the contact form on their listing page to make a reservation.',
            },
            {
                question: 'What\'s the difference between hotels, guesthouses, and short-lets?',
                answer: 'Hotels offer full daily services (housekeeping, restaurants, reception). Guesthouses are smaller, more intimate with fewer amenities. Short-lets are furnished apartments rented for days/weeks, ideal for extended stays with kitchen facilities.',
            },
            {
                question: 'Can I find hotels near specific locations?',
                answer: 'Yes! Use our search to find hotels near airports (Lagos Airport, Abuja Airport), business districts (Victoria Island, Ikoyi), or landmarks. Many listings include proximity information.',
            },
            {
                question: 'Are prices listed accurate?',
                answer: 'Price ranges shown are indicative. Always contact the hotel directly for current rates, as prices vary by season, availability, and special promotions.',
            },
        ],
        tips: [
            'Book in advance for major events (conferences, festivals) when demand is high',
            'Check if breakfast, Wi-Fi, and airport transfers are included in the rate',
            'Verify cancellation policies before booking',
            'Read reviews about cleanliness, service quality, and value for money',
        ],
    },
    {
        slug: 'real-estate',
        introText: `Explore Nigeria's real estate marketplace with verified real estate agencies, property developers, and real estate agents across the country. Whether you're buying, selling, renting, or investing in property, our directory connects you with trusted professionals who can help. Find residential properties (apartments, houses, duplexes), commercial spaces (offices, shops, warehouses), land for sale, and property management services. From luxury estates in Lekki and Banana Island to affordable housing in emerging neighborhoods, discover opportunities across Lagos, Abuja, Port Harcourt, and all major Nigerian cities. Filter by property type, location, price range, and agent specialization to find the right real estate partner.`,
        faqs: [
            {
                question: 'How do I verify a real estate agent is legitimate?',
                answer: 'Look for agents with verified badges, check their reviews and ratings, verify their company registration with CAC, and ask for professional certifications like ESVARBON or NIESV membership.',
            },
            {
                question: 'What areas in Lagos have the best property investment potential?',
                answer: 'Emerging areas like Ibeju-Lekki, Epe, and Ajah offer high growth potential due to infrastructure development (Lekki Deep Sea Port, Dangote Refinery). Established areas like Victoria Island and Ikoyi offer stable, premium investments.',
            },
            {
                question: 'Should I pay agency fees upfront?',
                answer: 'Standard practice is to pay agency fees (typically 10% of annual rent) only after a property is secured and agreements signed. Be cautious of agents demanding large upfront payments without showing properties.',
            },
            {
                question: 'Can I find mortgage assistance through these agents?',
                answer: 'Many real estate agencies partner with banks and mortgage providers. Ask about mortgage facilitation services when contacting agents.',
            },
        ],
        tips: [
            'Visit properties in person - never rent/buy based solely on photos',
            'Verify property documents and ownership before making payments',
            'Negotiate - listed prices are often negotiable in the Nigerian market',
            'Consider location, infrastructure, and future development plans',
        ],
    },
    {
        slug: 'healthcare',
        introText: `Access quality healthcare in Nigeria through our comprehensive medical services directory. Find hospitals, clinics, diagnostic centers, pharmacies, and specialist doctors across all states. Whether you need emergency care, routine check-ups, dental services, maternity care, or specialized treatments, our verified listings include detailed information about services offered, specialist doctors, equipment available, and operating hours. From tertiary hospitals in major cities to primary healthcare centers in local communities, lab services, imaging centers (X-ray, CT scan, MRI), and 24-hour pharmacies - discover trusted healthcare providers near you. Filter by specialty, insurance acceptance, location, and facility type.`,
        faqs: [
            {
                question: 'How do I find doctors who accept my health insurance?',
                answer: 'Many healthcare facility listings indicate which insurance providers (HMOs) they accept. Contact the facility directly to confirm your specific insurance plan is accepted.',
            },
            {
                question: 'Can I book appointments online?',
                answer: 'Some modern hospitals and clinics offer online booking through their websites. Check the facility\'s listing for their website link or call their phone number to schedule appointments.',
            },
            {
                question: 'What should I do in a medical emergency?',
                answer: 'For emergencies, call the facility\'s emergency line (many major hospitals have 24/7 emergency services) or go directly to the nearest hospital emergency room. Look for hospitals with "24-hour Emergency" in their listing.',
            },
            {
                question: 'How do I verify a healthcare provider\'s credentials?',
                answer: 'Check for facility registration with the Nigerian Medical Association (NMA), verify doctors are licensed by the Medical and Dental Council of Nigeria (MDCN), and read patient reviews on our platform.',
            },
        ],
        tips: [
            'Keep emergency contact numbers saved - especially for 24-hour facilities',
            'Verify costs before procedures - ask for itemized estimates',
            'Bring your insurance card and ID to all appointments',
            'For specialists, you may need a referral from a general practitioner',
        ],
    },
    {
        slug: 'technology',
        introText: `Discover Nigeria's thriving tech ecosystem with our comprehensive technology and IT services directory. Find software development companies, IT consultants, web designers, mobile app developers, cybersecurity firms, computer repair services, and tech training centers across the country. Whether you're a startup seeking custom software, a business needing IT infrastructure, or an individual looking for tech support, our directory connects you with verified IT professionals and companies. From Lagos's tech hub in Yaba to Abuja's growing tech scene and beyond, explore services including cloud solutions, digital transformation, software development, hardware sales, network setup, data recovery, and IT training. Filter by service type, experience level, and location.`,
        faqs: [
            {
                question: 'How much does custom software development cost in Nigeria?',
                answer: 'Costs vary widely based on project complexity, ranging from ₦200,000 for simple websites to ₦5M+ for complex enterprise systems. Request quotes from multiple providers and compare portfolios before deciding.',
            },
            {
                question: 'Can I hire freelance developers or should I use a company?',
                answer: 'Both options are available on our platform. Freelancers may be more affordable for small projects, while established companies offer more accountability, team resources, and ongoing support for larger projects.',
            },
            {
                question: 'What should I look for in an IT service provider?',
                answer: 'Check their portfolio/previous work, verify client testimonials, assess their technical expertise, ensure they offer post-project support, and confirm they understand your specific industry or business needs.',
            },
            {
                question: 'Do these companies offer remote/online services?',
                answer: 'Yes, many IT companies offer remote services including virtual IT support, cloud solutions, and remote software development. This is especially useful for businesses outside major tech hubs.',
            },
        ],
        tips: [
            'Request a detailed project proposal and timeline before starting',
            'Ask for examples of similar projects they\'ve completed',
            'Discuss ongoing maintenance and support arrangements upfront',
            'Ensure clear communication channels are established',
            'Consider intellectual property ownership in your contract',
        ],
    },
]

// Helper function to get SEO content by category slug
export function getCategorySEOContent(slug: string): CategorySEOContent | undefined {
    return categorySEOContent.find((content) => content.slug === slug)
}

// Helper to check if a category has SEO content
export function hasCategorySEOContent(slug: string): boolean {
    return categorySEOContent.some((content) => content.slug === slug)
}
