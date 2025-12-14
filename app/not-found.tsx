import Link from 'next/link'

const quickLinks = [
  { href: '/categories', label: 'Browse all categories' },
  { href: '/states', label: 'Browse by state' },
  { href: '/featured', label: 'Featured listings' },
  { href: '/add-business', label: 'Add your business' },
]

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        <div className="text-9xl font-bold text-green-600 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8 text-lg">
          We could not find the page you were looking for. Try searching for a business or use the quick links below.
        </p>

        <form action="/search" method="get" className="mb-6">
          <label htmlFor="q" className="sr-only">
            Search businesses
          </label>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              id="q"
              name="q"
              type="text"
              placeholder="Search businesses, services, cities..."
              className="w-full sm:w-96 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-green-500 hover:text-green-700 transition-colors"
            >
              <span className="font-semibold">{item.label}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Go Back Home
          </Link>

          <Link
            href="/contact"
            className="block w-full bg-white border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
