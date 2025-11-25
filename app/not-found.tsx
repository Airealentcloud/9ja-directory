import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                <div className="text-9xl font-bold text-green-600 mb-4">404</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                <p className="text-gray-600 mb-8 text-lg">
                    Oops! The page you are looking for seems to have gone on a holiday.
                    It might have been moved, deleted, or possibly never existed.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/"
                        className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                        Go Back Home
                    </Link>

                    <Link
                        href="/categories"
                        className="block w-full bg-white border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                    >
                        Browse Categories
                    </Link>
                </div>

                <div className="mt-12 text-gray-500 text-sm">
                    <p>Need help? <Link href="/contact" className="text-green-600 hover:underline">Contact Support</Link></p>
                </div>
            </div>
        </div>
    )
}
