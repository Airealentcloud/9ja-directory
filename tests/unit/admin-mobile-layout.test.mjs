import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

test('admin pages use the responsive dashboard shell', () => {
  const adminLayout = read('app/admin/layout.tsx')
  const dashboardLayout = read('components/dashboard/dashboard-layout.tsx')
  const sidebar = read('components/dashboard/sidebar.tsx')

  assert.match(adminLayout, /DashboardLayoutClient/)
  assert.doesNotMatch(adminLayout, /<Sidebar/)
  assert.match(dashboardLayout, /lg:hidden/)
  assert.match(dashboardLayout, /setSidebarOpen\(true\)/)
  assert.match(sidebar, /Close dashboard menu/)
  assert.match(sidebar, /top-16/)
})

test('Manage Listings controls and cards stack on mobile', () => {
  const page = read('app/admin/listings/page.tsx')

  assert.match(page, /overflow-x-auto/)
  assert.match(page, /flex-col gap-4 sm:flex-row/)
  assert.match(page, /w-full items-center gap-2 sm:ml-4 sm:w-auto/)
  assert.match(page, /z-\[60\]/)
})
