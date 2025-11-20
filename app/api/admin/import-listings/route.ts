import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null as any

interface BusinessData {
  business_name: string
  phone: string
  address: string
  location: string
  category: string
  description: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businesses, dryRun = false } = body as { businesses: BusinessData[], dryRun?: boolean }

    if (!businesses || !Array.isArray(businesses)) {
      return NextResponse.json(
        { error: 'Invalid request. Expected array of businesses.' },
        { status: 400 }
      )
    }

    // Step 1: Get or create categories
    const categoryMap = new Map<string, string>()
    const uniqueCategories = [...new Set(businesses.map(b => b.category))]

    for (const categoryName of uniqueCategories) {
      const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      if (!dryRun) {
        if (!supabaseAdmin) {
          throw new Error('Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.')
        }

        // Try to get existing category
        let { data: existingCategory } = await supabaseAdmin
          .from('categories')
          .select('id, slug')
          .eq('slug', slug)
          .single()

        if (!existingCategory) {
          // Create new category
          const { data: newCategory, error } = await supabaseAdmin
            .from('categories')
            .insert({
              name: categoryName,
              slug: slug,
              icon: getCategoryIcon(categoryName),
              description: `${categoryName} services and businesses`
            })
            .select('id, slug')
            .single()

          // If category already exists (duplicate key error), fetch it
          if (error && error.code === '23505') {
            const { data: retryCategory } = await supabaseAdmin
              .from('categories')
              .select('id, slug')
              .eq('slug', slug)
              .single()
            existingCategory = retryCategory
          } else if (error) {
            throw error
          } else {
            existingCategory = newCategory
          }
        }

        categoryMap.set(categoryName, existingCategory!.id)
      } else {
        categoryMap.set(categoryName, 'dry-run-id')
      }
    }

    // Step 2: Get all states and create a map
    const stateMap = new Map<string, string>()
    const uniqueStates = [...new Set(businesses.map(b => b.location))]

    for (const stateName of uniqueStates) {
      const slug = stateName.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      if (!dryRun) {
        const { data: existingState } = await supabaseAdmin
          .from('states')
          .select('id, slug')
          .eq('slug', slug)
          .single()

        if (existingState) {
          stateMap.set(stateName, existingState.id)
        } else {
          // State not found - this shouldn't happen in production
          console.warn(`State not found: ${stateName} (${slug})`)
          // For now, try to find Lagos as fallback
          const { data: lagosState } = await supabaseAdmin
            .from('states')
            .select('id')
            .eq('slug', 'lagos')
            .single()

          if (lagosState) {
            stateMap.set(stateName, lagosState.id)
          }
        }
      } else {
        stateMap.set(stateName, 'dry-run-id')
      }
    }

    // Step 3: Prepare listings for insert
    const listings = businesses.map((business) => {
      const slug = business.business_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      return {
        business_name: business.business_name,
        slug: slug, // Use clean slug
        description: business.description,
        category_id: categoryMap.get(business.category),
        state_id: stateMap.get(business.location) || null,
        address: business.address,
        phone: business.phone,
        status: 'approved',
        verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }).filter(listing => listing.state_id !== null) // Filter out listings without valid state

    // Step 4: Check for existing slugs to avoid duplicates
    let uniqueListings = listings
    let duplicatesFound = 0

    if (!dryRun) {
      // Get all slugs from the listings we're trying to insert
      const slugsToCheck = listings.map(l => l.slug)
      console.log(`Checking ${slugsToCheck.length} slugs for duplicates...`)

      // Query database for existing listings in batches (PostgREST has limits)
      const existingSlugSet = new Set<string>()
      const batchSize = 100 // Check 100 slugs at a time

      for (let i = 0; i < slugsToCheck.length; i += batchSize) {
        const batch = slugsToCheck.slice(i, i + batchSize)
        const { data: existingSlugs, error } = await supabaseAdmin
          .from('listings')
          .select('slug')
          .in('slug', batch)

        if (error) {
          console.error('Error checking duplicates:', error)
        } else if (existingSlugs) {
          existingSlugs.forEach((item: any) => existingSlugSet.add(item.slug))
        }
      }

      console.log(`Found ${existingSlugSet.size} existing slugs in database`)

      // Filter out listings with slugs that already exist
      uniqueListings = listings.filter(listing => {
        const isDuplicate = existingSlugSet.has(listing.slug)
        if (isDuplicate) {
          duplicatesFound++
          console.log(`Skipping duplicate: ${listing.business_name} (${listing.slug})`)
        }
        return !isDuplicate
      })

      console.log(`Found ${duplicatesFound} duplicates, importing ${uniqueListings.length} unique businesses`)
    }

    // Step 5: Insert unique listings
    let insertResult = null
    if (!dryRun && uniqueListings.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('listings')
        .insert(uniqueListings)
        .select('id, business_name, slug')

      if (error) {
        console.error('Insert error:', error)
        return NextResponse.json(
          { error: 'Failed to insert listings', details: error.message },
          { status: 500 }
        )
      }

      insertResult = data
    }

    return NextResponse.json({
      success: true,
      message: dryRun
        ? 'Dry run successful. No data was inserted.'
        : duplicatesFound > 0
          ? `Successfully imported ${uniqueListings.length} unique businesses (skipped ${duplicatesFound} duplicates)`
          : `Successfully imported ${uniqueListings.length} businesses`,
      categoriesCreated: uniqueCategories.length,
      listingsInserted: dryRun ? 0 : uniqueListings.length,
      duplicatesSkipped: duplicatesFound,
      totalProcessed: listings.length,
      data: insertResult,
      preview: uniqueListings.slice(0, 3) // Show first 3 for verification
    }, { status: 200 })

  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// Helper function to get appropriate icon for category
function getCategoryIcon(categoryName: string): string {
  const iconMap: Record<string, string> = {
    'accommodation': '🏨',
    'business': '💼',
    'arts': '🎨',
    'sports': '⚽',
    'automotive': '🚗',
  }

  const key = categoryName.toLowerCase()
  return iconMap[key] || '🏢'
}

// GET endpoint to check API status
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/admin/import-listings',
    methods: ['POST'],
    description: 'Import business listings from CSV data',
    usage: {
      method: 'POST',
      body: {
        businesses: 'Array of business objects',
        dryRun: 'Boolean (optional) - test without inserting data'
      }
    }
  })
}
