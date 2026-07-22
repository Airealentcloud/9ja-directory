import type { MetadataRoute } from 'next'
import { blogPostSummaries } from '@/lib/blog-index-data'
import { standalonePackages, bundlePackages, reputationPackages } from '@/lib/press-release/packages'
import {
  MIN_INDEXABLE_CATEGORY_STATE_LISTINGS,
  isIndexableListing,
} from '@/lib/seo/listing-quality'
import { createPublicClient } from '@/lib/supabase/public'

export const revalidate = 3600

const SITEMAP_LISTING_LIMIT = 10000
const SITEMAP_LISTING_BATCH_SIZE = 1000

const SITEMAP_LISTING_FIELDS = `
  slug,
  updated_at,
  description,
  phone,
  email,
  website,
  website_url,
  address,
  logo_url,
  images,
  opening_hours,
  services_offered,
  verified,
  claimed,
  categories(slug),
  states(slug)
`

const BLOG_UPDATED: Record<string, string> = {
  'best-web-hosting-in-nigeria-2026': '2026-02-24',
  'paypal-nigeria-2026-receive-payments-withdraw-naira': '2026-02-24',
  'local-lead-generation-mistakes-nigeria-2025': '2026-02-24',
  'top-business-listing-sites-in-nigeria-2025': '2026-02-24',
  'digital-marketing-strategies-small-business': '2026-02-24',
  'top-10-investment-opportunities-lagos': '2026-02-24',
  'starting-agriculture-business-nigeria': '2026-02-24',
  'how-to-get-business-loan-without-collateral-nigeria-2025': '2026-02-24',
  'best-banks-small-business-nigeria-comparison-2025': '2026-02-24',
  'how-to-start-blogging-content-business-nigeria-2025': '2026-02-24',
  'how-to-start-logistics-delivery-business-nigeria-2025': '2026-02-24',
  'cac-public-search-verify-company-nigeria': '2026-02-24',
  'company-code-nigeria-meaning-how-to-find': '2026-02-24',
  'cac-pre-incorporation-guide-nigeria-2026': '2026-02-24',
  'how-to-check-if-company-is-registered-nigeria': '2026-02-24',
  'top-10-real-estate-companies-abuja': '2026-02-24',
  'top-10-law-firms-lagos': '2026-02-24',
  'top-10-law-firms-abuja-fct': '2026-02-24',
  'how-to-start-food-delivery-business-in-nigeria': '2026-02-24',
  'best-plumbing-materials-companies-nigeria': '2026-02-24',
  'top-plastic-manufacturing-companies-nigeria': '2026-02-24',
  'top-food-processing-companies-nigeria': '2026-02-24',
  'best-telecommunication-companies-nigeria': '2026-02-24',
  'best-solar-panel-installation-companies-nigeria': '2026-02-24',
  'top-10-security-companies-nigeria': '2026-02-24',
  'best-insurance-companies-nigeria': '2026-02-24',
  'top-10-law-firms-nigeria': '2026-02-24',
  'best-private-hospitals-nigeria': '2026-02-24',
  'best-real-estate-companies-nigeria': '2026-02-24',
  'best-it-technology-companies-lagos': '2026-02-24',
}

type SitemapCategory = {
  slug: string
  updated_at?: string | null
}

type SitemapState = SitemapCategory

type RelatedSlug = { slug: string } | { slug: string }[] | null

type SitemapListing = {
  slug: string
  updated_at?: string | null
  description?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  website_url?: string | null
  address?: string | null
  logo_url?: string | null
  images?: unknown
  opening_hours?: unknown
  services_offered?: unknown
  verified?: boolean | null
  claimed?: boolean | null
  categories?: RelatedSlug
  states?: RelatedSlug
}

function dateOrFallback(value: string | undefined | null, fallback: Date) {
  const date = value ? new Date(value) : fallback
  return Number.isNaN(date.getTime()) ? fallback : date
}

function relationSlug(value: RelatedSlug | undefined) {
  if (Array.isArray(value)) return value[0]?.slug
  return value?.slug
}

function logSitemapError(source: string, error: unknown) {
  const message = error instanceof Error
    ? error.message
    : typeof error === 'object' && error && 'message' in error
      ? String(error.message)
      : String(error)

  console.error(JSON.stringify({
    event: 'sitemap_data_source_error',
    source,
    message,
  }))
}

async function fetchApprovedSitemapListings(
  supabase: ReturnType<typeof createPublicClient>,
): Promise<{ data: SitemapListing[]; error: unknown }> {
  const rows: SitemapListing[] = []

  for (let from = 0; from < SITEMAP_LISTING_LIMIT; from += SITEMAP_LISTING_BATCH_SIZE) {
    const to = Math.min(
      from + SITEMAP_LISTING_BATCH_SIZE - 1,
      SITEMAP_LISTING_LIMIT - 1,
    )
    const response = await supabase
      .from('listings')
      .select(SITEMAP_LISTING_FIELDS)
      .eq('status', 'approved')
      .order('updated_at', { ascending: false })
      .range(from, to)

    if (response.error) {
      return { data: rows, error: response.error }
    }

    const batch = (response.data || []) as unknown as SitemapListing[]
    rows.push(...batch)

    if (batch.length < SITEMAP_LISTING_BATCH_SIZE) {
      break
    }
  }

  return { data: rows, error: null }
}

/**
 * Public, quality-gated URLs only. The route is generated as ISR so Cloudflare
 * normally serves cached XML instead of rebuilding it for every crawler hit.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const startedAt = Date.now()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org'
  const now = new Date()

  const coreRoutes = [
    { path: '', priority: 1.0, changeFreq: 'daily' as const },
    { path: '/about', priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/contact', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/faq', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/pricing', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/featured', priority: 0.8, changeFreq: 'daily' as const },
    { path: '/blog', priority: 0.8, changeFreq: 'daily' as const },
    { path: '/categories', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/states', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/claim-your-business', priority: 0.8, changeFreq: 'monthly' as const },
  ].map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }))

  const legalRoutes = ['/terms', '/privacy'].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }))

  const pressReleaseMainRoutes = [
    { path: '/press-release', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/press-release/copywriting', priority: 0.8, changeFreq: 'monthly' as const },
  ].map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }))

  const pressReleasePackageUrls = [
    ...standalonePackages,
    ...bundlePackages,
    ...reputationPackages,
  ].map((pkg) => ({
    url: `${baseUrl}/press-release/${pkg.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const blogUrls = blogPostSummaries.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: dateOrFallback(BLOG_UPDATED[post.slug] || post.date, now),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  let categories: SitemapCategory[] = []
  let states: SitemapState[] = []
  let listings: SitemapListing[] = []
  let categoriesError: unknown = null
  let statesError: unknown = null
  let listingsError: unknown = null

  try {
    const supabase = createPublicClient()
    const [categoryResponse, stateResponse, listingResponse] = await Promise.all([
      supabase.from('categories').select('slug'),
      supabase.from('states').select('slug'),
      fetchApprovedSitemapListings(supabase),
    ])

    categories = (categoryResponse.data || []) as SitemapCategory[]
    states = (stateResponse.data || []) as SitemapState[]
    listings = (listingResponse.data || []) as unknown as SitemapListing[]
    categoriesError = categoryResponse.error
    statesError = stateResponse.error
    listingsError = listingResponse.error
  } catch (error) {
    categoriesError = error
    statesError = error
    listingsError = error
  }

  if (categoriesError) logSitemapError('categories', categoriesError)
  if (statesError) logSitemapError('states', statesError)
  if (listingsError) logSitemapError('listings', listingsError)

  const categoryUrls = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: dateOrFallback(category.updated_at, now),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const stateUrls = states.map((state) => ({
    url: `${baseUrl}/states/${state.slug}`,
    lastModified: dateOrFallback(state.updated_at, now),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const fallbackCategoryUrls: MetadataRoute.Sitemap = categories.length > 0
    ? []
    : [{
        url: `${baseUrl}/categories/real-estate`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }]

  const fallbackStateUrls: MetadataRoute.Sitemap = states.length > 0
    ? []
    : ['lagos', 'fct'].map((slug) => ({
        url: `${baseUrl}/states/${slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))

  const indexableListings = listings.filter((listing) => isIndexableListing(listing))
  const comboCounts = new Map<string, number>()

  for (const listing of indexableListings) {
    const categorySlug = relationSlug(listing.categories)
    const stateSlug = relationSlug(listing.states)
    if (categorySlug && stateSlug) {
      const key = `${categorySlug}/${stateSlug}`
      comboCounts.set(key, (comboCounts.get(key) || 0) + 1)
    }
  }

  const categoryStateUrls = categories.flatMap((category) =>
    states
      .filter((state) =>
        (comboCounts.get(`${category.slug}/${state.slug}`) || 0) >=
        MIN_INDEXABLE_CATEGORY_STATE_LISTINGS,
      )
      .map((state) => ({
        url: `${baseUrl}/categories/${category.slug}/${state.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      })),
  )

  const listingUrls = indexableListings.map((listing) => ({
    url: `${baseUrl}/listings/${listing.slug}`,
    lastModified: dateOrFallback(listing.updated_at, now),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const elapsedMs = Date.now() - startedAt
  if (listings.length >= SITEMAP_LISTING_LIMIT) {
    console.warn(JSON.stringify({
      event: 'sitemap_listing_limit_reached',
      limit: SITEMAP_LISTING_LIMIT,
    }))
  }

  if (elapsedMs > 2000) {
    console.warn(JSON.stringify({
      event: 'slow_sitemap_generation',
      elapsedMs,
      categories: categories.length,
      states: states.length,
      listings: listings.length,
      indexableListings: indexableListings.length,
    }))
  }

  return [
    ...coreRoutes,
    ...pressReleaseMainRoutes,
    ...pressReleasePackageUrls,
    ...categoryUrls,
    ...fallbackCategoryUrls,
    ...stateUrls,
    ...fallbackStateUrls,
    ...categoryStateUrls,
    ...blogUrls,
    ...listingUrls,
    ...legalRoutes,
  ]
}
