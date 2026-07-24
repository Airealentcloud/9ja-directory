import type { Metadata } from 'next'
import Link from 'next/link'
import { getPlanById } from '@/lib/pricing'
import { SITE_URL } from '@/lib/seo/site-url'

const siteUrl = SITE_URL
const basicPlan = getPlanById('basic')!
const premiumPlan = getPlanById('premium')!
const lifetimePlan = getPlanById('lifetime')!

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
        canonical: `${siteUrl}/faq`,
    },
    openGraph: {
        title: 'Frequently Asked Questions | 9jaDirectory',
        description: 'Answers to common questions about listing, searching, and using 9jaDirectory.',
        url: `${siteUrl}/faq`,
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
        answer: `Yes. Basic costs ${basicPlan.priceFormatted}, Premium costs ${premiumPlan.priceFormatted}, and Lifetime costs ${lifetimePlan.priceFormatted}; each is a one-time payment. Every submission is reviewed, but only Premium and Lifetime include a Verified badge after approval.`,
    },
    {
        question: 'How long does it take for my listing to be approved?',
        answer: 'Most business listings are reviewed within 24-48 hours. We check each submission for required information and policy compliance. You will receive an email notification after the decision.',
    },
    {
        question: 'Can I edit my business listing after it\'s published?',
        answer: 'Yes. Log into your dashboard, open "My Listings," and select the business you want to edit. All plans can update core contact details, descriptions, and allowed photos. Website, social links, and business hours are available on Premium and Lifetime.',
    },
    {
        question: 'How do I claim an existing business listing?',
        answer: 'If your business is already listed, use an active Premium or Lifetime plan and click "Claim This Business" on its page. Submit proof of ownership for manual review. An approved claim counts toward your plan\'s listing allowance.',
    },
    {
        question: 'What information should I include in my business listing?',
        answer: 'Include an accurate business name, address, phone number, email, category, location, useful description, logo, and clear photos. Premium and Lifetime can also show a website, social links, and business hours.',
    },
    {
        question: 'How can I improve my listing\'s visibility?',
        answer: 'Keep every available field accurate, add clear photos, select the correct category and location, and monitor customer reviews. Premium adds a richer verified profile and analytics. Lifetime includes priority search and homepage placement; Premium can purchase a time-limited featured add-on.',
    },
    {
        question: 'Can customers leave reviews on my listing?',
        answer: 'Yes, registered users can leave reviews and ratings on business listings. Reviews are moderated to prevent spam and ensure authenticity. Positive reviews help build trust and improve your ranking in search results.',
    },
    {
        question: 'What are the benefits of a featured listing?',
        answer: 'While featured placement is active, the listing receives a Featured badge and priority on supported search, category, and homepage sections. Lifetime includes this placement; eligible Premium listings can purchase a time-limited featured add-on.',
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
        answer: 'Yes, subject to your plan allowance: Basic includes 1 listing, Premium includes up to 5, and Lifetime includes unlimited listings.',
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
        answer: 'Contact our support team from the email on your account and identify the listing you want removed. We will verify ownership before removing or deactivating it.',
    },
]

export default function FAQPage() {
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${siteUrl}/faq` },
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
