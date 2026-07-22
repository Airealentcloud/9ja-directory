import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const robotsPath = resolve('.open-next/assets/robots.txt')
const robots = await readFile(robotsPath, 'utf8')
const rules = robots.split(/\r?\n/).map(line => line.trim())

if (rules.includes('Disallow: /')) {
  throw new Error('Production Cloudflare build contains the staging Disallow: / rule.')
}

if (!robots.includes('https://www.9jadirectory.org/sitemap.xml')) {
  throw new Error('Production robots.txt does not reference the production sitemap.')
}

console.log('Verified production robots.txt: public crawling is not globally blocked.')
