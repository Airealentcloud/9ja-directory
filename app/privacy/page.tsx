import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org'
const lastUpdated = 'January 25, 2026'

export const metadata: Metadata = {
  title: 'Privacy Policy | 9jaDirectory',
  description:
    'Read the 9jaDirectory privacy policy to learn how we collect, use, and protect your data when you use our platform.',
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy | 9jaDirectory',
    description: 'Learn how 9jaDirectory collects, uses, and protects your data.',
    url: `${siteUrl}/privacy`,
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
    title: 'Privacy Policy | 9jaDirectory',
    description: 'Learn how 9jaDirectory collects, uses, and protects your data.',
    images: ['/opengraph-image'],
  },
}

const sections = [
  {
    id: 'overview',
    title: '1. Overview',
    points: [
      'This Privacy Policy explains how 9jaDirectory collects, uses, and protects your data when you use our services.',
      'By using the Service, you consent to the practices described here.',
    ],
  },
  {
    id: 'data-we-collect',
    title: '2. Data We Collect',
    points: [
      'Identity data: name, business name, and similar identifiers.',
      'Contact data: email address, phone number.',
      'Usage and technical data: IP address, device/browser details, pages visited, interactions.',
      'Content data: listing details, reviews, and materials you submit.',
    ],
  },
  {
    id: 'how-we-use-data',
    title: '3. How We Use Data',
    points: [
      'Provide and improve the Service (listings, search, reviews, support).',
      'Process payments and manage subscriptions or purchases.',
      'Prevent fraud, abuse, and enforce our Terms of Service.',
      'Communicate with you about updates, support, or marketing (where permitted).',
    ],
  },
  {
    id: 'legal-bases',
    title: '4. Legal Bases for Processing',
    points: [
      'Performance of a contract (delivering listings or purchased services).',
      'Legitimate interests (improving and securing the Service).',
      'Consent (where required for marketing or certain cookies).',
      'Compliance with legal obligations.',
    ],
  },
  {
    id: 'sharing',
    title: '5. Sharing and Disclosure',
    points: [
      'Service providers (payments, hosting, analytics) under confidentiality obligations.',
      'When required by law or to protect rights, safety, and security.',
      'With your direction (e.g., publishing listings, sharing logos for "As Seen On").',
    ],
  },
  {
    id: 'data-security',
    title: '6. Data Security',
    points: [
      'We use technical and organizational measures to protect data.',
      'Access to personal data is limited to personnel and partners with a business need.',
      'No method of transmission or storage is 100% secure; residual risk remains.',
    ],
  },
  {
    id: 'retention',
    title: '7. Data Retention',
    points: [
      'We retain data as long as necessary to provide the Service and for legitimate business or legal purposes.',
      'We may anonymize data for analytics after it is no longer needed in identifiable form.',
    ],
  },
  {
    id: 'your-rights',
    title: '8. Your Choices and Rights',
    points: [
      'Update or delete your listing/account information by contacting support.',
      'Opt out of marketing emails using unsubscribe links.',
      'Control cookies via browser settings (which may affect functionality).',
    ],
  },
  {
    id: 'third-parties',
    title: '9. Third-Party Links and Services',
    points: [
      'The Service may link to third-party sites or embeds. Their privacy practices apply to your use of those services.',
    ],
  },
  {
    id: 'changes',
    title: '10. Changes to This Policy',
    points: [
      'We may update this Privacy Policy; the effective date is shown above.',
      'Continued use after updates signifies acceptance of the revised Policy.',
    ],
  },
  {
    id: 'contact',
    title: '11. Contact',
    points: ['Questions or requests? Email support@9jadirectory.org.'],
  },
]

export default function PrivacyPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: `${siteUrl}/privacy` },
    ],
  }

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': ['WebPage', 'PrivacyPolicy'],
    '@id': `${siteUrl}/privacy#page`,
    name: 'Privacy Policy',
    url: `${siteUrl}/privacy`,
    description: 'Privacy policy and data protection information for 9jaDirectory users.',
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-6">Last updated: {lastUpdated}</p>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800 mb-8 space-y-3">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Highlights</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>We collect identity, contact, usage, and listing content to operate the Service.</li>
                <li>We use data to provide, secure, and improve listings, payments, and support.</li>
                <li>We share data with service providers and when required by law.</li>
                <li>You can update data, opt out of marketing, and control cookies via browser settings.</li>
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
