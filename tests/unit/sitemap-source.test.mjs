import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const source = fs.readFileSync(path.join(process.cwd(), 'app', 'sitemap.ts'), 'utf8')

test('sitemap uses lightweight blog summaries and a cache interval', () => {
  assert.match(source, /from ['"]@\/lib\/blog-index-data['"]/)
  assert.doesNotMatch(source, /from ['"]@\/lib\/blog-data['"]/)
  assert.match(source, /export const revalidate\s*=\s*\d+/)
})

test('sitemap reuses one bounded listing query for listing and location URLs', () => {
  assert.equal((source.match(/\.from\(['"]listings['"]\)/g) || []).length, 1)
  assert.match(source, /Promise\.all/)
  assert.match(source, /SITEMAP_LISTING_LIMIT/)
  assert.match(source, /SITEMAP_LISTING_BATCH_SIZE/)
  assert.match(source, /\.range\(/)
})

test('sitemap handles data-source failures without failing the metadata route', () => {
  assert.match(source, /sitemap_data_source_error/)
  assert.match(source, /listingsError/)
})
