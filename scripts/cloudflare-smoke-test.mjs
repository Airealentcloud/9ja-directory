import process from 'node:process'

const baseInput = process.argv[2]
if (!baseInput) {
  console.error('Usage: node scripts/cloudflare-smoke-test.mjs <base-url>')
  process.exit(2)
}

const baseUrl = new URL(baseInput)
const isStaging = baseUrl.hostname.endsWith('.workers.dev')
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
  if (isStaging && path !== '/robots.txt') {
    check(
      response.headers.get('x-robots-tag') === 'noindex, nofollow',
      `${path} sends the staging noindex header`
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
if (isStaging) {
  check(robots.body.includes('Disallow: /'), 'staging robots.txt blocks crawling')

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
}

if (failures.length > 0) {
  console.error(`\n${failures.length} smoke check(s) failed.`)
  process.exit(1)
}

console.log('\nCloudflare smoke checks passed.')
