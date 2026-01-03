import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { blogPosts } from '@/lib/blog-data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://9jadirectory.org'
    const supabase = await createClient()

    // 1. Static Routes
    const routes = [
        '',
        '/about',
        '/contact',
        '/faq',
        '/featured',
        '/blog',
        '/categories',
        '/states',
        '/terms',
        '/privacy',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.7,
    }))

    // 2. Blog Posts
    const blogUrls = blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }))

    // 3. Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('slug, updated_at')

    const categoryUrls = (categories || []).map((category) => ({
        url: `${baseUrl}/categories/${category.slug}`,
        lastModified: new Date(category.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    // 4. States
    const { data: states } = await supabase
        .from('states')
        .select('slug')

    const stateUrls = (states || []).map((state) => ({
        url: `${baseUrl}/states/${state.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    // 5. Category + State Pages (New - HIGH PRIORITY for local SEO)
    // These 540+ dynamic pages target searches like "restaurants in Lagos", "salons in Abuja", etc.
    const hasCategories = (categories || []).length > 0
    const hasStates = (states || []).length > 0

    const fallbackCategoryUrls = hasCategories
        ? []
        : [
              {
                  url: `${baseUrl}/categories/real-estate`,
                  lastModified: new Date(),
                  changeFrequency: 'weekly' as const,
                  priority: 0.8,
              },
          ]

    const fallbackStateUrls = hasStates
        ? []
        : [
              {
                  url: `${baseUrl}/states/lagos`,
                  lastModified: new Date(),
                  changeFrequency: 'weekly' as const,
                  priority: 0.8,
              },
              {
                  url: `${baseUrl}/states/fct`,
                  lastModified: new Date(),
                  changeFrequency: 'weekly' as const,
                  priority: 0.8,
              },
          ]

    const categoryStateUrls = (categories || []).flatMap((category: any) =>
        (states || []).map((state: any) => ({
            url: `${baseUrl}/categories/${category.slug}/${state.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8, // High priority - these pages target high-volume keywords
        }))
    )

    const fallbackCategoryStateUrls = hasCategories && hasStates
        ? []
        : [
              {
                  url: `${baseUrl}/categories/real-estate/lagos`,
                  lastModified: new Date(),
                  changeFrequency: 'weekly' as const,
                  priority: 0.8,
              },
              {
                  url: `${baseUrl}/categories/real-estate/fct`,
                  lastModified: new Date(),
                  changeFrequency: 'weekly' as const,
                  priority: 0.8,
              },
          ]

    // 6. Listings (Approved only)
    // Fetching only necessary fields to minimize payload
    const { data: listings } = await supabase
        .from('listings')
        .select('slug, updated_at')
        .eq('status', 'approved')
        .limit(5000) // Reasonable limit for a single sitemap file

    const listingUrls = (listings || []).map((listing) => ({
        url: `${baseUrl}/listings/${listing.slug}`,
        lastModified: new Date(listing.updated_at || new Date()),
        changeFrequency: 'daily' as const,
        priority: 0.6,
    }))

    return [
        ...routes,
        ...blogUrls,
        ...categoryUrls,
        ...fallbackCategoryUrls,
        ...stateUrls,
        ...fallbackStateUrls,
        ...categoryStateUrls,
        ...fallbackCategoryStateUrls,
        ...listingUrls,
    ]
}
