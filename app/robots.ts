import { MetadataRoute } from 'next'

/**
 * Robots.txt configuration following Google's guidelines
 * @see https://developers.google.com/search/docs/crawling-indexing/robots/intro
 *
 * Key principles:
 * - Allow crawling of all public content pages
 * - Block private/authenticated areas (dashboard, admin)
 * - Block transactional pages (checkout, payment confirmation)
 * - Block API endpoints
 * - Reference sitemap for discovery
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org'

  return {
    rules: [
      {
        // Rules for all crawlers
        userAgent: '*',
        allow: '/',
        disallow: [
          // Authentication & User Areas
          '/api/',
          '/admin/',
          '/dashboard/',
          '/auth/',
          '/login',
          '/signup',

          // Business submission flow (private)
          '/add-business',
          '/listing-created',
          '/listings/*/claim',

          // Payment & Transaction Pages (not for indexing)
          '/checkout',
          '/payment/',
          '/press-release/checkout',
          '/press-release/order-success',
          '/press-release/order-pending',
          '/test-payment',

          // Newsletter flow (transactional, not for indexing)
          '/newsletter/',

          // Development & Testing
          '/debug',
          '/test-db',
          '/stats',

          // Prevent indexing of search results with parameters
          '/search?*',
        ],
      },
      {
        // Allow Googlebot-Image to crawl all images
        userAgent: 'Googlebot-Image',
        allow: [
          '/images/',
          '/*.jpg$',
          '/*.jpeg$',
          '/*.png$',
          '/*.gif$',
          '/*.webp$',
          '/*.svg$',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
