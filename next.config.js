/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                ],
            },
        ]
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
    async redirects() {
        return [
            {
                source: '/categories/:categorySlug/abuja',
                destination: '/categories/:categorySlug/fct',
                permanent: true,
            },
            {
                source: '/states/abuja',
                destination: '/states/fct',
                permanent: true,
            },
            // Catch malformed ampersand URLs seen in Google crawl logs
            {
                source: '/&',
                destination: '/',
                permanent: true,
            },
            {
                source: '/%26',
                destination: '/',
                permanent: true,
            },
        ]
    },
};

module.exports = nextConfig;
