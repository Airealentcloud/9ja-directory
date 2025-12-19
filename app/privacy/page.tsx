import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy | 9jaDirectory',
    description: 'Read the 9jaDirectory privacy policy to learn how we collect, use, and protect your data when you use our platform.',
    alternates: {
        canonical: 'https://9jadirectory.org/privacy',
    },
    openGraph: {
        title: 'Privacy Policy | 9jaDirectory',
        description: 'Learn how 9jaDirectory collects, uses, and protects your data.',
        url: 'https://9jadirectory.org/privacy',
        siteName: '9jaDirectory',
        locale: 'en_NG',
        type: 'website',
        images: [
            {
                url: '/opengraph-image',
                width: 1200,
                height: 630,
                alt: '9jaDirectory',
            },
        ],
    },
    twitter: {
        card: 'summary',
        title: 'Privacy Policy | 9jaDirectory',
        description: 'Learn how 9jaDirectory collects, uses, and protects your data.',
        images: ['/opengraph-image'],
    },
}

export default function PrivacyPage() {
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://9jadirectory.org' },
            { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: 'https://9jadirectory.org/privacy' },
        ],
    }

    const pageSchema = {
        '@context': 'https://schema.org',
        '@type': ['WebPage', 'PrivacyPolicy'],
        '@id': 'https://9jadirectory.org/privacy#page',
        name: 'Privacy Policy',
        url: 'https://9jadirectory.org/privacy',
        description: 'Privacy policy and data protection information for 9jaDirectory users.',
        inLanguage: 'en-NG',
        isPartOf: { '@type': 'WebSite', '@id': 'https://9jadirectory.org#website' },
        publisher: { '@type': 'Organization', '@id': 'https://9jadirectory.org#organization' },
        dateModified: new Date().toISOString(),
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

                    <div className="prose prose-green max-w-none text-gray-700">
                        <p className="lead">
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>

                        <h3>1. Introduction</h3>
                        <p>
                            At 9jaDirectory, we respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                        </p>

                        <h3>2. Information We Collect</h3>
                        <p>
                            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                        </p>
                        <ul>
                            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
                            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access this website.</li>
                            <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
                        </ul>

                        <h3>3. How We Use Your Personal Data</h3>
                        <p>
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        <ul>
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                            <li>Where we need to comply with a legal or regulatory obligation.</li>
                        </ul>

                        <h3>4. Data Security</h3>
                        <p>
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                            In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                        </p>

                        <h3>5. Third-Party Links</h3>
                        <p>
                            This website may include links to third-party websites, plug-ins and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you.
                            We do not control these third-party websites and are not responsible for their privacy statements.
                        </p>

                        <h3>6. Contact Us</h3>
                        <p>
                            If you have any questions about this privacy policy or our privacy practices, please contact us at support@9jadirectory.org.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
