import type { Metadata } from 'next'
import Link from 'next/link'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org'

export const metadata: Metadata = {
    title: 'Claim Your Business Listing | 9jaDirectory',
    description: 'Own a business listed on 9jaDirectory? Claim your listing to manage your profile, reply to reviews, update photos, and attract more customers across Nigeria.',
    alternates: {
        canonical: `${siteUrl}/claim-your-business`,
    },
    openGraph: {
        title: 'Claim Your Business Listing | 9jaDirectory',
        description: 'Own a business listed on 9jaDirectory? Claim your listing to manage your profile, reply to reviews, and attract more customers.',
        url: `${siteUrl}/claim-your-business`,
        siteName: '9jaDirectory',
        type: 'website',
    },
}

export default function ClaimYourBusinessPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Claim Your Business on 9jaDirectory
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Is your business already listed? Take control of your listing to manage your profile,
                    respond to reviews, and reach more customers across Nigeria.
                </p>
            </div>

            {/* Why Claim */}
            <div className="bg-blue-50 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-blue-900 mb-6">Why Claim Your Listing?</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Update Your Details</h3>
                            <p className="text-sm text-gray-600">Edit your business name, address, phone number, opening hours, and photos anytime.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Reply to Reviews</h3>
                            <p className="text-sm text-gray-600">Respond to customer reviews, build trust, and show you care about feedback.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Get Verified</h3>
                            <p className="text-sm text-gray-600">Earn a verified badge that tells customers your business is legitimate and trustworthy.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Boost Visibility</h3>
                            <p className="text-sm text-gray-600">Get featured placement, appear higher in search results, and attract more customers.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step by Step */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How to Claim Your Business in 4 Steps</h2>
                <div className="space-y-8">
                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold">1</div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your Free Account</h3>
                            <p className="text-gray-600 mb-3">
                                Sign up at 9jaDirectory with your name, email, and a password. It takes less than a minute.
                            </p>
                            <Link
                                href="/signup"
                                className="inline-flex items-center text-green-600 font-medium hover:text-green-700"
                            >
                                Create Account &rarr;
                            </Link>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold">2</div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose a Plan</h3>
                            <p className="text-gray-600 mb-3">
                                To claim an existing listing, you need a <strong>Premium</strong> or <strong>Lifetime</strong> plan.
                                This gives you full access to manage your listing, reply to reviews, and more.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4 mb-3">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">Popular</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900">Premium Plan</h4>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{'\u20A6'}115,500 <span className="text-sm font-normal text-gray-500">one-time</span></p>
                                        <ul className="mt-3 space-y-1 text-sm text-gray-600">
                                            <li>5 business listings</li>
                                            <li>Claim existing listings</li>
                                            <li>Reply to reviews</li>
                                            <li>Top search placement</li>
                                        </ul>
                                    </div>
                                    <div className="border border-green-300 rounded-lg p-4 bg-green-50">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">Best Value</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900">Lifetime Plan</h4>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{'\u20A6'}198,000 <span className="text-sm font-normal text-gray-500">one-time</span></p>
                                        <ul className="mt-3 space-y-1 text-sm text-gray-600">
                                            <li>Unlimited listings</li>
                                            <li>Claim existing listings</li>
                                            <li>Featured on homepage</li>
                                            <li>Verified badge + priority support</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <Link
                                href="/pricing"
                                className="inline-flex items-center text-green-600 font-medium hover:text-green-700"
                            >
                                View All Plans &rarr;
                            </Link>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold">3</div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Your Listing &amp; Submit a Claim</h3>
                            <p className="text-gray-600 mb-3">
                                Search for your business on 9jaDirectory. On your listing page, click the
                                <strong> &quot;Claim this Business&quot; </strong> button. You will need to provide:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-3">
                                <li><strong>Proof of ownership</strong> &mdash; CAC certificate, business registration, utility bill, or official company letterhead</li>
                                <li><strong>A short note</strong> explaining your role in the business (e.g., &quot;I am the CEO&quot; or &quot;I am the chairman&quot;)</li>
                            </ul>
                            <Link
                                href="/categories"
                                className="inline-flex items-center text-green-600 font-medium hover:text-green-700"
                            >
                                Browse Listings &rarr;
                            </Link>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold">4</div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Reviews &amp; Approves</h3>
                            <p className="text-gray-600 mb-3">
                                Our team will review your proof of ownership within <strong>24 hours</strong>.
                                Once approved, the listing appears in your dashboard and you can start managing it immediately.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* What You Can Do After Claiming */}
            <div className="bg-gray-50 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What You Can Do After Claiming</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        'Edit business name, description, and contact details',
                        'Upload photos and your business logo',
                        'Set your opening hours',
                        'Reply to customer reviews',
                        'View listing analytics and insights',
                        'Promote your listing to featured placement',
                        'Add social media links',
                        'Get a verified badge (Lifetime plan)',
                    ].map((item) => (
                        <div key={item} className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-700 text-sm">{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">How much does it cost to claim my listing?</h3>
                        <p className="text-gray-600">
                            Claiming requires a Premium ({'\u20A6'}115,500) or Lifetime ({'\u20A6'}198,000) plan. These are one-time payments &mdash; no monthly fees.
                            The plan also lets you add new listings, reply to reviews, and get top search placement.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">What proof do I need to provide?</h3>
                        <p className="text-gray-600">
                            Any official document that proves you own or manage the business: CAC registration certificate,
                            business license, utility bill with the business name, or an email from the company&apos;s official domain.
                            We accept PDF, JPG, PNG, and DOC formats.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">How long does approval take?</h3>
                        <p className="text-gray-600">
                            Most claims are reviewed and approved within 24 hours. You will be notified once your claim is processed.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">What if my business is not yet listed?</h3>
                        <p className="text-gray-600">
                            No problem! You can add your business directly.{' '}
                            <Link href="/pricing" className="text-green-600 font-medium hover:underline">Choose a plan</Link>,
                            then use the &quot;Add New Business&quot; form to create your listing from scratch.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Can someone else claim my business?</h3>
                        <p className="text-gray-600">
                            No. Every claim is manually reviewed by our team. We verify the proof of ownership before approving any claim.
                            If a listing is already claimed, we flag it and investigate before making changes.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-green-600 rounded-2xl p-8 text-center text-white">
                <h2 className="text-2xl font-bold mb-3">Ready to Take Control of Your Listing?</h2>
                <p className="text-green-100 mb-6 max-w-lg mx-auto">
                    Join hundreds of Nigerian businesses managing their presence on 9jaDirectory.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/signup"
                        className="inline-flex items-center justify-center px-6 py-3 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-colors"
                    >
                        Create Account
                    </Link>
                    <Link
                        href="/pricing"
                        className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    >
                        View Plans
                    </Link>
                </div>
            </div>

            {/* Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: [
                            {
                                '@type': 'Question',
                                name: 'How much does it cost to claim my business listing on 9jaDirectory?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Claiming requires a Premium (\u20A6115,500) or Lifetime (\u20A6198,000) plan. These are one-time payments with no monthly fees.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'What proof do I need to claim my business on 9jaDirectory?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Any official document that proves you own or manage the business: CAC registration certificate, business license, utility bill with the business name, or an email from the company\'s official domain.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'How long does claim approval take on 9jaDirectory?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Most claims are reviewed and approved within 24 hours.',
                                },
                            },
                        ],
                    }),
                }}
            />
        </div>
    )
}
