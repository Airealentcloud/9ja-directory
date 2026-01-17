import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Rate limits for AI review analysis
const RATE_LIMITS = {
    lifetime: 20,  // 20 analyses per day
}

interface ReviewData {
    id: string
    rating: number
    comment: string
    created_at: string
    reviewer_name?: string | null
}

interface SentimentResult {
    overall_sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
    sentiment_score: number // -1 to 1
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

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        // Get user's profile and check for Lifetime plan
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_plan')
            .eq('id', user.id)
            .single()

        if (profile?.subscription_plan !== 'lifetime') {
            return NextResponse.json(
                {
                    error: 'AI Review Insights is exclusive to Lifetime plan members.',
                    upgrade: true
                },
                { status: 403 }
            )
        }

        // Check rate limit
        const today = new Date().toISOString().split('T')[0]
        const { data: usage } = await supabase
            .from('ai_usage')
            .select('usage_count')
            .eq('user_id', user.id)
            .eq('feature', 'review_insights')
            .eq('usage_date', today)
            .single()

        const currentUsage = usage?.usage_count || 0
        const limit = RATE_LIMITS.lifetime

        if (currentUsage >= limit) {
            return NextResponse.json(
                {
                    error: `Daily limit reached (${limit} analyses). Try again tomorrow.`,
                    remaining: 0
                },
                { status: 429 }
            )
        }

        // Parse request body
        const body = await request.json()
        const { listingId } = body

        if (!listingId) {
            return NextResponse.json(
                { error: 'Listing ID is required' },
                { status: 400 }
            )
        }

        // Verify user owns this listing
        const { data: listing } = await supabase
            .from('listings')
            .select('id, business_name, user_id')
            .eq('id', listingId)
            .single()

        if (!listing || listing.user_id !== user.id) {
            return NextResponse.json(
                { error: 'You can only analyze reviews for your own listings' },
                { status: 403 }
            )
        }

        // Fetch approved reviews for this listing
        const { data: reviews, error: reviewsError } = await supabase
            .from('reviews')
            .select('id, rating, comment, created_at, reviewer_name')
            .eq('listing_id', listingId)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(50)

        if (reviewsError) {
            console.error('Error fetching reviews:', reviewsError)
            return NextResponse.json(
                { error: 'Failed to fetch reviews' },
                { status: 500 }
            )
        }

        if (!reviews || reviews.length === 0) {
            return NextResponse.json(
                { error: 'No approved reviews found for this listing' },
                { status: 404 }
            )
        }

        // Prepare reviews for analysis
        const reviewsText = reviews.map((r: ReviewData, i: number) =>
            `Review ${i + 1} (${r.rating}/5 stars): "${r.comment}"`
        ).join('\n\n')

        // Call Claude API for sentiment analysis
        const message = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1500,
            messages: [
                {
                    role: 'user',
                    content: `You are an expert business analyst. Analyze the following customer reviews for "${listing.business_name}" and provide insights.

REVIEWS:
${reviewsText}

Provide a JSON response with this exact structure (no markdown, just pure JSON):
{
    "overall_sentiment": "positive" | "neutral" | "negative" | "mixed",
    "sentiment_score": <number between -1 and 1>,
    "key_themes": ["theme1", "theme2", "theme3"],
    "strengths": ["strength1", "strength2"],
    "areas_for_improvement": ["area1", "area2"],
    "summary": "<2-3 sentence summary of overall customer sentiment>",
    "recommendation": "<1-2 sentence actionable recommendation for the business owner>",
    "individual_reviews": [
        {
            "id": "<review number>",
            "sentiment": "positive" | "neutral" | "negative",
            "key_points": ["point1", "point2"]
        }
    ]
}

Be specific, constructive, and helpful. Focus on actionable insights.`
                }
            ]
        })

        // Extract the text response
        const responseText = message.content[0].type === 'text'
            ? message.content[0].text
            : ''

        // Parse the JSON response
        let insights: SentimentResult
        try {
            // Clean up potential markdown formatting
            const cleanJson = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim()
            insights = JSON.parse(cleanJson)
        } catch {
            console.error('Failed to parse AI response:', responseText)
            return NextResponse.json(
                { error: 'Failed to parse AI analysis' },
                { status: 500 }
            )
        }

        // Update usage count
        if (usage) {
            await supabase
                .from('ai_usage')
                .update({ usage_count: currentUsage + 1 })
                .eq('user_id', user.id)
                .eq('feature', 'review_insights')
                .eq('usage_date', today)
        } else {
            await supabase
                .from('ai_usage')
                .insert({
                    user_id: user.id,
                    feature: 'review_insights',
                    usage_date: today,
                    usage_count: 1
                })
        }

        // Store the analysis result
        await supabase
            .from('review_insights')
            .upsert({
                listing_id: listingId,
                user_id: user.id,
                insights: insights,
                review_count: reviews.length,
                analyzed_at: new Date().toISOString()
            }, {
                onConflict: 'listing_id'
            })

        return NextResponse.json({
            success: true,
            insights,
            review_count: reviews.length,
            remaining: limit - currentUsage - 1
        })

    } catch (error) {
        console.error('Review analysis error:', error)
        return NextResponse.json(
            { error: 'Failed to analyze reviews' },
            { status: 500 }
        )
    }
}

// GET endpoint to fetch cached insights
export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)
        const listingId = searchParams.get('listingId')

        if (!listingId) {
            return NextResponse.json(
                { error: 'Listing ID is required' },
                { status: 400 }
            )
        }

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        // Get user's profile and check for Lifetime plan
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_plan')
            .eq('id', user.id)
            .single()

        if (profile?.subscription_plan !== 'lifetime') {
            return NextResponse.json(
                { error: 'AI Review Insights is exclusive to Lifetime plan members.', upgrade: true },
                { status: 403 }
            )
        }

        // Fetch cached insights
        const { data: cachedInsights } = await supabase
            .from('review_insights')
            .select('*')
            .eq('listing_id', listingId)
            .eq('user_id', user.id)
            .single()

        if (cachedInsights) {
            return NextResponse.json({
                success: true,
                insights: cachedInsights.insights,
                review_count: cachedInsights.review_count,
                analyzed_at: cachedInsights.analyzed_at,
                cached: true
            })
        }

        return NextResponse.json({
            success: false,
            message: 'No cached insights found. Run an analysis first.'
        })

    } catch (error) {
        console.error('Error fetching insights:', error)
        return NextResponse.json(
            { error: 'Failed to fetch insights' },
            { status: 500 }
        )
    }
}
