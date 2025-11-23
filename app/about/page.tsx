import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'About Us | Nigeria Premier Business Directory | 9jaDirectory',
  description: 'Learn about 9jaDirectory - Nigeria most comprehensive business directory connecting millions of users with verified businesses across all 36 states + FCT. Free listings, trusted reviews, nationwide coverage.',
  keywords: 'about 9jaDirectory, Nigeria business directory, Nigerian business listings, verified businesses Nigeria, business directory Lagos, Abuja business listings, trusted Nigerian directory',
  openGraph: {
    title: 'About 9jaDirectory - Nigeria Leading Business Directory',
    description: 'Connecting Nigerians with trusted businesses across all 36 states since 2025',
    url: 'https://9jadirectory.org/about',
    siteName: '9jaDirectory',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About 9jaDirectory',
    description: 'Nigeria most comprehensive business directory',
  },
  alternates: {
    canonical: 'https://9jadirectory.org/about',
  },
}

export default async function AboutPage() {
  const supabase = await createClient()

  const { count: totalListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { count: totalCategories } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })

  const { count: verifiedBusinesses } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .eq('verified', true)

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '9jaDirectory',
    url: 'https://9jadirectory.org',
    logo: 'https://9jadirectory.org/logo.png',
    description: 'Nigeria most comprehensive business directory platform',
    areaServed: {
      '@type': 'Country',
      name: 'Nigeria',
    },
    knowsAbout: [
      'Business Directory',
      'Nigerian Businesses',
      'Local Services',
      'Business Listings',
      'Service Providers Nigeria'
    ],
  }

  const aboutPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About 9jaDirectory',
    description: 'Learn about Nigeria premier business directory platform',
    url: 'https://9jadirectory.org/about',
    mainEntity: {
      '@type': 'Organization',
      name: '9jaDirectory',
    },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is 9jaDirectory?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '9jaDirectory is Nigeria most comprehensive online business directory, connecting millions of users with verified businesses and services across all 36 states plus FCT Abuja.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is it free to list my business on 9jaDirectory?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! We offer free business listings to help Nigerian businesses grow their online presence and reach more customers nationwide.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many businesses are listed on 9jaDirectory?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `9jaDirectory currently features ${totalListings || 10000}+ verified business listings across ${totalCategories || 50}+ categories, covering all 37 Nigerian states.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Which states does 9jaDirectory cover?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '9jaDirectory covers all 36 Nigerian states plus FCT Abuja, including Lagos, Kano, Rivers, Kaduna, Oyo, Anambra, Delta, Edo, and all other states.',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center text-sm mb-4 text-green-100">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">About Us</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About 9jaDirectory
            </h1>
            <p className="text-xl text-green-100 max-w-3xl">
              Nigeria most trusted and comprehensive business directory platform
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {(totalListings || 0).toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium">Verified Businesses</div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">37</div>
              <div className="text-gray-600 font-medium">States Covered</div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {(totalCategories || 0).toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium">Business Categories</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              At <strong>9jaDirectory</strong>, we are on a mission to transform how Nigerians discover and connect with local businesses and services.
              We believe every business deserves visibility, and every Nigerian deserves easy access to trusted, verified service providers
              across all 36 states plus FCT Abuja.
            </p>
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              Unlike traditional business directories that focus only on major cities like Lagos and Abuja, <strong>9jaDirectory provides
                comprehensive nationwide coverage</strong>, ensuring businesses in Port Harcourt, Kano, Ibadan, Enugu, Kaduna, Jos,
              Calabar, Benin City, and every corner of Nigeria can reach their target audience.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Why Choose 9jaDirectory?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <span className="text-green-600 text-2xl mr-3">Check Mark</span>
                  100% Free Business Listings
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Unlike other Nigerian directories that charge listing fees, 9jaDirectory offers completely free business
                  listings to all Nigerian businesses. We believe in democratizing access to online visibility.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <span className="text-green-600 text-2xl mr-3">Shield</span>
                  Verified Business Profiles
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Every business on 9jaDirectory undergoes verification to ensure authenticity and reliability.
                  Our {(verifiedBusinesses || 0).toLocaleString()}+ verified businesses give users confidence in their choices.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <span className="text-green-600 text-2xl mr-3">Map</span>
                  All 37 Nigerian States Coverage
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  From Lagos to Sokoto, Calabar to Kebbi - we cover every state in Nigeria. Find businesses in
                  major cities, state capitals, and local communities across the country.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <span className="text-green-600 text-2xl mr-3">Search</span>
                  Easy Search and Discovery
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Our intuitive search makes it easy to find exactly what you need. Filter by category, location,
                  verification status, and more to discover the perfect business for your needs.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <span className="text-green-600 text-2xl mr-3">Categories</span>
                  {(totalCategories || 0)}+ Business Categories
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  From restaurants and hotels to healthcare, education, real estate, and professional services -
                  our comprehensive category system covers every industry and sector in Nigeria.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <span className="text-green-600 text-2xl mr-3">Mobile</span>
                  Mobile-Friendly Platform
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Access 9jaDirectory seamlessly on any device - smartphone, tablet, or desktop.
                  Find businesses on the go with our responsive, fast-loading platform.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              How We Compare to Other Nigerian Directories
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-green-600">9jaDirectory</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Other Directories</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">Free Business Listings</td>
                    <td className="px-6 py-4 text-center text-green-600 font-bold">Yes</td>
                    <td className="px-6 py-4 text-center text-gray-500">Paid (N12,000+/year)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">States Coverage</td>
                    <td className="px-6 py-4 text-center text-green-600 font-bold">All 37 States</td>
                    <td className="px-6 py-4 text-center text-gray-500">Limited (Major cities)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">Business Verification</td>
                    <td className="px-6 py-4 text-center text-green-600 font-bold">Free Verification</td>
                    <td className="px-6 py-4 text-center text-gray-500">Premium only</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">Mobile Experience</td>
                    <td className="px-6 py-4 text-center text-green-600 font-bold">Fully Responsive</td>
                    <td className="px-6 py-4 text-center text-gray-500">Limited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">Search Functionality</td>
                    <td className="px-6 py-4 text-center text-green-600 font-bold">Advanced Filters</td>
                    <td className="px-6 py-4 text-center text-gray-500">Basic</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Commitment to Nigerian Businesses
            </h2>
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              <strong>9jaDirectory</strong> was built specifically for the Nigerian market, understanding the unique challenges
              and opportunities that businesses face across different regions. We recognize that:
            </p>
            <ul className="space-y-3 text-gray-700 mb-6">
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-3">Arrow</span>
                <span>Small businesses in secondary cities like Owerri, Ilorin, Minna, and Ado-Ekiti deserve equal visibility as those in Lagos or Abuja</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-3">Arrow</span>
                <span>Nigerian consumers prefer local, trusted businesses they can verify and contact directly</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-3">Arrow</span>
                <span>Business owners need free, accessible tools to grow their online presence without expensive fees</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-3">Arrow</span>
                <span>Every state in Nigeria - from Abia to Zamfara - has valuable businesses that deserve to be discovered</span>
              </li>
            </ul>
            <p className="text-lg text-gray-700 leading-relaxed">
              This commitment drives everything we do at 9jaDirectory, from our free listing policy to our
              comprehensive state-by-state coverage and rigorous verification process.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  What is 9jaDirectory?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  9jaDirectory is Nigeria most comprehensive online business directory, connecting millions of users
                  with verified businesses and services across all 36 states plus FCT Abuja. We provide free business
                  listings, detailed profiles, customer reviews, and easy search functionality.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Is it free to list my business on 9jaDirectory?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Yes! We offer completely free business listings to all Nigerian businesses. Unlike other directories
                  that charge N12,000 or more per year, 9jaDirectory provides free visibility to help your business grow.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  How many businesses are listed on 9jaDirectory?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  9jaDirectory currently features {(totalListings || 10000).toLocaleString()}+ verified business listings
                  across {(totalCategories || 50).toLocaleString()}+ categories, covering all 37 Nigerian states from Lagos
                  to Sokoto, Port Harcourt to Maiduguri.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Which states does 9jaDirectory cover?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We cover all 36 Nigerian states plus FCT Abuja: Abia, Adamawa, Akwa Ibom, Anambra, Bauchi, Bayelsa,
                  Benue, Borno, Cross River, Delta, Ebonyi, Edo, Ekiti, Enugu, Gombe, Imo, Jigawa, Kaduna, Kano, Katsina,
                  Kebbi, Kogi, Kwara, Lagos, Nasarawa, Niger, Ogun, Ondo, Osun, Oyo, Plateau, Rivers, Sokoto, Taraba,
                  Yobe, Zamfara, and FCT Abuja.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  How do I get my business verified?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  After listing your business, our verification team will review your information. Verified businesses
                  receive a special badge that builds trust with customers and improves visibility in search results.
                  Verification is completely free.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  How is 9jaDirectory different from VConnect or YelloPages Nigeria?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Unlike other directories, 9jaDirectory offers 100% free listings with no annual fees. We provide complete
                  coverage of all 37 Nigerian states (not just major cities), free verification for all businesses, and a
                  modern, mobile-friendly platform designed specifically for Nigerian users.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-green-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to List Your Business?</h2>
            <p className="text-xl mb-8 text-green-100">
              Join {(totalListings || 10000).toLocaleString()}+ businesses already on 9jaDirectory
            </p>
            <Link
              href="/add-business"
              className="inline-block px-8 py-4 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 text-lg transition-colors"
            >
              List Your Business - Free Forever
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
