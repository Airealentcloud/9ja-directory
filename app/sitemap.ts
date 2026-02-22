import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { blogPosts } from '@/lib/blog-data'
import { standalonePackages, bundlePackages, reputationPackages } from '@/lib/press-release/packages'

/**
 * Sitemap following Google's Guidelines:
 * - Maximum 50,000 URLs per sitemap
 * - Maximum 50MB uncompressed file size
 * - Use canonical URLs (consistent https://)
 * - Accurate lastModified dates for crawl efficiency
 * - Only include indexable, public pages
 * - No authentication-required pages
 *
 * @see https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org'
    const supabase = await createClient()

    // Current date for pages without specific modification tracking
    const now = new Date()

    // 1. Core Static Routes - High priority pages
    // Note: Only include pages that should appear in search results
    // Exclude: login, signup, checkout, order confirmation (blocked in robots.txt)
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

    // 2. Legal Pages - Lower priority, rarely change
    const legalRoutes = [
        '/terms',
        '/privacy',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: now,
        changeFrequency: 'yearly' as const,
        priority: 0.3,
    }))

    // 3. Press Release Section - Service pages (high commercial intent)
    const pressReleaseMainRoutes = [
        { path: '/press-release', priority: 0.9, changeFreq: 'weekly' as const },
        { path: '/press-release/copywriting', priority: 0.8, changeFreq: 'monthly' as const },
    ].map((route) => ({
        url: `${baseUrl}${route.path}`,
        lastModified: now,
        changeFrequency: route.changeFreq,
        priority: route.priority,
    }))

    // 4. Press Release Package Detail Pages
    const allPressReleasePackages = [
        ...standalonePackages,
        ...bundlePackages,
        ...reputationPackages,
    ]

    const pressReleasePackageUrls = allPressReleasePackages.map((pkg) => ({
        url: `${baseUrl}/press-release/${pkg.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    // 5. Blog Posts - Content marketing pages
    const blogUrls = blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }))

    // 6. Categories - Important for navigation and SEO
    const { data: categories } = await supabase
        .from('categories')
        .select('slug, updated_at')

    const categoryUrls = (categories || []).map((category) => ({
        url: `${baseUrl}/categories/${category.slug}`,
        lastModified: new Date(category.updated_at || now),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    // 7. States - Geographic targeting (all 36 states + FCT)
    const { data: states } = await supabase
        .from('states')
        .select('slug, updated_at')

    const stateUrls = (states || []).map((state) => ({
        url: `${baseUrl}/states/${state.slug}`,
        lastModified: new Date(state.updated_at || now),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    // 8. Category + State Combination Pages - HIGH VALUE for Local SEO
    // These dynamic pages target high-intent searches like:
    // "restaurants in Lagos", "hotels in Abuja", "real estate in Port Harcourt"
    //
    // Quality threshold: only include a combination when at least one approved
    // listing exists for it. Thin/empty combos are excluded to protect crawl
    // budget and avoid indexing low-value pages (P2-T1, P2-T2).
    const hasCategories = (categories || []).length > 0
    const hasStates = (states || []).length > 0

    const fallbackCategoryUrls = hasCategories
        ? []
        : [
              {
                  url: `${baseUrl}/categories/real-estate`,
                  lastModified: now,
                  changeFrequency: 'weekly' as const,
                  priority: 0.8,
              },
          ]

    const fallbackStateUrls = hasStates
        ? []
        : [
              {
                  url: `${baseUrl}/states/lagos`,
                  lastModified: now,
                  changeFrequency: 'weekly' as const,
                  priority: 0.8,
              },
              {
                  url: `${baseUrl}/states/fct`,
                  lastModified: now,
                  changeFrequency: 'weekly' as const,
                  priority: 0.8,
              },
          ]

    // Fetch distinct category+state combos that have at least one approved listing.
    // Using an INNER JOIN so only rows with valid FK relations are returned.
    const { data: activeCombos } = await supabase
        .from('listings')
        .select('categories!inner(slug), states!inner(slug)')
        .eq('status', 'approved')
        .not('category_id', 'is', null)
        .not('state_id', 'is', null)

    // Build a Set for O(1) membership checks: "categorySlug/stateSlug"
    // Supabase returns joined relations as arrays, so we use [0] to get the first (and only) match.
    const validComboSet = new Set(
        (activeCombos || []).flatMap((listing) => {
            const cats = listing.categories
            const sts = listing.states
            const catSlug = Array.isArray(cats) ? cats[0]?.slug : (cats as { slug: string } | null)?.slug
            const stateSlug = Array.isArray(sts) ? sts[0]?.slug : (sts as { slug: string } | null)?.slug
            return catSlug && stateSlug ? [`${catSlug}/${stateSlug}`] : []
        })
    )

    // Only include combinations present in the live listing data
    const categoryStateUrls = (categories || []).flatMap((category: { slug: string }) =>
        (states || [])
            .filter((state: { slug: string }) =>
                validComboSet.has(`${category.slug}/${state.slug}`)
            )
            .map((state: { slug: string }) => ({
                url: `${baseUrl}/categories/${category.slug}/${state.slug}`,
                lastModified: now,
                changeFrequency: 'weekly' as const,
                priority: 0.75,
            }))
    )

    const fallbackCategoryStateUrls = hasCategories && hasStates
        ? []
        : [
              {
                  url: `${baseUrl}/categories/real-estate/lagos`,
                  lastModified: now,
                  changeFrequency: 'weekly' as const,
                  priority: 0.75,
              },
              {
                  url: `${baseUrl}/categories/real-estate/fct`,
                  lastModified: now,
                  changeFrequency: 'weekly' as const,
                  priority: 0.75,
              },
          ]

    // 9. Business Listings (Approved only)
    // Core content - each listing is a unique business page
    // Limit to 40,000 to stay well under Google's 50,000 URL limit per sitemap
    const { data: listings } = await supabase
        .from('listings')
        .select('slug, updated_at')
        .eq('status', 'approved')
        .order('updated_at', { ascending: false })
        .limit(40000)

    const listingUrls = (listings || []).map((listing) => ({
        url: `${baseUrl}/listings/${listing.slug}`,
        lastModified: new Date(listing.updated_at || now),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    // Combine all URLs in priority order
    // Total estimated URLs: ~40,600 (well under 50,000 limit)
    return [
        // Core pages (highest priority)
        ...coreRoutes,
        // Commercial/service pages
        ...pressReleaseMainRoutes,
        ...pressReleasePackageUrls,
        // Discovery pages
        ...categoryUrls,
        ...fallbackCategoryUrls,
        ...stateUrls,
        ...fallbackStateUrls,
        // Local SEO combination pages
        ...categoryStateUrls,
        ...fallbackCategoryStateUrls,
        // Content pages
        ...blogUrls,
        // Individual listings
        ...listingUrls,
        // Legal pages (lowest priority)
        ...legalRoutes,
    ]
}
