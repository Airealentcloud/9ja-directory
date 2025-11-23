'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface WriteReviewModalProps {
    isOpen: boolean
    onClose: () => void
    listingId: string
    businessName: string
}

export default function WriteReviewModal({ isOpen, onClose, listingId, businessName }: WriteReviewModalProps) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (rating === 0) {
            setError('Please select a rating')
            return
        }

        if (comment.trim().length < 10) {
            setError('Please write at least 10 characters')
            return
        }

        setIsSubmitting(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setError('You must be logged in to write a review')
                return
            }

            // Call server action or API route here
            // For now, we'll use direct Supabase client for simplicity, 
            // but ideally this should be a Server Action for better security/validation
            const { error: submitError } = await supabase
                .from('reviews')
                .insert({
                    listing_id: listingId,
                    user_id: user.id,
                    rating,
                    comment,
                    status: 'pending' // Reviews start as pending
                })

            if (submitError) {
                if (submitError.code === '23505') {
                    throw new Error('You have already reviewed this business')
                }
                throw submitError
            }

            // Success
            onClose()
            setRating(0)
            setComment('')
            alert('Review submitted successfully! It will be visible after moderation.')
            router.refresh()
        } catch (err: any) {
            console.error('Error submitting review:', err)
            setError(err.message || 'Failed to submit review')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* Modal panel */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Write a Review for {businessName}
                                </h3>
                                <div className="mt-4">
                                    <form onSubmit={handleSubmit}>
                                        {/* Star Rating */}
                                        <div className="flex items-center justify-center mb-6">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className="p-1 focus:outline-none"
                                                    onMouseEnter={() => setHoveredRating(star)}
                                                    onMouseLeave={() => setHoveredRating(0)}
                                                    onClick={() => setRating(star)}
                                                >
                                                    <svg
                                                        className={`w-10 h-10 ${star <= (hoveredRating || rating)
                                                                ? 'text-yellow-400'
                                                                : 'text-gray-300'
                                                            } transition-colors duration-150`}
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Comment Textarea */}
                                        <div className="mb-4">
                                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Review
                                            </label>
                                            <textarea
                                                id="comment"
                                                rows={4}
                                                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                                placeholder="Share your experience with this business..."
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                required
                                            ></textarea>
                                        </div>

                                        {error && (
                                            <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                                                {error}
                                            </div>
                                        )}

                                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                            >
                                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                            <button
                                                type="button"
                                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                                onClick={onClose}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
