/** @type {import('next').NextConfig} */
const nextConfig = {
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
        ]
    },
};

module.exports = nextConfig;
