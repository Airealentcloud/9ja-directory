'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ReviewInsightsProps {
    listingId: string
    listingName: string
    hasAccess: boolean
    reviewCount: number
}

interface SentimentResult {
    overall_sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
    sentiment_score: number
    key_themes: string[]
    strengths: string[]
    areas_for_improvement: string[]
    summary: string
    recommendation: string
    individual_reviews: {
        id: string
        sentiment: 'positive' | 'neutral' | 'negative'
        key_points: string[]
    }[]
}

interface InsightsData {
    insights: SentimentResult
    review_count: number
    analyzed_at?: string
    cached?: boolean
}

export default function ReviewInsights({
    listingId,
    listingName,
    hasAccess,
    reviewCount
}: ReviewInsightsProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [insights, setInsights] = useState<InsightsData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [remaining, setRemaining] = useState<number | null>(null)

    // Fetch cached insights on mount
    useEffect(() => {
        if (hasAccess && reviewCount > 0) {
            fetchCachedInsights()
        }
    }, [hasAccess, reviewCount, listingId])

    const fetchCachedInsights = async () => {
        try {
            const response = await fetch(`/api/ai/analyze-reviews?listingId=${listingId}`)
            if (response.ok) {
                const data = await response.json()
                if (data.success && data.insights) {
                    setInsights(data)
                }
            }
        } catch (err) {
            console.error('Error fetching cached insights:', err)
        }
    }

    const analyzeReviews = async () => {
        setIsAnalyzing(true)
        setError(null)

        try {
            const response = await fetch('/api/ai/analyze-reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Failed to analyze reviews')
                return
            }

            setInsights(data)
            if (typeof data.remaining === 'number') {
                setRemaining(data.remaining)
            }
        } catch (err) {
            console.error('Analysis error:', err)
            setError('Network error. Please try again.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    // No access - show upgrade prompt
    if (!hasAccess) {
        return (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <BrainIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">AI Review Insights</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Get AI-powered sentiment analysis of your customer reviews. Understand what customers love and where to improve.
                        </p>
                        <div className="mt-4 p-3 bg-white/50 rounded-lg">
                            <p className="text-sm text-purple-800 font-medium">
                                This feature is exclusive to Lifetime plan members.
                            </p>
                            <Link
                                href="/pricing"
                                className="mt-2 inline-flex items-center text-sm font-medium text-purple-700 hover:text-purple-900"
                            >
                                Upgrade to Lifetime →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // No reviews to analyze
    if (reviewCount === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <BrainIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">AI Review Insights</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            No reviews yet. Once customers leave reviews, you can analyze them with AI.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const sentimentConfig = {
        positive: { color: 'text-green-700', bg: 'bg-green-100', icon: '😊' },
        neutral: { color: 'text-gray-700', bg: 'bg-gray-100', icon: '😐' },
        negative: { color: 'text-red-700', bg: 'bg-red-100', icon: '😟' },
        mixed: { color: 'text-amber-700', bg: 'bg-amber-100', icon: '🤔' },
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <BrainIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">AI Review Insights</h3>
                            <p className="text-purple-100 text-sm">
                                {reviewCount} review{reviewCount !== 1 ? 's' : ''} • Powered by Claude AI
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={analyzeReviews}
                        disabled={isAnalyzing}
                        className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium text-sm hover:bg-purple-50 disabled:opacity-50 transition-colors"
                    >
                        {isAnalyzing ? (
                            <span className="flex items-center gap-2">
                                <LoadingSpinner className="w-4 h-4" />
                                Analyzing...
                            </span>
                        ) : insights ? (
                            'Re-analyze'
                        ) : (
                            'Analyze Reviews'
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {remaining !== null && (
                    <p className="text-xs text-gray-500 mb-4">
                        {remaining} analysis{remaining !== 1 ? 'es' : ''} remaining today
                    </p>
                )}

                {!insights && !isAnalyzing && !error && (
                    <div className="text-center py-8">
                        <BrainIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">
                            Click "Analyze Reviews" to get AI-powered insights
                        </p>
                    </div>
                )}

                {isAnalyzing && (
                    <div className="text-center py-8">
                        <LoadingSpinner className="w-12 h-12 mx-auto text-purple-500 mb-3" />
                        <p className="text-gray-600">Analyzing {reviewCount} reviews...</p>
                        <p className="text-sm text-gray-400 mt-1">This may take a few seconds</p>
                    </div>
                )}

                {insights && !isAnalyzing && (
                    <div className="space-y-6">
                        {/* Overall Sentiment */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-500">Overall Sentiment</p>
                                <p className={`text-xl font-bold capitalize ${sentimentConfig[insights.insights.overall_sentiment].color}`}>
                                    {insights.insights.overall_sentiment}
                                </p>
                            </div>
                            <div className="text-4xl">
                                {sentimentConfig[insights.insights.overall_sentiment].icon}
                            </div>
                        </div>

                        {/* Sentiment Score Bar */}
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Sentiment Score</p>
                            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${
                                        insights.insights.sentiment_score > 0.3 ? 'bg-green-500' :
                                        insights.insights.sentiment_score < -0.3 ? 'bg-red-500' :
                                        'bg-amber-500'
                                    }`}
                                    style={{ width: `${((insights.insights.sentiment_score + 1) / 2) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Negative</span>
                                <span>Neutral</span>
                                <span>Positive</span>
                            </div>
                        </div>

                        {/* Summary */}
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Summary</p>
                            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {insights.insights.summary}
                            </p>
                        </div>

                        {/* Key Themes */}
                        {insights.insights.key_themes.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Key Themes</p>
                                <div className="flex flex-wrap gap-2">
                                    {insights.insights.key_themes.map((theme, i) => (
                                        <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                            {theme}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Strengths & Areas for Improvement */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Strengths */}
                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Strengths
                                </p>
                                <ul className="space-y-1">
                                    {insights.insights.strengths.map((s, i) => (
                                        <li key={i} className="text-sm text-green-700">• {s}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Areas for Improvement */}
                            <div className="bg-amber-50 rounded-lg p-4">
                                <p className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Areas for Improvement
                                </p>
                                <ul className="space-y-1">
                                    {insights.insights.areas_for_improvement.map((a, i) => (
                                        <li key={i} className="text-sm text-amber-700">• {a}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-blue-800 mb-1">
                                AI Recommendation
                            </p>
                            <p className="text-sm text-blue-700">
                                {insights.insights.recommendation}
                            </p>
                        </div>

                        {/* Last analyzed */}
                        {insights.analyzed_at && (
                            <p className="text-xs text-gray-400 text-right">
                                {insights.cached ? 'Cached analysis from ' : 'Analyzed '}
                                {new Date(insights.analyzed_at).toLocaleString()}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function BrainIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
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
