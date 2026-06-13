import csv from 'csv-parser'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const inputPath = path.join(root, 'data from finlib.csv')
const reportsDir = path.join(root, 'reports')
const qualitySource = fs.readFileSync(path.join(root, 'lib/seo/listing-quality.ts'), 'utf8')

function readConstant(name, fallback) {
  const match = qualitySource.match(new RegExp(`export const ${name} = (\\d+)`))
  return match ? Number(match[1]) : fallback
}

const thresholds = {
  minWords: readConstant('MIN_INDEXABLE_DESCRIPTION_WORDS', 100),
  minChars: readConstant('MIN_INDEXABLE_DESCRIPTION_CHARS', 700),
  minSignals: readConstant('MIN_BUSINESS_SIGNALS', 3),
  minComboListings: readConstant('MIN_INDEXABLE_CATEGORY_STATE_LISTINGS', 3),
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function wordCount(value) {
  return text(value).split(/\s+/).filter(Boolean).length
}

function normalize(value) {
  return text(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function phoneKey(value) {
  return text(value).replace(/\D+/g, ' ').trim()
}

function qualityBucket(row) {
  const words = wordCount(row.description)
  const chars = text(row.description).length
  const signals = [row.phone, row.address].filter((value) => text(value).length > 0).length
  const descriptionPass = words >= thresholds.minWords || chars >= thresholds.minChars
  const signalsPass = signals >= thresholds.minSignals

  if (descriptionPass && signalsPass) {
    return 'indexable'
  }

  if (words < 25) {
    return 'very_thin'
  }

  if (words < thresholds.minWords) {
    return 'thin'
  }

  return 'missing_signals'
}

function addToMap(map, key, row) {
  if (!key) {
    return
  }

  const rows = map.get(key) || []
  rows.push(row)
  map.set(key, rows)
}

async function readCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = []
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject)
  })
}

function toMarkdownTable(rows, headers) {
  if (rows.length === 0) {
    return '_None found._'
  }

  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
  ]

  for (const row of rows) {
    lines.push(`| ${headers.map((header) => String(row[header] ?? '').replace(/\|/g, '/')).join(' | ')} |`)
  }

  return lines.join('\n')
}

async function main() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing input file: ${inputPath}`)
  }

  fs.mkdirSync(reportsDir, { recursive: true })

  const rows = await readCsv(inputPath)
  const enriched = rows.map((row) => ({
    ...row,
    description_words: wordCount(row.description),
    description_chars: text(row.description).length,
    quality_bucket: qualityBucket(row),
  }))

  const byBucket = new Map()
  const byCategory = new Map()
  const byLocation = new Map()
  const byName = new Map()
  const byPhone = new Map()

  for (const row of enriched) {
    addToMap(byBucket, row.quality_bucket, row)
    addToMap(byCategory, text(row.category), row)
    addToMap(byLocation, text(row.location), row)
    addToMap(byName, normalize(row.business_name), row)
    addToMap(byPhone, phoneKey(row.phone), row)
  }

  const duplicateNames = [...byName.values()]
    .filter((group) => group.length > 1)
    .map((group) => ({
      count: group.length,
      business_name: group[0].business_name,
      locations: [...new Set(group.map((row) => row.location).filter(Boolean))].join(', '),
      categories: [...new Set(group.map((row) => row.category).filter(Boolean))].join(', '),
    }))
    .sort((a, b) => b.count - a.count || a.business_name.localeCompare(b.business_name))

  const duplicatePhones = [...byPhone.values()]
    .filter((group) => group.length > 1)
    .map((group) => ({
      count: group.length,
      phone: group[0].phone,
      businesses: group.map((row) => row.business_name).join(', '),
    }))
    .sort((a, b) => b.count - a.count || a.phone.localeCompare(b.phone))

  const bucketRows = [...byBucket.entries()]
    .map(([bucket, group]) => ({ bucket, count: group.length }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket))

  const categoryRows = [...byCategory.entries()]
    .map(([category, group]) => ({ category, count: group.length }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category))

  const locationRows = [...byLocation.entries()]
    .map(([location, group]) => ({ location, count: group.length }))
    .sort((a, b) => b.count - a.count || a.location.localeCompare(b.location))

  const thinRows = enriched
    .filter((row) => row.quality_bucket !== 'indexable')
    .sort((a, b) => a.description_words - b.description_words || a.business_name.localeCompare(b.business_name))
    .map((row) => ({
      business_name: row.business_name,
      category: row.category,
      location: row.location,
      description_words: row.description_words,
      quality_bucket: row.quality_bucket,
    }))

  fs.writeFileSync(
    path.join(reportsDir, 'adsense-listing-audit.csv'),
    [
      'business_name,category,location,description_words,description_chars,quality_bucket,phone,address',
      ...enriched.map((row) =>
        [
          row.business_name,
          row.category,
          row.location,
          row.description_words,
          row.description_chars,
          row.quality_bucket,
          row.phone,
          row.address,
        ]
          .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n')
  )

  const summary = {
    generatedAt: new Date().toISOString(),
    thresholds,
    totalListings: enriched.length,
    qualityBuckets: Object.fromEntries(bucketRows.map((row) => [row.bucket, row.count])),
    duplicateNameGroups: duplicateNames.length,
    duplicatePhoneGroups: duplicatePhones.length,
    categoryCounts: Object.fromEntries(categoryRows.map((row) => [row.category, row.count])),
    locationCounts: Object.fromEntries(locationRows.map((row) => [row.location, row.count])),
  }

  fs.writeFileSync(
    path.join(reportsDir, 'adsense-listing-audit.json'),
    `${JSON.stringify(summary, null, 2)}\n`
  )

  const md = `# AdSense Listing Audit

Generated: ${summary.generatedAt}

## Thresholds

- Minimum description words: ${thresholds.minWords}
- Minimum description characters: ${thresholds.minChars}
- Minimum business signals: ${thresholds.minSignals}
- Minimum strong listings for category/state indexing: ${thresholds.minComboListings}

## Summary

- Total imported listings audited: ${summary.totalListings}
- Duplicate business-name groups: ${summary.duplicateNameGroups}
- Duplicate phone groups: ${summary.duplicatePhoneGroups}

## Quality Buckets

${toMarkdownTable(bucketRows, ['bucket', 'count'])}

## Categories

${toMarkdownTable(categoryRows, ['category', 'count'])}

## Locations

${toMarkdownTable(locationRows, ['location', 'count'])}

## Duplicate Business Names

${toMarkdownTable(duplicateNames, ['count', 'business_name', 'locations', 'categories'])}

## Duplicate Phones

${toMarkdownTable(duplicatePhones, ['count', 'phone', 'businesses'])}

## First Thin Listings To Improve

${toMarkdownTable(thinRows.slice(0, 100), ['business_name', 'category', 'location', 'description_words', 'quality_bucket'])}
`

  fs.writeFileSync(path.join(reportsDir, 'adsense-listing-audit.md'), md)

  console.log(`Audited ${summary.totalListings} listings`)
  console.log(`Wrote ${path.relative(root, path.join(reportsDir, 'adsense-listing-audit.md'))}`)
  console.log(`Wrote ${path.relative(root, path.join(reportsDir, 'adsense-listing-audit.csv'))}`)
  console.log(`Wrote ${path.relative(root, path.join(reportsDir, 'adsense-listing-audit.json'))}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
