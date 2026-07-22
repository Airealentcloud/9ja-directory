import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import vm from 'node:vm'
import { execFileSync } from 'node:child_process'
import ts from 'typescript'

const root = process.cwd()
const sourcePath = path.join(root, 'lib', 'blog-data.ts')
const indexPath = path.join(root, 'lib', 'blog-index-data.ts')
const mojibakeMarkers = ['â€', 'â‚', 'â”', 'â˜', 'â†', 'âœ', 'â', 'Ã', 'Â', 'ðŸ', '\ufffd']

function evaluateExport(filePath, exportName) {
  const source = fs.readFileSync(filePath, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filePath,
  }).outputText
  const module = { exports: {} }
  vm.runInNewContext(output, { module, exports: module.exports }, { filename: filePath })
  return module.exports[exportName]
}

test('blog content is valid UTF-8 text without known mojibake', () => {
  const source = fs.readFileSync(sourcePath, 'utf8')
  for (const marker of mojibakeMarkers) {
    assert.equal(source.includes(marker), false, `Found corrupted text marker ${JSON.stringify(marker)}`)
  }
})

test('generated blog index matches every source post and remains newest first', () => {
  execFileSync(process.execPath, ['scripts/generate-blog-index.mjs', '--check'], {
    cwd: root,
    stdio: 'pipe',
  })

  const posts = evaluateExport(sourcePath, 'blogPosts')
  const summaries = evaluateExport(indexPath, 'blogPostSummaries')
  const sourceSlugs = Array.from(posts, (post) => post.slug).sort()
  const summarySlugs = Array.from(summaries, (post) => post.slug).sort()

  assert.deepEqual(summarySlugs, sourceSlugs)
  assert.equal(new Set(summarySlugs).size, summarySlugs.length, 'Blog slugs must be unique')

  for (let index = 1; index < summaries.length; index += 1) {
    assert.ok(
      Date.parse(summaries[index - 1].date) >= Date.parse(summaries[index].date),
      `${summaries[index - 1].slug} must not be older than ${summaries[index].slug}`,
    )
  }

  for (const summary of summaries) {
    assert.deepEqual(
      Object.keys(summary).sort(),
      ['author', 'category', 'date', 'excerpt', 'image', 'readTime', 'slug', 'title'].sort(),
    )
  }
})
