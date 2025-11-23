'use client'

import { useState } from 'react'
import WriteReviewModal from './write-review-modal'

interface ReviewButtonProps {
    listingId: string
    businessName: string
}

export default function ReviewButton({ listingId, businessName }: ReviewButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 px-6 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
                Write a Review
            </button>

            <WriteReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                listingId={listingId}
                businessName={businessName}
            />
        </>
    )
}
