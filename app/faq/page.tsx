import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Frequently Asked Questions | 9jaDirectory',
    description: 'Get answers to common questions about listing your business, searching for services, and using 9jaDirectory - Nigeria\'s premier business directory.',
    keywords: [
        '9jaDirectory FAQ',
        'how to list business on 9jaDirectory',
        'claim business listing Nigeria',
        'Nigeria business directory help',
    ],
    alternates: {
        canonical: 'https://9jadirectory.org/faq',
    },
    openGraph: {
        title: 'Frequently Asked Questions | 9jaDirectory',
        description: 'Answers to common questions about listing, searching, and using 9jaDirectory.',
        url: 'https://9jadirectory.org/faq',
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
        title: 'FAQ | 9jaDirectory',
        description: 'Answers to common questions about listing, searching, and using 9jaDirectory.',
        images: ['/opengraph-image'],
    },
}

const faqs = [
    {
        question: 'What is 9jaDirectory?',
        answer: '9jaDirectory is Nigeria\'s comprehensive online business directory connecting customers with trusted local businesses across all 36 states and the FCT. We help people find restaurants, hotels, healthcare services, shops, and more.',
    },
    {
        question: 'Do I need a plan to list my business?',
        answer: 'Yes. To publish your listing, choose a plan and complete payment. This keeps listings verified and helps you get the right level of visibility.',
    },
    {
        question: 'How long does it take for my listing to be approved?',
        answer: 'Most business listings are reviewed and approved within 24-48 hours. We manually verify each submission to ensure quality and accuracy. You\'ll receive an email notification once your listing is approved.',
    },
    {
        question: 'Can I edit my business listing after it\'s published?',
        answer: 'Absolutely! Log into your account dashboard, navigate to "My Listings," and click "Edit" on the business you want to update. You can change your contact information, business hours, description, photos, and more at any time.',
    },
    {
        question: 'How do I claim an existing business listing?',
        answer: 'If you find your business already listed (perhaps added by someone else), you can claim it by clicking the "Claim This Business" button on the listing page. You\'ll need to provide proof of ownership, which our team will verify before granting you access.',
    },
    {
        question: 'What information should I include in my business listing?',
        answer: 'For the best results, include: your business name, accurate address, phone number, email, website, business hours, high-quality photos, a detailed description of your services, and any specializations or unique offerings. The more complete your listing, the better your visibility.',
    },
    {
        question: 'How can I improve my listing\'s visibility?',
        answer: 'To increase visibility: (1) Complete all fields in your profile, (2) Add high-quality photos, (3) Encourage customers to leave reviews, (4) Keep your business hours and contact info updated, (5) Respond to reviews promptly, and (6) Consider upgrading to a featured listing for premium placement.',
    },
    {
        question: 'Can customers leave reviews on my listing?',
        answer: 'Yes, registered users can leave reviews and ratings on business listings. Reviews are moderated to prevent spam and ensure authenticity. Positive reviews help build trust and improve your ranking in search results.',
    },
    {
        question: 'What are the benefits of a featured listing?',
        answer: 'Featured listings appear at the top of search results and category pages, get highlighted with a special badge, and receive priority placement in our homepage carousel. This significantly increases visibility and can drive 3-5x more customer inquiries.',
    },
    {
        question: 'How do I search for businesses on 9jaDirectory?',
        answer: 'Use the search bar on our homepage to enter what you\'re looking for (e.g., "restaurants," "plumbers," "hotels"). You can filter by location (state or city) to find businesses near you. You can also browse by category or location from the main menu.',
    },
    {
        question: 'Is my personal information safe?',
        answer: 'Yes, we take data privacy seriously. Your personal information is encrypted and stored securely. We never sell your data to third parties. Business contact information you choose to display publicly (phone, email, address) will be visible to users searching the directory.',
    },
    {
        question: 'Can I list multiple businesses?',
        answer: 'Yes! You can add and manage multiple business listings from a single account. This is perfect for business owners with multiple locations or different business ventures.',
    },
    {
        question: 'What should I do if I find incorrect information on a listing?',
        answer: 'If you spot incorrect information on a listing you don\'t own, please use the "Report" button on the listing page to notify us. If it\'s your business, log in and update the information directly from your dashboard.',
    },
    {
        question: 'Do you cover businesses in all Nigerian states?',
        answer: 'Yes! 9jaDirectory covers businesses across all 36 states plus the Federal Capital Territory (FCT). Whether you\'re in Lagos, Kano, Rivers, or any other state, you can list your business and find services.',
    },
    {
        question: 'How do I delete my business listing?',
        answer: 'To remove a listing, log into your account, go to "My Listings," select the business you want to delete, and click "Delete Listing." The listing will be permanently removed from our directory. Alternatively, contact our support team for assistance.',
    },
]

export default function FAQPage() {
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://9jadirectory.org' },
            { '@type': 'ListItem', position: 2, name: 'FAQ', item: 'https://9jadirectory.org/faq' },
        ],
    }

    // FAQPage Schema for Rich Results
    const faqSchema = {
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

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
                        <p className="text-xl text-green-100">
                            Everything you need to know about 9jaDirectory
                        </p>
                    </div>
                </div>

                {/* FAQ Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-3">
                                    {faq.question}
                                </h2>
                                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="mt-16 bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Still Have Questions?
                        </h2>
                        <p className="text-gray-700 mb-6">
                            Can't find the answer you're looking for? Our support team is here to help.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/contact"
                                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                            >
                                Contact Support
                            </Link>
                            <Link
                                href="/pricing"
                                className="inline-block px-6 py-3 bg-white text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold"
                            >
                                Get Listed
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
