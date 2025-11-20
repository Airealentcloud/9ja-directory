import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import csv from 'csv-parser'

// Initialize Supabase client
// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if keys exist (to avoid build errors if script is included)
const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null as any

// Category mapping from CSV to database
const categoryMapping: Record<string, string> = {
  'Agriculture': 'agriculture',
  'Travel': 'transportation',
  'Services': 'professional-services',
  'RealEstate': 'real-estate',
  'Education': 'education',
}

// Helper function to generate slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Helper function to extract phone numbers
function cleanPhone(phone: string): string {
  if (!phone) return ''
  // Remove all non-numeric characters except +
  return phone.replace(/[^0-9+]/g, '')
}

// Helper function to parse address for state
function extractStateFromAddress(address: string): string | null {
  const addressLower = address.toLowerCase()

  // Common Lagos identifiers
  if (addressLower.includes('lagos')) return 'lagos'
  if (addressLower.includes('ikeja')) return 'lagos'
  if (addressLower.includes('lekki')) return 'lagos'
  if (addressLower.includes('victoria island')) return 'lagos'
  if (addressLower.includes('yaba')) return 'lagos'
  if (addressLower.includes('surulere')) return 'lagos'

  // Add more state patterns as needed
  if (addressLower.includes('abuja')) return 'fct'
  if (addressLower.includes('abia')) return 'abia'
  if (addressLower.includes('enugu')) return 'enugu'

  return 'lagos' // Default to Lagos for this dataset
}

// Helper function to extract city
function extractCityFromAddress(address: string): string | null {
  const addressLower = address.toLowerCase()

  // Lagos areas
  if (addressLower.includes('ikeja')) return 'ikeja'
  if (addressLower.includes('lekki')) return 'lekki'
  if (addressLower.includes('victoria island')) return 'victoria-island'
  if (addressLower.includes('yaba')) return 'yaba'
  if (addressLower.includes('surulere')) return 'surulere'
  if (addressLower.includes('ikoyi')) return 'ikoyi'
  if (addressLower.includes('maryland')) return 'maryland'
  if (addressLower.includes('ajah')) return 'ajah'

  return null
}

interface CSVRow {
  Name: string
  Address: string
  Phone: string
  Email: string
  Website: string
  Year_Established: string
  Registration_VAT: string
  Employees: string
  Manager: string
  Category: string
  Description: string
  Map_Location: string
  Photos_Gallery: string
  Image: string
}

interface ImportStats {
  total: number
  successful: number
  failed: number
  errors: Array<{ row: number; name: string; error: string }>
}

async function importListings(csvPath: string): Promise<ImportStats> {
  const stats: ImportStats = {
    total: 0,
    successful: 0,
    failed: 0,
    errors: []
  }

  const rows: CSVRow[] = []

  // Read CSV file
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row: CSVRow) => {
        rows.push(row)
      })
      .on('end', async () => {
        console.log(`📊 Total rows to import: ${rows.length}`)
        stats.total = rows.length

        // Check if Supabase client is initialized
        if (!supabase) {
          reject(new Error('Supabase credentials missing. Check .env.local'))
          return
        }

        // Get states and categories from database
        const { data: states } = await supabase.from('states').select('id, slug')
        const { data: categories } = await supabase.from('categories').select('id, slug')
        const { data: cities } = await supabase.from('cities').select('id, slug')

        if (!states || !categories) {
          console.error('❌ Failed to fetch states or categories')
          reject(new Error('Failed to fetch reference data'))
          return
        }

        // Create lookup maps
        const stateMap = new Map((states || []).map((s: any) => [s.slug, s.id]))
        const categoryMap = new Map((categories || []).map((c: any) => [c.slug, c.id]))
        const cityMap = new Map((cities || []).map((c: any) => [c.slug, c.id]))

        // Process each row
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i]

          try {
            // Map category
            const csvCategory = row.Category || 'Services'
            const categorySlug = categoryMapping[csvCategory] || 'professional-services'
            const categoryId = categoryMap.get(categorySlug)

            if (!categoryId) {
              throw new Error(`Category not found: ${categorySlug}`)
            }

            // Extract state and city
            const stateSlug = extractStateFromAddress(row.Address)
            const stateId = stateSlug ? stateMap.get(stateSlug) : null

            const citySlugCandidate = extractCityFromAddress(row.Address)
            const cityId = citySlugCandidate ? cityMap.get(citySlugCandidate) : null

            // Generate unique slug
            const baseSlug = generateSlug(row.Name)
            const slug = `${baseSlug}-${i + 1}`

            // Parse year
            const establishedYear = row.Year_Established
              ? parseInt(row.Year_Established.replace('.0', ''))
              : null

            // Prepare listing data
            const listingData = {
              business_name: row.Name,
              slug: slug,
              description: row.Description || null,
              category_id: categoryId,
              state_id: stateId,
              city_id: cityId,
              address: row.Address || null,
              phone: cleanPhone(row.Phone) || null,
              email: row.Email || null,
              website: row.Website || null,
              established_year: establishedYear,
              status: 'approved', // Auto-approve imported listings
              verified: false,
              logo_url: row.Image ? `/images/categories/${row.Image}` : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }

            // Insert into database
            const { error } = await supabase
              .from('listings')
              .insert(listingData)

            if (error) {
              throw error
            }

            stats.successful++
            console.log(`✅ [${stats.successful}/${rows.length}] Imported: ${row.Name}`)

          } catch (error: any) {
            stats.failed++
            stats.errors.push({
              row: i + 1,
              name: row.Name,
              error: error.message
            })
            console.error(`❌ [${i + 1}] Failed to import ${row.Name}: ${error.message}`)
          }

          // Add small delay to avoid rate limiting
          if (i % 10 === 0 && i > 0) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }

        // Print summary
        console.log('\n📊 Import Summary:')
        console.log(`Total: ${stats.total}`)
        console.log(`Successful: ${stats.successful}`)
        console.log(`Failed: ${stats.failed}`)

        if (stats.errors.length > 0) {
          console.log('\n❌ Errors:')
          stats.errors.forEach(err => {
            console.log(`  Row ${err.row} (${err.name}): ${err.error}`)
          })
        }

        resolve(stats)
      })
      .on('error', (error) => {
        reject(error)
      })
  })
}

// Run the import
const csvPath = path.join(process.cwd(), 'nigeria_business_directory_100_with_extra_fields.csv')

console.log('🚀 Starting CSV import...')
console.log(`📁 CSV file: ${csvPath}\n`)

importListings(csvPath)
  .then(stats => {
    console.log('\n✅ Import completed!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Import failed:', error)
    process.exit(1)
  })
