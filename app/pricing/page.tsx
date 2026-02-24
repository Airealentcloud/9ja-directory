import type { Metadata } from 'next'
import Link from 'next/link'
import PricingCheckout from '@/components/pricing/pricing-checkout'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org'

export const metadata: Metadata = {
    title: 'Business Listing Pricing Plans | 9jaDirectory Nigeria',
    description: 'List your Nigerian business from free to premium. Choose a plan with photos, verified badge, featured placement & priority support. No hidden fees.',
    keywords: ['business listing Nigeria', 'list business Nigeria', 'Nigerian directory pricing', 'advertise business Nigeria', 'business registration Nigeria directory'],
    alternates: {
        canonical: `${siteUrl}/pricing`,
    },
    openGraph: {
        title: 'Business Listing Pricing Plans | 9jaDirectory Nigeria',
        description: 'List your Nigerian business from free to premium. Photos, verified badge, featured placement & priority support.',
        url: `${siteUrl}/pricing`,
        siteName: '9jaDirectory',
        locale: 'en_NG',
        type: 'website',
        images: [
            {
                url: '/opengraph-image',
                width: 1200,
                height: 630,
                alt: '9jaDirectory Pricing Plans',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Business Listing Pricing Plans | 9jaDirectory',
        description: 'List your Nigerian business from free to premium. No hidden fees.',
        images: ['/opengraph-image'],
    },
}

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Choose the plan that works best for your business. No hidden fees.
                </p>
            </div>

            <PricingCheckout />

            {/* FAQ Section */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                    Frequently Asked Questions
                </h2>

                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            What payment methods do you accept?
                        </h3>
                        <p className="text-gray-600">
                            We accept all major debit/credit cards, bank transfers, and USSD payments through Paystack.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Can I upgrade my plan later?
                        </h3>
                        <p className="text-gray-600">
                            Yes! You can upgrade your plan at any time. The difference will be prorated.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Is there a refund policy?
                        </h3>
                        <p className="text-gray-600">
                            We offer a 7-day money-back guarantee if you're not satisfied with your plan.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            How do I cancel my subscription?
                        </h3>
                        <p className="text-gray-600">
                            You can cancel your subscription anytime from your dashboard. Your access will continue until the end of your billing period.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 text-center">
                <div className="bg-green-600 rounded-2xl p-8 text-white">
                    <h2 className="text-2xl font-bold mb-4">Need help choosing?</h2>
                    <p className="text-green-100 mb-6">
                        Contact our team and we'll help you find the perfect plan for your business.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
    )
}
