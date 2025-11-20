import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import AuthButton from '@/components/auth-button'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '9jaDirectory - Find Businesses & Services in Nigeria',
  description: 'Discover and connect with businesses, services, and professionals across Nigeria. Your complete Nigerian business directory.',
  keywords: ['Nigeria business directory', 'Nigerian businesses', 'find services in Nigeria', '9ja directory', 'Lagos businesses', 'Abuja businesses'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-green-600">9jaDirectory</Link>
              </div>
              <div className="hidden md:flex space-x-8 items-center">
                <Link href="/" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                <Link href="/categories" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">Categories</Link>
                <Link href="/states" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">Locations</Link>
                <Link href="/add-business" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 ml-4">
                  List Your Business
                </Link>
                <div className="ml-4 flex items-center">
                  <AuthButton />
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-gray-900 text-white mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">9jaDirectory</h3>
                <p className="text-gray-400">Your trusted Nigerian business directory connecting local businesses with customers nationwide</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                  <li><Link href="/add-business" className="hover:text-white transition-colors">List Your Business</Link></li>
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
                  <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">Twitter</a>
                  <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">Instagram</a>
                  <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">Facebook</a>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 9jaDirectory. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
