import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const robotsPath = resolve('.open-next/assets/robots.txt')
const stagingRobots = `User-agent: *
Disallow: /
`

await mkdir(dirname(robotsPath), { recursive: true })
await writeFile(robotsPath, stagingRobots, 'utf8')

console.log('Applied staging-only robots.txt (Disallow: /)')
