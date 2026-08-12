import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo/site-url'

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

export const authors: Record<string, {
  name: string
  role: string
  bio: string
  expertise: string[]
  initials: string
  color: string
}> = {
  'Israel Akhas': {
    name: 'Israel Akhas',
    role: 'Founder & CEO',
    bio: 'Israel founded 9jaDirectory to help Nigerian SMEs gain online visibility across all 36 states. He has spent years building digital platforms for Nigerian businesses and writes on entrepreneurship, business strategy, and digital growth.',
    expertise: ['Business Strategy', 'Digital Marketing', 'Nigerian SMEs', 'Entrepreneurship'],
    initials: 'IA',
    color: 'bg-green-600',
  },
  'Sarah Adebayo': {
    name: 'Sarah Adebayo',
    role: 'Senior Business Writer',
    bio: 'Sarah covers business registration, compliance, and regulatory topics for Nigerian entrepreneurs. She has a background in law and business administration, with a focus on CAC registration, NAFDAC, and SCUML processes.',
    expertise: ['Business Registration', 'Legal Compliance', 'CAC', 'NAFDAC', 'Regulatory Affairs'],
    initials: 'SA',
    color: 'bg-blue-600',
  },
  'Tunde Bakare': {
    name: 'Tunde Bakare',
    role: 'Finance & Investment Writer',
    bio: 'Tunde writes about SME finance, investment opportunities, and banking products for Nigerian businesses. He covers topics including business loans, grants, payment gateways, and fintech solutions relevant to Nigerian entrepreneurs.',
    expertise: ['SME Finance', 'Investment', 'Banking', 'Fintech Nigeria', 'Business Loans'],
    initials: 'TB',
    color: 'bg-purple-600',
  },
  'Ngozi Uche': {
    name: 'Ngozi Uche',
    role: 'Marketing & SEO Specialist',
    bio: 'Ngozi specialises in digital marketing, local SEO, and business visibility strategies for Nigerian companies. She writes guides on social media marketing, Google Business Profile, and customer acquisition for Nigerian SMEs.',
    expertise: ['Digital Marketing', 'Local SEO', 'Social Media', 'Business Listings', 'Google Maps'],
    initials: 'NU',
    color: 'bg-orange-600',
  },
  'Emmanuel Kalu': {
    name: 'Emmanuel Kalu',
    role: 'Technology Writer',
    bio: 'Emmanuel covers technology topics for Nigerian businesses, including web hosting, e-commerce platforms, payment solutions, and digital tools. He focuses on practical technology adoption for small and medium enterprises in Nigeria.',
    expertise: ['Web Hosting', 'E-commerce', 'Business Technology', 'Payment Solutions', 'Digital Tools'],
    initials: 'EK',
    color: 'bg-teal-600',
  },
  'Musa Ibrahim': {
    name: 'Musa Ibrahim',
    role: 'Business Guide Writer',
    bio: 'Musa produces practical step-by-step guides for starting and growing businesses in Nigeria. He focuses on agriculture, logistics, retail, and import/export sectors, drawing on his experience advising Nigerian SMEs in the northern states.',
    expertise: ['Agriculture Business', 'Logistics', 'Import/Export', 'Retail', 'Northern Nigeria Markets'],
    initials: 'MI',
    color: 'bg-amber-600',
  },
  'Chinyere Okeke': {
    name: 'Chinyere Okeke',
    role: 'Legal & Compliance Writer',
    bio: 'Chinyere writes about business law, regulatory compliance, and legal requirements for Nigerian companies. She covers topics including CAC registration, tax obligations, intellectual property, and business licensing across Nigerian states.',
    expertise: ['Business Law', 'Tax Compliance', 'CAC Registration', 'Intellectual Property', 'Regulatory Compliance'],
    initials: 'CO',
    color: 'bg-red-600',
  },
  'Chinedu Okonkwo': {
    name: 'Chinedu Okonkwo',
    role: 'Real Estate & Property Writer',
    bio: 'Chinedu covers real estate, property investment, and the Nigerian housing market. He writes in-depth guides on buying, renting, and investing in property across Lagos, Abuja, Port Harcourt, and other major Nigerian cities.',
    expertise: ['Real Estate Nigeria', 'Property Investment', 'Lagos Property', 'Abuja Real Estate', 'Housing Market'],
    initials: 'CO',
    color: 'bg-indigo-600',
  },
  '9jaDirectory Editorial Team': {
    name: '9jaDirectory Editorial Team',
    role: 'Editorial Team',
    bio: 'The 9jaDirectory editorial team produces business guides, directory resources, and research-backed articles for Nigerian entrepreneurs and consumers. Our writers combine local market expertise with practical knowledge of Nigerian business regulations and opportunities.',
    expertise: ['Nigerian Business', 'SME Guides', 'Business Directory', 'Local Services', 'Entrepreneurship'],
    initials: '9J',
    color: 'bg-green-700',
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
