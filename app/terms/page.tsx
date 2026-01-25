import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://9jadirectory.org'
const lastUpdated = 'January 25, 2026'

export const metadata: Metadata = {
  title: 'Terms of Service | 9jaDirectory',
  description: 'Read the 9jaDirectory terms of service and conditions for using our business directory platform.',
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: 'Terms of Service | 9jaDirectory',
    description: 'Terms and conditions for using 9jaDirectory services.',
    url: `${siteUrl}/terms`,
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
    card: 'summary',
    title: 'Terms of Service | 9jaDirectory',
    description: 'Terms and conditions for using 9jaDirectory services.',
    images: ['/opengraph-image'],
  },
}

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    points: [
      'By using 9jaDirectory (the "Service"), you agree to these Terms. If you do not agree, do not use the Service.',
      'These Terms apply in addition to any feature-specific guidelines (e.g., listings, payments).',
    ],
  },
  {
    id: 'service',
    title: '2. Description of Service',
    points: [
      'A business directory with listings, search, reviews, and related tools.',
      'Provided "AS IS" without guarantees of uptime, accuracy, or fitness for a particular purpose.',
    ],
  },
  {
    id: 'conduct',
    title: '3. User Obligations',
    points: [
      'Use the Service lawfully; do not submit false, misleading, infringing, or harmful content.',
      'Do not scrape, spam, or attempt unauthorized access or interference.',
      'Keep account credentials secure and notify us of unauthorized use.',
    ],
  },
  {
    id: 'listings',
    title: '4. Business Listings',
    points: [
      'You are responsible for the accuracy and legality of listing content.',
      'We may edit, suspend, or remove listings that violate policy or law.',
      'Paid/featured placements follow the plan terms shown at checkout or in your order confirmation.',
    ],
  },
  {
    id: 'payments',
    title: '5. Payments & Fees',
    points: [
      'Fees and billing intervals are shown at purchase; taxes may apply.',
      'Except where required by law, fees are non-refundable once services begin.',
      'Failed or disputed payments may lead to suspension of listings or services.',
    ],
  },
  {
    id: 'privacy',
    title: '6. Privacy',
    points: [
      'Your use is governed by our Privacy Policy, which explains how we collect and use data.',
      'By using the Service, you consent to the practices described in the Privacy Policy.',
    ],
  },
  {
    id: 'ip',
    title: '7. Intellectual Property',
    points: [
      'All trademarks, logos, and content on the Service belong to 9jaDirectory or its licensors.',
      'You may not copy, modify, or distribute content without written consent.',
    ],
  },
  {
    id: 'disclaimer',
    title: '8. Disclaimers & Liability',
    points: [
      'The Service is provided "AS IS" without warranties of any kind.',
      'To the fullest extent permitted by law, 9jaDirectory is not liable for indirect, incidental, or consequential damages.',
    ],
  },
  {
    id: 'changes',
    title: '9. Changes to Terms',
    points: [
      'We may update these Terms; the effective date is shown above.',
      'Continued use after updates means you accept the revised Terms.',
    ],
  },
  {
    id: 'contact',
    title: '10. Contact',
    points: ['Questions about these Terms? Email support@9jadirectory.org.'],
  },
]

export default function TermsPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: `${siteUrl}/terms` },
    ],
  }

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': ['WebPage', 'TermsOfService'],
    '@id': `${siteUrl}/terms#page`,
    name: 'Terms of Service',
    url: `${siteUrl}/terms`,
    description: 'Terms and conditions for using 9jaDirectory services.',
    inLanguage: 'en-NG',
    isPartOf: { '@type': 'WebSite', '@id': `${siteUrl}#website` },
    publisher: { '@type': 'Organization', '@id': `${siteUrl}#organization` },
    dateModified: lastUpdated,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-600 mb-6">Last updated: {lastUpdated}</p>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800 mb-8 space-y-3">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Highlights</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use 9jaDirectory responsibly and lawfully.</li>
                <li>You are responsible for the accuracy of your listings and payments.</li>
                <li>The Service is provided "AS IS"; see limits on liability below.</li>
                <li>Privacy practices are covered in our Privacy Policy.</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Contents</p>
              <div className="flex flex-wrap gap-3">
                {sections.map((section) => (
                  <a key={section.id} href={`#${section.id}`} className="text-green-700 hover:underline">
                    {section.title}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8 text-gray-700">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
