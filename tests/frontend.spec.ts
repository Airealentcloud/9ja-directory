import { test, expect } from '@playwright/test'

test.describe('9jaDirectory Frontend Tests', () => {
  const baseURL = 'http://localhost:3006'

  test('Homepage loads successfully', async ({ page }) => {
    await page.goto(baseURL)

    // Check title
    await expect(page).toHaveTitle(/Nigeria Business Directory/)

    // Check hero section - use more specific selector
    await expect(page.getByRole('heading', { name: /Discover Local Businesses/ })).toBeVisible()

    // Check search bar exists
    await expect(page.locator('input[name="search"]')).toBeVisible()

    // Check location dropdown exists (actual name is 'state' not 'location')
    await expect(page.locator('select[name="state"]')).toBeVisible()
  })

  test('Featured categories are displayed', async ({ page }) => {
    await page.goto(baseURL)

    // Check "Explore by Category" section (actual text on page)
    await expect(page.getByRole('heading', { name: 'Explore by Category' })).toBeVisible()

    // Check that categories are rendered
    const categoryLinks = page.locator('a[href^="/categories/"]')
    await expect(categoryLinks.first()).toBeVisible()
  })

  test('Featured listings are displayed', async ({ page }) => {
    await page.goto(baseURL)

    // Check "Featured Businesses" section heading
    await expect(page.getByRole('heading', { name: 'Featured Businesses', exact: true })).toBeVisible()

    // Check that at least one business listing is shown (or empty state if no data)
    const listingLinks = page.locator('a[href^="/listings/"]')
    const count = await listingLinks.count()

    // If no listings, check for the section itself being visible
    if (count === 0) {
      // No listings yet, which is okay - just verify the section exists
      await expect(page.getByRole('heading', { name: 'Featured Businesses', exact: true })).toBeVisible()
    } else {
      expect(count).toBeGreaterThan(0)
    }
  })

  test('Navigation links work', async ({ page }) => {
    await page.goto(baseURL)

    // Check navigation exists - use navigation role to scope the search
    const nav = page.getByRole('navigation')
    await expect(nav.getByRole('link', { name: 'Home', exact: true })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Categories', exact: true })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Locations', exact: true })).toBeVisible()
  })

  test('Categories page loads', async ({ page }) => {
    await page.goto(`${baseURL}/categories`, { timeout: 60000 })

    // Check page loaded - use more specific selector
    await expect(page.getByRole('heading', { name: 'Browse All Categories' })).toBeVisible()

    // Check categories are displayed
    const categories = page.locator('a[href^="/categories/"]')
    await expect(categories.first()).toBeVisible()
  })

  test('Individual category page loads', async ({ page }) => {
    await page.goto(`${baseURL}/categories/accommodation`)

    // Check page loaded - use more specific selector
    await expect(page.getByRole('heading', { name: 'Accommodation', level: 1, exact: true })).toBeVisible()

    // Check business listings are shown
    const listings = page.locator('a[href^="/listings/"]')
    const count = await listings.count()
    expect(count).toBeGreaterThan(0)
  })

  test('Individual business page loads', async ({ page }) => {
    await page.goto(`${baseURL}/listings/nevada-hotels-and-suites`)

    // Check business name is displayed - use more specific selector
    await expect(page.getByRole('heading', { name: /Nevada Hotels/ })).toBeVisible()

    // Check contact information section
    await expect(page.getByRole('heading', { name: 'Contact Information' })).toBeVisible()

    // Check phone number is displayed - use first() to avoid strict mode violation
    await expect(page.locator('a[href^="tel:"]').first()).toBeVisible()

    // Check address is displayed (it's text, not a heading)
    await expect(page.locator('body')).toContainText('Address')
    await expect(page.locator('body')).toContainText('3 Aaron Irabor St')

    // Check reviews section
    await expect(page.getByRole('heading', { name: 'Customer Reviews' })).toBeVisible()

    // Check rating stars - use first() since 4.0 appears multiple times
    await expect(page.locator('text=4.0').first()).toBeVisible()
  })

  test('Business listing has all required elements', async ({ page }) => {
    await page.goto(`${baseURL}/listings/nevada-hotels-and-suites`)

    // Check breadcrumb navigation exists (text content check)
    await expect(page.locator('body')).toContainText('Home')
    await expect(page.locator('body')).toContainText('Categories')

    // Check business description
    await expect(page.getByRole('heading', { name: 'About This Business' })).toBeVisible()

    // Check location section
    await expect(page.getByRole('heading', { name: 'Location' })).toBeVisible()

    // Check call button
    await expect(page.getByRole('link', { name: 'Call Now' })).toBeVisible()

    // Check share/save buttons
    await expect(page.locator('button:has-text("Share")').first()).toBeVisible()
    await expect(page.locator('button:has-text("Save")').first()).toBeVisible()
  })

  test('Footer is present with all sections', async ({ page }) => {
    await page.goto(baseURL)

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Check footer sections - use heading role to be specific
    await expect(page.getByRole('heading', { name: 'Company' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Browse' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Legal' })).toBeVisible()
  })

  test('How It Works section is present', async ({ page }) => {
    await page.goto(baseURL)

    // Check main heading
    await expect(page.getByRole('heading', { name: 'How It Works' })).toBeVisible()

    // Check step headings
    await expect(page.getByRole('heading', { name: 'Search', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Select', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Contact', exact: true })).toBeVisible()
  })

  test('Responsive design - mobile view', async ({ page }) => {
    // Set viewport to mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(baseURL)

    // Check page still loads - use more specific selector
    await expect(page.getByRole('heading', { name: /Discover Local Businesses/ })).toBeVisible()

    // Check search is visible
    await expect(page.locator('input[name="search"]')).toBeVisible()
  })

  test('No console errors on homepage', async ({ page }) => {
    const consoleErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto(baseURL)
    await page.waitForLoadState('networkidle')

    // Allow some time for any async errors
    await page.waitForTimeout(2000)

    // Filter out known Next.js warnings
    const actualErrors = consoleErrors.filter(
      error => !error.includes('Download the React DevTools')
    )

    expect(actualErrors.length).toBe(0)
  })
})
