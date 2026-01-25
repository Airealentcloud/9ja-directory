import type { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingCart, Info } from 'lucide-react'

const packages = [
  {
    name: 'Starter',
    price: '₦120,000',
    releases: '10 press releases',
    delivery: 'Publish in 6-24 hours',
    badge: 'Popular for new brands',
    href: '/press-release/starter',
    features: [
      'Distribution to 10+ outlets',
      'Write-up included',
      'Proof of publication links',
      'Use of "As Seen On" logos',
      'Standard support',
    ],
  },
  {
    name: 'Growth',
    price: '₦225,000',
    releases: '30 press releases',
    delivery: 'Publish in 6-24 hours',
    badge: 'Fast-moving startups',
    href: '/press-release/growth',
    features: [
      'Includes Starter features',
      'Priority placement in Nigerian outlets',
      'Light editorial review',
      '2 revision cycles',
    ],
  },
  {
    name: 'Business',
    price: '₦350,000',
    releases: '80 press releases',
    delivery: 'Publish in 2-7 days',
    badge: 'Best for SMEs',
    href: '/press-release/business',
    features: [
      'Includes Growth features',
      'Emphasis on national business media',
      'SEO keyword optimization',
      'Account coordinator',
    ],
  },
  {
    name: 'Enterprise',
    price: '₦500,000',
    releases: '300 press releases',
    delivery: 'Publish in 2-7 days',
    badge: 'Enterprise reach',
    href: '/press-release/enterprise',
    features: [
      'Includes Business features',
      'International outlet mix (Forbes, Reuters, Entrepreneur)',
      'Launch calendar planning',
      'Dedicated account manager',
    ],
  },
]

const bundles = [
  {
    name: 'Starter Bundle',
    price: '₦228,500/year',
    badge: 'Best for new businesses',
    href: '/press-release/bundle-starter',
    items: [
      '9jaDirectory Basic Listing (₦38,500)',
      'MyNigeriaBusiness Standard (₦70,000)',
      '10 Press Releases (₦120,000)',
    ],
    bonus: 'Great for first-time launches',
  },
  {
    name: 'Growth Bundle',
    price: '₦520,500/year',
    badge: 'Most Popular',
    href: '/press-release/bundle-growth',
    items: [
      '9jaDirectory Featured Listing (₦115,500)',
      'MyNigeriaBusiness Featured (₦180,000)',
      '30 Press Releases (₦225,000)',
    ],
    bonus: 'Priority homepage placement on both directories',
  },
  {
    name: 'Premium Bundle',
    price: '₦948,000/year',
    badge: 'Enterprise',
    href: '/press-release/bundle-premium',
    items: [
      '9jaDirectory Premium Listing (₦198,000)',
      'MyNigeriaBusiness Premium/Sector (₦250,000)',
      '300 Press Releases (₦500,000)',
    ],
    bonus: 'Sector page feature + dedicated account manager',
  },
]

const reputationPrograms = [
  {
    name: 'Defend',
    price: '₦1,200,000',
    tagline: 'Baseline protection with proof-backed reviews',
    href: '/press-release/reputation-defend',
    points: [
      '20 verified human reviews (Google, Facebook, Trustpilot)',
      '300 press release placements over 12 months',
      'Featured on 9jaDirectory + MyNigeriaBusiness listings',
      'APNews, Benzinga, TheGlobeandMail, Barchart, TV & Radio station sites + 350 downstream sites',
      'Add-on: USAToday.com availability',
    ],
  },
  {
    name: 'Command',
    price: '₦2,200,000',
    tagline: 'Proactive authority building with directory reach',
    href: '/press-release/reputation-command',
    points: [
      '30+ verified reviews and reputation boosts per quarter',
      '300 press releases plus SEO content sprints',
      'Published and boosted on 9jaDirectory + MyNigeriaBusiness',
      '1 Premium PR Distribution: APNews, Benzinga, TheGlobeandMail, Barchart, TV & Radio station sites + 350 downstream sites',
      'Add-on: USAToday.com availability',
    ],
  },
  {
    name: 'Elite',
    price: '₦5,600,000',
    tagline: 'Enterprise-grade credibility, newsroom backed',
    href: '/press-release/reputation-elite',
    points: [
      '100 verified human reviews (Google, Facebook, Trustpilot)',
      '500 press release placements across international + local outlets',
      'Premium placement on 9jaDirectory + MyNigeriaBusiness',
      'Yahoo News, Google News, EIN Presswire distribution',
      '20 Premium PR Distributions: APNews, Benzinga, TheGlobeandMail, Barchart, TV & Radio station sites + 350 downstream sites',
      '50 Nigerian news platforms secured with social media posts',
      'Add-on: USAToday.com availability',
    ],
  },
]

const editorialAddons = [
  {
    name: 'Basic Editing',
    price: '₦25,000',
    points: ['Grammar + structure check', 'Media-ready formatting'],
  },
  {
    name: 'Full Press Release Writing',
    price: '₦50,000',
    points: ['Complete writing from brief', 'SEO optimization', 'Quote development'],
  },
  {
    name: 'Premium Storytelling',
    price: '₦100,000',
    points: ['Interview-based story', 'Multimedia integration', 'Multiple angles tested'],
  },
]

const steps = [
  { title: 'Select a package', description: 'Choose a standalone press release or bundle.' },
  { title: 'Submit content', description: 'Share your Google Doc link or fill our form.' },
  { title: 'Publish + proof', description: 'We distribute and send live URLs within SLA.' },
]

const benefits = [
  'Guaranteed publication windows (6-24 hours for standard)',
  'Backlinks from authoritative news sites for SEO',
  'Local + international media mix tailored to Nigeria',
  '"As Seen On" rights for your site and marketing',
  'Investor-ready credibility for startups and SMEs',
  'Accountable reporting with live links',
]

const testimonials = [
  {
    name: 'Ada, Fintech Founder',
    quote: 'We landed Techpoint and national coverage in 24 hours. The bundle gave us directory visibility too.',
  },
  {
    name: 'Kunle, Retail CEO',
    quote: 'Proof links arrived same day and our Google rankings jumped within weeks.',
  },
]

const faqs = [
  {
    q: 'How fast do you publish?',
    a: 'Most Starter/Growth releases go live within 6-24 hours. Business/Enterprise with international outlets are 2-7 days.',
  },
  {
    q: 'Do you guarantee placement?',
    a: 'Yes. Packages include guaranteed placements and proof links. If any outlet misses, we replace it.',
  },
  {
    q: 'What content do you need?',
    a: 'A Google Doc or draft with headline, body, quotes, and contact info. We can write or edit if you add Editorial Support.',
  },
  {
    q: 'Can I use the outlet logos?',
    a: 'Yes. Packages include "As Seen On" usage rights for your website and marketing.',
  },
  {
    q: 'Which payments do you support?',
    a: 'Paystack (cards, bank transfer, USSD). Flutterwave and USD options can be enabled on request.',
  },
]

const mediaOutlets = {
  Tech: ['Techpoint', 'TechCabal', 'Techeconomy', 'Disrupt Africa'],
  National: ['Punch', 'Vanguard', 'Guardian Nigeria', 'BusinessDay', 'Daily Trust'],
  International: ['Forbes', 'Reuters', 'Entrepreneur', 'Boston Herald', 'Wall Street Select'],
}

const whatsappLink =
  'https://wa.me/2349160023442?text=Hi%209jaDirectory,%20I%27m%20interested%20in%20press%20release%20distribution.'

export const metadata: Metadata = {
  title: 'Press Release Distribution | 9jaDirectory',
  description:
    'Get featured on 500+ news outlets with guaranteed publication. Choose standalone press release packages or bundles with 9jaDirectory listings.',
  alternates: { canonical: '/press-release' },
  openGraph: {
    title: 'Press Release Distribution | 9jaDirectory',
    description:
      'Nigeria-owned press release marketplace with guaranteed placements, bundles, and add-on reputation management.',
    url: '/press-release',
    siteName: '9jaDirectory',
  },
}

export default function PressReleasePage() {
  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-green-700 mb-3">Press Release & Media Distribution</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Get featured on 500+ news outlets worldwide with guaranteed publication.
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Nigeria&apos;s first press release marketplace built for startups, SMEs, and enterprises. Choose a package,
              submit your story, and get proof links within hours.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#packages"
                className="inline-flex items-center justify-center rounded-lg bg-green-600 px-5 py-3 text-white font-semibold shadow-sm hover:bg-green-700"
              >
                View packages
              </a>
              <a
                href={whatsappLink}
                className="inline-flex items-center justify-center rounded-lg border border-green-200 bg-white px-5 py-3 text-green-700 font-semibold hover:border-green-300"
              >
                Talk on WhatsApp
              </a>
            </div>
            <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-100">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" aria-hidden />
              <span className="text-sm text-gray-700">Publishes in 6-24 hours for standard packages</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-t border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-gray-500 text-sm">
            <span className="font-semibold text-gray-700">Trusted by Nigerian brands and global outlets</span>
            <div className="flex flex-wrap gap-4">
              {['Techpoint', 'Punch', 'Forbes', 'Reuters', 'Guardian', 'BusinessDay'].map((name) => (
                <span key={name} className="rounded-full border border-gray-200 px-3 py-1 bg-gray-50">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Standalone packages */}
      <section id="packages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <p className="text-green-700 font-semibold text-sm">Standalone press release packages</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Choose the reach that fits your launch</h2>
            <p className="text-gray-600 mt-3 max-w-2xl">
              Guaranteed publication, proof links, and "As Seen On" usage rights across every tier.
            </p>
          </div>
          <a
            href={whatsappLink}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-700 border border-green-200 hover:border-green-300 shadow-sm"
          >
            Need a custom mix? Chat with us
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="relative rounded-2xl bg-white border border-gray-200 shadow-sm hover:-translate-y-1 hover:shadow-md transition-transform h-full"
            >
              <div className="p-6 space-y-4 h-full flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                    <p className="text-sm text-green-700 mt-1">{pkg.badge}</p>
                  </div>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    {pkg.delivery}
                  </span>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{pkg.price}</div>
                  <p className="text-sm text-gray-600">{pkg.releases}</p>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  {pkg.features.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-green-500" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4 mt-auto space-y-2">
                  <Link
                    href={`/press-release/checkout?package=${pkg.href?.replace('/press-release/', '') ?? 'starter'}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-white font-semibold hover:bg-green-700"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Order Now
                  </Link>
                  <Link
                    href={pkg.href ?? '#cta'}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 font-medium hover:border-gray-300 text-sm"
                  >
                    <Info className="w-4 h-4" />
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bundles */}
      <section className="bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <div>
              <p className="text-green-700 font-semibold text-sm">Complete visibility bundles</p>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">Press releases + directory listings</h2>
              <p className="text-gray-600 mt-3 max-w-2xl">
                Pair guaranteed press with 9jaDirectory and MyNigeriaBusiness listings for maximum reach.
              </p>
            </div>
            <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
              60% of clients pick bundles
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bundles.map((bundle) => (
              <div
                key={bundle.name}
                className={`relative rounded-2xl border bg-white p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-transform h-full ${
                  bundle.badge === 'Most Popular' ? 'border-green-500' : 'border-gray-200'
                }`}
              >
                {bundle.badge && (
                  <span
                    className={`absolute -top-3 left-4 rounded-full px-3 py-1 text-xs font-semibold ${
                      bundle.badge === 'Most Popular'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-50 text-green-700 border border-green-100'
                    }`}
                  >
                    {bundle.badge}
                  </span>
                )}
                <div className="space-y-4 h-full flex flex-col">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{bundle.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{bundle.bonus}</p>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{bundle.price}</div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {bundle.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-green-500" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                </ul>
                <div className="pt-4 mt-auto space-y-2">
                  <Link
                    href={`/press-release/checkout?package=${bundle.href?.replace('/press-release/', '') ?? 'bundle-starter'}`}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold ${
                      bundle.badge === 'Most Popular'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-900 text-white hover:bg-black'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Order Now
                    </Link>
                    <Link
                      href={bundle.href ?? '#cta'}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 font-medium hover:border-gray-300 text-sm"
                    >
                      <Info className="w-4 h-4" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl">
          <p className="text-green-700 font-semibold text-sm">How it works</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">Simple 3-step submission</h2>
          <p className="text-gray-600 mt-3">
            Modeled after Pressdia with a faster Nigeria-first workflow for startups, SMEs, and enterprises.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-full bg-green-100 text-green-700 font-semibold flex items-center justify-center">
                  {index + 1}
                </div>
                <span className="text-sm text-gray-500">Fast turnaround</span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reputation management hero */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-4">
              <p className="text-green-400 font-semibold text-sm">Reputation Management</p>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Control your narrative with review velocity and newsroom firepower.
              </h2>
              <p className="text-gray-200">
                Human-verified reviews, 300 press release placements, and newsroom relationships for Yahoo News, Google
                News, and EIN Presswire. Built to outrank negatives and build trust fast.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/press-release/reputation-defend"
                  className="inline-flex items-center justify-center rounded-lg bg-green-500 px-5 py-3 font-semibold text-gray-900 hover:bg-green-400"
                >
                  Book a reputation program
                </a>
                <a
                  href="#cta"
                  className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-3 font-semibold text-white hover:bg-white/10"
                >
                  Talk to an expert
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-200">
                <span className="h-2 w-2 rounded-full bg-green-400" aria-hidden />
                <span>Launch in under 5 business days with live proof links</span>
              </div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              {reputationPrograms.map((program) => (
                <div key={program.name} className="rounded-2xl bg-white/5 border border-white/10 p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">{program.name}</h3>
                      <p className="text-sm text-gray-300">{program.tagline}</p>
                    </div>
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-200">
                      Starts at
                    </span>
                  </div>
                  <div className="mt-4 text-3xl font-bold text-white">{program.price}</div>
                  <ul className="mt-4 space-y-2 text-sm text-gray-100">
                    {program.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-green-400" aria-hidden />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 space-y-2">
                    <Link
                      href={`/press-release/checkout?package=${program.href?.replace('/press-release/', '') ?? 'reputation-defend'}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-gray-900 font-semibold hover:bg-green-400"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Order Now
                    </Link>
                    <Link
                      href={program.href ?? '#cta'}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 bg-transparent px-4 py-2 text-white font-medium hover:bg-white/10 text-sm"
                    >
                      <Info className="w-4 h-4" />
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <p className="text-green-700 font-semibold text-sm">Why 9jaDirectory</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Built for Nigerian visibility</h2>
            <p className="text-gray-600 mt-3">
              Local media expertise plus international reach, bundled with our directory audience.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((item) => (
              <div key={item} className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-gray-800">
                <div className="mb-3 h-2 w-10 rounded-full bg-green-500" aria-hidden />
                <p className="text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <p className="text-green-700 font-semibold text-sm">Add-on services</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Editorial support to move faster (from ₦25,000)</h2>
            <p className="text-gray-600 mt-3">
              Layer expert writing on top of your press release package or reputation program for stronger pickup.
            </p>
          </div>
          <a
            href={whatsappLink}
            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700 shadow-sm"
          >
            Add to my order
          </a>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900">Editorial Writing Support</h3>
          <p className="text-gray-600 mt-2">From quick edits to full storytelling with interviews.</p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {editorialAddons.map((addon) => (
              <div key={addon.name} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                <p className="text-sm text-green-700 mt-1">{addon.price}</p>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {addon.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-green-500" aria-hidden />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <p className="text-green-700 font-semibold text-sm">Client results</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">What customers say</h2>
            <p className="text-gray-600 mt-3">Stories from Nigerian founders and operators using our bundles.</p>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                <p className="text-gray-800 text-lg leading-relaxed">"{item.quote}"</p>
                <p className="mt-4 text-sm font-semibold text-gray-900">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media outlets grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl">
          <p className="text-green-700 font-semibold text-sm">Outlet coverage</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">Local + international media mix</h2>
          <p className="text-gray-600 mt-3">
            Sample outlets we prioritize. Final mix is tailored per package and story angle.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(mediaOutlets).map(([group, names]) => (
            <div key={group} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">{group}</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {names.map((name) => (
                  <li key={name} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-green-500" aria-hidden />
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <p className="text-green-700 font-semibold text-sm">FAQ</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Answers before you book</h2>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900">{item.q}</h3>
                <p className="mt-2 text-sm text-gray-700">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-green-600 px-6 py-10 md:px-10 text-white shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold">Ready to get featured?</h2>
              <p className="mt-3 text-green-100">
                Tell us your package, target outlets, and timeline. We will reply with payment link and submission form.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={whatsappLink}
                  className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-green-700 font-semibold hover:bg-gray-100"
                >
                  Chat on WhatsApp
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-lg border border-white/60 px-5 py-3 font-semibold text-white hover:bg-white/10"
                >
                  Contact form
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-gray-900 shadow-md">
              <h3 className="text-lg font-bold">Fast response</h3>
              <p className="text-sm text-gray-600 mt-1">Average response time: under 1 hour during business days.</p>
              <div className="mt-4 space-y-2 text-sm text-gray-800">
                <div className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-green-500" aria-hidden />
                  <span>Payment: Paystack (cards, transfer, USSD). Flutterwave/Stripe on request.</span>
                </div>
                <div className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-green-500" aria-hidden />
                  <span>Delivery: 6-24 hours (standard) or 2-7 days (premium/international).</span>
                </div>
                <div className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-green-500" aria-hidden />
                  <span>Contact: info@mynigeriabusiness.ng | +234 916 002 3442</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
