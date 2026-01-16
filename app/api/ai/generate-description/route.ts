import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { getPlanLimits, type PlanId } from '@/lib/pricing'

// Rate limit: requests per day per user
const DAILY_LIMIT_BY_PLAN: Record<PlanId, number> = {
    basic: 0,      // Basic plan doesn't have AI
    premium: 10,   // 10 generations per day
    lifetime: 50,  // 50 generations per day
}

interface GenerateRequest {
    businessName: string
    category: string
    location: string
    services?: string
    targetAudience?: string
    uniqueFeatures?: string
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'You must be logged in to use AI features' },
                { status: 401 }
            )
        }

        // Get user's plan
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_plan')
            .eq('id', user.id)
            .single()

        const userPlan = (profile?.subscription_plan as PlanId) || 'basic'
        const planLimits = getPlanLimits(userPlan)

        // Check if plan has AI description feature
        if (!planLimits?.hasAiDescription) {
            return NextResponse.json(
                {
                    error: 'AI Description Writer is not available on your plan',
                    upgrade: true,
                    message: 'Upgrade to Premium or Lifetime to access AI-powered description generation.'
                },
                { status: 403 }
            )
        }

        // Check rate limit
        const dailyLimit = DAILY_LIMIT_BY_PLAN[userPlan]
        const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

        // Get today's usage count
        const { data: usageData, error: usageError } = await supabase
            .from('ai_usage')
            .select('usage_count')
            .eq('user_id', user.id)
            .eq('feature', 'description_generator')
            .eq('usage_date', today)
            .maybeSingle()

        if (usageError && !usageError.message.includes('does not exist')) {
            console.error('Error checking AI usage:', usageError)
        }

        const currentUsage = usageData?.usage_count || 0

        if (currentUsage >= dailyLimit) {
            return NextResponse.json(
                {
                    error: 'Daily limit reached',
                    message: `You've used all ${dailyLimit} AI generations for today. Try again tomorrow.`,
                    remaining: 0,
                    limit: dailyLimit
                },
                { status: 429 }
            )
        }

        // Get request body
        const body: GenerateRequest = await request.json()
        const { businessName, category, location, services, targetAudience, uniqueFeatures } = body

        if (!businessName?.trim()) {
            return NextResponse.json(
                { error: 'Business name is required' },
                { status: 400 }
            )
        }

        if (!category?.trim()) {
            return NextResponse.json(
                { error: 'Category is required' },
                { status: 400 }
            )
        }

        // Check for Anthropic API key
        const apiKey = process.env.ANTHROPIC_API_KEY
        if (!apiKey) {
            console.error('ANTHROPIC_API_KEY not configured')
            return NextResponse.json(
                { error: 'AI service not configured. Please contact support.' },
                { status: 500 }
            )
        }

        // Initialize Anthropic client
        const anthropic = new Anthropic({ apiKey })

        // Build the prompt
        const prompt = buildPrompt({
            businessName,
            category,
            location,
            services,
            targetAudience,
            uniqueFeatures
        })

        // Generate description using Claude
        const message = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 500,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        })

        // Extract text content
        const textContent = message.content.find(block => block.type === 'text')
        if (!textContent || textContent.type !== 'text') {
            throw new Error('No text response from AI')
        }

        const description = textContent.text.trim()

        // Update usage count
        if (usageData) {
            // Update existing record
            await supabase
                .from('ai_usage')
                .update({ usage_count: currentUsage + 1, updated_at: new Date().toISOString() })
                .eq('user_id', user.id)
                .eq('feature', 'description_generator')
                .eq('usage_date', today)
        } else {
            // Insert new record
            await supabase
                .from('ai_usage')
                .insert({
                    user_id: user.id,
                    feature: 'description_generator',
                    usage_date: today,
                    usage_count: 1
                })
        }

        return NextResponse.json({
            success: true,
            description,
            remaining: dailyLimit - currentUsage - 1,
            limit: dailyLimit
        })

    } catch (error) {
        console.error('AI description generation error:', error)

        // Handle Anthropic-specific errors
        if (error instanceof Anthropic.APIError) {
            if (error.status === 401) {
                return NextResponse.json(
                    { error: 'AI service authentication failed' },
                    { status: 500 }
                )
            }
            if (error.status === 429) {
                return NextResponse.json(
                    { error: 'AI service is busy. Please try again in a moment.' },
                    { status: 503 }
                )
            }
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate description' },
            { status: 500 }
        )
    }
}

function buildPrompt(data: GenerateRequest): string {
    const { businessName, category, location, services, targetAudience, uniqueFeatures } = data

    let prompt = `You are a professional copywriter creating business descriptions for a Nigerian business directory. Write a compelling, professional description for this business:

Business Name: ${businessName}
Category: ${category}
Location: ${location}, Nigeria`

    if (services?.trim()) {
        prompt += `\nServices/Products: ${services}`
    }

    if (targetAudience?.trim()) {
        prompt += `\nTarget Audience: ${targetAudience}`
    }

    if (uniqueFeatures?.trim()) {
        prompt += `\nUnique Features: ${uniqueFeatures}`
    }

    prompt += `

Requirements:
- Write 2-3 paragraphs (150-250 words total)
- Use professional but warm Nigerian English
- Highlight key services and value propositions
- Include a call to action at the end
- Make it engaging and trust-building
- Do NOT include contact information or addresses
- Do NOT use placeholder text like [Business Name]
- Write in third person

Output only the description text, no titles or labels.`

    return prompt
}
