import Link from 'next/link'

export const metadata = {
    title: 'Authentication Error | 9jaDirectory',
    description: 'There was an error with your authentication',
}

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
                <div className="text-red-500 text-5xl mb-4">!</div>
                <h2 className="text-3xl font-extrabold text-gray-900">
                    Authentication Error
                </h2>
                <p className="mt-2 text-gray-600">
                    We couldn't verify your email. This could happen if:
                </p>
                <ul className="mt-4 text-left text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                        <span className="mr-2">•</span>
                        The verification link has expired
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">•</span>
                        The link was already used
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">•</span>
                        There was a network error
                    </li>
                </ul>
                <div className="mt-6 space-y-3">
                    <Link
                        href="/signup"
                        className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
                    >
                        Try Again
                    </Link>
                    <Link
                        href="/login"
                        className="block text-green-600 hover:text-green-500 font-medium"
                    >
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    )
}
