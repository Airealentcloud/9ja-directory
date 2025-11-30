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
    {
        slug: 'accommodation',
        introText: `Find your perfect accommodation across Nigeria with 9jaDirectory's comprehensive lodging database. From luxury 5-star hotels and boutique guesthouses to affordable budget lodges and furnished short-let apartments, we connect travelers, business professionals, and long-term residents with verified accommodation providers in every major city. Whether you're booking a hotel in Lagos, finding a cozy guesthouse in Abuja, securing conference facilities, or arranging extended stay apartments in Port Harcourt, our platform makes it easy to compare options, read verified guest reviews, check real-time availability, and contact providers directly. Filter by location, star rating, price range, amenities (WiFi, pool, restaurant, gym, conference rooms), and guest ratings to find exactly what you need.`,
        faqs: [
            {
                question: 'How do I book accommodation through 9jaDirectory?',
                answer: 'Browse listings, read reviews and see photos, compare prices and amenities, then contact the provider directly via phone or email provided in their listing. Many also have booking links to their websites. We recommend calling ahead to confirm availability and negotiate rates, as many providers offer discounts for bulk bookings or long stays.',
            },
            {
                question: 'What\'s included in hotel rates?',
                answer: 'This varies by establishment. Check each listing\'s details for what\'s included - breakfast, Wi-Fi, taxes, parking, and service charges may or may not be included in the quoted price. Always confirm this when booking to avoid surprises.',
            },
            {
                question: 'Which accommodations are best for business travelers?',
                answer: 'Look for hotels with facilities like business centers, conference rooms, meeting spaces, reliable WiFi, 24-hour reception, and proximity to business districts. Lagos (Victoria Island, Ikoyi), Abuja (Wuse, Garki), and Port Harcourt (GRA) all have excellent business-friendly options.',
            },
            {
                question: 'Can I find good deals and discounts?',
                answer: 'Yes! Call providers directly and ask about package deals, long-stay discounts, group rates, or promotional rates. Many accommodations offer better prices off-platform. Read recent reviews to see if current guests mention any ongoing promotions or loyalty discounts.',
            },
            {
                question: 'Are cancellation policies flexible?',
                answer: 'Cancellation policies vary. Check each listing for their policy - some offer free cancellation up to 7 days before arrival, others are non-refundable. Always clarify this before booking, especially for events or during peak seasons.',
            },
        ],
        tips: [
            '💡 Book well in advance for major events (conferences, festivals, holidays)',
            '💡 Read recent guest reviews - they reveal current experience quality',
            '💡 Negotiate rates when booking for extended stays (1+ months)',
            '💡 Verify proximity to your venue/activity before booking',
            '💡 Ask about airport transfers and local transportation',
            '💡 Check for hidden charges (service fees, WiFi, parking, amenities)',
            '💡 Request photos of actual rooms, not just promotional images',
        ],
    },
    {
        slug: 'arts',
        introText: `Explore Nigeria's vibrant arts and culture scene with our comprehensive directory of art galleries, artist studios, craft centers, art schools, and creative services. Discover talented Nigerian artists, craftspeople, and cultural organizations showcasing traditional and contemporary art across all 36 states and the FCT. Whether you're looking to commission custom artwork, purchase authentic Nigerian crafts, attend art exhibitions, learn creative skills at art schools, or explore cultural institutions, 9jaDirectory connects you with verified creative professionals. From Lagos's thriving contemporary art scene to Abuja's cultural centers, Oshogbo's renowned traditional arts, and artisan communities nationwide - find everything from oil paintings, sculptures, and textiles to jewelry, pottery, digital art, and performance art. Perfect for collectors, art enthusiasts, event decorators, and anyone passionate about Nigerian culture.`,
        faqs: [
            {
                question: 'How do I find and purchase authentic Nigerian art?',
                answer: 'Browse our directory for galleries, artist studios, and craft markets. Check artist credentials, request certificates of authenticity, and view their previous work. Reputable galleries should provide documentation about artists and artworks. Prices range from affordable craft pieces to investment-grade fine art.',
            },
            {
                question: 'Can I commission custom artwork or crafts?',
                answer: 'Yes! Many artists and craft studios listed accept commissions for paintings, sculptures, textiles, jewelry, interior design pieces, and more. Contact providers directly with your vision, budget, and timeline. Expect 2-12 weeks depending on complexity.',
            },
            {
                question: 'What\'s the difference between a gallery, studio, and market?',
                answer: 'Galleries are curated spaces representing selected artists. Studios are where artists create (some sell directly). Markets are open-air or indoor spaces with many independent vendors and craftspeople. Each offers different experiences and price points.',
            },
            {
                question: 'Are there art training or workshop opportunities?',
                answer: 'Absolutely! Our directory includes art schools and training centers offering courses in painting, sculpture, textile design, jewelry making, traditional crafts, digital art, and photography. Most offer beginner to advanced levels.',
            },
            {
                question: 'How do I know if art is fairly priced?',
                answer: 'Research the artist\'s background and previous sales, compare prices across galleries, consider the artwork\'s size and complexity, and ask about artist reputation. Unknown emerging artists are typically affordable; established artists command higher prices.',
            },
        ],
        tips: [
            '🎨 Support emerging artists - discover the next generation of Nigerian talent',
            '🎨 Attend gallery exhibitions and art events for inspiration and networking',
            '🎨 Visit artist studios directly for better prices and direct artist interaction',
            '🎨 Commission pieces for unique, personalized artwork for homes or offices',
            '🎨 Join art communities and groups to stay updated on new exhibitions',
            '🎨 Consider art as an investment - authenticated pieces appreciate over time',
            '🎨 Explore traditional crafts (textiles, beadwork, pottery) from artisan communities',
        ],
    },
    {
        slug: 'auto-services',
        introText: `Find reliable and professional automotive services across Nigeria with our trusted auto repair, maintenance, and vehicle care directory. Discover certified mechanics, full-service auto workshops, spare parts dealers, car dealerships, and specialized auto services for all vehicle types and makes. Whether you need routine maintenance (oil changes, tire services), major repairs (engine work, transmission repairs), diagnostic services, paint & body work, detailing, or buying/selling a vehicle, our verified listings connect you with qualified professionals and businesses. From budget-friendly repair shops to premium auto centers, find trusted service providers in your area. Filter by location, vehicle type, services offered, and customer ratings to find the perfect auto service provider for your needs.`,
        faqs: [
            {
                question: 'How do I find an honest and reliable mechanic?',
                answer: 'Look for established shops with good reviews, ASE certifications or manufacturer training, transparent pricing, and warranty on repairs. Ask for referrals from friends, check their experience with your vehicle brand, and never leave your car without a written estimate and itemized bill.',
            },
            {
                question: 'What\'s a reasonable price for auto repairs in Nigeria?',
                answer: 'Prices vary by repair type and vehicle model. Get quotes from 2-3 providers, compare labor rates (typically ₦5K-₦25K/hour) and parts costs. Establish a budget-friendly trusted mechanic for routine maintenance, and specialized shops for complex repairs.',
            },
            {
                question: 'How often should I service my vehicle?',
                answer: 'Follow your vehicle manufacturer\'s schedule (usually every 5,000-10,000km or 3-6 months). Regular maintenance prevents breakdowns, extends vehicle life, and maintains resale value. Our directory includes many service centers offering scheduled maintenance packages.',
            },
            {
                question: 'Should I buy original or aftermarket spare parts?',
                answer: 'Original parts ensure quality and warranty but cost more. Reputable aftermarket parts offer good value if sourced from trusted dealers. Avoid counterfeit parts. Ask mechanics for recommendations based on your budget and the part\'s importance to vehicle safety.',
            },
            {
                question: 'How do I buy or sell a used car safely?',
                answer: 'Use our directory to find reputable car dealerships and private sellers. Have the vehicle inspected by a mechanic before buying, verify ownership documents (registration), check for outstanding loans via NVIS database, test drive thoroughly, and only pay after proper documentation transfer.',
            },
            {
                question: 'What services does a full-service auto center provide?',
                answer: 'Most offer oil changes, tire services, battery replacement, brakes, suspension, engine diagnostics, air conditioning repairs, detailing, body work, and general maintenance. Contact providers to confirm they service your specific vehicle type.',
            },
        ],
        tips: [
            '🚗 Keep maintenance records for warranty and resale value',
            '🚗 Don\'t ignore warning lights - diagnose early to avoid expensive repairs',
            '🚗 Maintain tire pressure and alignment for safety and fuel efficiency',
            '🚗 Use genuine fuel and quality oil recommended for your vehicle',
            '🚗 Have battery, brakes, and suspension checked regularly',
            '🚗 Keep tires rotated and balanced for even wear and performance',
            '🚗 Build a relationship with a trusted mechanic for better service and loyalty discounts',
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
