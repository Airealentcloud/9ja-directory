import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ShoppingCart, MessageCircle, Mail, ArrowLeft } from 'lucide-react'

type PageConfig = {
  slug: string
  title: string
  price: string
  releases?: string
  delivery?: string
  summary: string
  includes: string[]
  outcomes?: string[]
  needs?: string[]
  sampleImage?: string
  sampleNote?: string
  whatsapp?: string
  emailSubject?: string
}

const baseWhatsApp = 'https://wa.me/2349160023442?text='

const pages: Record<string, PageConfig> = {
  starter: {
    slug: 'starter',
    title: 'Starter Press Release',
    price: 'NGN 120,000',
    releases: '10 press releases',
    delivery: 'Publish in 6-24 hours',
    summary:
      'For new brands that need fast visibility. We write it, publish it on 10+ outlets, and send proof links you can use as "As Seen On".',
    includes: [
      'Distribution to 10+ outlets',
      'Write-up included (up to 700 words)',
      'Proof of publication links',
      'Use of "As Seen On" logos',
      'Standard support',
    ],
    outcomes: [
      '10 live publications across regional and niche outlets',
      'SEO-friendly backlinks to your site',
      'Publication-ready copy (headline, body, quote, boilerplate)',
    ],
    needs: ['Company name, URL, and contact', 'Key announcement details (what, who, where, when)', 'Optional quote and logo/image'],
    sampleImage: '/images/press-starter-logos-20250125.png',
    sampleNote: 'Representative mix similar to the provided screenshot. Final outlet mix may vary; we guarantee 10 live publications.',
    whatsapp: baseWhatsApp + encodeURIComponent('Hi 9jaDirectory, I want the Starter press release package (10 publications for NGN 120,000).'),
    emailSubject: 'Starter Press Release Order',
  },
  growth: {
    slug: 'growth',
    title: 'Growth Press Release',
    price: 'NGN 225,000',
    releases: '30 press releases',
    delivery: 'Publish in 6-24 hours',
    summary: 'Priority placement in Nigerian outlets with light editorial review and two revision cycles.',
    includes: [
      'Priority placement in Nigerian outlets',
      'Includes write-up and 2 revision cycles',
      'Proof links and "As Seen On" usage',
      'Standard support',
    ],
    outcomes: ['30 publications with proof links', 'Optimized headlines and SEO keywords'],
    needs: ['Company and story details', 'Preferred outlets (if any)', 'Brand assets (logo/image)'],
    sampleNote: 'We prioritize tech and national outlets; final mix confirmed after brief.',
    whatsapp: baseWhatsApp + encodeURIComponent('Hi 9jaDirectory, I want the Growth press release package (30 publications for NGN 225,000).'),
    emailSubject: 'Growth Press Release Order',
  },
  business: {
    slug: 'business',
    title: 'Business Press Release',
    price: 'NGN 350,000',
    releases: '80 press releases',
    delivery: 'Publish in 2-7 days',
    summary: 'National business media emphasis with SEO optimization and coordination support.',
    includes: [
      'National business media focus',
      'SEO keyword optimization',
      'Account coordinator',
      'Proof links and "As Seen On" usage',
    ],
    outcomes: ['80 publications with proof links', 'SEO-tuned copy and headlines'],
    needs: ['Company profile and sector', 'Key angles and timing', 'Logo and any photos'],
    sampleNote: 'Outlet mix tailored to your sector; proof links shared on delivery.',
    whatsapp: baseWhatsApp + encodeURIComponent('Hi 9jaDirectory, I want the Business press release package (80 publications for NGN 350,000).'),
    emailSubject: 'Business Press Release Order',
  },
  enterprise: {
    slug: 'enterprise',
    title: 'Enterprise Press Release',
    price: 'NGN 500,000',
    releases: '300 press releases',
    delivery: 'Publish in 2-7 days',
    summary: 'Enterprise reach with international outlet mix and dedicated account management.',
    includes: [
      'International outlet mix (Forbes, Reuters, Entrepreneur)',
      'Launch calendar planning',
      'Dedicated account manager',
      'Proof links and "As Seen On" usage',
    ],
    outcomes: ['300 publications with proof links', 'Coordinated multi-drop campaigns'],
    needs: ['Launch calendar', 'Exec quotes and media kit', 'Target markets and outlets'],
    sampleNote: 'International + national mix confirmed after scoping call.',
    whatsapp: baseWhatsApp + encodeURIComponent('Hi 9jaDirectory, I want the Enterprise press release package (300 publications for NGN 500,000).'),
    emailSubject: 'Enterprise Press Release Order',
  },
  'bundle-starter': {
    slug: 'bundle-starter',
    title: 'Starter Bundle',
    price: 'NGN 228,500/year',
    summary: 'Basic listings + 10 press releases for new businesses.',
    includes: [
      '9jaDirectory Basic Listing (NGN 38,500)',
      'MyNigeriaBusiness Standard (NGN 70,000)',
      '10 Press Releases (NGN 120,000)',
      'Priority listing setup and proof links',
    ],
    outcomes: ['Live listings on both directories', '10 publications with proof links'],
    needs: ['Business profile and contacts', 'Logo and photos', 'Key announcement details'],
    sampleNote: 'Listings go live with press proof for "As Seen On".',
    whatsapp: baseWhatsApp + encodeURIComponent('Hi 9jaDirectory, I want the Starter Bundle (NGN 228,500/year).'),
    emailSubject: 'Starter Bundle Order',
  },
  'bundle-growth': {
    slug: 'bundle-growth',
    title: 'Growth Bundle',
    price: 'NGN 520,500/year',
    summary: 'Featured listings + 30 press releases; most popular bundle.',
    includes: [
      '9jaDirectory Featured Listing (NGN 115,500)',
      'MyNigeriaBusiness Featured (NGN 180,000)',
      '30 Press Releases (NGN 225,000)',
      'Priority homepage placement on both directories',
    ],
    outcomes: ['Featured placement + 30 publications', 'Proof links for "As Seen On"'],
    needs: ['Business profile and keywords', 'Logo/photos', 'Announcement details'],
    sampleNote: 'Homepage boost plus guaranteed press proof.',
    whatsapp: baseWhatsApp + encodeURIComponent('Hi 9jaDirectory, I want the Growth Bundle (NGN 520,500/year).'),
    emailSubject: 'Growth Bundle Order',
  },
  'bundle-premium': {
    slug: 'bundle-premium',
    title: 'Premium Bundle',
    price: 'NGN 948,000/year',
    summary: 'Premium listings + 300 press releases with sector features.',
    includes: [
      '9jaDirectory Premium Listing (NGN 198,000)',
      'MyNigeriaBusiness Premium/Sector (NGN 250,000)',
      '300 Press Releases (NGN 500,000)',
      'Sector page feature + dedicated account manager',
    ],
    outcomes: ['Premium placement + 300 publications', 'Dedicated manager and proof links'],
    needs: ['Sector focus and targets', 'Media kit', 'Launch schedule'],
    sampleNote: 'Sector placement plus large-scale press rollout.',
    whatsapp: baseWhatsApp + encodeURIComponent('Hi 9jaDirectory, I want the Premium Bundle (NGN 948,000/year).'),
    emailSubject: 'Premium Bundle Order',
  },
  'reputation-defend': {
    slug: 'reputation-defend',
    title: 'Reputation Defend',
    price: 'NGN 1,200,000',
    summary: 'Baseline protection with verified reviews and 300 press placements.',
    includes: [
      '20 verified human reviews (Google, Facebook, Trustpilot)',
      '300 press release placements over 12 months',
      'Featured on 9jaDirectory + MyNigeriaBusiness listings',
      'APNews, Benzinga, TheGlobeandMail, Barchart, TV & Radio station sites + 350 downstream sites',
      'Add-on: USAToday.com availability',
    ],
    needs: ['Brand profiles and existing links', 'Priority keywords and disputes', 'Logo and review links (if any)'],
    sampleNote: 'We provide proof links for all placements and verified reviews.',
    whatsapp: baseWhatsApp + encodeURIComponent('Hi 9jaDirectory, I want the Reputation Defend program (NGN 1,200,000).'),
    emailSubject: 'Reputation Defend Order',
  },
  'reputation-command': {
    slug: 'reputation-command',
    title: 'Reputation Command',
    price: 'NGN 2,200,000',
    summary: 'Proactive authority building with directory reach and premium PR.',
    includes: [
      '30+ verified reviews per quarter',
      '300 press releases plus SEO content sprints',
      'Published and boosted on 9jaDirectory + MyNigeriaBusiness',
      '1 Premium PR Distribution: APNews, Benzinga, TheGlobeandMail, Barchart, TV & Radio station sites + 350 downstream sites',
      'Add-on: USAToday.com availability',
    ],
    needs: ['Brand assets and KPIs', 'Priority outlets and disputes', 'Launch calendar'],
    sampleNote: 'Quarterly reporting with proof links and review verification.',
    whatsapp: baseWhatsApp + encodeURIComponent('Hi 9jaDirectory, I want the Reputation Command program (NGN 2,200,000).'),
    emailSubject: 'Reputation Command Order',
  },
  'reputation-elite': {
    slug: 'reputation-elite',
    title: 'Reputation Elite',
    price: 'NGN 5,600,000',
    summary: 'Enterprise-grade credibility with 100 reviews, 500 PR placements, and premium distributions.',
    includes: [
      '100 verified human reviews',
      '500 press release placements across international + local outlets',
      'Premium placement on 9jaDirectory + MyNigeriaBusiness',
      '20 Premium PR Distributions: APNews, Benzinga, TheGlobeandMail, Barchart, TV & Radio station sites + 350 downstream sites',
      '50 Nigerian news platforms secured with social media posts',
      'Add-on: USAToday.com availability',
    ],
    needs: ['Executive media kit', 'Priority markets/outlets', 'Crisis/escalation contacts'],
    sampleNote: 'International + Nigerian media mix with proof for every placement and review.',
    whatsapp: baseWhatsApp + encodeURIComponent('Hi 9jaDirectory, I want the Reputation Elite program (NGN 5,600,000).'),
    emailSubject: 'Reputation Elite Order',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = pages[slug]
  if (!page) return {}
  return {
    title: `${page.title} | 9jaDirectory`,
    description: page.summary,
  }
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = pages[slug]
  if (!page) {
    notFound()
  }

  return (
    <div className="bg-gray-50">
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-green-700">{page.title}</p>
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">{page.summary}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
              <span>{page.delivery ?? 'Fast onboarding'}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/press-release/checkout?package=${page.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white font-semibold shadow-sm hover:bg-green-700"
              >
                <ShoppingCart className="w-5 h-5" />
                Proceed to Checkout
              </Link>
              {page.whatsapp && (
                <a
                  href={page.whatsapp}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-white px-5 py-3 text-green-700 font-semibold hover:border-green-300"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              )}
              <Link
                href="/press-release"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-800 font-semibold hover:border-gray-300"
              >
                <ArrowLeft className="w-4 h-4" />
                All packages
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-green-700 font-semibold">{page.title}</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{page.price}</h2>
                {page.releases && <p className="text-sm text-gray-600">{page.releases}</p>}
              </div>
              {page.delivery && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  {page.delivery}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">What you get</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {page.includes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-green-500" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {page.outcomes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Deliverables</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {page.outcomes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-green-500" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {page.needs && (
              <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-900">What we need from you</h4>
                <ul className="mt-2 space-y-2 text-sm text-gray-700">
                  {page.needs.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-green-500" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {(page.sampleImage || page.sampleNote) && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold text-green-700">Sample outlets</p>
              <h3 className="text-2xl font-bold text-gray-900">Example publications</h3>
              {page.sampleNote && <p className="text-gray-600 mt-2">{page.sampleNote}</p>}
            </div>
          </div>
          {page.sampleImage && (
            <div className="mb-6 overflow-hidden rounded-3xl border border-gray-200 shadow-sm">
              <img src={page.sampleImage} alt="Sample press release outlet logos" className="w-full object-cover" />
            </div>
          )}
        </section>
      )}

      <section className="bg-white border-t border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row items-center gap-6 justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Ready to proceed?</h3>
            <p className="text-gray-600 mt-2">
              {page.summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/press-release/checkout?package=${page.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700"
            >
              <ShoppingCart className="w-5 h-5" />
              Proceed to Checkout
            </Link>
            {page.whatsapp && (
              <a
                href={page.whatsapp}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-800 font-semibold hover:border-gray-300"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
