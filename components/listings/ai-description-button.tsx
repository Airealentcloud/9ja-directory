'use client'

import { useState } from 'react'
import Link from 'next/link'

interface AIDescriptionButtonProps {
    businessName: string
    category: string
    location: string
    hasAccess: boolean
    onDescriptionGenerated: (description: string) => void
}

interface AdditionalInputs {
    services: string
    targetAudience: string
    uniqueFeatures: string
}

export default function AIDescriptionButton({
    businessName,
    category,
    location,
    hasAccess,
    onDescriptionGenerated
}: AIDescriptionButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [remaining, setRemaining] = useState<number | null>(null)
    const [additionalInputs, setAdditionalInputs] = useState<AdditionalInputs>({
        services: '',
        targetAudience: '',
        uniqueFeatures: ''
    })

    const handleGenerate = async () => {
        if (!businessName.trim() || !category.trim()) {
            setError('Please enter a business name and select a category first.')
            return
        }

        setIsGenerating(true)
        setError(null)

        try {
            const response = await fetch('/api/ai/generate-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessName,
                    category,
                    location: location || 'Nigeria',
                    services: additionalInputs.services,
                    targetAudience: additionalInputs.targetAudience,
                    uniqueFeatures: additionalInputs.uniqueFeatures
                })
            })

            const data = await response.json()

            if (!response.ok) {
                if (data.upgrade) {
                    setError(data.message || 'Upgrade required to use AI features.')
                } else if (response.status === 429) {
                    setError(data.message || 'Daily limit reached. Try again tomorrow.')
                } else {
                    setError(data.error || 'Failed to generate description.')
                }
                return
            }

            if (data.description) {
                onDescriptionGenerated(data.description)
                setShowModal(false)
                setAdditionalInputs({ services: '', targetAudience: '', uniqueFeatures: '' })
            }

            if (typeof data.remaining === 'number') {
                setRemaining(data.remaining)
            }

        } catch (err) {
            console.error('AI generation error:', err)
            setError('Network error. Please try again.')
        } finally {
            setIsGenerating(false)
        }
    }

    // No access - show upgrade prompt
    if (!hasAccess) {
        return (
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                    <SparklesIcon className="w-4 h-4 mr-1" />
                    Generate with AI
                </button>
                <Link
                    href="/pricing"
                    className="text-xs text-amber-600 hover:text-amber-700 underline"
                >
                    Upgrade to unlock
                </Link>
            </div>
        )
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={isGenerating}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all shadow-sm"
            >
                <SparklesIcon className="w-4 h-4 mr-1" />
                {isGenerating ? 'Generating...' : 'Generate with AI'}
            </button>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/50 transition-opacity"
                            onClick={() => !isGenerating && setShowModal(false)}
                        />

                        {/* Modal content */}
                        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 z-10">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                                        <SparklesIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">AI Description Writer</h3>
                                        <p className="text-xs text-gray-500">Powered by Claude AI</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => !isGenerating && setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                    disabled={isGenerating}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Info box */}
                            <div className="bg-purple-50 rounded-lg p-3 mb-4">
                                <p className="text-sm text-purple-800">
                                    <strong>Generating for:</strong> {businessName || 'Your Business'}
                                </p>
                                <p className="text-xs text-purple-600 mt-1">
                                    Category: {category || 'Not selected'} • Location: {location || 'Nigeria'}
                                </p>
                            </div>

                            {/* Optional inputs */}
                            <div className="space-y-3 mb-4">
                                <p className="text-sm text-gray-600">Add more details for a better description (optional):</p>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Services/Products offered
                                    </label>
                                    <input
                                        type="text"
                                        value={additionalInputs.services}
                                        onChange={(e) => setAdditionalInputs(prev => ({ ...prev, services: e.target.value }))}
                                        placeholder="e.g., Web design, SEO, branding"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                                        disabled={isGenerating}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Target audience
                                    </label>
                                    <input
                                        type="text"
                                        value={additionalInputs.targetAudience}
                                        onChange={(e) => setAdditionalInputs(prev => ({ ...prev, targetAudience: e.target.value }))}
                                        placeholder="e.g., Small businesses, startups"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                                        disabled={isGenerating}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Unique features/selling points
                                    </label>
                                    <input
                                        type="text"
                                        value={additionalInputs.uniqueFeatures}
                                        onChange={(e) => setAdditionalInputs(prev => ({ ...prev, uniqueFeatures: e.target.value }))}
                                        placeholder="e.g., 24/7 support, free consultation"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                                        disabled={isGenerating}
                                    />
                                </div>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            {/* Remaining uses */}
                            {remaining !== null && (
                                <p className="text-xs text-gray-500 mb-4">
                                    {remaining} generations remaining today
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    disabled={isGenerating}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !businessName.trim() || !category.trim()}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isGenerating ? (
                                        <>
                                            <LoadingSpinner className="w-4 h-4 mr-2" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="w-4 h-4 mr-1" />
                                            Generate Description
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
    )
}

function LoadingSpinner({ className }: { className?: string }) {
    return (
        <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    )
}
