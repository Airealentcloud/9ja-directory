import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import AuthButton from '@/components/auth-button'
import NavLink from '@/components/nav-link'
import MobileNav from '@/components/mobile-nav'
import NewsletterSignup from '@/components/newsletter-signup'
import GoogleAnalytics from '@/components/google-analytics'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.9jadirectory.org'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: '9jaDirectory - Find Businesses & Services in Nigeria',
  description: 'Discover and connect with trusted businesses, services, and professionals across Nigeria. Your complete Nigerian business directory for Lagos, Abuja, and all 36 states.',
  keywords: ['Nigeria business directory', 'Nigerian businesses', 'find services in Nigeria', '9ja directory', 'Lagos businesses', 'Abuja businesses', 'local services Nigeria', 'Nigerian companies'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: siteUrl,
    siteName: '9jaDirectory',
    title: '9jaDirectory - Find Businesses & Services in Nigeria',
    description: 'Discover and connect with trusted businesses, services, and professionals across Nigeria.',
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
    card: 'summary_large_image',
    title: '9jaDirectory - Find Businesses & Services in Nigeria',
    description: 'Discover and connect with trusted businesses, services, and professionals across Nigeria.',
    images: ['/opengraph-image'],
    creator: '@9jaDirectory',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleAnalytics />
        <nav className="sticky top-0 z-50 bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <NavLink href="/" className="text-2xl font-bold text-green-600">9jaDirectory</NavLink>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex space-x-8 items-center">
                  <NavLink href="/" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">Home</NavLink>
                  <NavLink href="/categories" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">Categories</NavLink>
                  <NavLink href="/states" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">Locations</NavLink>
                  <NavLink href="/blog" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">Blog</NavLink>
                  <NavLink href="/press-release" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">Press Release</NavLink>
                  <NavLink href="/pricing" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">Pricing</NavLink>
                  <NavLink href="/pricing" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 ml-4">
                    Get Listed
                  </NavLink>
                  <div className="ml-4 flex items-center">
                    <AuthButton user={user} />
                  </div>
                </div>
                <div className="md:hidden">
                  <MobileNav>
                    <AuthButton user={user} variant="mobile" />
                  </MobileNav>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-gray-900 text-white mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold mb-4">9jaDirectory</h3>
                <p className="text-gray-400 mb-6">Your trusted Nigerian business directory connecting local businesses with customers nationwide</p>
                <NewsletterSignup />
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/press-release" className="hover:text-white transition-colors">Press Release</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                  <li><Link href="/pricing" className="hover:text-white transition-colors">Get Listed</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Browse</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/categories" className="hover:text-white transition-colors">All Categories</Link></li>
                  <li><Link href="/states" className="hover:text-white transition-colors">Browse States</Link></li>
                  <li><Link href="/featured" className="hover:text-white transition-colors">Featured Businesses</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                </ul>
                <h4 className="font-semibold mt-6 mb-4">Follow Us</h4>
                <div className="flex space-x-4 text-gray-400">
                  <a href="https://twitter.com/9jaDirectory" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Twitter">Twitter</a>
                  <a href="https://instagram.com/9jaDirectory" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">Instagram</a>
                  <a href="https://facebook.com/9jaDirectory" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">Facebook</a>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} 9jaDirectory. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
