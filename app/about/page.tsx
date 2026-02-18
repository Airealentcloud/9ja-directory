import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Shield, MapPin, Search, LayoutGrid, Smartphone, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org'

export const metadata: Metadata = {
  title: 'About Us | Nigeria Premier Business Directory | 9jaDirectory',
  description: 'Learn about 9jaDirectory - Nigeria most comprehensive business directory connecting millions of users with verified businesses across all 36 states + FCT. Trusted reviews, nationwide coverage, and transparent listing plans.',
  keywords: 'about 9jaDirectory, Nigeria business directory, Nigerian business listings, verified businesses Nigeria, business directory Lagos, Abuja business listings, trusted Nigerian directory',
  openGraph: {
    title: 'About 9jaDirectory - Nigeria Leading Business Directory',
    description: 'Connecting Nigerians with trusted businesses across all 36 states since 2025',
    url: `${siteUrl}/about`,
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
    title: 'About 9jaDirectory',
    description: 'Nigeria most comprehensive business directory',
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: `${siteUrl}/about`,
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

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${siteUrl}/about` },
    ],
  }

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '9jaDirectory',
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
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
    url: `${siteUrl}/about`,
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
        name: 'Do I need a plan to list my business on 9jaDirectory?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. To publish a business listing, choose a plan and complete payment. This keeps listings verified and helps us maintain quality and visibility for businesses.',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
                  <CheckCircle className="text-green-600 mr-3 shrink-0" size={24} />
                  Transparent Listing Plans
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We offer transparent plans so businesses can choose the right level of visibility and support.
                  Every plan includes verified profiles and nationwide exposure across Nigeria.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <Shield className="text-green-600 mr-3 shrink-0" size={24} />
                  Verified Business Profiles
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Every business on 9jaDirectory undergoes verification to ensure authenticity and reliability.
                  Our {(verifiedBusinesses || 0).toLocaleString()}+ verified businesses give users confidence in their choices.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <MapPin className="text-green-600 mr-3 shrink-0" size={24} />
                  All 37 Nigerian States Coverage
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  From Lagos to Sokoto, Calabar to Kebbi - we cover every state in Nigeria. Find businesses in
                  major cities, state capitals, and local communities across the country.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <Search className="text-green-600 mr-3 shrink-0" size={24} />
                  Easy Search and Discovery
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Our intuitive search makes it easy to find exactly what you need. Filter by category, location,
                  verification status, and more to discover the perfect business for your needs.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <LayoutGrid className="text-green-600 mr-3 shrink-0" size={24} />
                  {(totalCategories || 0)}+ Business Categories
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  From restaurants and hotels to healthcare, education, real estate, and professional services -
                  our comprehensive category system covers every industry and sector in Nigeria.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <Smartphone className="text-green-600 mr-3 shrink-0" size={24} />
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Who We Are</h2>
            <p className="text-gray-600 mb-8">The team behind 9jaDirectory</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl mb-4">
                  IA
                </div>
                <h3 className="text-lg font-bold text-gray-900">Israel Akhas</h3>
                <p className="text-sm text-green-600 font-medium mb-2">Founder & CEO</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Digital entrepreneur with experience building online platforms for Nigerian SMEs. Passionate about connecting local businesses with customers nationwide.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl mb-4">
                  ET
                </div>
                <h3 className="text-lg font-bold text-gray-900">Editorial Team</h3>
                <p className="text-sm text-green-600 font-medium mb-2">Content & Research</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  A dedicated team of Nigerian business writers, researchers, and SEO specialists producing in-depth guides for entrepreneurs across all 37 states.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl mb-4">
                  VT
                </div>
                <h3 className="text-lg font-bold text-gray-900">Verification Team</h3>
                <p className="text-sm text-green-600 font-medium mb-2">Quality & Trust</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Our verification specialists review every business listing to ensure accuracy, authenticity, and compliance before it goes live on the platform.
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
                    <td className="px-6 py-4 text-sm text-gray-700">Listing Plans</td>
                    <td className="px-6 py-4 text-center text-green-600 font-bold">Transparent paid plans</td>
                    <td className="px-6 py-4 text-center text-gray-500">Hidden fees or add-ons</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">States Coverage</td>
                    <td className="px-6 py-4 text-center text-green-600 font-bold">All 37 States</td>
                    <td className="px-6 py-4 text-center text-gray-500">Limited (Major cities)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">Business Verification</td>
                    <td className="px-6 py-4 text-center text-green-600 font-bold">Included</td>
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
                <ArrowRight className="text-green-600 mr-3 mt-0.5 shrink-0" size={18} />
                <span>Small businesses in secondary cities like Owerri, Ilorin, Minna, and Ado-Ekiti deserve equal visibility as those in Lagos or Abuja</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="text-green-600 mr-3 mt-0.5 shrink-0" size={18} />
                <span>Nigerian consumers prefer local, trusted businesses they can verify and contact directly</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="text-green-600 mr-3 mt-0.5 shrink-0" size={18} />
                <span>Business owners need affordable, accessible tools to grow their online presence with clear pricing</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="text-green-600 mr-3 mt-0.5 shrink-0" size={18} />
                <span>Every state in Nigeria - from Abia to Zamfara - has valuable businesses that deserve to be discovered</span>
              </li>
            </ul>
            <p className="text-lg text-gray-700 leading-relaxed">
              This commitment drives everything we do at 9jaDirectory, from our transparent pricing to our
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
                  with verified businesses and services across all 36 states plus FCT Abuja. We provide paid listing
                  plans, detailed profiles, customer reviews, and easy search functionality.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Do I need a plan to list my business on 9jaDirectory?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Yes. To publish your listing, choose a plan and complete payment. This ensures verified listings and
                  gives your business the right level of visibility.
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
                  Unlike other directories, 9jaDirectory provides clear pricing, complete coverage of all 37 Nigerian
                  states (not just major cities), verification included with every plan, and a modern, mobile-friendly
                  platform designed specifically for Nigerian users.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-green-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Listed?</h2>
            <p className="text-xl mb-8 text-green-100">
              Join {(totalListings || 10000).toLocaleString()}+ businesses already on 9jaDirectory
            </p>
            <Link
              href="/pricing"
              className="inline-block px-8 py-4 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 text-lg transition-colors"
            >
              Get Listed Today
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
