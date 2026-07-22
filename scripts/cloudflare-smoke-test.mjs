import process from 'node:process'

const baseInput = process.argv[2]
const mode = process.argv[3]
const validModes = new Set(['staging', 'production-preview', 'production'])

if (!baseInput || !validModes.has(mode)) {
  console.error(
    'Usage: node scripts/cloudflare-smoke-test.mjs <base-url> <staging|production-preview|production>'
  )
  process.exit(2)
}

const baseUrl = new URL(baseInput)
const isStaging = mode === 'staging'
const shouldNoindex = mode !== 'production'
const failures = []

function check(condition, message) {
  if (condition) {
    console.log(`PASS ${message}`)
  } else {
    failures.push(message)
    console.error(`FAIL ${message}`)
  }
}

async function request(path, options = {}) {
  const response = await fetch(new URL(path, baseUrl), {
    redirect: 'manual',
    ...options,
  })
  return {
    response,
    body: await response.text(),
  }
}

for (const path of ['/', '/pricing', '/blog', '/robots.txt', '/sitemap.xml']) {
  const { response } = await request(path)
  check(response.status === 200, `${path} returns 200`)
  if (path !== '/robots.txt') {
    const robotsHeader = response.headers.get('x-robots-tag') || ''
    check(
      shouldNoindex
        ? robotsHeader.includes('noindex')
        : !robotsHeader.includes('noindex'),
      shouldNoindex
        ? `${path} sends a preview noindex header`
        : `${path} is indexable on the production domain`
    )
  }
}

const home = await request('/')
check(
  home.body.includes('rel="canonical" href="https://www.9jadirectory.org"'),
  'homepage canonical remains on the production domain'
)

const pricing = await request('/pricing')
for (const text of [
  '1 business listing',
  '5 business listings',
  'Unlimited business listings',
  'Verified business badge after approval',
  'Featured homepage placement included',
]) {
  check(pricing.body.includes(text), `pricing contains: ${text}`)
}

const robots = await request('/robots.txt')
const robotsRules = robots.body.split(/\r?\n/).map(line => line.trim())
const blocksAllCrawling = robotsRules.includes('Disallow: /')

if (isStaging) {
  check(blocksAllCrawling, 'staging robots.txt blocks crawling')

  for (const path of ['/login', '/checkout', '/admin/listings', '/api/cron/expire-featured']) {
    const { response } = await request(path)
    check(response.status === 503, `${path} is locked until test services are configured`)
    check(
      response.headers.get('cache-control')?.includes('no-store') === true,
      `${path} staging lock is not cached`
    )
  }

  const adminPost = await request('/api/admin/import-listings', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ businesses: [], dryRun: true }),
  })
  check(adminPost.response.status === 503, 'staging blocks write APIs')
} else {
  check(!blocksAllCrawling, `${mode} robots.txt does not block all crawling`)

  const login = await request('/login')
  check(login.response.status !== 503, `${mode} does not use the staging route lock`)
}

if (failures.length > 0) {
  console.error(`\n${failures.length} smoke check(s) failed.`)
  process.exit(1)
}

console.log('\nCloudflare smoke checks passed.')
