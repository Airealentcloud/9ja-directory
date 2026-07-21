import type { Metadata } from 'next'
import Link from 'next/link'
import PricingCheckout from '@/components/pricing/pricing-checkout'
import { SITE_URL } from '@/lib/seo/site-url'

const siteUrl = SITE_URL

export const metadata: Metadata = {
    title: 'Business Listing Pricing Plans | 9jaDirectory Nigeria',
    description: 'List your Nigerian business from ₦5,000. Compare Basic, Premium and Lifetime limits, verification, analytics and featured placement.',
    keywords: ['business listing Nigeria', 'list business Nigeria', 'Nigerian directory pricing', 'advertise business Nigeria', 'business registration Nigeria directory'],
    alternates: {
        canonical: `${siteUrl}/pricing`,
    },
    openGraph: {
        title: 'Business Listing Pricing Plans | 9jaDirectory Nigeria',
        description: 'Compare one-time Basic, Premium and Lifetime business-listing plans for Nigeria.',
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
        description: 'Compare one-time Nigerian business-listing plans. No hidden fees.',
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
                    Choose the exact features your business needs. Every plan is a one-time payment with clearly separated limits.
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
                            Yes. You can purchase a higher tier at any time. Contact support before paying if you need help confirming how an earlier payment will be handled; upgrades are not automatically prorated.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Is there a refund policy?
                        </h3>
                        <p className="text-gray-600">
                            Except where required by law, listing fees are non-refundable once review or publishing work begins. Contact support promptly about duplicate or failed charges.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Will I be charged again?
                        </h3>
                        <p className="text-gray-600">
                            No. Basic, Premium and Lifetime are one-time payments, not recurring subscriptions. There is no monthly billing to cancel.
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
