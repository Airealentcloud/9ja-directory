/**
 * Single source of truth for the canonical site URL.
 *
 * Import SITE_URL from here instead of declaring a local `siteUrl` or `baseUrl`
 * constant in each file. This prevents canonical host mismatches across
 * metadata generators, the sitemap, and schema.org markup.
 *
 * Set NEXT_PUBLIC_SITE_URL in your environment:
 *   - Production:  https://www.9jadirectory.org
 *   - Preview/dev: http://localhost:3000
 */
const fallbackSiteUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://www.9jadirectory.org'
    : 'http://localhost:3000'

function normalizeCanonicalHost(url: string): string {
  try {
    const parsed = new URL(url)

    // Keep one canonical host to avoid mixed host signals in metadata/schema.
    if (parsed.hostname === '9jadirectory.org') {
      parsed.hostname = 'www.9jadirectory.org'
    }

    return parsed.toString().replace(/\/$/, '')
  } catch {
    return url.replace(/\/$/, '')
  }
}

export const SITE_URL = normalizeCanonicalHost(
  process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl
)
