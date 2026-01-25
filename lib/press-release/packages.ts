// Press Release Package Definitions
// Centralized pricing and package data for checkout and display

export type PackageType = 'standalone' | 'bundle' | 'reputation' | 'copywriting' | 'addon'

export interface PressReleasePackage {
  slug: string
  name: string
  type: PackageType
  price: number // Amount in kobo (NGN * 100)
  priceDisplay: string // Formatted price string
  releases?: string
  delivery?: string
  badge?: string
  features: string[]
  description?: string
  bonus?: string
  items?: string[] // For bundles
  points?: string[] // For reputation programs
}

// Bank Transfer Details
export const BANK_ACCOUNT = {
  accountName: 'A.I ROBOTICS LOGISTICS LTD',
  accountNumber: '1219916577',
  bankName: 'Zenith Bank',
} as const

// WhatsApp contact
export const WHATSAPP_NUMBER = '2349160023442'
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%209jaDirectory,%20I%27m%20interested%20in%20press%20release%20distribution.`

// Standalone Press Release Packages
export const standalonePackages: PressReleasePackage[] = [
  {
    slug: 'starter',
    name: 'Starter',
    type: 'standalone',
    price: 12000000, // ₦120,000 in kobo
    priceDisplay: '₦120,000',
    releases: '10 press releases',
    delivery: 'Publish in 6-24 hours',
    badge: 'Popular for new brands',
    features: [
      'Distribution to 10+ outlets',
      'Write-up included',
      'Proof of publication links',
      'Use of "As Seen On" logos',
      'Standard support',
    ],
    description: 'Perfect for new brands launching their first press campaign. Get published on 10+ news outlets within 24 hours.',
  },
  {
    slug: 'growth',
    name: 'Growth',
    type: 'standalone',
    price: 22500000, // ₦225,000 in kobo
    priceDisplay: '₦225,000',
    releases: '30 press releases',
    delivery: 'Publish in 6-24 hours',
    badge: 'Fast-moving startups',
    features: [
      'Includes Starter features',
      'Priority placement in Nigerian outlets',
      'Light editorial review',
      '2 revision cycles',
    ],
    description: 'Ideal for startups with regular announcements. Priority Nigerian media placement with editorial support.',
  },
  {
    slug: 'business',
    name: 'Business',
    type: 'standalone',
    price: 35000000, // ₦350,000 in kobo
    priceDisplay: '₦350,000',
    releases: '80 press releases',
    delivery: 'Publish in 2-7 days',
    badge: 'Best for SMEs',
    features: [
      'Includes Growth features',
      'Emphasis on national business media',
      'SEO keyword optimization',
      'Account coordinator',
    ],
    description: 'Built for SMEs seeking consistent media presence. National business media focus with SEO optimization.',
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    type: 'standalone',
    price: 50000000, // ₦500,000 in kobo
    priceDisplay: '₦500,000',
    releases: '300 press releases',
    delivery: 'Publish in 2-7 days',
    badge: 'Enterprise reach',
    features: [
      'Includes Business features',
      'International outlet mix (Forbes, Reuters, Entrepreneur)',
      'Launch calendar planning',
      'Dedicated account manager',
    ],
    description: 'Enterprise-grade distribution with international reach. Forbes, Reuters, and 300+ outlets with dedicated support.',
  },
]

// Bundle Packages (Directory + Press Releases)
export const bundlePackages: PressReleasePackage[] = [
  {
    slug: 'bundle-starter',
    name: 'Starter Bundle',
    type: 'bundle',
    price: 22850000, // ₦228,500 in kobo
    priceDisplay: '₦228,500/year',
    badge: 'Best for new businesses',
    features: [
      '9jaDirectory Basic Listing',
      'MyNigeriaBusiness Standard',
      '10 Press Releases',
    ],
    items: [
      '9jaDirectory Basic Listing (₦38,500)',
      'MyNigeriaBusiness Standard (₦70,000)',
      '10 Press Releases (₦120,000)',
    ],
    bonus: 'Great for first-time launches',
    description: 'Complete visibility package for new businesses. Directory listings + press coverage in one bundle.',
  },
  {
    slug: 'bundle-growth',
    name: 'Growth Bundle',
    type: 'bundle',
    price: 52050000, // ₦520,500 in kobo
    priceDisplay: '₦520,500/year',
    badge: 'Most Popular',
    features: [
      '9jaDirectory Featured Listing',
      'MyNigeriaBusiness Featured',
      '30 Press Releases',
      'Priority homepage placement',
    ],
    items: [
      '9jaDirectory Featured Listing (₦115,500)',
      'MyNigeriaBusiness Featured (₦180,000)',
      '30 Press Releases (₦225,000)',
    ],
    bonus: 'Priority homepage placement on both directories',
    description: 'Our most popular bundle. Featured directory placement + 30 press releases for maximum visibility.',
  },
  {
    slug: 'bundle-premium',
    name: 'Premium Bundle',
    type: 'bundle',
    price: 94800000, // ₦948,000 in kobo
    priceDisplay: '₦948,000/year',
    badge: 'Enterprise',
    features: [
      '9jaDirectory Premium Listing',
      'MyNigeriaBusiness Premium/Sector',
      '300 Press Releases',
      'Dedicated account manager',
    ],
    items: [
      '9jaDirectory Premium Listing (₦198,000)',
      'MyNigeriaBusiness Premium/Sector (₦250,000)',
      '300 Press Releases (₦500,000)',
    ],
    bonus: 'Sector page feature + dedicated account manager',
    description: 'Enterprise-level visibility. Premium directory placement + 300 press releases with dedicated support.',
  },
]

// Reputation Management Programs
export const reputationPackages: PressReleasePackage[] = [
  {
    slug: 'reputation-defend',
    name: 'Defend',
    type: 'reputation',
    price: 120000000, // ₦1,200,000 in kobo
    priceDisplay: '₦1,200,000',
    badge: 'Baseline protection',
    features: [
      '20 verified human reviews',
      '300 press release placements',
      'Featured directory listings',
      'APNews, Benzinga distribution',
    ],
    points: [
      '20 verified human reviews (Google, Facebook, Trustpilot)',
      '300 press release placements over 12 months',
      'Featured on 9jaDirectory + MyNigeriaBusiness listings',
      'APNews, Benzinga, TheGlobeandMail, Barchart, TV & Radio station sites + 350 downstream sites',
      'Add-on: USAToday.com availability',
    ],
    description: 'Baseline protection with proof-backed reviews. Build credibility with verified reviews and consistent press coverage.',
  },
  {
    slug: 'reputation-command',
    name: 'Command',
    type: 'reputation',
    price: 220000000, // ₦2,200,000 in kobo
    priceDisplay: '₦2,200,000',
    badge: 'Authority building',
    features: [
      '30+ verified reviews per quarter',
      '300 press releases + SEO content',
      'Premium PR distribution',
      'Directory boost',
    ],
    points: [
      '30+ verified reviews and reputation boosts per quarter',
      '300 press releases plus SEO content sprints',
      'Published and boosted on 9jaDirectory + MyNigeriaBusiness',
      '1 Premium PR Distribution: APNews, Benzinga, TheGlobeandMail, Barchart, TV & Radio station sites + 350 downstream sites',
      'Add-on: USAToday.com availability',
    ],
    description: 'Proactive authority building with directory reach. Quarterly review campaigns with SEO-optimized content.',
  },
  {
    slug: 'reputation-elite',
    name: 'Elite',
    type: 'reputation',
    price: 560000000, // ₦5,600,000 in kobo
    priceDisplay: '₦5,600,000',
    badge: 'Enterprise-grade',
    features: [
      '100 verified human reviews',
      '500 press release placements',
      'Yahoo News, Google News distribution',
      '20 Premium PR distributions',
    ],
    points: [
      '100 verified human reviews (Google, Facebook, Trustpilot)',
      '500 press release placements across international + local outlets',
      'Premium placement on 9jaDirectory + MyNigeriaBusiness',
      'Yahoo News, Google News, EIN Presswire distribution',
      '20 Premium PR Distributions: APNews, Benzinga, TheGlobeandMail, Barchart, TV & Radio station sites + 350 downstream sites',
      '50 Nigerian news platforms secured with social media posts',
      'Add-on: USAToday.com availability',
    ],
    description: 'Enterprise-grade credibility, newsroom backed. Maximum visibility with 100 reviews and 500+ press placements.',
  },
]

// Editorial Add-ons
export const editorialAddons: PressReleasePackage[] = [
  {
    slug: 'addon-basic-editing',
    name: 'Basic Editing',
    type: 'addon',
    price: 2500000, // ₦25,000 in kobo
    priceDisplay: '₦25,000',
    features: ['Grammar + structure check', 'Media-ready formatting'],
    points: ['Grammar + structure check', 'Media-ready formatting'],
    description: 'Basic editing and formatting service for your press release.',
  },
  {
    slug: 'addon-full-writing',
    name: 'Full Press Release Writing',
    type: 'addon',
    price: 5000000, // ₦50,000 in kobo
    priceDisplay: '₦50,000',
    features: ['Complete writing from brief', 'SEO optimization', 'Quote development'],
    points: ['Complete writing from brief', 'SEO optimization', 'Quote development'],
    description: 'Complete press release writing service from your brief.',
  },
  {
    slug: 'addon-premium-storytelling',
    name: 'Premium Storytelling',
    type: 'addon',
    price: 10000000, // ₦100,000 in kobo
    priceDisplay: '₦100,000',
    features: ['Interview-based story', 'Multimedia integration', 'Multiple angles tested'],
    points: ['Interview-based story', 'Multimedia integration', 'Multiple angles tested'],
    description: 'Premium storytelling package with interview-based narrative.',
  },
]

// Copywriting Package
export const copywritingPackage: PressReleasePackage = {
  slug: 'copywriting',
  name: 'Press Release Copywriting',
  type: 'copywriting',
  price: 10000000, // ₦100,000 in kobo
  priceDisplay: '₦100,000',
  delivery: '2-4 business days',
  features: [
    '1000 words of professional copy',
    'Logo creation included',
    '1 revision round',
    'SEO-optimized content',
    'Media-ready formatting',
  ],
  description: 'Professional press release copywriting with logo creation.',
}

// All packages combined for lookup
export const allPackages: PressReleasePackage[] = [
  ...standalonePackages,
  ...bundlePackages,
  ...reputationPackages,
  ...editorialAddons,
  copywritingPackage,
]

// Helper function to get package by slug
export function getPackageBySlug(slug: string): PressReleasePackage | undefined {
  return allPackages.find(pkg => pkg.slug === slug)
}

// Helper function to format price from kobo to display string
export function formatPrice(amountInKobo: number): string {
  const naira = amountInKobo / 100
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(naira)
}

// Generate unique order reference
export function generateOrderReference(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `PR-${timestamp}-${random}`.toUpperCase()
}
