import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://9jadirectory.org'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/dashboard/',
        '/auth/',
        '/login',
        '/signup',
        '/add-business',
        '/listing-created',
        '/payment/',
        '/debug',
        '/test-db',
        '/stats',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
