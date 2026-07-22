import { SITE_URL } from '@/lib/seo/site-url'

const ALLOWED_PRODUCTION_HOSTS = new Set([
    '9jadirectory.org',
    'www.9jadirectory.org',
    '9jadirectory-staging.israelakhas.workers.dev',
    '9jadirectory-production.israelakhas.workers.dev',
])

function configuredVercelHost(): string | null {
    const value = process.env.VERCEL_URL?.trim()
    if (!value) return null

    try {
        return new URL(value.includes('://') ? value : `https://${value}`).hostname.toLowerCase()
    } catch {
        return null
    }
}

export function isAllowedApplicationOrigin(value: string): boolean {
    try {
        const hostname = new URL(value).hostname.toLowerCase()
        const vercelHost = configuredVercelHost()
        return (
            ALLOWED_PRODUCTION_HOSTS.has(hostname) ||
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.endsWith('.israelakhas.workers.dev') ||
            hostname === vercelHost
        )
    } catch {
        return false
    }
}

export function resolveApplicationOrigin(request: Request): string {
    const suppliedOrigin = request.headers.get('origin')
    if (suppliedOrigin && isAllowedApplicationOrigin(suppliedOrigin)) {
        return new URL(suppliedOrigin).origin
    }

    const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
    const forwardedOrigin = host ? `${protocol}://${host}` : ''
    return isAllowedApplicationOrigin(forwardedOrigin) ? forwardedOrigin : SITE_URL
}
