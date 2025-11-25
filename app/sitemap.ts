import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { blogPosts } from '@/lib/blog-data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://9jadirectory.org'
    const supabase = await createClient()

    // 1. Static Routes
    const routes = [
        '',
        '/about',
        '/contact',
        '/blog',
        '/categories',
        '/states',
        '/add-business',
        '/login',
        '/signup',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
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

    // 5. Cities (New - for better local SEO)
    const { data: cities } = await supabase
        .from('cities')
        .select('slug, state_id, states(slug)')
        .limit(1000) // Limit to top 1000 cities to avoid huge sitemap

    const cityUrls = (cities || []).map((city: any) => ({
        url: `${baseUrl}/states/${city.states?.slug}/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

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

    return [...routes, ...blogUrls, ...categoryUrls, ...stateUrls, ...cityUrls, ...listingUrls]
}
