import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo/site-url'
import { authors } from '@/lib/authors'

const siteUrl = SITE_URL

export const metadata: Metadata = {
  title: 'Our Team | 9jaDirectory',
  description: 'Meet the editorial team behind 9jaDirectory — Nigeria business writers, legal researchers, and fintech analysts producing in-depth guides for Nigerian entrepreneurs.',
  alternates: { canonical: `${siteUrl}/team` },
  openGraph: {
    title: 'Our Team | 9jaDirectory',
    description: 'Meet the editorial team behind 9jaDirectory.',
    url: `${siteUrl}/team`,
    siteName: '9jaDirectory',
    locale: 'en_NG',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: '9jaDirectory' }],
  },
}

export default function TeamPage() {
  const teamMembers = Object.values(authors).filter(a => a.name !== '9jaDirectory Editorial Team')

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Our Team', item: `${siteUrl}/team` },
    ],
  }

  const teamSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Our Team | 9jaDirectory',
    url: `${siteUrl}/team`,
    description: 'Meet the editorial team behind 9jaDirectory',
    mainEntity: {
      '@type': 'Organization',
      name: '9jaDirectory',
      url: siteUrl,
      member: teamMembers.map(member => ({
        '@type': 'Person',
        name: member.name,
        jobTitle: member.role,
        description: member.bio,
        worksFor: { '@type': 'Organization', name: '9jaDirectory' },
      })),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(teamSchema) }} />

      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center text-sm mb-4 text-green-100">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white">Our Team</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Editorial Team</h1>
            <p className="text-xl text-green-100 max-w-3xl">
              Nigerian business writers, legal researchers, and industry specialists producing practical guides for entrepreneurs across all 37 states.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-white rounded-lg shadow-md p-8">
                <div className="flex items-start gap-5">
                  <div className={`w-16 h-16 rounded-full ${member.color} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                    {member.initials}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">{member.name}</h2>
                    <p className="text-green-600 font-medium text-sm mb-3">{member.role}</p>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">{member.bio}</p>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((topic) => (
                        <span key={topic} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Editorial Standards</h2>
            <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
              All 9jaDirectory content is written by Nigerian business specialists with direct knowledge of the topics they cover.
              Articles are reviewed for accuracy against current Nigerian regulations, market conditions, and business practices
              before publication. We do not accept payment for editorial rankings or recommendations.
            </p>
            <Link href="/blog" className="mt-6 inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
              Read Our Guides
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
