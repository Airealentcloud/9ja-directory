'use client'

import Link from 'next/link'

interface ClaimButtonProps {
    slug: string
    isClaimed: boolean
    isLoggedIn?: boolean
    canClaim?: boolean
}

export default function ClaimButton({ slug, isClaimed, isLoggedIn, canClaim }: ClaimButtonProps) {
    if (isClaimed) return null

    // Not logged in — prompt to sign up
    if (!isLoggedIn) {
        return (
            <div className="mt-6 pt-6 border-t">
                <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">
                        Is this your business?
                    </h3>
                    <p className="text-xs text-blue-700 mb-3">
                        Sign up and claim this listing to manage details, reply to reviews, and more.
                    </p>
                    <Link
                        href={`/signup?next=/listings/${slug}/claim`}
                        className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        Sign Up to Claim
                    </Link>
                </div>
            </div>
        )
    }

    // Logged in but on Basic plan — prompt to upgrade
    if (!canClaim) {
        return (
            <div className="mt-6 pt-6 border-t">
                <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">
                        Is this your business?
                    </h3>
                    <p className="text-xs text-blue-700 mb-3">
                        Upgrade to a Premium plan to claim this listing, manage details, and reply to reviews.
                    </p>
                    <Link
                        href="/pricing"
                        className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        Upgrade to Claim
                    </Link>
                </div>
            </div>
        )
    }

    // Premium/Lifetime user — can claim
    return (
        <div className="mt-6 pt-6 border-t">
            <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    Is this your business?
                </h3>
                <p className="text-xs text-blue-700 mb-3">
                    Claim this listing to manage details, reply to reviews, and more.
                </p>
                <Link
                    href={`/listings/${slug}/claim`}
                    className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    Claim this Business
                </Link>
            </div>
        </div>
    )
}
